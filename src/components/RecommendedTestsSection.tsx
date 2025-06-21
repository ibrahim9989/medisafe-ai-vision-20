
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TestTube, Plus, X } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';

interface RecommendedTestsSectionProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const RecommendedTestsSection = ({ data, onChange }: RecommendedTestsSectionProps) => {
  const [newTest, setNewTest] = useState('');

  const addTest = () => {
    if (newTest.trim() && !data.recommendedTests.includes(newTest.trim())) {
      const updatedTests = [...data.recommendedTests, newTest.trim()];
      onChange({
        ...data,
        recommendedTests: updatedTests
      });
      setNewTest('');
      console.log('✅ Test added:', newTest.trim());
    }
  };

  const removeTest = (index: number) => {
    const updatedTests = data.recommendedTests.filter((_, i) => i !== index);
    onChange({ ...data, recommendedTests: updatedTests });
    console.log('❌ Test removed at index:', index);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTest();
    }
  };

  // Common medical tests for quick selection
  const commonTests = [
    'Complete Blood Count (CBC)',
    'Blood Sugar (Fasting)',
    'Blood Pressure Check',
    'Lipid Profile',
    'Liver Function Test',
    'Kidney Function Test',
    'Thyroid Function Test',
    'X-Ray Chest',
    'ECG',
    'Urine Analysis'
  ];

  const addCommonTest = (test: string) => {
    if (!data.recommendedTests.includes(test)) {
      const updatedTests = [...data.recommendedTests, test];
      onChange({
        ...data,
        recommendedTests: updatedTests
      });
    }
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
            <TestTube className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-medium">Recommended Tests</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Test Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Add Recommended Test
          </label>
          <div className="flex gap-2">
            <Input
              value={newTest}
              onChange={(e) => setNewTest(e.target.value)}
              placeholder="Enter test name (e.g., CBC, Blood Sugar, X-Ray)"
              className="flex-1 bg-white/60 border-white/30"
              onKeyPress={handleKeyPress}
            />
            <Button 
              onClick={addTest} 
              size="sm"
              disabled={!newTest.trim()}
              className="bg-green-600 hover:bg-green-700 text-white px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Common Tests Quick Add */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Quick Add Common Tests
          </label>
          <div className="flex flex-wrap gap-2">
            {commonTests.map((test) => (
              <Button
                key={test}
                variant="outline"
                size="sm"
                onClick={() => addCommonTest(test)}
                disabled={data.recommendedTests.includes(test)}
                className="text-xs bg-white/60 hover:bg-green-50 border-green-200"
              >
                {test}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Tests Display */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Selected Tests ({data.recommendedTests.length})
          </label>
          {data.recommendedTests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.recommendedTests.map((test, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 px-3 py-1">
                  {test}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTest(index)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No tests added yet. Use the input above to add recommended tests.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedTestsSection;
