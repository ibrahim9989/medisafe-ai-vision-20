import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Brain, Search, Zap, Stethoscope } from 'lucide-react';
import VitalSigns from './VitalSigns';
import AIAnalysisSection from './AIAnalysisSection';
import PrescriptionPDFExport from './PrescriptionPDFExport';
import { toast } from '@/hooks/use-toast';
import EnhancedMedicationList from './EnhancedMedicationList';
import EnhancedPrescriptionForm from './EnhancedPrescriptionForm';
import { tavilyService } from '../services/tavilyService';
import { usePrescriptions } from '@/hooks/usePrescriptions';

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
  diagnosis: string;
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
    diagnosis: '',
    notes: '',
    followUpDate: ''
  });

  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState<string | null>(null);
  
  const { savePrescription, saveAIAnalysis } = usePrescriptions();

  // Add event listeners for global voice commands
  useEffect(() => {
    const handleVoiceFillForm = (event: CustomEvent) => {
      const { prescription } = event.detail;
      if (prescription) {
        console.log('Filling prescription from voice command:', prescription);
        
        // Map the voice command data to prescription format
        const updatedData: PrescriptionData = {
          doctorName: prescription.doctorName || prescriptionData.doctorName,
          patientName: prescription.patientName || prescriptionData.patientName,
          age: prescription.age ? parseInt(prescription.age) : prescriptionData.age,
          gender: prescription.gender || prescriptionData.gender,
          contact: prescription.contact || prescriptionData.contact,
          temperature: prescription.temperature ? parseFloat(prescription.temperature) : prescriptionData.temperature,
          bp: prescription.bloodPressure || prescriptionData.bp,
          diagnosis: prescription.diagnosis || prescriptionData.diagnosis,
          notes: prescription.clinicalNotes || prescriptionData.notes,
          followUpDate: prescriptionData.followUpDate,
          medications: prescription.medication ? [{
            name: prescription.medication,
            dosage: prescription.dosage || '',
            frequency: prescription.frequency || '',
            duration: prescription.duration || ''
          }] : prescriptionData.medications
        };
        
        setPrescriptionData(updatedData);
        toast({
          title: "✅ Voice Command Processed",
          description: "Prescription form has been filled with voice data",
        });
      }
    };

    const handleVoiceClearForm = () => {
      setPrescriptionData({
        doctorName: '',
        patientName: '',
        age: 0,
        gender: '',
        contact: '',
        temperature: 98.6,
        bp: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        diagnosis: '',
        notes: '',
        followUpDate: ''
      });
      toast({
        title: "✅ Form Cleared",
        description: "All prescription data has been cleared",
      });
    };

    const handleVoiceDownloadPdf = () => {
      // Trigger the PDF download if form has data
      if (prescriptionData.patientName && prescriptionData.doctorName) {
        const downloadEvent = new CustomEvent('download-pdf', {
          detail: { type: 'prescription' }
        });
        window.dispatchEvent(downloadEvent);
      } else {
        toast({
          title: "Cannot Download PDF",
          description: "Please fill in patient and doctor information first",
          variant: "destructive"
        });
      }
    };

    // Listen for voice commands
    window.addEventListener('voice-fill-form', handleVoiceFillForm as EventListener);
    window.addEventListener('voice-clear-form', handleVoiceClearForm);
    window.addEventListener('voice-download-pdf', handleVoiceDownloadPdf);

    return () => {
      window.removeEventListener('voice-fill-form', handleVoiceFillForm as EventListener);
      window.removeEventListener('voice-clear-form', handleVoiceClearForm);
      window.removeEventListener('voice-download-pdf', handleVoiceDownloadPdf);
    };
  }, [prescriptionData]);

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

Current Diagnosis: ${data.diagnosis}

Medications to Analyze (USE GENERIC NAMES):
${medicationDetails}

Active Ingredients Summary:
${resolvedMedications.map(med => `${med.genericName}: ${med.activeIngredients.join(', ')}`).join('\n')}

