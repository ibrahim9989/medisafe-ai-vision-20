
import React from 'react';
import { Stethoscope, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-2xl shadow-lg shadow-purple-500/25">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">MediSafe AI</h1>
              <p className="text-sm font-medium text-gray-500">Prescription Intelligence Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full bg-green-50 border border-green-100">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">HIPAA Secure</span>
            </div>
            
            <button className="px-6 py-2 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
