import React, { ReactNode } from 'react';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';

interface AccessibleFormFieldProps {
  label: string;
  children: ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  fieldId: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  children,
  description,
  error,
  required = false,
  fieldId
}) => {
  return (
    <div className="space-y-2">
      {/* Label with clear hierarchy */}
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required field">
            *
          </span>
        )}
      </label>

      {/* Description */}
      {description && (
        <div id={`${fieldId}-description`} className="flex items-start">
          <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      )}

      {/* Form control */}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': `${description ? `${fieldId}-description` : ''} ${error ? `${fieldId}-error` : ''}`.trim() || undefined,
          'aria-invalid': !!error,
          'aria-required': required
        })}
      </div>

      {/* Error message */}
      {error && (
        <div id={`${fieldId}-error`} className="flex items-start" role="alert">
          <AlertCircleIcon className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};