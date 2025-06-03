
import React from 'react';
import { Stethoscope, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MediSafe AI</h1>
              <p className="text-sm text-gray-500">Prescription Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
