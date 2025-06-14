
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface VoiceAssistantConfig {
  onTranscript?: (text: string) => void;
  onAudioResponse?: (audioUrl: string) => void;
  onError?: (error: string) => void;
  voiceId?: string;
}

export const useVoiceAssistant = (config: VoiceAssistantConfig = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Use WAV format for better compatibility with ElevenLabs
      const options = {
        mimeType: 'audio/wav'
      };

      // Fallback to webm if wav is not supported
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        console.log('WAV not supported, falling back to webm');
        options.mimeType = 'audio/webm;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      console.log('MediaRecorder created with MIME type:', mediaRecorder.mimeType);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received, size:', event.data.size);
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        console.log('Recording stopped, total blob size:', audioBlob.size);
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsListening(true);
      
      toast({
        title: "Listening",
        description: "Speak now... Click stop when finished."
      });

    } catch (error) {
      console.error('Error starting voice recording:', error);
      config.onError?.('Failed to start voice recording. Please check microphone permissions.');
      toast({
        title: "Voice Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [config]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type);

      // Validate audio blob
      if (audioBlob.size < 1000) {
        throw new Error('Audio recording too short. Please try speaking for longer.');
      }

      // Convert audio blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          console.log('Base64 conversion complete, length:', base64.length);
          resolve(base64);
        };
        reader.onerror = () => {
          console.error('FileReader error:', reader.error);
          reject(new Error('Failed to convert audio to base64'));
        };
        reader.readAsDataURL(audioBlob);
      });

      console.log('Calling voice-to-text function...');

      // Call voice-to-text edge function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audioData: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process speech');
      }

      console.log('Voice-to-text response:', data);

      const transcriptText = data.transcript || '';
      setTranscript(transcriptText);
      config.onTranscript?.(transcriptText);

      if (!transcriptText.trim()) {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking more clearly and for a longer duration."
        });
      } else {
        toast({
          title: "Speech Recognized",
          description: `"${transcriptText.substring(0, 50)}${transcriptText.length > 50 ? '...' : ''}"`
        });
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process speech';
      config.onError?.(errorMessage);
      toast({
        title: "Speech Processing Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string, voiceId?: string) => {
    if (!text.trim()) return;

    setIsSpeaking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voiceId: voiceId || config.voiceId || 'EXAVITQu4vr4xnSDxMaL'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate speech');
      }

      if (data.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audioRef.current.play();
        config.onAudioResponse?.(audioUrl);
      }

    } catch (error) {
      console.error('Error generating speech:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
      config.onError?.(errorMessage);
      toast({
        title: "Speech Generation Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  return {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
