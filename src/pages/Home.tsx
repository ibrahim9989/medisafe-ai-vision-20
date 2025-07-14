
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Brain, Stethoscope, FileImage, ArrowRight, Zap } from 'lucide-react';
import Header from '@/components/Header';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
              MedVerse
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered medical intelligence platform combining voice-controlled prescription management 
            with precision medical imaging interpretation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Voice Controlled Medical Management Card */}
          <Card 
            className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2"
            onClick={() => navigate('/app')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30 transform scale-110"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl ring-1 ring-white/20">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <CardTitle className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                Voice Controlled Medical Management
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Revolutionary voice-powered prescription management system with AI analysis, patient history tracking, and comprehensive medical documentation
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 pt-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <Mic className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Voice-to-text prescription creation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">AI-powered drug interaction analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                    <Zap className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Real-time patient management</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/app');
                }}
              >
                Launch Prescription Management
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Interpret AI Card */}
          <Card 
            className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2"
            onClick={() => navigate('/interpret-ai')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-30 transform scale-110"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl ring-1 ring-white/20">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <CardTitle className="text-2xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                Interpret AI
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Advanced AI radiologist that analyzes medical images including X-rays, CT scans, MRIs, ECGs, and EEGs with precision interpretation
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 pt-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                    <FileImage className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Radiological image analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-lg">
                    <Brain className="h-4 w-4 text-pink-600" />
                  </div>
                  <span className="text-gray-700 font-medium">ECG & EEG interpretation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-rose-100 rounded-lg">
                    <Zap className="h-4 w-4 text-rose-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Precision medical insights</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/interpret-ai');
                }}
              >
                Launch Interpret AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Powered by advanced AI models • Secure medical data handling • HIPAA compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
