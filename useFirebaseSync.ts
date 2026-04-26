import { useState, useEffect, useRef } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { GameResult } from '../types';

// ---------------------------------------------------------------------------
// Static pattern data (kept outside to avoid re-creation on every render)
// ---------------------------------------------------------------------------
const SEED_COLORS: ('RED' | 'BLUE' | 'TIE')[] = [
  'RED', 'BLUE', 'RED', 'TIE', 'TIE', 'RED', 'BLUE', 'RED', 'BLUE', 'RED',
  'RED', 'BLUE', 'RED', 'TIE', 'RED', 'BLUE', 'BLUE', 'RED', 'BLUE', 'TIE',
];
const SEED_VALUES = [5, 13, 7, 10, 10, 8, 8, 9, 7, 6, 12, 13, 7, 10, 8, 13, 7, 12, 6, 10];

const PATTERN_COLORS: ('RED' | 'BLUE' | 'TIE')[] = [
  'RED', 'BLUE', 'RED', 'RED', 'BLUE', 'TIE', 'BLUE', 'RED', 'BLUE', 'RED',
  'RED', 'RED', 'BLUE', 'BLUE', 'TIE', 'RED', 'BLUE', 'RED', 'BLUE', 'TIE',
];
const PATTERN_VALUES = [5, 13, 7, 12, 6, 10, 7, 8, 8, 9, 13, 11, 4, 14, 1, 9, 13, 7, 8, 10];
const PATTERN_LENGTH = PATTERN_COLORS.length;

// Interval between automatic entries (ms)
const ADD_INTERVAL_MS = 20_000;

// Minimum number of results before we stop seeding
const SEED_THRESHOLD = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTimestamp(offsetMs = 0) {
  return Date.now() - offsetMs;
}

function makeTimeLabel(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Seeds the Firestore collection with SEED_THRESHOLD entries.
 * Called only when the collection has fewer than SEED_THRESHOLD docs.
 * Running outside the snapshot listener avoids feedback loops.
 */
async function seedCollection(
  resultsRef: ReturnType<typeof collection>
): Promise<void> {
  const writes = SEED_COLORS.map((color, i) => {
    const timestamp = makeTimestamp((SEED_COLORS.length - i) * 60_000);
    return addDoc(resultsRef, {
      color,
      value: SEED_VALUES[i] ?? 8,
      time: makeTimeLabel(timestamp),
      timestamp,
    });
  });

  // Run all writes in parallel — seeding is a one-off operation so flooding
  // the listener briefly here is acceptable and faster than sequential writes.
  await Promise.all(writes);
}

/**
 * Appends the next scripted entry to Firestore.
 * The pattern index is derived from wall-clock time, so it stays consistent
 * regardless of how many documents are currently in the collection.
 */
async function addNextEntry(
  resultsRef: ReturnType<typeof collection>
): Promise<void> {
  const now = Date.now();
  // Time-based index: advances by 1 each ADD_INTERVAL_MS — stable across
  // reconnections and independent of docs.length.
  const index = Math.floor(now / ADD_INTERVAL_MS) % PATTERN_LENGTH;

  await addDoc(resultsRef, {
    color: PATTERN_COLORS[index],
    value: PATTERN_VALUES[index],
    time: makeTimeLabel(now),
    timestamp: now,
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFirebaseSync() {
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Strict-mode / HMR guard — run only once per mount
    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: (() => void) | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const setup = async () => {
      try {
        // ── 1. Auth ──────────────────────────────────────────────────────────
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr: any) {
            if (authErr.code === 'auth/admin-restricted-operation') {
              console.warn(
                'Anonymous Auth is disabled in Firebase Console. ' +
                'Proceeding without explicit auth state.'
              );
            } else {
              throw authErr;
            }
          }
        }

        // ── 2. Collection ref & query ────────────────────────────────────────
        const resultsRef = collection(db, 'live_results');
        const q = query(resultsRef, orderBy('timestamp', 'desc'), limit(50));

        // ── 3. Seed BEFORE attaching the listener ────────────────────────────
        //    This prevents addDoc calls from triggering the snapshot callback,
        //    which would cause a feedback loop.
        const initialSnap = await getDocs(q);
        if (initialSnap.size < SEED_THRESHOLD) {
          await seedCollection(resultsRef);
        }

        // ── 4. Real-time listener ────────────────────────────────────────────
        unsubscribe = onSnapshot(q, (snapshot) => {
          const results = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as GameResult[];

          setRecentResults(results);
        });

        // ── 5. Periodic entries ──────────────────────────────────────────────
        //    Interval matches ADD_INTERVAL_MS exactly — no wasted getDocs calls.
        interval = setInterval(() => {
          addNextEntry(resultsRef).catch((err) =>
            console.error('Failed to add periodic entry:', err)
          );
        }, ADD_INTERVAL_MS);

      } catch (err) {
        console.error('Firebase sync setup failed:', err);
      }
    };

    setup();

    return () => {
      unsubscribe?.();
      if (interval !== undefined) clearInterval(interval);
    };
  }, []);

  return { recentResults };
}
