
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  country: string | null;
  profile_picture_url: string | null;
  phone_number: string | null;
  years_of_experience: number | null;
  specialization: string[] | null;
  clinical_address: string | null;
  pincode: string | null;
  regulatory_body: string | null;
  license_number: string | null;
  is_profile_complete: boolean;
  public_profile: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateProfileData {
  full_name: string;
  age?: number | null;
  gender?: string | null;
  country?: string | null;
  profile_picture_url?: string | null;
  phone_number?: string | null;
  years_of_experience?: number | null;
  specialization?: string[] | null;
  clinical_address?: string | null;
  pincode?: string | null;
  regulatory_body?: string | null;
  license_number?: string | null;
  public_profile?: boolean;
}

export const useDoctorProfile = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: CreateProfileData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .insert({
          user_id: user.id,
          full_name: profileData.full_name,
          age: profileData.age,
          gender: profileData.gender,
          country: profileData.country,
          profile_picture_url: profileData.profile_picture_url,
          phone_number: profileData.phone_number,
          years_of_experience: profileData.years_of_experience,
          specialization: profileData.specialization,
          clinical_address: profileData.clinical_address,
          pincode: profileData.pincode,
          regulatory_body: profileData.regulatory_body,
          license_number: profileData.license_number,
          public_profile: profileData.public_profile || false,
          is_profile_complete: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<CreateProfileData>) => {
    if (!user || !profile) throw new Error('User not authenticated or profile not found');

    try {
      const updateData: any = {
        ...profileData,
        is_profile_complete: true
      };

      const { data, error } = await supabase
        .from('doctor_profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    fetchProfile
  };
};
