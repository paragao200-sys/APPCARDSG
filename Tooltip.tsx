import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = ({ 
  children, 
  content, 
  side = 'top', 
  align = 'center',
  className
}: { 
  children: React.ReactNode; 
  content: React.ReactNode; 
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          className="z-[100]"
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className={cn(
                "px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white glass-panel rounded-lg border border-white/10 shadow-2xl backdrop-blur-xl",
                className
              )}
            >
              {content}
              <TooltipPrimitive.Arrow className="fill-white/10" />
            </motion.div>
          </AnimatePresence>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};
