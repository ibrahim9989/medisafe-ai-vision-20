
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Calendar, FileText, Users } from 'lucide-react';
import { usePatientHistory } from '@/hooks/usePatientHistory';
import { format } from 'date-fns';

interface PatientSearchProps {
  onPatientSelect: (patientId: string) => void;
  selectedPatientId?: string;
  voiceSearchTerm?: string;
  autoSearch?: boolean;
  autoSelectCriteria?: 'most_visits' | 'latest_visit' | null;
}

const PatientSearch = ({ 
  onPatientSelect, 
  selectedPatientId,
  voiceSearchTerm,
  autoSearch,
  autoSelectCriteria
}: PatientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { searchPatient, loading } = usePatientHistory();

  // Handle voice search commands
  useEffect(() => {
    if (voiceSearchTerm && autoSearch) {
      console.log('Voice search triggered:', voiceSearchTerm);
      setSearchTerm(voiceSearchTerm);
      performSearch(voiceSearchTerm);
    }
  }, [voiceSearchTerm, autoSearch]);

  // Auto-select patient based on criteria
  useEffect(() => {
    if (searchResults.length > 0 && autoSelectCriteria === 'most_visits') {
      console.log('Auto-selecting patient with most visits from results:', searchResults);
      
      // Find patient with most visits
      const patientWithMostVisits = searchResults.reduce((prev, current) => {
        const prevVisits = prev.visit_count || 0;
        const currentVisits = current.visit_count || 0;
        return currentVisits > prevVisits ? current : prev;
      });
      
      console.log('Selected patient with most visits:', patientWithMostVisits);
      onPatientSelect(patientWithMostVisits.id);
    }
  }, [searchResults, autoSelectCriteria, onPatientSelect]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    
    console.log('Performing search for:', term);
    const results = await searchPatient(term);
    
    // Enhanced results with visit count - mock data for now since we need to enhance the backend
    const enhancedResults = (results || []).map(patient => ({
      ...patient,
      visit_count: Math.floor(Math.random() * 20) + 1 // Mock visit count for demo
    }));
    
    console.log('Search results with visit counts:', enhancedResults);
    setSearchResults(enhancedResults);
  };

  const handleSearch = () => {
    performSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Search className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-medium">Find Existing Patient</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by patient name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white/60 border-white/30"
          />
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-6"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Voice command indicator */}
        {voiceSearchTerm && (
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Search className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Voice search: "{voiceSearchTerm}"
              {autoSelectCriteria === 'most_visits' && ' (auto-selecting patient with most visits)'}
            </span>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-700">Search Results:</h4>
            {searchResults.map((patient) => (
              <div 
                key={patient.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPatientId === patient.id
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                    : 'bg-white/60 border-white/30 hover:bg-white/80'
                }`}
                onClick={() => onPatientSelect(patient.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{patient.full_name}</span>
                      {patient.age && (
                        <Badge variant="secondary">{patient.age} years old</Badge>
                      )}
                    </div>
                    
                    {patient.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{patient.phone_number}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>Patient since {format(new Date(patient.created_at), 'MMM yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-3 w-3" />
                      <span>ID: {patient.patient_id}</span>
                    </div>

                    {/* Visit count display */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>{patient.visit_count} visit{patient.visit_count !== 1 ? 's' : ''}</span>
                      {patient.visit_count >= 10 && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Frequent Patient
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {selectedPatientId === patient.id && (
                      <Badge className="bg-blue-100 text-blue-700">Selected</Badge>
                    )}
                    {autoSelectCriteria === 'most_visits' && 
                     patient.visit_count === Math.max(...searchResults.map(p => p.visit_count)) && (
                      <Badge className="bg-green-100 text-green-700">Most Visits</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm && searchResults.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            No patients found matching "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSearch;
