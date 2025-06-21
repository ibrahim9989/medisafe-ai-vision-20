
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
    if (newTest.trim()) {
      onChange({
        ...data,
        recommendedTests: [...data.recommendedTests, newTest.trim()]
      });
      setNewTest('');
    }
  };

  const removeTest = (index: number) => {
    const updatedTests = data.recommendedTests.filter((_, i) => i !== index);
    onChange({ ...data, recommendedTests: updatedTests });
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
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTest}
            onChange={(e) => setNewTest(e.target.value)}
            placeholder="Add recommended test (e.g., CBC, Blood Sugar, X-Ray)"
            className="bg-white/60 border-white/30"
            onKeyPress={(e) => e.key === 'Enter' && addTest()}
          />
          <Button onClick={addTest} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.recommendedTests.map((test, index) => (
            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
              {test}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTest(index)}
                className="ml-1 h-4 w-4 p-0 hover:bg-red-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedTestsSection;
