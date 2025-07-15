
import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileGuard from "@/components/ProfileGuard";
import Header from "@/components/Header";
import GlobalVoiceControl from "@/components/GlobalVoiceControl";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import DoctorsDirectory from "./pages/DoctorsDirectory";
import InterpretAI from "./pages/InterpretAI";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";
import TutorialOverlay from "@/components/tutorial/TutorialOverlay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TutorialProvider>
            <TutorialOverlay />
            <Routes>
              {/* Root route redirects to auth */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/interpret-ai" 
                element={
                  <ProtectedRoute>
                    <InterpretAI />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/directory" 
                element={
                  <ProtectedRoute>
                    <Header />
                    <DoctorsDirectory />
                    <GlobalVoiceControl />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile-setup" 
                element={
                  <ProtectedRoute>
                    <ProfileSetup />
                    <GlobalVoiceControl />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute>
                    <ProfileGuard>
                      <Index />
                      <GlobalVoiceControl />
                    </ProfileGuard>
                  </ProtectedRoute>
                } 
              />
              {/* Catch all other routes and redirect to auth */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </TutorialProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
