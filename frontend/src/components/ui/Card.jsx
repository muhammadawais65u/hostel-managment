import React from 'react';

const Card = ({ children, className = '', padding = 'normal', shadow = 'soft' }) => {
  const paddings = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  const shadows = {
    none: '',
    soft: 'shadow-soft',
    card: 'shadow-card',
    lg: 'shadow-lg',
  };

  return (
    <div className={`bg-white rounded-xl overflow-hidden ${shadows[shadow]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-secondary-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`mt-1 text-sm text-secondary-500 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-secondary-100 ${className}`}>
    {children}
  </div>
);

export default Card;
