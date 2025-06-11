
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
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
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
            <Link to="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="glass-card flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                MediSafe{' '}
                <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                  AI
                </span>
              </h1>
            </Link>
            <h2 className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp 
                ? 'Sign up to start managing prescriptions with AI' 
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
