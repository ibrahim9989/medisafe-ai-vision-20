
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-purple-50/20 relative overflow-hidden">
      <Header />
      
      {/* Ultra-premium background with animated elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle dot pattern overlay inspired by your reference */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cb6ce6 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
        
        {/* Floating orbs with ultra-subtle animation */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#cb6ce6]/6 to-transparent rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-purple-300/6 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#cb6ce6]/2 to-purple-400/2 rounded-full blur-3xl opacity-20"></div>
      </div>
      
      <main className="relative container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Premium hero text section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-white/60 backdrop-blur-xl rounded-full border border-white/20 shadow-lg ring-1 ring-white/10">
              <div className="w-2 h-2 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 tracking-wide">Intelligent Prescription Management</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extralight text-gray-900 mb-6 tracking-tight leading-[0.9]">
              Advanced{' '}
              <span className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] bg-clip-text text-transparent font-light">
                AI-powered
              </span>
              <br />
              medication analysis
            </h1>
            
            <p className="text-xl md:text-2xl font-light text-gray-500 max-w-4xl mx-auto leading-relaxed tracking-wide">
              Safety monitoring with surgical precision and elegant simplicity
            </p>
          </div>
          
          {/* Main Content with enhanced premium styling */}
          <div className="relative">
            {/* Multi-layered glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/3 via-transparent to-purple-300/3 rounded-[3rem] blur-3xl transform scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-purple-50/10 rounded-[3rem] blur-2xl transform scale-105"></div>
            
            {/* Ultra-premium main card */}
            <div className="relative bg-white/40 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-2xl shadow-gray-900/3 ring-1 ring-white/10 p-16 md:p-20">
              {/* Subtle inner highlights */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-purple-50/10 rounded-[3rem] pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              
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
