
import React from 'react';
import { Stethoscope, Menu, LogOut, User, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/40 lg:bg-white/30 backdrop-blur-3xl border-b border-white/20 lg:border-white/10">
      <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 lg:space-x-6">
            {/* Mobile-optimized logo */}
            <div className="relative cursor-pointer" onClick={() => navigate('/')}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl lg:rounded-3xl blur-lg lg:blur-xl opacity-30 transform scale-110"></div>
              <div className="relative flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl shadow-purple-500/25 ring-1 ring-white/20 backdrop-blur-sm">
                <Stethoscope className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl lg:rounded-3xl"></div>
              </div>
            </div>
            
            <div>
              <h1 className="text-xl lg:text-3xl xl:text-4xl font-light text-gray-900 tracking-tight cursor-pointer" onClick={() => navigate('/')}>
                <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] bg-clip-text text-transparent font-medium">
                  MedVerse
                </span>
              </h1>
              <p className="text-xs lg:text-sm font-light text-gray-400 tracking-widest uppercase hidden sm:block">
                Medical Intelligence Platform
              </p>
            </div>
          </div>
          
          {/* Navigation and User menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Directory Link */}
            <Button
              variant="ghost"
              onClick={() => navigate('/directory')}
              className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Users className="h-4 w-4" />
              <span>Directory</span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-xl border-white/30">
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <button className="lg:hidden p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
