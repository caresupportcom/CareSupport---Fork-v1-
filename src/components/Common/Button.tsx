import React, { Children } from 'react';
import { BracketText } from './BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  ariaLabel,
  ...props
}) => {
  const baseClasses = 'rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
  };
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  // If children is a string, wrap it in BracketText
  const renderChildren = () => {
    if (typeof children === 'string') {
      return <BracketText active={variant === 'primary'} className={variant === 'primary' ? 'text-white' : ''}>
          {children}
        </BracketText>;
    }
    return children;
  };
  const handleClick = e => {
    if (disabled) return;
    // Track button click in analytics
    if (typeof children === 'string') {
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'button_click',
        button_text: children
      });
    }
    if (onClick) onClick(e);
  };
  return <button className={classes} onClick={handleClick} disabled={disabled} aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)} {...props}>
      {renderChildren()}
    </button>;
};