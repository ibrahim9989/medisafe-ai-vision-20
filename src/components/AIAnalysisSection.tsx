
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, AlertTriangle, CheckCircle, Zap, Beaker } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAnalysisSectionProps {
  prescriptionData: PrescriptionData;
  onAnalysisComplete?: (analysis: any) => void;
}

const AIAnalysisSection = ({ prescriptionData, onAnalysisComplete }: AIAnalysisSectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-prescription-analysis', {
        body: {
          prescriptionData: {
            ...prescriptionData,
            // Include all new fields for comprehensive analysis
            consultationNotes: prescriptionData.consultationNotes,
            recommendedTests: prescriptionData.recommendedTests,
            labReports: prescriptionData.labReports,
            labAnalysis: prescriptionData.labAnalysis,
            followUpDate: prescriptionData.followUpDate,
            isFollowUp: prescriptionData.isFollowUp
          }
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast.success('AI analysis completed successfully!');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      toast.error('Failed to perform AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-medium">AI Prescription Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis && (
          <div className="text-center py-8">
            <Button
              onClick={performAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Prescription...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              Get comprehensive AI analysis including drug interactions, recommendations, and more
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Risk Factors */}
            {analysis.risk_factors && analysis.risk_factors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Risk Factors</h3>
                </div>
                <ul className="space-y-1">
                  {analysis.risk_factors.map((risk: string, index: number) => (
                    <li key={index} className="text-red-700 text-sm flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Drug Interactions */}
            {analysis.drug_interactions && analysis.drug_interactions.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Drug Interactions</h3>
                </div>
                <ul className="space-y-1">
                  {analysis.drug_interactions.map((interaction: string, index: number) => (
                    <li key={index} className="text-yellow-700 text-sm flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      {interaction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lab Analysis Integration */}
            {prescriptionData.labAnalysis && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Beaker className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Lab Report Analysis</h3>
                </div>
                <div className="text-blue-700 text-sm">
                  {prescriptionData.labAnalysis}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Recommendations</h3>
                </div>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-green-700 text-sm flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternative Treatments */}
            {analysis.alternative_treatments && analysis.alternative_treatments.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Alternative Treatments</h3>
                </div>
                <ul className="space-y-1">
                  {analysis.alternative_treatments.map((treatment: string, index: number) => (
                    <li key={index} className="text-purple-700 text-sm flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      {treatment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Analysis */}
            {analysis.analysis && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Overall Analysis</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{analysis.analysis}</p>
              </div>
            )}

            <Button
              onClick={performAnalysis}
              variant="outline"
              size="sm"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                'Re-analyze'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysisSection;
