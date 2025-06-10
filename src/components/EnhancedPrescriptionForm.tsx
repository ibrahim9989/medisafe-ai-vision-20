import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, History } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';
import PatientSearch from './PatientSearch';
import PatientHistoryView from './PatientHistoryView';
import PatientInfo from './PatientInfo';
import { usePatientHistory } from '@/hooks/usePatientHistory';

interface EnhancedPrescriptionFormProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
  children: React.ReactNode;
}

const EnhancedPrescriptionForm = ({ data, onChange, children }: EnhancedPrescriptionFormProps) => {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { patientHistory, getPatientHistory, loading } = usePatientHistory();

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatientId(patientId);
    const history = await getPatientHistory(patientId);
    
    if (history) {
      // Pre-populate form with patient information
      onChange({
        ...data,
        patientName: history.patient.full_name,
        age: history.patient.age || 0,
        gender: history.patient.gender || '',
        contact: history.patient.phone_number || '',
      });
    }
  };

  const handleNewPatient = () => {
    setMode('new');
    setSelectedPatientId(null);
    // Clear patient data
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
            <span className="text-xl font-medium">Patient Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={mode === 'new' ? 'default' : 'outline'}
              onClick={handleNewPatient}
              className={mode === 'new' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
            <Button
              variant={mode === 'existing' ? 'default' : 'outline'}
              onClick={() => setMode('existing')}
              className={mode === 'existing' ? 'bg-gradient-to-r from-green-500 to-green-600' : ''}
            >
              <History className="h-4 w-4 mr-2" />
              Existing Patient
            </Button>
          </div>

          {mode === 'existing' && (
            <PatientSearch
              onPatientSelect={handlePatientSelect}
              selectedPatientId={selectedPatientId}
            />
          )}
        </CardContent>
      </Card>

      {/* Patient History View */}
      {patientHistory && selectedPatientId && (
        <PatientHistoryView patientHistory={patientHistory} />
      )}

      {/* Patient Info Form */}
      {(mode === 'new' || selectedPatientId) && (
        <PatientInfo data={data} onChange={onChange} />
      )}

      {/* Rest of the prescription form */}
      {children}
    </div>
  );
};

export default EnhancedPrescriptionForm;
