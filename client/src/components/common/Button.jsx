import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  ...props // Pass rest of the props like 'href'
}) => {
  const baseStyle =
    'px-4 py-2 font-medium rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary:
      'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary',
    outline:
      'bg-white text-primary border border-primary hover:bg-primary-light/10 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed';

  // If 'href' prop is present, render an anchor tag
  if (props.href) {
    return (
      <a
        {...props}
        className={`${baseStyle} ${variantStyles[variant]} ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${disabledStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;