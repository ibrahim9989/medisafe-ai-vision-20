import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, CheckCircle, Info, Shield, Pill, ArrowRight, Sparkles } from 'lucide-react';
import PDFExport from './PDFExport';

interface AIAnalysisProps {
  analysis: {
    drugInteractions: Array<{
      medications: string[];
      severity: string;
      description: string;
      validated?: boolean;
      additionalInfo?: string;
      sources?: string[];
    }>;
    adverseReactions: Array<{
      medication: string;
      reaction: string;
      likelihood: string;
      patientRisk: string;
    }>;
    dosageValidation: Array<{
      medication: string;
      status: string;
      recommendation: string;
    }>;
    overallRisk: string;
    recommendations: string[];
    alternatives?: Array<{
      originalMedication: string;
      riskLevel: string;
      alternativeMedicines: string[];
      reasoning: string;
    }>;
    medicationResolutions?: Array<{
      originalName: string;
      genericName: string;
      activeIngredients: string[];
      confidence?: number;
    }>;
  };
  prescriptionData: any;
}

const AIAnalysis = ({ analysis, prescriptionData }: AIAnalysisProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200 text-red-900';
      case 'medium':
        return 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 text-amber-900';
      case 'low':
        return 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 text-emerald-900';
      default:
        return 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200 text-slate-900';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-amber-600" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      default:
        return <Shield className="h-5 w-5 text-slate-600" />;
    }
  };

  const getValidationBadge = (interaction: any) => {
    if (interaction.validated === true) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </span>
      );
    } else if (interaction.validated === false && interaction.confidence !== undefined) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Partial Validation
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-0">
      {/* Header Card with Export - Mobile optimized */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex-shrink-0">
                <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  AI Analysis Results
                </span>
                <div className="flex items-center mt-1">
                  <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500 mr-1 flex-shrink-0" />
                  <span className="text-xs lg:text-sm text-slate-600">Powered by Advanced AI</span>
                </div>
              </div>
            </CardTitle>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <PDFExport prescriptionData={prescriptionData} analysis={analysis} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center space-x-3 px-4 lg:px-6 py-3 rounded-2xl border-2 shadow-lg w-full sm:w-auto justify-center sm:justify-start ${getRiskColor(analysis.overallRisk)}`}>
            {getRiskIcon(analysis.overallRisk)}
            <span className="font-bold text-base lg:text-lg">Overall Risk Level: {analysis.overallRisk}</span>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Name Resolution Display */}
      {analysis.medicationResolutions && analysis.medicationResolutions.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex-shrink-0">
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-slate-800">Medicine Name Resolution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-blue-800 mb-4 p-3 bg-white/70 rounded-lg border border-blue-200">
              <strong>Analysis Note:</strong> AI analysis was performed using generic drug names for medical accuracy.
            </div>
            {analysis.medicationResolutions.map((resolution, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <span className="font-medium text-slate-700 px-3 py-1 bg-slate-100 rounded-lg text-sm break-words">{resolution.originalName}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 self-center sm:self-auto" />
                    <span className="font-bold text-blue-900 px-3 py-1 bg-blue-100 rounded-lg text-sm break-words">{resolution.genericName}</span>
                  </div>
                  {resolution.activeIngredients && resolution.activeIngredients.length > 0 && (
                    <div className="text-xs lg:text-sm text-slate-600 mt-2 ml-1 break-words">
                      <span className="font-medium">Active:</span> {resolution.activeIngredients.join(', ')}
                    </div>
                  )}
                </div>
                {resolution.confidence && (
                  <div className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-medium shadow-sm flex-shrink-0 text-center ${
                    resolution.confidence >= 0.7 ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' : 
                    resolution.confidence >= 0.4 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200' : 
                    'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
                  }`}>
                    {Math.round(resolution.confidence * 100)}% confident
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alternative Medications Section */}
      {analysis.alternatives && analysis.alternatives.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex-shrink-0">
                <Pill className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-slate-800">Alternative Medications Recommended</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis.alternatives.map((alternative, index) => (
              <div key={index} className={`p-4 lg:p-6 rounded-2xl border-2 shadow-lg ${getRiskColor(alternative.riskLevel)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
                  {getRiskIcon(alternative.riskLevel)}
                  <span className="font-bold text-lg lg:text-xl break-words">
                    Replace: {alternative.originalMedication}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs lg:text-sm font-bold shadow-sm self-start sm:self-auto ${getRiskColor(alternative.riskLevel)}`}>
                    {alternative.riskLevel} Risk
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-bold text-slate-900 mb-3 text-base lg:text-lg">Recommended Alternatives:</h4>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    {alternative.alternativeMedicines.map((medicine, medIndex) => (
                      <span 
                        key={medIndex}
                        className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200 break-words"
                      >
                        {medicine}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs lg:text-sm text-slate-700 bg-white/80 backdrop-blur-sm p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <strong className="text-blue-700">Reasoning:</strong> {alternative.reasoning}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rest of the analysis sections with improved mobile layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Drug Interactions */}
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex-shrink-0">
                <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-slate-800">Drug Interactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.drugInteractions.length > 0 ? (
              analysis.drugInteractions.map((interaction, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 shadow-sm ${getRiskColor(interaction.severity)}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(interaction.severity)}
                      <span className="font-bold text-base lg:text-lg">{interaction.severity} Risk</span>
                    </div>
                    {getValidationBadge(interaction)}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold mb-2 text-slate-800 break-words">Medications: {interaction.medications.join(' + ')}</div>
                    <div className="mb-2">{interaction.description}</div>
                    {interaction.additionalInfo && (
                      <div className="mt-3 p-3 bg-white/70 rounded-lg text-xs border border-slate-200">
                        <strong>Additional Info:</strong> {interaction.additionalInfo}
                      </div>
                    )}
                    {interaction.sources && interaction.sources.length > 0 && (
                      <div className="mt-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                            View Sources ({interaction.sources.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {interaction.sources.slice(0, 2).map((source: string, srcIndex: number) => (
                              <a
                                key={srcIndex}
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 hover:text-blue-800 truncate hover:underline"
                              >
                                {source}
                              </a>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-emerald-700 text-sm flex items-center space-x-2 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">No significant drug interactions detected</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adverse Reactions */}
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex-shrink-0">
                <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-slate-800">Adverse Reactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.adverseReactions.length > 0 ? (
              analysis.adverseReactions.map((reaction, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 shadow-sm ${getRiskColor(reaction.likelihood)}`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {getRiskIcon(reaction.likelihood)}
                    <span className="font-bold text-base lg:text-lg break-words">{reaction.medication}</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold mb-1 text-slate-800 break-words">Potential Reaction: {reaction.reaction}</div>
                    <div className="text-slate-600">{reaction.patientRisk}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-emerald-700 text-sm flex items-center space-x-2 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">No adverse reactions identified for this patient profile</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dosage Validation */}
      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex-shrink-0">
              <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-slate-800">Dosage Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.dosageValidation.map((validation, index) => (
            <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <span className="font-bold text-base lg:text-lg text-slate-800 break-words">{validation.medication}</span>
                <span className={`px-3 py-1 rounded-full text-xs lg:text-sm font-bold self-start sm:self-auto ${
                  validation.status === 'Appropriate' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                }`}>
                  {validation.status}
                </span>
              </div>
              <div className="text-xs lg:text-sm text-slate-600">{validation.recommendation}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex-shrink-0">
              <Info className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-slate-800">Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-3 p-3 bg-white/70 rounded-xl border border-blue-200 hover:bg-white/90 transition-all duration-200">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-700 font-medium text-sm lg:text-base">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysis;
