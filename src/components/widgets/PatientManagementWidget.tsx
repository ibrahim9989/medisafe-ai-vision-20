
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Activity, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phoneNumber?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
  };
}

interface PatientManagementWidgetProps {
  config: {
    patientId: string;
    editableFields?: string[];
  };
  onEvent: (eventType: string, data: any) => void;
}

const PatientManagementWidget: React.FC<PatientManagementWidgetProps> = ({ config, onEvent }) => {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const editableFields = config.editableFields || ['name', 'age', 'gender', 'phoneNumber', 'address', 'medicalHistory', 'allergies'];

  useEffect(() => {
    if (config.patientId) {
      loadPatientData();
      loadPatientHistory();
    }
  }, [config.patientId]);

  const loadPatientData = async () => {
    try {
      // Load patient data from database
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', config.patientId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPatient({
          id: data.id,
          name: data.full_name,
          age: data.age || 0,
          gender: data.gender || '',
          phoneNumber: data.phone_number || '',
          address: data.address || '',
          medicalHistory: '',
          allergies: '',
          currentMedications: ''
        });
      } else {
        // Create placeholder patient if not found
        setPatient({
          id: config.patientId,
          name: 'Unknown Patient',
          age: 0,
          gender: '',
          phoneNumber: '',
          address: '',
          medicalHistory: '',
          allergies: '',
          currentMedications: ''
        });
      }
    } catch (error) {
      console.error('Failed to load patient:', error);
      onEvent('error', 'Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientHistory = async () => {
    try {
      // Load patient visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('patient_visits')
        .select('*')
        .eq('patient_id', config.patientId)
        .order('visit_date', { ascending: false })
        .limit(10);

      if (visitsError) throw visitsError;
      setVisits(visitsData || []);

      // Load patient prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_name', patient?.name || '')
        .order('created_at', { ascending: false })
        .limit(10);

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

    } catch (error) {
      console.error('Failed to load patient history:', error);
    }
  };

  const updatePatient = (field: keyof PatientData, value: any) => {
    if (!patient) return;
    
    setPatient({
      ...patient,
      [field]: value
    });
  };

  const updateVitals = (field: string, value: any) => {
    if (!patient) return;
    
    setPatient({
      ...patient,
      vitals: {
        ...patient.vitals,
        [field]: value
      }
    });
  };

  const savePatient = async () => {
    if (!patient) return;

    try {
      const patientData = {
        patient_id: config.patientId,
        full_name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone_number: patient.phoneNumber,
        address: patient.address,
        doctor_id: '', // This would come from the authenticated doctor
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('patients')
        .upsert(patientData);

      if (error) throw error;

      setIsEditing(false);
      onEvent('patientUpdated', patient);
    } catch (error) {
      console.error('Failed to save patient:', error);
      onEvent('error', 'Failed to save patient data');
    }
  };

  const isFieldEditable = (field: string) => {
    return editableFields.includes(field);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cb6ce6]"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Patient Information</span>
              <Badge variant="outline">ID: {config.patientId}</Badge>
            </div>
            <Button
              onClick={() => isEditing ? savePatient() : setIsEditing(true)}
              size="sm"
            >
              {isEditing ? 'Save Changes' : 'Edit Patient'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="demographics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="visits">Recent Visits</TabsTrigger>
            </TabsList>

            <TabsContent value="demographics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={patient.name}
                    onChange={(e) => updatePatient('name', e.target.value)}
                    readOnly={!isEditing || !isFieldEditable('name')}
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={patient.age}
                    onChange={(e) => updatePatient('age', parseInt(e.target.value) || 0)}
                    readOnly={!isEditing || !isFieldEditable('age')}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input
                    value={patient.gender}
                    onChange={(e) => updatePatient('gender', e.target.value)}
                    readOnly={!isEditing || !isFieldEditable('gender')}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={patient.phoneNumber}
                    onChange={(e) => updatePatient('phoneNumber', e.target.value)}
                    readOnly={!isEditing || !isFieldEditable('phoneNumber')}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={patient.address}
                    onChange={(e) => updatePatient('address', e.target.value)}
                    readOnly={!isEditing || !isFieldEditable('address')}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Temperature (°F)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={patient.vitals?.temperature || ''}
                    onChange={(e) => updateVitals('temperature', parseFloat(e.target.value) || 0)}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    value={patient.vitals?.bloodPressure || ''}
                    onChange={(e) => updateVitals('bloodPressure', e.target.value)}
                    placeholder="120/80"
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={patient.vitals?.heartRate || ''}
                    onChange={(e) => updateVitals('heartRate', parseInt(e.target.value) || 0)}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <Label>Respiratory Rate</Label>
                  <Input
                    type="number"
                    value={patient.vitals?.respiratoryRate || ''}
                    onChange={(e) => updateVitals('respiratoryRate', parseInt(e.target.value) || 0)}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <Label>Medical History</Label>
                <Textarea
                  value={patient.medicalHistory}
                  onChange={(e) => updatePatient('medicalHistory', e.target.value)}
                  readOnly={!isEditing || !isFieldEditable('medicalHistory')}
                  rows={4}
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={patient.allergies}
                  onChange={(e) => updatePatient('allergies', e.target.value)}
                  readOnly={!isEditing || !isFieldEditable('allergies')}
                  rows={3}
                />
              </div>
              <div>
                <Label>Current Medications</Label>
                <Textarea
                  value={patient.currentMedications}
                  onChange={(e) => updatePatient('currentMedications', e.target.value)}
                  readOnly={!isEditing}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="visits" className="space-y-4">
              <div className="space-y-3">
                {visits.length > 0 ? (
                  visits.map((visit, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(visit.visit_date).toLocaleDateString()}</span>
                            </h4>
                            {visit.reason_for_visit && (
                              <p className="text-sm text-gray-600 mt-1">{visit.reason_for_visit}</p>
                            )}
                            {visit.diagnosis && (
                              <p className="text-sm mt-1"><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                            )}
                          </div>
                          {visit.is_follow_up && (
                            <Badge variant="outline">Follow-up</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent visits found</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientManagementWidget;
