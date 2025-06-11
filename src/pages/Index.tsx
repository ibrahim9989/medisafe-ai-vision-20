
import React, { useState } from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import PatientHistory from '../components/PatientHistory';
import Header from '../components/Header';
import { Sparkles, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'prescription' | 'history'>('prescription');

  return (
    <div className="min-h-screen relative overflow-hidden floating-particles">
      <Header />
      
      {/* Enhanced background with liquid glass effect */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated liquid gradient overlay */}
        <div className="absolute inset-0 liquid-gradient opacity-40"></div>
        
        {/* Floating orbs with enhanced glass effect */}
        <div className="hidden lg:block absolute top-0 left-1/4 w-96 h-96 glass rounded-full opacity-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="hidden lg:block absolute bottom-0 right-1/4 w-80 h-80 glass rounded-full opacity-15 animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }}></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] glass rounded-full opacity-10"></div>
      </div>

      {/* AI Status with glass morphism */}
      <div className="fixed top-20 right-4 z-40 lg:top-32 lg:right-8">
        <div className="relative group">
          <div className="glass-card p-3 lg:p-6 hover:scale-105 transition-all duration-700">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="relative">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Status</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Analysis Ready</p>
              </div>
              <div className="lg:hidden">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">AI Ready</p>
              </div>
              <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-[#cb6ce6] opacity-60" />
            </div>
          </div>
        </div>
      </div>
      
      <main className="relative container mx-auto px-4 sm:px-6 py-6 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with glass morphism */}
          <div className="text-center mb-8 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 dark:text-gray-100 mb-4 lg:mb-6 tracking-tight leading-[1.1] px-2">
              <span className="block">Intelligent</span>
              <span className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                Prescription
              </span>
              <span className="block">Management</span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-xl xl:text-2xl font-light text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed tracking-wide px-4">
              Advanced AI-powered medication analysis and patient history management
            </p>
          </div>

          {/* Tab Navigation with glass effect */}
          <div className="flex justify-center mb-8">
            <div className="glass-nav rounded-xl p-1">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === 'prescription' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('prescription')}
                  className={`glass-button flex items-center space-x-2 px-6 py-3 transition-all duration-300 ${
                    activeTab === 'prescription' 
                      ? 'bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white shadow-lg border-0' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>New Prescription</span>
                </Button>
                <Button
                  variant={activeTab === 'history' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('history')}
                  className={`glass-button flex items-center space-x-2 px-6 py-3 transition-all duration-300 ${
                    activeTab === 'history' 
                      ? 'bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white shadow-lg border-0' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Patient History</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content with enhanced glass morphism */}
          <div className="relative">
            <div className="glass-card p-4 sm:p-6 lg:p-16 xl:p-20">
              <div className="relative">
                {activeTab === 'prescription' ? (
                  <PrescriptionForm />
                ) : (
                  <PatientHistory />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
