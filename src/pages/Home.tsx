
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import FHIRIntegration from '@/components/FHIRIntegration';
import HIPAACompliance from '@/components/HIPAACompliance';
import PluginTestSuite from '@/components/PluginTestSuite';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Zap,
  AlertTriangle,
  Info
} from 'lucide-react';

const Home = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">MedVerse</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Healthcare Management Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                onClick={handleSignOut}
                className="gap-1 sm:gap-2"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* HIPAA Compliance Notice */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>HIPAA Compliance Notice:</strong> This platform is currently in the process of obtaining HIPAA compliance certification.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-1`}>
            <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="fhir" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">FHIR Integration</span>
              <span className="sm:hidden">FHIR</span>
            </TabsTrigger>
            {isMobile && (
              <>
                <TabsTrigger value="compliance" className="gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>HIPAA</span>
                </TabsTrigger>
                <TabsTrigger value="testing" className="gap-1 text-xs">
                  <TestTube className="h-3 w-3" />
                  <span>Tests</span>
                </TabsTrigger>
              </>
            )}
            {!isMobile && (
              <>
                <TabsTrigger value="compliance" className="gap-2">
                  <Shield className="h-4 w-4" />
                  HIPAA Compliance
                </TabsTrigger>
                <TabsTrigger value="testing" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  System Testing
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Voice Controlled Medical Management */}
              <Card 
                className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => navigate('/app')}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    Voice Medical Management
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600">
                    AI-powered prescription management with voice controls
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow-md transition-all duration-300 text-sm sm:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/app');
                    }}
                  >
                    Launch App
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                    Interpret AI
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600">
                    Advanced AI for medical image analysis
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 rounded-lg shadow-md transition-all duration-300 text-sm sm:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/interpret-ai');
                    }}
                  >
                    Launch Interpret AI
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                    FHIR Integration
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Connect to Epic SMART on FHIR for patient data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("fhir")}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    Configure FHIR
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                    HIPAA Compliance
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Monitor security and regulatory compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("compliance")}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    View Compliance
                  </Button>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TestTube className="h-4 w-4 sm:h-5 sm:w-5" />
                    System Testing
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Test all integrations and components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTab("testing")}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    Run Tests
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Implementation Status</CardTitle>
                <CardDescription className="text-sm">
                  Progress on healthcare platform core features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">✅ Authentication System</span>
                    <span className="text-xs sm:text-sm text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">✅ Epic SMART on FHIR Integration</span>
                    <span className="text-xs sm:text-sm text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">🔄 HIPAA Compliance & Security</span>
                    <span className="text-xs sm:text-sm text-orange-600">In Progress</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">✅ Plugin System Testing</span>
                    <span className="text-xs sm:text-sm text-green-600">Complete</span>
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
