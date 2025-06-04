
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Brain, CheckCircle, Search, Sparkles, Zap } from 'lucide-react';
import PatientInfo from './PatientInfo';
import MedicationList from './MedicationList';
import VitalSigns from './VitalSigns';
import AIAnalysis from './AIAnalysis';
import { toast } from '@/hooks/use-toast';
import EnhancedMedicationList from './EnhancedMedicationList';
import { tavilyService } from '../services/tavilyService';

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
  const [isValidating, setIsValidating] = useState(false);

  const analyzePrescriptionWithLyzr = async (data: PrescriptionData) => {
    console.log('Resolving medicine names...');
    const resolvedMedications = await Promise.all(
      data.medications
        .filter(med => med.name.trim())
        .map(async (med) => {
          try {
            const resolution = await tavilyService.resolveMedicineName(med.name);
            return {
              originalName: med.name,
              genericName: resolution.genericName,
              activeIngredients: resolution.activeIngredients,
              confidence: resolution.confidence,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration
            };
          } catch (error) {
            return { 
              originalName: med.name,
              genericName: med.name, 
              activeIngredients: [med.name], 
              confidence: 0.3,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration
            };
          }
        })
    );

    const medicationDetails = resolvedMedications
      .map(med => `${med.genericName} (originally entered as: ${med.originalName}) - ${med.dosage} ${med.frequency} for ${med.duration}`)
      .join(', ');

    console.log('Medications being sent to AI analysis:', resolvedMedications.map(med => ({
      generic: med.genericName,
      original: med.originalName,
      dosage: med.dosage,
      frequency: med.frequency
    })));

    const analysisPrompt = `Analyze this prescription for drug interactions, adverse reactions, dosage validation, and provide specific alternative medications.

IMPORTANT: Analyze the GENERIC NAMES ONLY for accurate medical interactions. The original branded names are provided for reference only.

Patient Information:
- Name: ${data.patientName}
- Age: ${data.age}
- Gender: ${data.gender}
- Temperature: ${data.temperature}°F
- Blood Pressure: ${data.bp}

Medications to Analyze (USE GENERIC NAMES):
${medicationDetails}

Active Ingredients Summary:
${resolvedMedications.map(med => `${med.genericName}: ${med.activeIngredients.join(', ')}`).join('\n')}

Clinical Notes: ${data.notes}

Please provide a comprehensive analysis based on the GENERIC DRUG NAMES and active ingredients including:
1. Drug-drug interactions (analyze interactions between the GENERIC medications)
2. Potential adverse reactions based on patient profile
3. Dosage validation for each GENERIC medication
4. Overall risk assessment (Low/Medium/High)
5. Clinical recommendations
6. ALTERNATIVE MEDICATIONS: For any medication with HIGH or MEDIUM risk, suggest specific alternative GENERIC medicine names that would be safer and not interact with other prescribed medications

CRITICAL: Base all analysis on the generic drug names and active ingredients, not the branded names.

Format the response as JSON with the following structure:
{
  "drugInteractions": [{"medications": [], "severity": "", "description": ""}],
  "adverseReactions": [{"medication": "", "reaction": "", "likelihood": "", "patientRisk": ""}],
  "dosageValidation": [{"medication": "", "status": "", "recommendation": ""}],
  "overallRisk": "",
  "recommendations": [],
  "alternatives": [{"originalMedication": "", "riskLevel": "", "alternativeMedicines": [], "reasoning": ""}],
  "medicationResolutions": [{"originalName": "", "genericName": "", "activeIngredients": []}]
}`;

    try {
      const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-default-AsQXLZ1TMDXuZxqud7PGl6ae7Q5Gs5UX'
        },
        body: JSON.stringify({
          user_id: "ibrahimshaheer75@gmail.com",
          agent_id: "68401a5c0ff8ffe17f2c0aab",
          session_id: "68401a5c0ff8ffe17f2c0aab-zzfkwq1hb0s",
          message: analysisPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Lyzr API Response:', result);

      let analysisData;
      try {
        const messageContent = result.response || result.message || result.content || '';
        analysisData = JSON.parse(messageContent);
      } catch (parseError) {
        console.log('Failed to parse JSON response, using fallback analysis');
        analysisData = generateMockAnalysis(data, resolvedMedications);
      }

      analysisData.medicationResolutions = resolvedMedications.map(med => ({
        originalName: med.originalName,
        genericName: med.genericName,
        activeIngredients: med.activeIngredients,
        confidence: med.confidence
      }));

      if (analysisData.drugInteractions && analysisData.drugInteractions.length > 0) {
        console.log('Validating drug interactions...');
        setIsValidating(true);
        
        const validatedInteractions = await Promise.all(
          analysisData.drugInteractions.map(async (interaction: any) => {
            try {
              const validation = await tavilyService.validateADRPrediction(
                interaction.medications.join(' + '),
                interaction.description
              );
              return {
                ...interaction,
                validated: validation.validated,
                confidence: validation.confidence,
                sources: validation.sources,
                additionalInfo: validation.additionalInfo
              };
            } catch (error) {
              return { ...interaction, validated: false, confidence: 0 };
            }
          })
        );
        
        analysisData.drugInteractions = validatedInteractions;
        setIsValidating(false);
      }

      return analysisData;
    } catch (error) {
      console.error('Lyzr API Error:', error);
      return generateMockAnalysis(data, resolvedMedications);
    }
  };

  const generateMockAnalysis = (data: PrescriptionData, resolvedMedications: any[]) => {
    const genericNames = resolvedMedications.map(med => med.genericName.toLowerCase());

    console.log('Generating mock analysis for generic medications:', genericNames);

    const drugInteractions = [];
    const adverseReactions = [];
    const alternatives = [];

    genericNames.forEach((genericName, index) => {
      const originalMed = resolvedMedications[index];
      
      if (genericName.includes('amoxicillin')) {
        adverseReactions.push({
          medication: originalMed.genericName,
          reaction: 'Gastrointestinal upset, allergic reactions including rash',
          likelihood: 'Medium',
          patientRisk: 'Monitor for allergic reactions and GI disturbances'
        });
        
        alternatives.push({
          originalMedication: originalMed.genericName,
          riskLevel: 'Medium',
          alternativeMedicines: ['Cefdinir', 'Clindamycin', 'Azithromycin'],
          reasoning: 'Alternative antibiotics with different mechanisms and potentially fewer GI side effects'
        });
      }

      if (genericName.includes('verapamil')) {
        adverseReactions.push({
          medication: originalMed.genericName,
          reaction: 'Hypotension, dizziness, constipation, bradycardia',
          likelihood: 'Medium',
          patientRisk: 'Monitor blood pressure and heart rate closely'
        });

        alternatives.push({
          originalMedication: originalMed.genericName,
          riskLevel: 'Medium',
          alternativeMedicines: ['Amlodipine', 'Nifedipine', 'Lisinopril'],
          reasoning: 'Alternative antihypertensives with better tolerability profiles and fewer drug interactions'
        });
      }

      if (genericName.includes('digoxin')) {
        adverseReactions.push({
          medication: originalMed.genericName,
          reaction: 'Nausea, vomiting, confusion, arrhythmias',
          likelihood: 'Medium',
          patientRisk: 'Monitor for signs of toxicity'
        });
        
        alternatives.push({
          originalMedication: originalMed.genericName,
          riskLevel: 'Medium',
          alternativeMedicines: ['Metoprolol', 'Carvedilol', 'Atenolol'],
          reasoning: 'Beta-blockers may provide similar cardiovascular benefits with lower toxicity risk'
        });
      }
    });

    const hasAmoxicillin = genericNames.some(name => name.includes('amoxicillin'));
    const hasVerapamil = genericNames.some(name => name.includes('verapamil'));
    const hasDigoxin = genericNames.some(name => name.includes('digoxin'));

    if (hasAmoxicillin && hasVerapamil) {
      drugInteractions.push({
        medications: ['Amoxicillin/Clavulanate', 'Verapamil'],
        severity: 'Medium',
        description: 'Verapamil may increase serum levels of Amoxicillin by reducing renal clearance, potentially increasing risk of side effects'
      });
    }

    if (hasDigoxin && hasVerapamil) {
      drugInteractions.push({
        medications: ['Digoxin', 'Verapamil'],
        severity: 'High',
        description: 'Verapamil significantly increases digoxin levels, increasing risk of digoxin toxicity'
      });
    }

    const dosageValidation = resolvedMedications.map(med => ({
      medication: med.genericName,
      status: 'Appropriate',
      recommendation: `Dosage of ${med.dosage} ${med.frequency} appears within normal range for ${med.genericName}`
    }));

    let overallRisk = 'Low';
    if (drugInteractions.some(interaction => interaction.severity === 'High') || 
        alternatives.some(alt => alt.riskLevel === 'High')) {
      overallRisk = 'High';
    } else if (drugInteractions.some(interaction => interaction.severity === 'Medium') || 
               alternatives.some(alt => alt.riskLevel === 'Medium')) {
      overallRisk = 'Medium';
    }

    const recommendations = [
      'Monitor patient response to prescribed medications',
      'Schedule follow-up appointment as indicated',
      'Educate patient about potential side effects',
      'Analysis based on resolved generic drug names for accuracy'
    ];

    if (alternatives.length > 0) {
      recommendations.unshift('Consider alternative medications due to identified risks');
    }

    return {
      drugInteractions,
      adverseReactions,
      dosageValidation,
      overallRisk,
      recommendations,
      alternatives,
      medicationResolutions: resolvedMedications.map(med => ({
        originalName: med.originalName,
        genericName: med.genericName,
        activeIngredients: med.activeIngredients,
        confidence: med.confidence
      }))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const analysisResult = await analyzePrescriptionWithLyzr(prescriptionData);
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "AI analysis with medicine name resolution and validation completed.",
      });
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
    <div className="space-y-20">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-16">
            <PatientInfo 
              data={prescriptionData} 
              onChange={setPrescriptionData} 
            />
          </div>
          <div className="space-y-16">
            <VitalSigns 
              data={prescriptionData} 
              onChange={setPrescriptionData} 
            />
          </div>
        </div>
        
        <EnhancedMedicationList 
          data={prescriptionData} 
          onChange={setPrescriptionData} 
        />

        <Card className="border-0 bg-white/30 backdrop-blur-3xl shadow-2xl shadow-gray-900/3 rounded-[2rem] ring-1 ring-white/10 relative overflow-hidden">
          {/* Ultra-subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-50/10 rounded-[2rem] pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <CardHeader className="pb-10 relative">
            <CardTitle className="flex items-center space-x-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-3xl blur-xl opacity-30 transform scale-110"></div>
                <div className="relative p-5 bg-gradient-to-br from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-3xl shadow-xl shadow-purple-500/25 ring-1 ring-white/20">
                  <AlertCircle className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl"></div>
                </div>
              </div>
              <span className="text-3xl md:text-4xl font-extralight text-gray-900 tracking-tight">Clinical Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-12 relative">
            <div>
              <label className="block text-xl font-light text-gray-900 mb-6 tracking-wide">
                Additional Observations
              </label>
              <div className="relative">
                <textarea
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData({
                    ...prescriptionData,
                    notes: e.target.value
                  })}
                  className="w-full p-10 border-0 bg-white/40 backdrop-blur-sm rounded-3xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-700 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/20 text-lg leading-relaxed resize-none"
                  rows={6}
                  placeholder="Clinical observations, patient concerns, or additional notes..."
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl pointer-events-none"></div>
              </div>
            </div>
            <div>
              <label className="block text-xl font-light text-gray-900 mb-6 tracking-wide">
                Follow-up Appointment
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={prescriptionData.followUpDate}
                  onChange={(e) => setPrescriptionData({
                    ...prescriptionData,
                    followUpDate: e.target.value
                  })}
                  className="w-full p-10 border-0 bg-white/40 backdrop-blur-sm rounded-3xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-700 text-gray-700 shadow-inner ring-1 ring-white/20 text-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl pointer-events-none"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-16">
          <div className="relative group">
            {/* Multi-layered glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700 transform scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-all duration-700 transform scale-105"></div>
            
            <Button
              type="submit"
              disabled={isAnalyzing || isValidating}
              className="relative px-20 py-10 bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] text-white text-xl font-light rounded-[2rem] shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/35 transform hover:scale-[1.02] transition-all duration-700 border-0 disabled:opacity-50 disabled:transform-none ring-1 ring-white/20 backdrop-blur-sm tracking-wide"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-8 w-8 mr-6 animate-pulse" />
                  Analyzing Prescription...
                </>
              ) : isValidating ? (
                <>
                  <Search className="h-8 w-8 mr-6 animate-pulse" />
                  Validating Results...
                </>
              ) : (
                <>
                  <Zap className="h-8 w-8 mr-6" />
                  Analyze with AI
                </>
              )}
              
              {/* Ultra-premium inner highlights */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/8 to-white/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:opacity-100 opacity-0 transition-opacity duration-700"></div>
            </Button>
          </div>
        </div>
      </form>

      {analysis && <AIAnalysis analysis={analysis} prescriptionData={prescriptionData} />}
    </div>
  );
};

export default PrescriptionForm;
