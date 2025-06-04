
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';
import { Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20 relative overflow-hidden">
      <Header />
      
      {/* Ultra-premium background with animated elements and plus grid pattern */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Plus sign grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(to right, #8b7355 1px, transparent 1px),
            linear-gradient(to bottom, #8b7355 1px, transparent 1px),
            linear-gradient(to right, transparent 10px, #8b7355 11px, #8b7355 13px, transparent 14px),
            linear-gradient(to bottom, transparent 10px, #8b7355 11px, #8b7355 13px, transparent 14px)
          `,
          backgroundSize: '24px 24px, 24px 24px, 24px 24px, 24px 24px'
        }}></div>
        
        {/* Floating orbs with ultra-subtle animation - hidden on mobile */}
        <div className="hidden lg:block absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#cb6ce6]/4 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="hidden lg:block absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-purple-300/4 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }}></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-[#cb6ce6]/1 to-purple-400/1 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Mobile AI Status - Fixed position for mobile */}
      <div className="fixed top-20 right-4 z-40 lg:top-32 lg:right-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/20 to-purple-400/20 rounded-2xl lg:rounded-3xl blur-lg lg:blur-xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-3xl border border-white/40 rounded-2xl lg:rounded-3xl p-3 lg:p-6 shadow-xl lg:shadow-2xl shadow-purple-500/15 lg:shadow-purple-500/10 ring-1 ring-white/30 hover:shadow-purple-500/25 lg:hover:shadow-purple-500/20 transition-all duration-700 hover:scale-105">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="relative">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-700">AI Status</p>
                <p className="text-xs text-gray-500">Analysis Ready</p>
              </div>
              <div className="lg:hidden">
                <p className="text-xs font-medium text-gray-700">AI Ready</p>
              </div>
              <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-[#cb6ce6] opacity-60" />
            </div>
          </div>
        </div>
      </div>
      
      <main className="relative container mx-auto px-4 sm:px-6 py-6 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile-First Hero Section */}
          <div className="text-center mb-8 lg:mb-16">
            {/* Mobile-optimized heading with proper spacing */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 mb-4 lg:mb-6 tracking-tight leading-[1.1] px-2">
              <span className="block">Intelligent</span>
              <span className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                Prescription
              </span>
              <span className="block">Management</span>
            </h1>
            
            {/* Mobile-optimized subtitle */}
            <p className="text-sm sm:text-base lg:text-xl xl:text-2xl font-light text-gray-500 max-w-3xl mx-auto leading-relaxed tracking-wide px-4">
              Advanced AI-powered medication analysis and safety monitoring
            </p>
          </div>
          
          {/* Main Content with mobile-optimized spacing */}
          <div className="relative">
            {/* Simplified glow effects for mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/1 via-transparent to-purple-300/1 rounded-xl lg:rounded-[3rem] blur-xl lg:blur-3xl transform scale-102 lg:scale-110"></div>
            
            {/* Mobile-first main card */}
            <div className="relative bg-white/60 lg:bg-white/40 backdrop-blur-2xl lg:backdrop-blur-3xl border border-white/30 lg:border-white/20 rounded-xl lg:rounded-[3rem] shadow-lg lg:shadow-2xl shadow-gray-900/5 lg:shadow-gray-900/3 ring-1 ring-white/20 lg:ring-white/10 p-4 sm:p-6 lg:p-16 xl:p-20">
              {/* Subtle inner highlights - mobile optimized */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 lg:from-white/30 via-white/5 to-purple-50/10 rounded-xl lg:rounded-[3rem] pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 lg:via-white/30 to-transparent"></div>
              <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-white/15 lg:via-white/20 to-transparent"></div>
              
              <div className="relative">
                <PrescriptionForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
