
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Brain, AlertTriangle, Shield, Pill } from 'lucide-react';
import AIAnalysisPDFExport from './AIAnalysisPDFExport';
import { PrescriptionData } from './PrescriptionForm';

interface AIAnalysisSectionProps {
  analysis: any;
  prescriptionData: PrescriptionData;
}

const AIAnalysisSection = ({ analysis, prescriptionData }: AIAnalysisSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl lg:rounded-2xl ring-1 ring-white/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-50/10 rounded-xl lg:rounded-2xl pointer-events-none"></div>
      
      <CardHeader className="pb-4 lg:pb-6 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 lg:space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl opacity-20 blur-lg"></div>
              <div className="relative p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <span className="text-lg lg:text-2xl xl:text-3xl font-medium text-gray-900 tracking-wide">AI Analysis Results</span>
          </CardTitle>
          <div className="flex items-center gap-4">
            <AIAnalysisPDFExport prescriptionData={prescriptionData} analysis={analysis} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white/60 border-white/30"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 lg:space-y-8 p-4 lg:p-6 pt-0 relative">
          {/* Overall Risk Assessment */}
          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/30">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">Overall Risk Level</span>
            </div>
            <Badge className={`${getRiskColor(analysis.overallRisk)} font-medium px-3 py-1`}>
              {analysis.overallRisk}
            </Badge>
          </div>

          {/* Drug Interactions */}
          {analysis.drugInteractions && analysis.drugInteractions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Drug Interactions</h3>
              </div>
              <div className="space-y-3">
                {analysis.drugInteractions.map((interaction: any, index: number) => (
                  <div key={index} className={`p-4 rounded-xl border-2 ${getSeverityColor(interaction.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {interaction.medications.join(' + ')}
                      </div>
                      <Badge variant="outline" className={getRiskColor(interaction.severity)}>
                        {interaction.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm">{interaction.description}</p>
                    {interaction.validated && (
                      <div className="mt-2 text-xs text-green-600">
                        ✓ Validated by medical sources
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adverse Reactions */}
          {analysis.adverseReactions && analysis.adverseReactions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Potential Adverse Reactions</h3>
              </div>
              <div className="grid gap-3">
                {analysis.adverseReactions.map((reaction: any, index: number) => (
                  <div key={index} className="p-4 bg-white/60 rounded-xl border border-white/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">{reaction.medication}</div>
                      <Badge variant="outline">{reaction.likelihood}</Badge>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{reaction.reaction}</p>
                    <p className="text-gray-600 text-xs">{reaction.patientRisk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Medications */}
          {analysis.alternatives && analysis.alternatives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Pill className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Alternative Medications</h3>
              </div>
              <div className="space-y-3">
                {analysis.alternatives.map((alt: any, index: number) => (
                  <div key={index} className="p-4 bg-white/60 rounded-xl border border-white/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">{alt.originalMedication}</div>
                      <Badge variant="outline" className={getRiskColor(alt.riskLevel)}>
                        {alt.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Alternatives: </span>
                      <span className="text-sm text-gray-600">{alt.alternativeMedicines.join(', ')}</span>
                    </div>
                    <p className="text-gray-600 text-xs">{alt.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Recommendations</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-white/30">
                    <div className="text-purple-600 font-semibold text-sm mt-0.5">{index + 1}.</div>
                    <p className="text-gray-700 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medication Resolutions */}
          {analysis.medicationResolutions && analysis.medicationResolutions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medication Resolution Details</h3>
              <div className="space-y-3">
                {analysis.medicationResolutions.map((med: any, index: number) => (
                  <div key={index} className="p-3 bg-white/60 rounded-lg border border-white/30">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900">{med.originalName}</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(med.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Generic: {med.genericName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Active ingredients: {med.activeIngredients.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AIAnalysisSection;
