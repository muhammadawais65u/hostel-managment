import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      title: 'text-blue-800',
      text: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      title: 'text-green-800',
      text: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700',
    },
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border p-4 ${style.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${style.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${style.text} ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${style.text} hover:bg-white hover:bg-opacity-20 focus:outline-none`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
