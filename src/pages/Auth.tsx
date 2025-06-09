
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(to right, #8b7355 1px, transparent 1px),
            linear-gradient(to bottom, #8b7355 1px, transparent 1px),
            linear-gradient(to right, transparent 10px, #8b7355 11px, #8b7355 13px, transparent 14px),
            linear-gradient(to bottom, transparent 10px, #8b7355 11px, #8b7355 13px, transparent 14px)
          `,
          backgroundSize: '24px 24px, 24px 24px, 24px 24px, 24px 24px'
        }}></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl blur-lg opacity-30 transform scale-110"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl shadow-xl ring-1 ring-white/20 backdrop-blur-sm">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-light text-gray-900 tracking-tight">
                MediSafe{' '}
                <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                  AI
                </span>
              </h1>
            </Link>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500">
              {isSignUp 
                ? 'Sign up to start managing prescriptions with AI' 
                : 'Sign in to your account'
              }
            </p>
          </div>

          {/* Auth Card */}
          <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl ring-1 ring-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl opacity-20 blur-lg"></div>
                  <div className="relative p-2 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl shadow-lg">
                    {isSignUp ? (
                      <UserPlus className="h-4 w-4 text-white" />
                    ) : (
                      <LogIn className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
                <span className="text-lg font-medium text-gray-900 tracking-wide">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30 focus:ring-[#cb6ce6]/30"
                      placeholder="Dr. John Smith"
                      required={isSignUp}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:ring-[#cb6ce6]/30"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:ring-[#cb6ce6]/30"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300"
                >
                  {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-[#cb6ce6] hover:text-[#9c4bc7] font-medium"
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
