
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileImage, Trash2 } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';

interface LabReportsSectionProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const LabReportsSection = ({ data, onChange }: LabReportsSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      onChange({
        ...data,
        labReports: [...data.labReports, ...newFiles]
      });
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = data.labReports.filter((_, i) => i !== index);
    onChange({ ...data, labReports: updatedFiles });
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <FileImage className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-medium">Lab Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full bg-white/60 border-dashed border-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Lab Reports (Images/PDFs)
          </Button>
        </div>

        {data.labReports.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
            {data.labReports.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white/60 p-2 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {data.labAnalysis && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Lab Analysis
            </label>
            <Textarea
              value={data.labAnalysis}
              onChange={(e) => onChange({ ...data, labAnalysis: e.target.value })}
              placeholder="AI analysis of lab reports will appear here..."
              className="min-h-24 bg-white/60 border-white/30"
              readOnly
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabReportsSection;
