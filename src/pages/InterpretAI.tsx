
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Brain, FileImage, Loader2, AlertCircle, CheckCircle, ArrowLeft, Stethoscope, FileText, Search, ClipboardList, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import TokenCounter from '@/components/TokenCounter';
import { useInterpretAITokenTracker } from '@/components/InterpretAITokenTracker';

const InterpretAI = () => {
  const navigate = useNavigate();
  const { trackTokenUsage } = useInterpretAITokenTracker();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clinicalContext, setClinicalContext] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB for better mobile performance)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear previous interpretation
      setInterpretation('');
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select a medical image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setInterpretation('');

    try {
      // Show progress toast
      toast({
        title: "Analysis Starting",
        description: "Processing your medical image...",
      });

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
      });

      reader.readAsDataURL(selectedFile);
      const base64Image = await base64Promise;

      console.log('Starting image analysis...');
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analysis timeout - please try again')), 60000); // 1 minute timeout
      });

      // Call the interpret AI edge function with timeout
      const analysisPromise = supabase.functions.invoke('interpret-medical-image', {
        body: {
          imageData: base64Image,
          imageType: selectedFile.type,
          clinicalContext: clinicalContext || null,
          patientName: patientName || null,
          patientAge: patientAge ? parseInt(patientAge) : null
        }
      });

      const { data, error } = await Promise.race([analysisPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error from interpret function:', error);
        throw new Error(error.message || 'Failed to analyze image');
      }

      console.log('Analysis completed successfully');

      if (data.interpretation) {
        setInterpretation(data.interpretation);
        
        // Track token usage
        const tokensUsed = data.tokensUsed || Math.ceil(data.interpretation.length / 4);
        const sessionId = `interpret-ai-${Date.now()}`;
        
        await trackTokenUsage(tokensUsed, sessionId);
        
        toast({
          title: "Analysis Complete",
          description: `Medical image interpretation generated successfully`
        });
      } else {
        throw new Error('No interpretation received from AI');
      }

    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze medical image';
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setInterpretation('');
    setClinicalContext('');
    setPatientName('');
    setPatientAge('');
  };

  // Enhanced function to format the interpretation text with proper medical report structure
  const formatInterpretation = (text: string) => {
    // Clean the text and prepare for parsing
    const cleanText = text.replace(/\*\*/g, '').trim();
    
    // Split by sections - handle various formats
    const sections = cleanText.split(/(?=(?:\d+\.\s*[A-Z][A-Z\s&:]+|###\s*\d*\.?\s*[A-Z][A-Z\s&:]+|[A-Z][A-Z\s&:]+:))/);
    
    // Map section types to icons
    const getSectionIcon = (title: string) => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('image') || lowerTitle.includes('quality')) return <FileImage className="h-4 w-4 sm:h-5 sm:w-5" />;
      if (lowerTitle.includes('anatomical') || lowerTitle.includes('structures')) return <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />;
      if (lowerTitle.includes('findings') || lowerTitle.includes('observation')) return <Search className="h-4 w-4 sm:h-5 sm:w-5" />;
      if (lowerTitle.includes('technical') || lowerTitle.includes('artifact')) return <Settings className="h-4 w-4 sm:h-5 sm:w-5" />;
      if (lowerTitle.includes('summary') || lowerTitle.includes('recommendation')) return <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />;
      return <FileText className="h-4 w-4 sm:h-5 sm:w-5" />;
    };

    return sections.map((section, index) => {
      if (section.trim() === '' || section.trim() === '---') return null;
      
      // Parse section title and content
      let title = '';
      let content = '';
      
      // Handle different section formats
      if (section.startsWith('###')) {
        const lines = section.split('\n');
        title = lines[0].replace('###', '').replace(/^\d+\.?\s*/, '').trim();
        content = lines.slice(1).join('\n').trim();
      } else if (section.match(/^\d+\.\s*[A-Z]/)) {
        const match = section.match(/^(\d+\.\s*[A-Z][^:]*:?)(.*)$/s);
        if (match) {
          title = match[1].replace(/^\d+\.\s*/, '').replace(':', '').trim();
          content = match[2].trim();
        }
      } else if (section.includes(':')) {
        const colonIndex = section.indexOf(':');
        title = section.substring(0, colonIndex).trim();
        content = section.substring(colonIndex + 1).trim();
      } else {
        content = section.trim();
      }
      
      // If we have a title, create a structured section
      if (title) {
        return (
          <div key={index} className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-blue-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white flex-shrink-0">
                {getSectionIcon(title)}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex-1 min-w-0">
                {title}
              </h3>
            </div>
            
            <div className="space-y-2 sm:space-y-3 ml-8 sm:ml-11">
              {content.split('\n').map((line, lineIndex) => {
                if (line.trim() === '') return null;
                
                // Handle bullet points
                if (line.trim().match(/^[-•*]\s*(.*)$/)) {
                  const match = line.trim().match(/^[-•*]\s*(.*)$/);
                  if (match) {
                    return (
                      <div key={lineIndex} className="flex items-start gap-2 sm:gap-3 py-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed flex-1 text-sm sm:text-base">{match[1]}</p>
                      </div>
                    );
                  }
                }
                
                // Handle sub-bullets
                if (line.trim().match(/^\s+[-•*]\s*(.*)$/)) {
                  const match = line.trim().match(/^[-•*]\s*(.*)$/);
                  if (match) {
                    return (
                      <div key={lineIndex} className="flex items-start gap-2 sm:gap-3 py-1 ml-3 sm:ml-6">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-2 sm:mt-2.5 flex-shrink-0"></div>
                        <p className="text-gray-600 leading-relaxed flex-1 text-xs sm:text-sm">{match[1]}</p>
                      </div>
                    );
                  }
                }
                
                // Regular paragraph
                if (line.trim()) {
                  return (
                    <p key={lineIndex} className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {line.trim()}
                    </p>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        );
      } else if (content) {
        // General content without specific section
        return (
          <div key={index} className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="space-y-2 sm:space-y-3">
              {content.split('\n').map((line, lineIndex) => {
                if (line.trim() === '' || line.trim() === '---') return null;
                
                return (
                  <p key={lineIndex} className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {line.trim()}
                  </p>
                );
              })}
            </div>
          </div>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50/80 via-amber-50/30 to-purple-50/20">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4 bg-white/60 backdrop-blur-sm border-white/30 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl sm:rounded-3xl blur-xl opacity-30 transform scale-110"></div>
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl ring-1 ring-white/20">
                  <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent font-medium">
                Interpret AI
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Advanced AI radiologist for precise medical image interpretation
            </p>
          </div>
        </div>

        {/* Token Counter */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <TokenCounter featureType="interpret_ai" className="mb-4 sm:mb-6" />
        </div>

        {/* Mobile-first layout */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Upload and Input Section */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <span>Medical Image Upload</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Upload radiological images, ECGs, EEGs, or other medical images for AI interpretation
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName" className="text-sm sm:text-base">Patient Name (Optional)</Label>
                  <input
                    id="patientName"
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Label htmlFor="patientAge" className="text-sm sm:text-base">Patient Age (Optional)</Label>
                  <input
                    id="patientAge"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Enter age"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 lg:p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Choose medical image'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Supports: JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </label>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <img
                    src={previewUrl}
                    alt="Medical image preview"
                    className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                    style={{ maxHeight: '250px' }}
                  />
                </div>
              )}

              {/* Clinical Context */}
              <div>
                <Label htmlFor="clinicalContext" className="text-sm sm:text-base">Clinical Context (Optional)</Label>
                <Textarea
                  id="clinicalContext"
                  value={clinicalContext}
                  onChange={(e) => setClinicalContext(e.target.value)}
                  placeholder="Provide relevant clinical history, symptoms, or specific areas of concern..."
                  className="min-h-20 sm:min-h-24 resize-none text-sm sm:text-base"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg text-sm sm:text-base"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  className="sm:px-6 bg-white/60 backdrop-blur-sm border-white/30 text-sm sm:text-base"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/30 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <span>AI Medical Report</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Comprehensive radiological analysis and clinical findings
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <Loader2 className="relative h-12 w-12 sm:h-16 sm:w-16 text-purple-500 animate-spin" />
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-700 mb-2 mt-4">AI Analysis in Progress...</p>
                  <p className="text-xs sm:text-sm text-gray-500">Advanced medical image interpretation</p>
                </div>
              ) : interpretation ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-2 text-green-600 mb-4 sm:mb-6 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium text-sm sm:text-base">Medical Analysis Complete</span>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-inner border border-gray-100 max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {formatInterpretation(interpretation)}
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 mb-2 text-sm sm:text-base">Medical Disclaimer</p>
                        <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                          This AI interpretation is generated for educational and informational purposes only. 
                          It should not replace professional medical diagnosis, treatment, or clinical judgment. 
                          Always consult with qualified healthcare professionals for proper medical evaluation, 
                          diagnosis, and treatment decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-gray-500">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gray-200 rounded-full blur-xl opacity-50"></div>
                    <FileImage className="relative h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
                  </div>
                  <p className="text-lg sm:text-xl font-medium mb-2">Ready for Analysis</p>
                  <p className="text-xs sm:text-sm max-w-md px-4">Upload a medical image and provide clinical context to receive a comprehensive AI interpretation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterpretAI;
