
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  isSignUp: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (fullName: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  setIsSignUp: (isSignUp: boolean) => void;
}

export const AuthForm = ({
  isSignUp,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  isLoading,
  handleSubmit,
  setIsSignUp,
}: AuthFormProps) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {isSignUp && (
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required={isSignUp}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#3b82f6] hover:to-[#06b6d4] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isSignUp ? 'Creating account...' : 'Signing in...'}
            </>
          ) : (
            <>
              {isSignUp ? 'Create account' : 'Sign in'}
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-[#4facfe] hover:text-[#3b82f6] font-medium"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>
  );
};
