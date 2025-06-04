
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
    <div className="space-y-8">
      {/* Header Card with Export */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Analysis Results
                </span>
                <div className="flex items-center mt-1">
                  <Sparkles className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-slate-600">Powered by Advanced AI</span>
                </div>
              </div>
            </CardTitle>
            <PDFExport prescriptionData={prescriptionData} analysis={analysis} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 shadow-lg ${getRiskColor(analysis.overallRisk)}`}>
            {getRiskIcon(analysis.overallRisk)}
            <span className="font-bold text-lg">Overall Risk Level: {analysis.overallRisk}</span>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Name Resolution Display */}
      {analysis.medicationResolutions && analysis.medicationResolutions.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Medicine Name Resolution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-blue-800 mb-4 p-3 bg-white/70 rounded-lg border border-blue-200">
              <strong>Analysis Note:</strong> AI analysis was performed using generic drug names for medical accuracy.
            </div>
            {analysis.medicationResolutions.map((resolution, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">{resolution.originalName}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-blue-900 px-3 py-1 bg-blue-100 rounded-lg">{resolution.genericName}</span>
                  </div>
                  {resolution.activeIngredients && resolution.activeIngredients.length > 0 && (
                    <div className="text-sm text-slate-600 mt-2 ml-1">
                      <span className="font-medium">Active:</span> {resolution.activeIngredients.join(', ')}
                    </div>
                  )}
                </div>
                {resolution.confidence && (
                  <div className={`px-3 py-2 rounded-xl text-sm font-medium shadow-sm ${
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
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Alternative Medications Recommended</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis.alternatives.map((alternative, index) => (
              <div key={index} className={`p-6 rounded-2xl border-2 shadow-lg ${getRiskColor(alternative.riskLevel)}`}>
                <div className="flex items-center space-x-3 mb-4">
                  {getRiskIcon(alternative.riskLevel)}
                  <span className="font-bold text-xl">
                    Replace: {alternative.originalMedication}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${getRiskColor(alternative.riskLevel)}`}>
                    {alternative.riskLevel} Risk
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-bold text-slate-900 mb-3 text-lg">Recommended Alternatives:</h4>
                  <div className="flex flex-wrap gap-3">
                    {alternative.alternativeMedicines.map((medicine, medIndex) => (
                      <span 
                        key={medIndex}
                        className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {medicine}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-slate-700 bg-white/80 backdrop-blur-sm p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <strong className="text-blue-700">Reasoning:</strong> {alternative.reasoning}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Drug Interactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.drugInteractions.length > 0 ? (
              analysis.drugInteractions.map((interaction, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 shadow-sm ${getRiskColor(interaction.severity)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(interaction.severity)}
                      <span className="font-bold text-lg">{interaction.severity} Risk</span>
                    </div>
                    {getValidationBadge(interaction)}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold mb-2 text-slate-800">Medications: {interaction.medications.join(' + ')}</div>
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
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">No significant drug interactions detected</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Adverse Reactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.adverseReactions.length > 0 ? (
              analysis.adverseReactions.map((reaction, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 shadow-sm ${getRiskColor(reaction.likelihood)}`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {getRiskIcon(reaction.likelihood)}
                    <span className="font-bold text-lg">{reaction.medication}</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold mb-1 text-slate-800">Potential Reaction: {reaction.reaction}</div>
                    <div className="text-slate-600">{reaction.patientRisk}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-emerald-700 text-sm flex items-center space-x-2 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">No adverse reactions identified for this patient profile</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Dosage Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.dosageValidation.map((validation, index) => (
            <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg text-slate-800">{validation.medication}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  validation.status === 'Appropriate' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                }`}>
                  {validation.status}
                </span>
              </div>
              <div className="text-sm text-slate-600">{validation.recommendation}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <Info className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-3 p-3 bg-white/70 rounded-xl border border-blue-200 hover:bg-white/90 transition-all duration-200">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-700 font-medium">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysis;
