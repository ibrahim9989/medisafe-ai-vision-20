
import React from 'react';
import { Stethoscope } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/10">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-3xl shadow-2xl shadow-purple-500/30 ring-1 ring-white/20">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">MediSafe AI</h1>
              <p className="text-sm font-medium text-gray-500 tracking-wide">Prescription Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="px-8 py-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white font-medium rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/35 transform hover:scale-[1.02] transition-all duration-500 ring-1 ring-white/20 backdrop-blur-sm">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
