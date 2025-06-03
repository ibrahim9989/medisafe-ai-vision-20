
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';

interface MedicationListProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const MedicationList = ({ data, onChange }: MedicationListProps) => {
  const addMedication = () => {
    const newMedications = [
      ...data.medications,
      { name: '', dosage: '', frequency: '', duration: '' }
    ];
    onChange({ ...data, medications: newMedications });
  };

  const removeMedication = (index: number) => {
    const newMedications = data.medications.filter((_, i) => i !== index);
    onChange({ ...data, medications: newMedications });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMedications = data.medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    onChange({ ...data, medications: newMedications });
  };

  const commonMedications = [
    'Aspirin', 'Lisinopril', 'Metformin', 'Atorvastatin', 'Amlodipine',
    'Metoprolol', 'Omeprazole', 'Simvastatin', 'Losartan', 'Gabapentin'
  ];

  const frequencyOptions = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 8 hours', 'Every 12 hours', 'As needed', 'Before meals', 'After meals'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-blue-600" />
          <span>Medications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.medications.map((medication, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
              {data.medications.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Select or type medication name"
                  list={`medications-${index}`}
                  required
                />
                <datalist id={`medications-${index}`}>
                  {commonMedications.map(med => (
                    <option key={med} value={med} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500mg, 10ml"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={medication.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 7 days, 2 weeks"
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addMedication}
          className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Medication
        </Button>
      </CardContent>
    </Card>
  );
};

export default MedicationList;
