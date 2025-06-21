import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, History } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';
import PatientSearch from './PatientSearch';
import PatientHistoryView from './PatientHistoryView';
import PatientInfo from './PatientInfo';
import { usePatientHistory } from '@/hooks/usePatientHistory';
import { toast } from '@/hooks/use-toast';

interface EnhancedPrescriptionFormProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
  children: React.ReactNode;
}

const EnhancedPrescriptionForm = ({ data, onChange, children }: EnhancedPrescriptionFormProps) => {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [voiceSearchTerm, setVoiceSearchTerm] = useState<string>('');
  const [autoSearch, setAutoSearch] = useState(false);
  const [autoSelectCriteria, setAutoSelectCriteria] = useState<'most_visits' | 'latest_visit' | null>(null);
  const { patientHistory, getPatientHistory, loading } = usePatientHistory();

  useEffect(() => {
    const handleVoiceSearch = (event: CustomEvent) => {
      const { query, autoSelect, switchToExisting } = event.detail;
      console.log('🎤 Enhanced voice search command received in EnhancedPrescriptionForm:', event.detail);
      
      if (switchToExisting) {
        console.log('🔄 Auto-switching to existing patient mode');
        setMode('existing');
      }
      
      setVoiceSearchTerm(query);
      setAutoSearch(true);
      
      if (autoSelect === 'most_visits') {
        setAutoSelectCriteria('most_visits');
        toast({
          title: "🎤 Enhanced Voice Search",
          description: `Searching for "${query}" and will auto-select patient with most visits`,
        });
      } else if (autoSelect === 'latest_visit') {
        setAutoSelectCriteria('latest_visit');
        toast({
          title: "🎤 Enhanced Voice Search", 
          description: `Searching for "${query}" and will auto-select most recent patient`,
        });
      } else {
        setAutoSelectCriteria(null);
        toast({
          title: "🎤 Enhanced Voice Search",
          description: `Searching for "${query}"`,
        });
      }
    };

    window.addEventListener('voice-search', handleVoiceSearch as EventListener);
    
    return () => {
      window.removeEventListener('voice-search', handleVoiceSearch as EventListener);
    };
  }, []);

  useEffect(() => {
    if (autoSearch && voiceSearchTerm) {
      const timer = setTimeout(() => {
        setAutoSearch(false);
        setVoiceSearchTerm('');
        setAutoSelectCriteria(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [autoSearch, voiceSearchTerm]);

  const handlePatientSelect = async (patientId: string) => {
    console.log('Patient selected:', patientId);
    setSelectedPatientId(patientId);
    const history = await getPatientHistory(patientId);
    
    if (history) {
      onChange({
        ...data,
        patientName: history.patient.full_name,
        age: history.patient.age || 0,
        gender: history.patient.gender || '',
        contact: history.patient.phone_number || '',
      });

      toast({
        title: "✅ Patient Selected",
        description: `${history.patient.full_name} has been selected and form updated`,
      });
    }
  };

  const handleNewPatient = () => {
    setMode('new');
    setSelectedPatientId(null);
    onChange({
      ...data,
      patientName: '',
      age: 0,
      gender: '',
      contact: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Patient Selection Mode */}
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Patient Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 mb-6 w-full max-w-none">
            <Button
              variant={mode === 'new' ? 'default' : 'outline'}
              onClick={handleNewPatient}
              className={
                mode === 'new'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 min-w-[150px]'
                  : 'min-w-[150px]'
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
            <Button
              variant={mode === 'existing' ? 'default' : 'outline'}
              onClick={() => setMode('existing')}
              className={
                mode === 'existing'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 min-w-[150px]'
                  : 'min-w-[150px]'
              }
            >
              <History className="h-4 w-4 mr-2" />
              Existing Patient
            </Button>
          </div>

          {mode === 'existing' && (
            <PatientSearch
              onPatientSelect={handlePatientSelect}
              selectedPatientId={selectedPatientId}
              voiceSearchTerm={voiceSearchTerm}
              autoSearch={autoSearch}
              autoSelectCriteria={autoSelectCriteria}
            />
          )}
        </CardContent>
      </Card>

      {/* Patient History View */}
      {patientHistory && selectedPatientId && (
        <PatientHistoryView patientHistory={patientHistory} />
      )}

      {/* Patient Info Form - Only show when new patient or patient selected */}
      {(mode === 'new' || selectedPatientId) && (
        <PatientInfo data={data} onChange={onChange} />
      )}

      {/* Rest of the prescription form */}
      {children}
    </div>
  );
};

export default EnhancedPrescriptionForm;
