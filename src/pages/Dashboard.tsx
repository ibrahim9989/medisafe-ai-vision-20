
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Brain, Sparkles, FileText, Users, Zap } from 'lucide-react';
import Header from '@/components/Header';

const Dashboard = () => {
  const navigate = useNavigate();

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
      
      {/* Enhanced background with liquid glass effect */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated liquid gradient overlay */}
        <div className="absolute inset-0 liquid-gradient opacity-40"></div>
        
        {/* Floating orbs with enhanced glass effect */}
        <div className="hidden lg:block absolute top-0 left-1/4 w-96 h-96 glass rounded-full opacity-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="hidden lg:block absolute bottom-0 right-1/4 w-80 h-80 glass rounded-full opacity-15 animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }}></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] glass rounded-full opacity-10"></div>
      </div>

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 dark:text-gray-100 mb-4 lg:mb-6 tracking-tight leading-[1.1]">
              <span className="block">AI-Powered</span>
              <span className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                Medical Suite
              </span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed tracking-wide">
              Choose your AI medical assistant - Voice-controlled prescription management or advanced medical image interpretation
            </p>
          </div>

          {/* Cards Section */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Voice Controlled Medical Management Card */}
            <Card 
              className="glass-card p-6 lg:p-8 hover:scale-105 transition-all duration-700 cursor-pointer group border-0 shadow-2xl"
              onClick={() => navigate('/app')}
            >
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] rounded-full flex items-center justify-center group-hover:shadow-2xl transition-all duration-500">
                    <Stethoscope className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-yellow-600" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Voice Controlled Medical Management
                </CardTitle>
                <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  Create prescriptions, manage patient history, and navigate with voice commands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#cb6ce6] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Voice-controlled navigation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#cb6ce6] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Smart prescription forms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#cb6ce6] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Patient history management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#cb6ce6] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">PDF export capabilities</span>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] hover:from-[#b84fd9] hover:to-[#8a3db3] text-white border-0 py-3">
                  <FileText className="w-4 h-4 mr-2" />
                  Start Prescription Management
                </Button>
              </CardContent>
            </Card>

            {/* Interpret AI Card */}
            <Card 
              className="glass-card p-6 lg:p-8 hover:scale-105 transition-all duration-700 cursor-pointer group border-0 shadow-2xl"
              onClick={() => navigate('/interpret-ai')}
            >
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center group-hover:shadow-2xl transition-all duration-500">
                    <Brain className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Interpret AI
                </CardTitle>
                <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  AI-powered radiological and medical image interpretation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#4facfe] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">X-ray & CT scan analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#4facfe] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">ECG & EEG interpretation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#4facfe] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Detailed AI analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#4facfe] rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Secure image storage</span>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#3b82f6] hover:to-[#06b6d4] text-white border-0 py-3">
                  <Brain className="w-4 h-4 mr-2" />
                  Start Medical Interpretation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info Section */}
          <div className="text-center mt-12 lg:mt-16">
            <div className="glass-card p-6 lg:p-8 max-w-2xl mx-auto">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Professional AI Medical Assistant
              </h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Our AI provides accurate interpretations and assists with medical documentation, 
                but always consult with qualified medical professionals for diagnosis and treatment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
