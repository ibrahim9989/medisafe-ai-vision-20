
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - Apple-inspired */}
          <div className="text-center mb-20">
            <div className="inline-block mb-8">
              <span className="inline-block px-6 py-2 rounded-full border border-purple-200/60 bg-white/80 backdrop-blur-md text-sm font-medium text-gray-600 mb-6">
                Evidence-Based Medical Analysis
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight leading-none">
              Intelligent
              <span className="block font-medium bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent">
                Prescription
              </span>
              <span className="block font-light">
                Management
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered medication analysis and safety monitoring 
              with surgical precision and elegant simplicity.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center mt-12 space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#cb6ce6]"></div>
                <span className="text-sm font-medium text-gray-700">AI-Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">Real-time Analysis</span>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6]/5 to-transparent rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/10 p-8 md:p-12">
              <PrescriptionForm />
            </div>
          </div>
        </div>
      </main>
      
      {/* Subtle background elements */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#cb6ce6]/10 to-purple-300/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-blue-400/10 to-[#cb6ce6]/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default Index;
