
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, MapPin, Calendar, Stethoscope, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DoctorProfile } from '@/hooks/useDoctorProfile';
import { useNavigate } from 'react-router-dom';

interface DirectoryStats {
  totalDoctors: number;
  specializations: { [key: string]: number };
  countries: { [key: string]: number };
}

const DoctorsDirectory = () => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([]);
  const [stats, setStats] = useState<DirectoryStats>({ totalDoctors: 0, specializations: {}, countries: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization, selectedCountry]);

  const fetchPublicDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('public_profile', true)
        .eq('is_profile_complete', true);

      if (error) throw error;

      setDoctors(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (doctorsList: DoctorProfile[]) => {
    const specializations: { [key: string]: number } = {};
    const countries: { [key: string]: number } = {};

    doctorsList.forEach(doctor => {
      if (doctor.specialization) {
        doctor.specialization.forEach(spec => {
          specializations[spec] = (specializations[spec] || 0) + 1;
        });
      }
      if (doctor.country) {
        countries[doctor.country] = (countries[doctor.country] || 0) + 1;
      }
    });

    setStats({
      totalDoctors: doctorsList.length,
      specializations,
      countries
    });
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialization?.includes(selectedSpecialization)
      );
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(doctor => doctor.country === selectedCountry);
    }

    setFilteredDoctors(filtered);
  };

  const getTopSpecializations = () => {
    return Object.entries(stats.specializations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopCountries = () => {
    return Object.entries(stats.countries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl blur-lg opacity-30 transform scale-110"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-2xl shadow-xl ring-1 ring-white/20 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                Doctors Directory
              </h1>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              Discover healthcare professionals using MediSafe AI
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] text-white hover:shadow-lg hover:shadow-purple-500/25"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join as Doctor
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/60 backdrop-blur-xl border-white/30">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[#cb6ce6] mb-2">{stats.totalDoctors}</div>
                <div className="text-gray-600">Registered Doctors</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-xl border-white/30">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[#cb6ce6] mb-2">{Object.keys(stats.specializations).length}</div>
                <div className="text-gray-600">Specializations</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-xl border-white/30">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[#cb6ce6] mb-2">{Object.keys(stats.countries).length}</div>
                <div className="text-gray-600">Countries</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-white/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Specialization</label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30">
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {Object.keys(stats.specializations).map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {Object.keys(stats.countries).map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with top specializations and countries */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/60 backdrop-blur-xl border-white/30">
              <CardHeader>
                <CardTitle className="text-lg">Top Specializations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTopSpecializations().map(([spec, count]) => (
                  <div key={spec} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{spec}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-xl border-white/30">
              <CardHeader>
                <CardTitle className="text-lg">Top Countries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTopCountries().map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{country}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Doctors Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            {filteredDoctors.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-xl border-white/30">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="bg-white/60 backdrop-blur-xl border-white/30 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            Dr. {doctor.full_name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {doctor.country && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{doctor.country}</span>
                              </div>
                            )}
                            {doctor.years_of_experience && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{doctor.years_of_experience}+ years</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-lg">
                          <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {doctor.specialization && doctor.specialization.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Specializations:</p>
                          <div className="flex flex-wrap gap-2">
                            {doctor.specialization.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {doctor.specialization.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{doctor.specialization.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {doctor.regulatory_body && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Licensed with {doctor.regulatory_body}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsDirectory;
