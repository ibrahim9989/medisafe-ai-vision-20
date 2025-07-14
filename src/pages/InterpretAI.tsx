
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Brain, Loader2, FileImage } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

const InterpretAI = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [imageType, setImageType] = useState('');
  const [clinicalContext, setClinicalContext] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile || !patientName || !imageType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload an image.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-images')
        .getPublicUrl(filePath);

      // Convert image to base64 for Azure API
      const base64 = imagePreview.split(',')[1];

      // Call Azure GPT-4 Vision API
      const response = await supabase.functions.invoke('interpret-medical-image', {
        body: {
          imageBase64: base64,
          imageType,
          patientName,
          patientAge: parseInt(patientAge) || null,
          clinicalContext,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const aiInterpretation = response.data.interpretation;
      setInterpretation(aiInterpretation);

      // Save to database using raw SQL since types aren't updated yet
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { error: dbError } = await supabase.rpc('insert_ai_interpretation', {
          p_user_id: user.user.id,
          p_image_url: publicUrl,
          p_image_type: imageType,
          p_interpretation: aiInterpretation,
          p_patient_name: patientName,
          p_patient_age: parseInt(patientAge) || null,
          p_clinical_context: clinicalContext,
        });

        // If RPC doesn't exist, we'll handle gracefully
        if (dbError) {
          console.warn('Could not save to database:', dbError);
          // Still show success to user since analysis worked
        }
      }

      setAnalysisComplete(true);
      toast({
        title: "Analysis Complete",
        description: "Medical image has been successfully analyzed.",
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the medical image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startNewAnalysis = () => {
    setImageFile(null);
    setImagePreview('');
    setPatientName('');
    setPatientAge('');
    setImageType('');
    setClinicalContext('');
    setInterpretation('');
    setAnalysisComplete(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden floating-particles">
      {/* SUNSHINE RAYS Animated BG */}
      <div className="sunshine-rays-bg"></div>
      
      {/* PREMIUM ANIMATED GLASSMORPHIC LIQUID DROP BACKGROUND */}
      <div className="premium-liquid-drops-bg">
        <div className="animated-grid"></div>
        <div className="drop main-drop"></div>
        <div className="drop drop2"></div>
        <div className="drop drop3"></div>
        <div className="drop sub-drop1"></div>
        <div className="drop main-drop2"></div>
        <div className="drop sub-drop2"></div>
        <div className="drop main-drop3"></div>
        <div className="drop sub-drop3"></div>
        <div className="drop drop4"></div>
        <div className="drop drop5"></div>
      </div>
      
      <Header />
      
      {/* Enhanced background with liquid glass effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 liquid-gradient opacity-40"></div>
        <div className="hidden lg:block absolute top-0 left-1/4 w-96 h-96 glass rounded-full opacity-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="hidden lg:block absolute bottom-0 right-1/4 w-80 h-80 glass rounded-full opacity-15 animate-pulse" style={{ animationDuration: '16s', animationDelay: '3s' }}></div>
      </div>

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Interpret AI
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered medical image interpretation
              </p>
            </div>
          </div>

          {!analysisComplete ? (
            <Card className="glass-card p-6 lg:p-8 border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Medical Image Analysis
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Upload medical images for AI-powered interpretation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload" className="text-sm font-medium">
                    Medical Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4facfe] transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Medical scan preview"
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Medical Image
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            Supports JPG, PNG, DICOM formats
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*,.dcm"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Patient Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">
                      Patient Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="patient-name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-age">Patient Age</Label>
                    <Input
                      id="patient-age"
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Enter patient age"
                    />
                  </div>
                </div>

                {/* Image Type */}
                <div className="space-y-2">
                  <Label>
                    Image Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={imageType} onValueChange={setImageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of medical image" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radiological">Radiological (X-ray, CT, MRI)</SelectItem>
                      <SelectItem value="ecg">ECG (Electrocardiogram)</SelectItem>
                      <SelectItem value="eeg">EEG (Electroencephalogram)</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clinical Context */}
                <div className="space-y-2">
                  <Label htmlFor="clinical-context">Clinical Context</Label>
                  <Textarea
                    id="clinical-context"
                    value={clinicalContext}
                    onChange={(e) => setClinicalContext(e.target.value)}
                    placeholder="Provide relevant clinical information, symptoms, or specific areas of concern..."
                    rows={3}
                  />
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing || !imageFile || !patientName || !imageType}
                  className="w-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#3b82f6] hover:to-[#06b6d4] text-white py-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-6 lg:p-8 border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  AI Interpretation Results
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Analysis completed for {patientName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Analyzed medical scan"
                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Interpretation */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AI Interpretation
                  </Label>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-[#4facfe]">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                      {interpretation}
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Important:</strong> This AI interpretation is for reference only and should not replace professional medical diagnosis. 
                    Always consult with qualified healthcare professionals for accurate diagnosis and treatment decisions.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={startNewAnalysis}
                    className="flex-1 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#3b82f6] hover:to-[#06b6d4] text-white"
                  >
                    New Analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterpretAI;
