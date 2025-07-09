
import React, { useState, useEffect } from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import PatientHistory from '../components/PatientHistory';
import Header from '../components/Header';
import { Sparkles, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PWADownloadButton from '../components/PWADownloadButton';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'prescription' | 'history'>('prescription');

  useEffect(() => {
    // Listen for voice commands to switch tabs
    const handleVoiceSwitchTab = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab === 'history' || tab === 'prescription') {
        setActiveTab(tab);
      }
    };

    // Listen for PDF download commands
    const handleVoiceDownloadPdf = (event: CustomEvent) => {
      // Trigger PDF download based on current tab
      const downloadEvent = new CustomEvent('download-pdf', {
        detail: { type: activeTab }
      });
      window.dispatchEvent(downloadEvent);
    };

    // Listen for export commands
    const handleVoiceExportData = (event: CustomEvent) => {
      const exportEvent = new CustomEvent('export-data', {
        detail: { type: activeTab, ...event.detail }
      });
      window.dispatchEvent(exportEvent);
    };

    window.addEventListener('voice-switch-tab', handleVoiceSwitchTab as EventListener);
    window.addEventListener('voice-download-pdf', handleVoiceDownloadPdf as EventListener);
    window.addEventListener('voice-export-data', handleVoiceExportData as EventListener);

    return () => {
      window.removeEventListener('voice-switch-tab', handleVoiceSwitchTab as EventListener);
      window.removeEventListener('voice-download-pdf', handleVoiceDownloadPdf as EventListener);
      window.removeEventListener('voice-export-data', handleVoiceExportData as EventListener);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen relative overflow-hidden floating-particles">
      {/* SUNSHINE RAYS Animated BG */}
      <div className="sunshine-rays-bg"></div>
      
      {/* PREMIUM ANIMATED GLASSMORPHIC LIQUID DROP BACKGROUND */}
      <div className="premium-liquid-drops-bg">
        <div className="animated-grid"></div>
        <div className="drop main-drop"></div>
        <div className="drop drop2"></div>
        <div className="drop drop3"></div>
        <div className="drop sub-drop1"></div>
        <div className="drop main-drop2"></div>
        <div className="drop sub-drop2"></div>
        <div className="drop main-drop3"></div>
        <div className="drop sub-drop3"></div>
        <div className="drop drop4"></div>
        <div className="drop drop5"></div>
      </div>
      
      <Header />

      {/* Install PWA button (visible on supported devices/browsers) */}
      <PWADownloadButton />
      
      {/* Enhanced background with liquid glass effect */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated liquid gradient overlay */}
        <div className="absolute inset-0 liquid-gradient opacity-40"></div>
        
        {/* Floating orbs with enhanced glass effect */}
        <div className="hidden lg:block absolute top-0 left-1/4 w-96 h-96 glass rounded-full opacity-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="hidden lg:block absolute bottom-0 right-1/4 w-80 h-80 glass rounded-full opacity-15 animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }}></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] glass rounded-full opacity-10"></div>
      </div>

      {/* AI Status with glass morphism - Enhanced mobile positioning */}
      <div className="fixed top-16 right-2 z-40 sm:top-20 sm:right-4 lg:top-32 lg:right-8">
        <div className="relative group">
          <div className="glass-card p-2 sm:p-3 lg:p-6 hover:scale-105 transition-all duration-700">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <div className="relative">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="hidden sm:block lg:block">
                <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">AI Status</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 hidden lg:block">Voice Ready</p>
              </div>
              <div className="sm:hidden">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Voice</p>
              </div>
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-[#cb6ce6] opacity-60" />
            </div>
          </div>
        </div>
      </div>
      
      <main className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with glass morphism - Enhanced mobile responsiveness */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 lg:mb-6 tracking-tight leading-[1.1] px-1 sm:px-2">
              <span className="block">Voice-Controlled</span>
              <span className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                Medical
              </span>
              <span className="block">Management</span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-light text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed tracking-wide px-2 sm:px-4">
              Control everything with your voice - Navigate, export PDFs, fill forms, and more
            </p>
          </div>

          {/* Tab Navigation with glass effect - Enhanced mobile design */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="glass-nav rounded-lg sm:rounded-xl p-1">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === 'prescription' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('prescription')}
                  className={`glass-button flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === 'prescription' 
                      ? 'bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white shadow-lg border-0' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">New Prescription</span>
                  <span className="sm:hidden">New</span>
                </Button>
                <Button
                  variant={activeTab === 'history' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('history')}
                  className={`glass-button flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === 'history' 
                      ? 'bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white shadow-lg border-0' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Patient History</span>
                  <span className="sm:hidden">History</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content with enhanced glass morphism - Enhanced mobile padding */}
          <div className="relative">
            <div className="glass-card p-3 sm:p-4 md:p-6 lg:p-12 xl:p-16 2xl:p-20">
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
