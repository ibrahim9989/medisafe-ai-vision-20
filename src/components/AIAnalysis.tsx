
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, CheckCircle, Info, Shield, Pill, ArrowRight } from 'lucide-react';

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
}

const AIAnalysis = ({ analysis }: AIAnalysisProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getValidationBadge = (interaction: any) => {
    if (interaction.validated === true) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </span>
      );
    } else if (interaction.validated === false && interaction.confidence !== undefined) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Partial Validation
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-blue-900">AI Analysis Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getRiskColor(analysis.overallRisk)}`}>
            {getRiskIcon(analysis.overallRisk)}
            <span className="font-semibold">Overall Risk Level: {analysis.overallRisk}</span>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Name Resolution Display */}
      {analysis.medicationResolutions && analysis.medicationResolutions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-6 w-6 text-blue-600" />
              <span className="text-blue-900">Medicine Name Resolution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-blue-800 mb-3">
              <strong>Analysis Note:</strong> AI analysis was performed using generic drug names for medical accuracy.
            </div>
            {analysis.medicationResolutions.map((resolution, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{resolution.originalName}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">{resolution.genericName}</span>
                  </div>
                  {resolution.activeIngredients && resolution.activeIngredients.length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      Active: {resolution.activeIngredients.join(', ')}
                    </div>
                  )}
                </div>
                {resolution.confidence && (
                  <div className={`px-2 py-1 rounded text-xs ${
                    resolution.confidence >= 0.7 ? 'bg-green-100 text-green-800' : 
                    resolution.confidence >= 0.4 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(resolution.confidence * 100)}% confident
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alternative Medications Section - Show prominently if there are alternatives */}
      {analysis.alternatives && analysis.alternatives.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-6 w-6 text-orange-600" />
              <span className="text-orange-900">Alternative Medications Recommended</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.alternatives.map((alternative, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getRiskColor(alternative.riskLevel)}`}>
                <div className="flex items-center space-x-2 mb-3">
                  {getRiskIcon(alternative.riskLevel)}
                  <span className="font-semibold text-lg">
                    Replace: {alternative.originalMedication}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(alternative.riskLevel)}`}>
                    {alternative.riskLevel} Risk
                  </span>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Alternatives:</h4>
                  <div className="flex flex-wrap gap-2">
                    {alternative.alternativeMedicines.map((medicine, medIndex) => (
                      <span 
                        key={medIndex}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200"
                      >
                        {medicine}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-500">
                  <strong>Reasoning:</strong> {alternative.reasoning}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Drug Interactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.drugInteractions.length > 0 ? (
              analysis.drugInteractions.map((interaction, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRiskColor(interaction.severity)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(interaction.severity)}
                      <span className="font-semibold">{interaction.severity} Risk</span>
                    </div>
                    {getValidationBadge(interaction)}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Medications: {interaction.medications.join(' + ')}</div>
                    <div className="mt-1">{interaction.description}</div>
                    {interaction.additionalInfo && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>Additional Info:</strong> {interaction.additionalInfo}
                      </div>
                    )}
                    {interaction.sources && interaction.sources.length > 0 && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Sources ({interaction.sources.length})
                          </summary>
                          <div className="mt-1 space-y-1">
                            {interaction.sources.slice(0, 2).map((source: string, srcIndex: number) => (
                              <a
                                key={srcIndex}
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 hover:text-blue-800 truncate"
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
              <div className="text-green-600 text-sm flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No significant drug interactions detected</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span>Adverse Reactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.adverseReactions.length > 0 ? (
              analysis.adverseReactions.map((reaction, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRiskColor(reaction.likelihood)}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getRiskIcon(reaction.likelihood)}
                    <span className="font-semibold">{reaction.medication}</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Potential Reaction: {reaction.reaction}</div>
                    <div className="mt-1 text-gray-600">{reaction.patientRisk}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-green-600 text-sm flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No adverse reactions identified for this patient profile</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Dosage Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.dosageValidation.map((validation, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{validation.medication}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  validation.status === 'Appropriate' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {validation.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">{validation.recommendation}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysis;
