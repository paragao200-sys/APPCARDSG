
import React from 'react';

export function IconButton({ icon, onClick, title }: { icon: React.ReactNode, onClick?: () => void, title?: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
    if (onClick) onClick();
  };

  return (
    <button 
      onClick={handleClick}
      title={title}
      className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors relative overflow-hidden"
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
    </button>
  );
}
