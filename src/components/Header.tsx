
import React from 'react';
import { Stethoscope } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-3xl border-b border-white/10">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Ultra-premium logo with enhanced styling */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-3xl blur-xl opacity-30 transform scale-110"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-3xl shadow-2xl shadow-purple-500/25 ring-1 ring-white/20 backdrop-blur-sm">
                <Stethoscope className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl"></div>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight text-gray-900 tracking-tight">
                MediSafe{' '}
                <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-light">
                  AI
                </span>
              </h1>
              <p className="text-sm font-light text-gray-400 tracking-widest uppercase">
                Prescription Intelligence
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
              <button className="relative px-10 py-4 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white font-light rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-[1.02] transition-all duration-700 ring-1 ring-white/20 backdrop-blur-sm text-lg tracking-wide">
                Get Started
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
