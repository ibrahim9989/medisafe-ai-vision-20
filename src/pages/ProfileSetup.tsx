
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { User, Stethoscope, Upload } from 'lucide-react';

const INDIAN_REGULATORY_BODIES = [
  'Medical Council of India (MCI)',
  'National Medical Commission (NMC)',
  'State Medical Council',
  'Dental Council of India (DCI)',
  'Pharmacy Council of India (PCI)',
  'Indian Nursing Council (INC)',
  'Central Council of Homoeopathy (CCH)',
  'Central Council of Indian Medicine (CCIM)'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden',
  'Norway', 'Denmark', 'Switzerland', 'Singapore', 'Japan'
];

const SPECIALIZATIONS = [
  'General Medicine', 'Internal Medicine', 'Cardiology', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Obstetrics & Gynecology', 'Psychiatry',
  'Dermatology', 'Ophthalmology', 'ENT', 'Radiology', 'Pathology',
  'Anesthesiology', 'Emergency Medicine', 'Family Medicine',
  'Endocrinology', 'Gastroenterology', 'Nephrology', 'Oncology',
  'Pulmonology', 'Rheumatology', 'Urology', 'Plastic Surgery',
  'General Surgery', 'Neurosurgery', 'Cardiac Surgery'
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { createProfile, updateProfile, profile } = useDoctorProfile();
  const [loading, setLoading] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    country: profile?.country || '',
    phone_number: profile?.phone_number || '',
    years_of_experience: profile?.years_of_experience || '',
    clinical_address: profile?.clinical_address || '',
    pincode: profile?.pincode || '',
    regulatory_body: profile?.regulatory_body || '',
    license_number: profile?.license_number || '',
    profile_picture_url: profile?.profile_picture_url || ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        country: profile.country || '',
        phone_number: profile.phone_number || '',
        years_of_experience: profile.years_of_experience || '',
        clinical_address: profile.clinical_address || '',
        pincode: profile.pincode || '',
        regulatory_body: profile.regulatory_body || '',
        license_number: profile.license_number || '',
        profile_picture_url: profile.profile_picture_url || ''
      });
      setSelectedSpecializations(profile.specialization || []);
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setSelectedSpecializations(prev => 
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        ...formData,
        age: formData.age ? parseInt(formData.age.toString()) : null,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience.toString()) : null,
        specialization: selectedSpecializations
      };

      if (profile) {
        await updateProfile(profileData);
      } else {
        await createProfile(profileData);
      }

      toast({
        title: "Profile Saved",
        description: "Your profile has been saved successfully!",
      });

      navigate('/', { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
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
            linear-gradient(to bottom, #8b7355 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
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
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-500">
              Please fill in your professional details to get started
            </p>
          </div>

          {/* Profile Form */}
          <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl ring-1 ring-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl opacity-20 blur-lg"></div>
                  <div className="relative p-2 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <span className="text-lg font-medium text-gray-900 tracking-wide">
                  Doctor Profile
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30"
                      placeholder="Dr. John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30"
                      placeholder="35"
                      min="18"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                    <Input
                      id="years_of_experience"
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30"
                      placeholder="10"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-md">
                    {SPECIALIZATIONS.map(spec => (
                      <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSpecializations.includes(spec)}
                          onChange={() => handleSpecializationToggle(spec)}
                          className="rounded border-white/30"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regulatory_body">Regulatory Body</Label>
                    <Select value={formData.regulatory_body} onValueChange={(value) => handleInputChange('regulatory_body', value)}>
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30">
                        <SelectValue placeholder="Select regulatory body" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_REGULATORY_BODIES.map(body => (
                          <SelectItem key={body} value={body}>{body}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30"
                      placeholder="MCI-12345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="bg-white/60 backdrop-blur-sm border-white/30"
                      placeholder="110001"
                    />
                  </div>
                </div>

                {/* Clinical Address */}
                <div className="space-y-2">
                  <Label htmlFor="clinical_address">Clinical Address</Label>
                  <Textarea
                    id="clinical_address"
                    value={formData.clinical_address}
                    onChange={(e) => handleInputChange('clinical_address', e.target.value)}
                    className="bg-white/60 backdrop-blur-sm border-white/30"
                    placeholder="Enter your clinic or hospital address"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300"
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
