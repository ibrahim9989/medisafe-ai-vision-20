
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';

interface AIAnalysisSectionProps {
  prescriptionData: PrescriptionData;
  onAnalysisComplete?: (analysis: any) => void;
}

const AIAnalysisSection = ({ prescriptionData, onAnalysisComplete }: AIAnalysisSectionProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCompletePrescription = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare comprehensive analysis data including all new fields
      const analysisPrompt = `
        Analyze this complete prescription and consultation data:
        
        Patient: ${prescriptionData.patientName}, Age: ${prescriptionData.age}, Gender: ${prescriptionData.gender}
        Vital Signs: Temperature: ${prescriptionData.temperature}°F, BP: ${prescriptionData.bp}
        
        Consultation Notes: ${prescriptionData.consultationNotes}
        Diagnosis: ${prescriptionData.diagnosis}
        Clinical Notes: ${prescriptionData.notes}
        
        Medications: ${JSON.stringify(prescriptionData.medications)}
        Recommended Tests: ${prescriptionData.recommendedTests.join(', ')}
        Lab Analysis: ${prescriptionData.labAnalysis}
        
        Please provide comprehensive analysis including:
        1. Drug interactions and contraindications
        2. Dosage appropriateness for patient's age/condition
        3. Adverse reaction risks
        4. Assessment of lab results (if available)
        5. Recommendations for treatment optimization
        6. Follow-up suggestions
        7. Overall risk assessment
        8. Alternative treatment options if applicable
      `;

      const response = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analysisPrompt,
          prescriptionData
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete({
          prescriptionId: prescriptionData.id || 'temp',
          ...result
        });
      }
    } catch (error) {
      console.error('Error analyzing prescription:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">AI Comprehensive Analysis</span>
          </div>
          <Button 
            onClick={analyzeCompletePrescription}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-purple-600"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Complete Prescription'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {analysis && (
        <CardContent className="space-y-6">
          {/* Overall Risk Assessment */}
          <div className="bg-white/60 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Overall Risk Assessment
            </h3>
            <Badge 
              variant={analysis.overallRisk === 'High' ? 'destructive' : 
                     analysis.overallRisk === 'Medium' ? 'default' : 'secondary'}
            >
              {analysis.overallRisk || 'Low'} Risk
            </Badge>
            <p className="text-sm text-gray-600 mt-2">{analysis.riskExplanation}</p>
          </div>

          {/* Lab Analysis Section */}
          {prescriptionData.labAnalysis && (
            <div className="bg-white/60 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Lab Results Analysis
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {prescriptionData.labAnalysis}
              </div>
            </div>
          )}

          {/* Drug Interactions */}
          {analysis.drugInteractions?.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Drug Interactions</h3>
              <div className="space-y-2">
                {analysis.drugInteractions.map((interaction: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{interaction.drugs}</span>: {interaction.description}
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {interaction.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <CheckCircle className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Analysis Sections */}
          {analysis.followUpSuggestions && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Follow-up Suggestions</h3>
              <p className="text-sm text-blue-700">{analysis.followUpSuggestions}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AIAnalysisSection;
