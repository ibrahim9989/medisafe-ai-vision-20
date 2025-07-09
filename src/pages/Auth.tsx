
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Stethoscope } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign Up Successful",
            description: "Please check your email to confirm your account.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign In Successful",
            description: "Welcome back!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred with Google sign in.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden floating-particles">
      {/* Enhanced background with liquid glass effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 liquid-gradient opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header with glass effect */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="glass-card flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                  MedVerse
                </span>
              </h1>
            </div>
            <h2 className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp 
                ? 'Sign up to start using the medical intelligence platform' 
                : 'Sign in to your account'
              }
            </p>
          </div>

          {/* Auth Card with enhanced glass morphism */}
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="relative">
                  <div className="glass-button p-2 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl border-0">
                    {isSignUp ? (
                      <UserPlus className="h-4 w-4 text-white" />
                    ) : (
                      <LogIn className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100 tracking-wide">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                variant="outline"
                className="w-full glass-input border-0 hover:bg-white/10 text-gray-900 dark:text-gray-100"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="glass-input border-0 focus:ring-2 focus:ring-[#cb6ce6]/30 text-gray-900 dark:text-gray-100"
                      placeholder="Dr. John Smith"
                      required={isSignUp}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input border-0 focus:ring-2 focus:ring-[#cb6ce6]/30 text-gray-900 dark:text-gray-100"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input border-0 focus:ring-2 focus:ring-[#cb6ce6]/30 text-gray-900 dark:text-gray-100"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300 border-0"
                >
                  {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-[#cb6ce6] hover:text-[#9c4bc7] font-medium transition-colors"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Sign Up"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
