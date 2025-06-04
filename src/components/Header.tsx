
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
          
          {/* Mobile navigation - only menu button */}
          <div className="flex items-center">
            <button className="lg:hidden p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
