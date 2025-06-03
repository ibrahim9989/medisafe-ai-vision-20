
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Brain, CheckCircle } from 'lucide-react';
import PatientInfo from './PatientInfo';
import MedicationList from './MedicationList';
import VitalSigns from './VitalSigns';
import AIAnalysis from './AIAnalysis';
import { toast } from '@/hooks/use-toast';

export interface PrescriptionData {
  doctorName: string;
  patientName: string;
  age: number;
  gender: string;
  contact: string;
  temperature: number;
  bp: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
  followUpDate: string;
}

const PrescriptionForm = () => {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>({
    doctorName: '',
    patientName: '',
    age: 0,
    gender: '',
    contact: '',
    temperature: 98.6,
    bp: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
    followUpDate: ''
  });

  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateMockAnalysis = (data: PrescriptionData) => {
    const medicationNames = data.medications
      .filter(med => med.name.trim())
      .map(med => med.name.trim().toLowerCase());

    // Define known drug interactions and adverse reactions
    const knownInteractions: { [key: string]: any } = {
      'aspirin-warfarin': {
        medications: ['Aspirin', 'Warfarin'],
        severity: 'High',
        description: 'Increased risk of bleeding when used together'
      },
      'aspirin-metformin': {
        medications: ['Aspirin', 'Metformin'],
        severity: 'Low',
        description: 'Monitor blood glucose levels more closely'
      }
    };

    const knownAdverseReactions: { [key: string]: any } = {
      'lisinopril': {
        medication: 'Lisinopril',
        reaction: 'Dry cough',
        likelihood: 'Medium',
        patientRisk: 'Consider patient age and gender'
      },
      'amoxicillin': {
        medication: 'Amoxicillin',
        reaction: 'Allergic reactions, nausea',
        likelihood: 'Low',
        patientRisk: 'Monitor for rash or digestive issues'
      },
      'metformin': {
        medication: 'Metformin',
        reaction: 'Gastrointestinal upset, lactic acidosis (rare)',
        likelihood: 'Medium',
        patientRisk: 'Monitor kidney function, especially in elderly patients'
      }
    };

    // Check for interactions between prescribed medications
    const drugInteractions = [];
    for (let i = 0; i < medicationNames.length; i++) {
      for (let j = i + 1; j < medicationNames.length; j++) {
        const key1 = `${medicationNames[i]}-${medicationNames[j]}`;
        const key2 = `${medicationNames[j]}-${medicationNames[i]}`;
        
        if (knownInteractions[key1]) {
          drugInteractions.push(knownInteractions[key1]);
        } else if (knownInteractions[key2]) {
          drugInteractions.push(knownInteractions[key2]);
        }
      }
    }

    // Check for adverse reactions for each prescribed medication
    const adverseReactions = medicationNames
      .map(med => knownAdverseReactions[med])
      .filter(reaction => reaction);

    // Generate dosage validation for prescribed medications
    const dosageValidation = data.medications
      .filter(med => med.name.trim())
      .map(med => ({
        medication: med.name,
        status: 'Appropriate',
        recommendation: `Dosage of ${med.dosage} ${med.frequency} appears within normal range for this medication`
      }));

    // Determine overall risk
    let overallRisk = 'Low';
    if (drugInteractions.some(interaction => interaction.severity === 'High')) {
      overallRisk = 'High';
    } else if (drugInteractions.some(interaction => interaction.severity === 'Medium') || 
               adverseReactions.some(reaction => reaction.likelihood === 'Medium')) {
      overallRisk = 'Medium';
    }

    // Generate recommendations
    const recommendations = [
      'Monitor patient response to prescribed medications',
      'Schedule follow-up appointment as indicated',
      'Educate patient about potential side effects'
    ];

    if (drugInteractions.length > 0) {
      recommendations.unshift('Monitor for drug interaction effects closely');
    }

    if (data.age > 65) {
      recommendations.push('Consider dose adjustments for elderly patient');
    }

    return {
      drugInteractions,
      adverseReactions,
      dosageValidation,
      overallRisk,
      recommendations
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!prescriptionData.patientName || !prescriptionData.doctorName) {
      toast({
        title: "Validation Error",
        description: "Please fill in required patient and doctor information.",
        variant: "destructive"
      });
      return;
    }

    if (prescriptionData.medications.some(med => !med.name)) {
      toast({
        title: "Validation Error", 
        description: "Please specify all medication names.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Generate analysis based on actual prescription data
      setTimeout(() => {
        const mockAnalysis = generateMockAnalysis(prescriptionData);
        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
        toast({
          title: "Analysis Complete",
          description: "AI analysis has been generated successfully.",
        });
      }, 2000);

    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete AI analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientInfo 
            data={prescriptionData} 
            onChange={setPrescriptionData} 
          />
          <VitalSigns 
            data={prescriptionData} 
            onChange={setPrescriptionData} 
          />
        </div>
        
        <MedicationList 
          data={prescriptionData} 
          onChange={setPrescriptionData} 
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Additional Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Notes
              </label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData({
                  ...prescriptionData,
                  notes: e.target.value
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional clinical observations, patient concerns, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={prescriptionData.followUpDate}
                onChange={(e) => setPrescriptionData({
                  ...prescriptionData,
                  followUpDate: e.target.value
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-5 w-5 mr-2 animate-pulse" />
                Analyzing Prescription...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Analyze Prescription
              </>
            )}
          </Button>
        </div>
      </form>

      {analysis && <AIAnalysis analysis={analysis} />}
    </div>
  );
};

export default PrescriptionForm;
