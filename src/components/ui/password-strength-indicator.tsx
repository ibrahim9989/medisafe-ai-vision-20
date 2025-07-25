
import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

const PasswordStrengthIndicator = ({ password, errors, strength }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'weak': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStrengthIcon = () => {
    switch (strength) {
      case 'strong': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'weak': return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="mt-2">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm ${getStrengthColor()}`}>
        {getStrengthIcon()}
        <span className="font-medium">
          Password strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </span>
      </div>
      
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
              <XCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
