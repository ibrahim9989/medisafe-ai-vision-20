
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import FHIRIntegration from '@/components/FHIRIntegration';
import HIPAACompliance from '@/components/HIPAACompliance';
import PluginTestSuite from '@/components/PluginTestSuite';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Database, 
  Shield, 
  TestTube, 
  LogOut,
  User,
  Activity,
  Brain,
  ArrowRight,
  FileImage,
  Zap
} from 'lucide-react';

const Home = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">MedVerse</h1>
                <p className="text-sm text-muted-foreground">Healthcare Management Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="fhir" className="gap-2">
              <Database className="h-4 w-4" />
              FHIR Integration
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <Shield className="h-4 w-4" />
              HIPAA Compliance
            </TabsTrigger>
            <TabsTrigger value="testing" className="gap-2">
              <TestTube className="h-4 w-4" />
              System Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Voice Controlled Medical Management */}
              <Card 
                className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => navigate('/app')}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    Voice Medical Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    AI-powered prescription management with voice controls
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow-md transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/app');
                    }}
                  >
                    Launch App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Interpret AI */}
              <Card 
                className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => navigate('/interpret-ai')}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                    Interpret AI
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Advanced AI for medical image analysis
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 rounded-lg shadow-md transition-all duration-300"
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

            {/* System Components */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    FHIR Integration
                  </CardTitle>
                  <CardDescription>
                    Connect to Epic SMART on FHIR for patient data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("fhir")}
                    variant="outline"
                    className="w-full"
                  >
                    Configure FHIR
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    HIPAA Compliance
                  </CardTitle>
                  <CardDescription>
                    Monitor security and regulatory compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("compliance")}
                    variant="outline"
                    className="w-full"
                  >
                    View Compliance
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    System Testing
                  </CardTitle>
                  <CardDescription>
                    Test all integrations and components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("testing")}
                    variant="outline"
                    className="w-full"
                  >
                    Run Tests
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>
                  Progress on healthcare platform core features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">✅ Authentication System</span>
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">✅ Epic SMART on FHIR Integration</span>
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">✅ HIPAA Compliance & Security</span>
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">✅ Plugin System Testing</span>
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fhir">
            <FHIRIntegration />
          </TabsContent>

          <TabsContent value="compliance">
            <HIPAACompliance />
          </TabsContent>

          <TabsContent value="testing">
            <PluginTestSuite />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
