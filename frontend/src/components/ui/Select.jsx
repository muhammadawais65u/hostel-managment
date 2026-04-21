import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  helper,
  options = [],
  placeholder = 'Select an option',
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
      <div className="relative">
        <select
          ref={ref}
          className={`
            block w-full rounded-lg shadow-sm appearance-none
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
            }
            disabled:bg-secondary-50 disabled:text-secondary-500
            pr-10 pl-3 py-2 sm:text-sm transition-colors
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-secondary-400" />
        </div>
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

Select.displayName = 'Select';

export default Select;