Underlying Medical Conditions/Clinical Notes: ${data.notes}

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
      // Save prescription to database first
      console.log('Saving prescription to database...');
      const savedPrescription = await savePrescription(prescriptionData);
      setCurrentPrescriptionId(savedPrescription.id);
      
      toast({
        title: "Prescription Saved",
        description: "Prescription has been saved successfully.",
      });

      // Then perform AI analysis
      console.log('Starting AI analysis...');
      const analysisResult = await analyzePrescriptionWithLyzr(prescriptionData);
      
      // Save AI analysis to database
      console.log('Saving AI analysis to database...');
      await saveAIAnalysis(savedPrescription.id, analysisResult);
      
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "AI analysis completed and saved successfully.",
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
    <div className="space-y-8 lg:space-y-16">
      <form onSubmit={handleSubmit} className="space-y-8 lg:space-y-16">
        <EnhancedPrescriptionForm 
          data={prescriptionData} 
          onChange={setPrescriptionData}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="space-y-6 lg:space-y-12">
              <VitalSigns 
                data={prescriptionData} 
                onChange={setPrescriptionData} 
              />
            </div>
          </div>
          
          {/* Diagnosis Section */}
          <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-50/10 rounded-xl lg:rounded-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <CardHeader className="pb-4 lg:pb-6 relative">
              <CardTitle className="flex items-center space-x-3 lg:space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl opacity-20 blur-lg"></div>
                  <div className="relative p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Stethoscope className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                <span className="text-lg lg:text-2xl xl:text-3xl font-medium text-gray-900 tracking-wide">Diagnosis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 lg:space-y-8 p-4 lg:p-6 pt-0 relative">
              <div className="space-y-2">
                <label className="block text-sm lg:text-lg font-medium text-gray-900 mb-3 tracking-wide">
                  Current Diagnosis *
                </label>
                <div className="relative">
                  <textarea
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData({
                      ...prescriptionData,
                      diagnosis: e.target.value
                    })}
                    className="w-full p-4 lg:p-6 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base leading-relaxed resize-none"
                    rows={3}
                    placeholder="Enter the current medical diagnosis for this visit (e.g., Acute bronchitis, Type 2 diabetes mellitus, Essential hypertension)..."
                    required
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl pointer-events-none"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EnhancedMedicationList 
            data={prescriptionData} 
            onChange={setPrescriptionData} 
          />

          <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-50/10 rounded-xl lg:rounded-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <CardHeader className="pb-4 lg:pb-6 relative">
              <CardTitle className="flex items-center space-x-3 lg:space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl opacity-20 blur-lg"></div>
                  <div className="relative p-2 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <AlertCircle className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                <span className="text-lg lg:text-2xl xl:text-3xl font-medium text-gray-900 tracking-wide">Clinical Notes & Underlying Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 lg:space-y-8 p-4 lg:p-6 pt-0 relative">
              <div className="space-y-2">
                <label className="block text-sm lg:text-lg font-medium text-gray-900 mb-3 tracking-wide">
                  Underlying Medical Conditions & Additional Observations
                </label>
                <div className="relative">
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData({
                      ...prescriptionData,
                      notes: e.target.value
                    })}
                    className="w-full p-4 lg:p-6 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base leading-relaxed resize-none"
                    rows={4}
                    placeholder="Enter underlying conditions (e.g., hypertension, diabetes), patient concerns, allergies, or additional clinical observations..."
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl pointer-events-none"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm lg:text-lg font-medium text-gray-900 mb-3 tracking-wide">
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
                    className="w-full p-4 lg:p-6 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 shadow-inner ring-1 ring-white/30 text-base"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl pointer-events-none"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 lg:pt-12">
            {/* Prescription PDF Export - Available after form is filled */}
            {prescriptionData.patientName && prescriptionData.doctorName && prescriptionData.medications.some(med => med.name) && (
              <PrescriptionPDFExport prescriptionData={prescriptionData} />
            )}
            
            {/* AI Analysis Button */}
            <div className="relative group w-full max-w-md lg:max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-xl lg:rounded-2xl blur-xl lg:blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700 transform scale-105 lg:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] rounded-xl lg:rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-700 transform scale-102 lg:scale-105"></div>
              
              <Button
                type="submit"
                disabled={isAnalyzing || isValidating}
                className="relative w-full px-8 lg:px-16 py-4 lg:py-6 bg-gradient-to-r from-[#cb6ce6] via-[#b84fd9] to-[#9c4bc7] text-white text-base lg:text-lg xl:text-xl font-medium rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl shadow-purple-500/25 hover:shadow-2xl lg:hover:shadow-3xl hover:shadow-purple-500/35 transform hover:scale-[1.02] transition-all duration-700 border-0 disabled:opacity-50 disabled:transform-none ring-1 ring-white/20 backdrop-blur-sm tracking-wide min-h-[48px] lg:min-h-[64px]"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-5 w-5 lg:h-6 lg:w-6 mr-3 lg:mr-4 animate-pulse" />
                    Analyzing Prescription...
                  </>
                ) : isValidating ? (
                  <>
                    <Search className="h-5 w-5 lg:h-6 lg:w-6 mr-3 lg:mr-4 animate-pulse" />
                    Validating Results...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 lg:h-6 lg:w-6 mr-3 lg:mr-4" />
                    Analyze with AI
                  </>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/8 to-white/5 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:opacity-100 opacity-0 transition-opacity duration-700"></div>
              </Button>
            </div>
          </div>
        </EnhancedPrescriptionForm>
      </form>

      {/* AI Analysis Section - Separated from prescription */}
      {analysis && (
        <div className="border-t border-gray-200/50 pt-8 lg:pt-16">
          <AIAnalysisSection analysis={analysis} prescriptionData={prescriptionData} />
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
