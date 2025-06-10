
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard = ({ children }: ProfileGuardProps) => {
  const { profile, loading } = useDoctorProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cb6ce6] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no profile exists or profile is not complete, redirect to profile setup
  if (!profile || !profile.is_profile_complete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

export default ProfileGuard;
