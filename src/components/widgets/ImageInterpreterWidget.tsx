
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImageInterpreterWidgetProps {
  config: {
    supportedFormats?: string[];
  };
  onEvent: (eventType: string, data: any) => void;
}

const ImageInterpreterWidget: React.FC<ImageInterpreterWidgetProps> = ({ config, onEvent }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientContext, setPatientContext] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = config.supportedFormats || ['jpg', 'jpeg', 'png', 'dicom'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!supportedFormats.includes(fileExtension || '')) {
      onEvent('error', `Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    onEvent('imageUploaded', { fileName: file.name, size: file.size, type: file.type });

    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      // Upload image to Supabase storage
      const fileName = `medical-images/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures') // Using existing bucket for demo
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Call interpretation function
      const { data, error } = await supabase.functions.invoke('interpret-medical-image', {
        body: {
          imageUrl: urlData.publicUrl,
          imageType: selectedFile.type,
          patientContext: patientContext || undefined
        }
      });

      if (error) throw error;

      setInterpretation(data);
      onEvent('interpretationComplete', {
        imageUrl: urlData.publicUrl,
        interpretation: data,
        patientContext
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      onEvent('error', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileImage className="h-5 w-5" />
            <span>Medical Image Interpreter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Supported Formats</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {supportedFormats.map(format => (
                <Badge key={format} variant="outline">{format.toUpperCase()}</Badge>
              ))}
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Upload Medical Image'}
            </p>
            <p className="text-gray-500">
              Click to browse or drag and drop your medical image here
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={supportedFormats.map(f => `.${f}`).join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Medical image preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded-lg border"
              />
            </div>
          )}

          <div>
            <Label htmlFor="patientContext">Patient Context (Optional)</Label>
            <Textarea
              id="patientContext"
              value={patientContext}
              onChange={(e) => setPatientContext(e.target.value)}
              placeholder="Provide relevant patient history, symptoms, or clinical context to improve interpretation accuracy..."
              rows={3}
            />
          </div>

          <Button
            onClick={analyzeImage}
            disabled={!selectedFile || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Image...
              </>
            ) : (
              'Analyze Medical Image'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Interpretation Results */}
      {interpretation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>AI Interpretation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interpretation.findings && (
              <div>
                <h4 className="font-medium mb-2">Key Findings</h4>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{interpretation.findings}</p>
              </div>
            )}

            {interpretation.recommendations && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <p className="text-sm bg-blue-50 p-3 rounded-lg">{interpretation.recommendations}</p>
              </div>
            )}

            {interpretation.confidence && (
              <div>
                <h4 className="font-medium mb-2">Confidence Score</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${interpretation.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round(interpretation.confidence * 100)}%</span>
                </div>
              </div>
            )}

            {interpretation.urgency && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <h4 className="font-medium">Urgency Level: {interpretation.urgency}</h4>
                  {interpretation.urgencyReason && (
                    <p className="text-sm text-amber-700">{interpretation.urgencyReason}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageInterpreterWidget;
