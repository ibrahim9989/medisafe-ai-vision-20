
import React from 'react';
import { Stethoscope, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/40 lg:bg-white/30 backdrop-blur-3xl border-b border-white/20 lg:border-white/10">
      <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 lg:space-x-6">
            {/* Mobile-optimized logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl lg:rounded-3xl blur-lg lg:blur-xl opacity-30 transform scale-110"></div>
              <div className="relative flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl shadow-purple-500/25 ring-1 ring-white/20 backdrop-blur-sm">
                <Stethoscope className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl lg:rounded-3xl"></div>
              </div>
            </div>
            
            <div>
              <h1 className="text-xl lg:text-3xl xl:text-4xl font-light text-gray-900 tracking-tight">
                MediSafe{' '}
                <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                  AI
                </span>
              </h1>
              <p className="text-xs lg:text-sm font-light text-gray-400 tracking-widest uppercase hidden sm:block">
                Prescription Intelligence
              </p>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <div className="flex items-center space-x-2 lg:space-x-0">
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Desktop Get Started button */}
            <div className="hidden lg:flex items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
                <button className="relative px-8 lg:px-10 py-3 lg:py-4 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white font-light rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-[1.02] transition-all duration-700 ring-1 ring-white/20 backdrop-blur-sm text-base lg:text-lg tracking-wide">
                  Get Started
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:opacity-100 opacity-0 transition-opacity duration-700"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Get Started button - below header */}
        <div className="lg:hidden mt-4 flex justify-center">
          <div className="relative group w-full max-w-xs">
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
            <button className="relative w-full px-6 py-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.02] transition-all duration-700 ring-1 ring-white/20 backdrop-blur-sm text-base tracking-wide">
              Get Started
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
