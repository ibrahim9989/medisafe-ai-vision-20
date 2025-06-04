
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { MedicineResolution } from '../services/tavilyService';

interface MedicineResolutionCardProps {
  medicineName: string;
  resolution: MedicineResolution | null;
}

const MedicineResolutionCard = ({ medicineName, resolution }: MedicineResolutionCardProps) => {
  if (!resolution || !medicineName) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getConfidencePercentage = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl p-4 space-y-3">
      {/* Medicine Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 break-words">
            {resolution.resolvedName || medicineName}
          </h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {resolution.confidence >= 0.7 && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          <span className={`text-sm font-medium ${getConfidenceColor(resolution.confidence)}`}>
            {getConfidencePercentage(resolution.confidence)}%
          </span>
        </div>
      </div>

      {/* Description Box */}
      {resolution.description && (
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-800 leading-relaxed">
            {resolution.description}
          </p>
        </div>
      )}

      {/* Active Ingredients */}
      {resolution.activeIngredients && resolution.activeIngredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Active Ingredients:</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {resolution.activeIngredients.join(', ')}
          </p>
        </div>
      )}

      {/* Uses */}
      {resolution.uses && resolution.uses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Common Uses:</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {resolution.uses.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicineResolutionCard;
