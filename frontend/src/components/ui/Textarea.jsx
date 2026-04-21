import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helper,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          block w-full rounded-lg shadow-sm
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
          }
          disabled:bg-secondary-50 disabled:text-secondary-500
          p-3 sm:text-sm transition-colors resize-none
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helper}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
