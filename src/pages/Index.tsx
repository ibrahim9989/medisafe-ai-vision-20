
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-purple-50/20 relative overflow-hidden">
      <Header />
      
      {/* Premium background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#cb6ce6]/8 to-transparent rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-purple-300/8 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#cb6ce6]/3 to-purple-400/3 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <main className="relative container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="relative">
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/5 via-transparent to-purple-300/5 rounded-[2rem] blur-3xl transform scale-105"></div>
            
            {/* Main card with ultra-premium styling */}
            <div className="relative bg-white/60 backdrop-blur-3xl border border-white/30 rounded-[2rem] shadow-2xl shadow-gray-900/5 ring-1 ring-white/20 p-12 md:p-16">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-purple-50/20 rounded-[2rem] pointer-events-none"></div>
              
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
