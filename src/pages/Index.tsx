
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';
import { Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-purple-50/20 relative overflow-hidden">
      <Header />
      
      {/* Ultra-premium background with animated elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cb6ce6 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
        
        {/* Floating orbs with ultra-subtle animation */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#cb6ce6]/4 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-purple-300/4 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-[#cb6ce6]/1 to-purple-400/1 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Premium Floating UI Element */}
      <div className="fixed top-32 right-8 z-40 hidden lg:block">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/20 to-purple-400/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>
          <div className="relative bg-white/70 backdrop-blur-3xl border border-white/30 rounded-3xl p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-white/20 hover:shadow-purple-500/20 transition-all duration-700 hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-ping opacity-30"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">AI Status</p>
                <p className="text-xs text-gray-500">Analysis Ready</p>
              </div>
              <Sparkles className="w-4 h-4 text-[#cb6ce6] opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating UI */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/30 to-purple-400/30 rounded-full blur-lg opacity-60"></div>
          <div className="relative bg-white/80 backdrop-blur-3xl border border-white/40 rounded-full p-3 shadow-xl shadow-purple-500/20 ring-1 ring-white/30">
            <Sparkles className="w-5 h-5 text-[#cb6ce6]" />
          </div>
        </div>
      </div>
      
      <main className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Compact Premium Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            {/* Mobile-first heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[0.9]">
              <span className="block sm:inline">Intelligent </span>
              <span className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] bg-clip-text text-transparent font-light">
                Prescription
              </span>
              <span className="block sm:inline"> Management</span>
            </h1>
            
            {/* Responsive subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-gray-500 max-w-4xl mx-auto leading-relaxed tracking-wide px-4 sm:px-0">
              Advanced AI-powered medication analysis and safety monitoring with surgical precision and elegant simplicity
            </p>
          </div>
          
          {/* Main Content with mobile-optimized styling */}
          <div className="relative">
            {/* Multi-layered glow effects - adjusted for mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/2 via-transparent to-purple-300/2 rounded-2xl sm:rounded-[3rem] blur-2xl sm:blur-3xl transform scale-105 sm:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-purple-50/10 rounded-2xl sm:rounded-[3rem] blur-xl sm:blur-2xl transform scale-102 sm:scale-105"></div>
            
            {/* Ultra-premium main card - mobile responsive */}
            <div className="relative bg-white/50 sm:bg-white/40 backdrop-blur-2xl sm:backdrop-blur-3xl border border-white/25 sm:border-white/20 rounded-2xl sm:rounded-[3rem] shadow-xl sm:shadow-2xl shadow-gray-900/5 sm:shadow-gray-900/3 ring-1 ring-white/15 sm:ring-white/10 p-6 sm:p-12 md:p-16 lg:p-20">
              {/* Subtle inner highlights - mobile optimized */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 sm:from-white/30 via-white/5 to-purple-50/10 rounded-2xl sm:rounded-[3rem] pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 sm:via-white/30 to-transparent"></div>
              <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-white/15 sm:via-white/20 to-transparent"></div>
              
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
