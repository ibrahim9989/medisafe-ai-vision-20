
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
      
      <CardHeader className="pb-3 sm:pb-4 lg:pb-6 relative px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6">
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4">
          <CardTitle className="flex items-start sm:items-center gap-2 sm:gap-3 lg:gap-6 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl opacity-20 blur-lg"></div>
              <div className="relative p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-medium text-gray-900 tracking-wide block leading-tight">
                AI Analysis Results
              </span>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
            <div className="scale-75 sm:scale-100">
              <AIAnalysisPDFExport prescriptionData={prescriptionData} analysis={analysis} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white/60 border-white/30 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 pt-0 relative">
          {/* Overall Risk Assessment */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-white/30 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm sm:text-base truncate">Overall Risk Level</span>
            </div>
            <Badge className={`${getRiskColor(analysis.overallRisk)} font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm flex-shrink-0`}>
              {analysis.overallRisk}
            </Badge>
          </div>

          {/* Drug Interactions */}
          {analysis.drugInteractions && analysis.drugInteractions.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Drug Interactions</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {analysis.drugInteractions.map((interaction: any, index: number) => (
                  <div key={index} className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${getSeverityColor(interaction.severity)}`}>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="font-medium text-gray-900 text-sm sm:text-base min-w-0 flex-1">
                        <span className="break-words">{interaction.medications.join(' + ')}</span>
                      </div>
                      <Badge variant="outline" className={`${getRiskColor(interaction.severity)} text-xs flex-shrink-0`}>
                        {interaction.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{interaction.description}</p>
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Potential Adverse Reactions</h3>
              </div>
              <div className="grid gap-2 sm:gap-3">
                {analysis.adverseReactions.map((reaction: any, index: number) => (
                  <div key={index} className="p-3 sm:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-white/30">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="font-medium text-gray-900 text-sm sm:text-base min-w-0 flex-1 break-words">{reaction.medication}</div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{reaction.likelihood}</Badge>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm mb-1 leading-relaxed">{reaction.reaction}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{reaction.patientRisk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Medications */}
          {analysis.alternatives && analysis.alternatives.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Alternative Medications</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {analysis.alternatives.map((alt: any, index: number) => (
                  <div key={index} className="p-3 sm:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-white/30">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="font-medium text-gray-900 text-sm sm:text-base min-w-0 flex-1 break-words">{alt.originalMedication}</div>
                      <Badge variant="outline" className={`${getRiskColor(alt.riskLevel)} text-xs flex-shrink-0`}>
                        {alt.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Alternatives: </span>
                      <span className="text-xs sm:text-sm text-gray-600 break-words">{alt.alternativeMedicines.join(', ')}</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">{alt.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Clinical Recommendations</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/60 rounded-lg border border-white/30">
                    <div className="text-purple-600 font-semibold text-xs sm:text-sm mt-0.5 flex-shrink-0">{index + 1}.</div>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medication Resolutions */}
          {analysis.medicationResolutions && analysis.medicationResolutions.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Medication Resolution Details</h3>
              <div className="space-y-2 sm:space-y-3">
                {analysis.medicationResolutions.map((med: any, index: number) => (
                  <div key={index} className="p-2 sm:p-3 bg-white/60 rounded-lg border border-white/30">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <span className="font-medium text-gray-900 text-sm sm:text-base min-w-0 flex-1 break-words">{med.originalName}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {Math.round(med.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">
                      Generic: <span className="break-words">{med.genericName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Active ingredients: <span className="break-words">{med.activeIngredients.join(', ')}</span>
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
