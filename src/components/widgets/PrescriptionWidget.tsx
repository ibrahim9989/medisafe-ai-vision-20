
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionWidgetProps {
  config: {
    patientId?: string;
    readOnly?: boolean;
  };
  onEvent: (eventType: string, data: any) => void;
}

const PrescriptionWidget: React.FC<PrescriptionWidgetProps> = ({ config, onEvent }) => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patientName, setPatientName] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load patient data if patientId is provided
    if (config.patientId) {
      loadPatientData();
    }
  }, [config.patientId]);

  const loadPatientData = async () => {
    // Implementation to load patient data from FHIR or internal database
    // This would typically integrate with the EHS system's patient data
  };

  const addMedication = () => {
    const newMedication: Medication = {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMedication]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const analyzePrescription = async () => {
    if (medications.length === 0) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-prescription-analysis', {
        body: {
          medications,
          patientId: config.patientId,
          patientName
        }
      });

      if (error) throw error;

      setAnalysis(data);
      onEvent('prescriptionAnalyzed', { medications, analysis: data });
    } catch (error) {
      console.error('Analysis failed:', error);
      onEvent('error', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const savePrescription = async () => {
    try {
      const prescription = {
        patientName,
        medications,
        analysis,
        createdBy: user?.id
      };

      // Save to internal database
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user?.id || '',
          patient_name: patientName,
          medications: JSON.parse(JSON.stringify(medications)),
          doctor_name: user?.user_metadata?.full_name || 'Dr. User',
          age: 0, // Will be updated with actual patient data
          gender: 'Unknown' // Will be updated with actual patient data
        })
        .select();

      if (error) throw error;

      const insertedId = data && data.length > 0 ? data[0].id : null;
      onEvent('prescriptionCreated', { prescription, id: insertedId });
    } catch (error) {
      console.error('Save failed:', error);
      onEvent('error', error);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Prescription Widget</span>
            {config.patientId && <Badge variant="outline">Patient: {config.patientId}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              readOnly={config.readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Medications</span>
            {!config.readOnly && (
              <Button onClick={addMedication} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.map((medication, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Medication {index + 1}</h4>
                {!config.readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Medication Name</Label>
                  <Input
                    value={medication.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    placeholder="e.g., Amoxicillin"
                    readOnly={config.readOnly}
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input
                    value={medication.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    readOnly={config.readOnly}
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Input
                    value={medication.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    placeholder="e.g., Twice daily"
                    readOnly={config.readOnly}
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={medication.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                    readOnly={config.readOnly}
                  />
                </div>
              </div>
              
              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={medication.instructions}
                  onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  placeholder="Additional instructions for the patient"
                  readOnly={config.readOnly}
                />
              </div>
            </div>
          ))}

          {medications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No medications added yet. Click "Add Medication" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>AI Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.drugInteractions?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-600 mb-2">Drug Interactions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.drugInteractions.map((interaction: any, index: number) => (
                    <li key={index} className="text-sm">{interaction.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.map((rec: any, index: number) => (
                    <li key={index} className="text-sm">{rec.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!config.readOnly && (
        <div className="flex space-x-3">
          <Button
            onClick={analyzePrescription}
            disabled={medications.length === 0 || isAnalyzing}
            variant="outline"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Prescription'}
          </Button>
          <Button
            onClick={savePrescription}
            disabled={medications.length === 0 || !patientName}
          >
            Save Prescription
          </Button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionWidget;
