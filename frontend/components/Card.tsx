import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false
}) => {
  const baseStyles = "bg-white rounded-2xl border-2 border-gray-200 border-b-4";
  const hoverStyles = hoverable ? "transition-all hover:-translate-y-1 hover:border-b-[6px] hover:-mb-0.5 active:translate-y-0 active:border-b-4 active:mb-0 cursor-pointer" : "";
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
