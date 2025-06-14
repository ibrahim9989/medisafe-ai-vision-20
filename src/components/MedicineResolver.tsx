
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { tavilyService, MedicineResolution } from '../services/tavilyService';
import { Card, CardContent } from '@/components/ui/card';

interface MedicineResolverProps {
  medicineName: string;
  onResolutionChange: (resolution: MedicineResolution | null) => void;
}

const MedicineResolver = ({ medicineName, onResolutionChange }: MedicineResolverProps) => {
  const [resolution, setResolution] = useState<MedicineResolution | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MedicineResolver: Medicine name changed to:', medicineName);
    if (medicineName.trim().length > 2) {
      console.log('MedicineResolver: Starting resolution for:', medicineName);
      resolveMedicine();
    } else {
      console.log('MedicineResolver: Medicine name too short, clearing resolution');
      setResolution(null);
      setError(null);
      onResolutionChange(null);
    }
  }, [medicineName]);

  const resolveMedicine = async () => {
    setIsResolving(true);
    setError(null);
    console.log('MedicineResolver: Calling Tavily service for:', medicineName);
    
    try {
      const result = await tavilyService.resolveMedicineName(medicineName);
      console.log('MedicineResolver: Received result:', result);
      setResolution(result);
      onResolutionChange(result);
    } catch (error) {
      console.error('MedicineResolver: Failed to resolve medicine:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Resolution failed: ${errorMessage}`);
      setResolution(null);
      onResolutionChange(null);
    } finally {
      setIsResolving(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.7) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  if (!medicineName.trim() || medicineName.length <= 2) return null;

  return (
    <div className="mt-2 space-y-2">
      {isResolving && (
        <div className="flex items-center space-x-2 text-blue-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Resolving medicine name...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {resolution && (
        <Card className="border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Medicine Resolution</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getConfidenceColor(resolution.confidence)}`}>
                {getConfidenceIcon(resolution.confidence)}
                <span>{Math.round(resolution.confidence * 100)}% confidence</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {resolution.genericName !== resolution.originalName && (
                <div>
                  <span className="font-medium text-gray-600">Generic Name:</span>
                  <span className="ml-2 text-gray-900">{resolution.genericName}</span>
                </div>
              )}

              {resolution.activeIngredients.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Active Ingredients:</span>
                  <span className="ml-2 text-gray-900">{resolution.activeIngredients.join(', ')}</span>
                </div>
              )}

              {resolution.brandNames.length > 1 && (
                <div>
                  <span className="font-medium text-gray-600">Brand Names:</span>
                  <span className="ml-2 text-gray-900">{resolution.brandNames.slice(0, 3).join(', ')}</span>
                  {resolution.brandNames.length > 3 && (
                    <span className="text-gray-500"> +{resolution.brandNames.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            {resolution.sources.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showDetails ? 'Hide' : 'Show'} sources ({resolution.sources.length})
                </button>
                
                {showDetails && (
                  <div className="mt-1 space-y-1">
                    {resolution.sources.slice(0, 3).map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 hover:text-blue-800 truncate"
                      >
                        {source}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicineResolver;
