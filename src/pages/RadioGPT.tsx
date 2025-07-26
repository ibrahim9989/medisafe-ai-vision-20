import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, AlertCircle, CheckCircle, Activity, Heart, Brain, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenUsage } from '@/hooks/useTokenUsage';

const RadioGPT = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [clinicalContext, setClinicalContext] = useState('');
  const [imageType, setImageType] = useState<'radiology' | 'eeg' | 'ecg' | 'other'>('radiology');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logTokenUsage } = useTokenUsage();

  const supportedFormats = ['jpg', 'jpeg', 'png', 'dicom', 'dcm'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!supportedFormats.includes(fileExtension || '')) {
      toast({
        title: "Unsupported Format",
        description: `Supported formats: ${supportedFormats.join(', ').toUpperCase()}`,
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB for medical images)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    console.log('RadioGPT: File selected', { fileName: file.name, size: file.size, type: file.type });

    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImagePreview('');
    setInterpretation(null);
    setPatientName('');
    setPatientAge('');
    setClinicalContext('');
    setImageType('radiology');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('RadioGPT: Analysis reset');
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Missing Requirements",
        description: "Please select an image and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    console.log('RadioGPT: Starting analysis', {
      userId: user.id,
      fileName: selectedFile.name,
      imageType,
      patientName,
      clinicalContext: clinicalContext.substring(0, 100)
    });

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (error) => {
          console.error('RadioGPT: FileReader error', error);
          reject(error);
        };
        reader.readAsDataURL(selectedFile);
      });

      console.log('RadioGPT: Image converted to base64, size:', imageData.length);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analysis timeout after 60 seconds')), 60000);
      });

      // Call RadioGPT edge function
      const analysisPromise = supabase.functions.invoke('radiogpt', {
        body: {
          imageData,
          imageType: selectedFile.type,
          medicalImageType: imageType,
          clinicalContext: clinicalContext || undefined,
          patientName: patientName || undefined,
          patientAge: patientAge ? parseInt(patientAge) : undefined,
          userId: user.id
        }
      });

      const { data, error } = await Promise.race([analysisPromise, timeoutPromise]) as any;

      const analysisTime = Date.now() - startTime;
      console.log('RadioGPT: Analysis completed', { 
        success: !error, 
        analysisTime,
        provider: data?.provider,
        tokensUsed: data?.tokensUsed 
      });

      if (error) {
        console.error('RadioGPT: Analysis error', error);
        throw error;
      }

      setInterpretation(data);

      // Log token usage
      if (data.tokensUsed) {
        await logTokenUsage({
          feature_type: 'radiogpt' as any,
          counter_type: data.provider === 'gemini' ? 'gemini' : 'azure_openai' as any,
          tokens_used: data.tokensUsed,
          session_id: `radiogpt_${Date.now()}`
        });
        console.log('RadioGPT: Token usage logged', { tokens: data.tokensUsed, provider: data.provider });
      }

      toast({
        title: "Analysis Complete",
        description: `RadioGPT has analyzed your ${imageType} image successfully`,
      });

    } catch (error: any) {
      console.error('RadioGPT: Analysis failed', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the medical image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImageTypeIcon = () => {
    switch (imageType) {
      case 'eeg': return <Brain className="h-5 w-5" />;
      case 'ecg': return <Heart className="h-5 w-5" />;
      case 'radiology': return <Activity className="h-5 w-5" />;
      default: return <FileImage className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            RadioGPT
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-Powered Radiological Companion for ICU Professionals
          </p>
        </div>

        {/* Image Upload and Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getImageTypeIcon()}
              <span>Medical Image Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Type Selection */}
            <div>
              <Label>Image Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['radiology', 'eeg', 'ecg', 'other'] as const).map(type => (
                  <Button
                    key={type}
                    variant={imageType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageType(type)}
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name (Optional)</Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="patientAge">Patient Age (Optional)</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Enter patient age"
                />
              </div>
            </div>

            {/* Supported Formats */}
            <div>
              <Label>Supported Formats</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {supportedFormats.map(format => (
                  <Badge key={format} variant="outline">{format.toUpperCase()}</Badge>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Upload Medical Image'}
              </p>
              <p className="text-muted-foreground">
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

            {/* Image Preview */}
            {imagePreview && (
              <div className="text-center">
                <img
                  src={imagePreview}
                  alt="Medical image preview"
                  className="max-w-full h-auto max-h-64 mx-auto rounded-lg border shadow-sm"
                />
              </div>
            )}

            {/* Clinical Context */}
            <div>
              <Label htmlFor="clinicalContext">Clinical Context</Label>
              <Textarea
                id="clinicalContext"
                value={clinicalContext}
                onChange={(e) => setClinicalContext(e.target.value)}
                placeholder="Provide relevant clinical context, symptoms, or history to improve interpretation accuracy..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  'Analyze with RadioGPT'
                )}
              </Button>
              <Button variant="outline" onClick={resetAnalysis}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {interpretation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>RadioGPT Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {interpretation.interpretation && (
                <div>
                  <h4 className="font-medium mb-2">Medical Image Interpretation</h4>
                  <div className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {interpretation.interpretation}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Analyzed by: {interpretation.provider === 'gemini' ? 'Gemini AI' : 'Azure OpenAI'}</span>
                {interpretation.tokensUsed && <span>Tokens used: {interpretation.tokensUsed}</span>}
              </div>

              {/* Medical Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">Medical Disclaimer</p>
                    <p className="text-amber-700">
                      RadioGPT provides AI-powered image interpretation for educational and supportive purposes only. 
                      This analysis is not a medical diagnosis and should not replace professional medical judgment. 
                      Always consult with qualified medical professionals for clinical decisions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RadioGPT;