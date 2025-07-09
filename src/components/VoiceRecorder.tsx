
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string, analysis?: any) => void;
  existingTranscript?: string;
}

const VoiceRecorder = ({ onTranscriptionComplete, existingTranscript }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak clearly for best transcription results",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: "Processing your audio...",
      });
    }
  };

  const processAudio = async () => {
    if (!audioUrl) return;

    setIsProcessing(true);

    try {
      // Convert audio URL to blob then to base64
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];

          console.log('Calling voice-transcription function...');
          const { data, error } = await supabase.functions.invoke('voice-transcription', {
            body: {
              audioBlob: base64Audio,
              action: 'both' // Both transcribe and analyze
            }
          });

          console.log('Function response:', { data, error });

          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(error.message || 'Function call failed');
          }

          if (data && data.success) {
            onTranscriptionComplete(data.transcription, data.analysis);
            toast({
              title: "Processing Complete",
              description: "Transcription and analysis completed successfully!",
            });
          } else {
            throw new Error(data?.error || 'Processing failed');
          }
        } catch (innerError) {
          console.error('Error in reader.onloadend:', innerError);
          toast({
            title: "Processing Error",
            description: `Failed to process audio: ${innerError.message}`,
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: `Failed to process audio: ${error.message}`,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const analyzeExistingTranscript = async () => {
    if (!existingTranscript) return;

    setIsProcessing(true);

    try {
      console.log('Analyzing existing transcript...');
      const { data, error } = await supabase.functions.invoke('voice-transcription', {
        body: {
          action: 'analyze',
          existingTranscript
        }
      });

      console.log('Analysis response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      if (data && data.success) {
        onTranscriptionComplete(existingTranscript, data.analysis);
        toast({
          title: "Analysis Complete",
          description: "Consultation notes analyzed successfully!",
        });
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Error analyzing transcript:', error);
      toast({
        title: "Analysis Error",
        description: `Failed to analyze transcript: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">Voice Recording</h4>
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            className="flex items-center space-x-2"
          >
            <Mic className="h-4 w-4" />
            <span>Start Recording</span>
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Stop Recording</span>
          </Button>
        )}

        {audioUrl && !isProcessing && (
          <Button
            onClick={processAudio}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4" />
            <span>Transcribe & Analyze</span>
          </Button>
        )}

        {existingTranscript && (
          <Button
            onClick={analyzeExistingTranscript}
            disabled={isProcessing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
            <span>Analyze Existing Notes</span>
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Processing audio...</span>
        </div>
      )}

      {audioUrl && (
        <div className="mt-2">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
