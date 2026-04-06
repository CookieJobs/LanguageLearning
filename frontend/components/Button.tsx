// input: react
// output: Button
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'duo-primary' | 'duo-secondary' | 'duo-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  const variants = {
    primary: "bg-duo-green text-white border-b-4 border-duo-green-dark hover:bg-[#61e002] active:border-b-0 active:translate-y-1 focus-visible:ring-duo-green shadow-none",
    secondary: "bg-duo-blue text-white border-b-4 border-duo-blue-dark hover:bg-[#3dd2ff] active:border-b-0 active:translate-y-1 focus-visible:ring-duo-blue shadow-none",
    outline: "bg-transparent text-gray-500 border-2 border-gray-200 border-b-4 hover:bg-gray-50 active:border-b-2 active:translate-y-[2px] focus-visible:ring-gray-400 shadow-none",
    ghost: "bg-transparent text-gray-500 border-2 border-transparent border-b-4 hover:bg-gray-100 active:border-b-0 active:translate-y-1 focus-visible:ring-gray-400 shadow-none",
    danger: "bg-red-500 text-white border-b-4 border-red-600 hover:bg-red-400 active:border-b-0 active:translate-y-1 focus-visible:ring-red-500 shadow-none",
    'duo-primary': "bg-duo-green text-white border-b-4 border-duo-green-dark hover:bg-[#61e002] active:border-b-0 active:translate-y-1 focus-visible:ring-duo-green shadow-none",
    'duo-secondary': "bg-duo-blue text-white border-b-4 border-duo-blue-dark hover:bg-[#3dd2ff] active:border-b-0 active:translate-y-1 focus-visible:ring-duo-blue shadow-none",
    'duo-outline': "bg-transparent text-gray-500 border-2 border-gray-200 border-b-4 hover:bg-gray-50 active:border-b-2 active:translate-y-[2px] focus-visible:ring-gray-400 shadow-none",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-base gap-2",
    lg: "px-7 py-3.5 text-lg gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>处理中...</span>
        </span>
      ) : children}
    </button>
  );
};
