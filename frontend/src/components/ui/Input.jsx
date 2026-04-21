import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helper,
  type = 'text',
  icon: Icon,
  className = '',
  containerClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium text-secondary-700 mb-1 ${labelClassName}`}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            block w-full rounded-lg shadow-sm
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
            }
            disabled:bg-secondary-50 disabled:text-secondary-500
            sm:text-sm transition-colors
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
