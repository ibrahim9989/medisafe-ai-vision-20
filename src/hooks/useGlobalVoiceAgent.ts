import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalVoiceCommand {
  action: string;
  target?: string;
  parameters?: Record<string, any>;
  response?: string;
  navigation?: string;
}

export const useGlobalVoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  const navigate = useNavigate();
  const { signOut } = useAuth();
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

      const options = {
        mimeType: 'audio/wav'
      };

      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        await processGlobalCommand(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsListening(true);
      
      toast({
        title: "🎤 Global Voice Agent",
        description: "Listening for commands... Say anything to control the app!"
      });

    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast({
        title: "Voice Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processGlobalCommand = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      if (audioBlob.size < 1000) {
        throw new Error('Audio recording too short. Please try speaking for longer.');
      }

      // Convert audio to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to convert audio to base64'));
        reader.readAsDataURL(audioBlob);
      });

      // First, convert speech to text
      const { data: speechData, error: speechError } = await supabase.functions.invoke('voice-to-text', {
        body: { audioData: base64Audio }
      });

      if (speechError) {
        throw new Error(speechError.message || 'Failed to process speech');
      }

      const transcript = speechData.transcript || '';
      setLastCommand(transcript);

      if (!transcript.trim()) {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking more clearly."
        });
        return;
      }

      // Process the command with the enhanced global voice command handler
      const { data: commandData, error: commandError } = await supabase.functions.invoke('global-voice-commands', {
        body: { 
          transcript: transcript.trim(),
          currentPath: window.location.pathname
        }
      });

      if (commandError) {
        throw new Error(commandError.message || 'Failed to process command');
      }

      // Execute the parsed command with enhanced logic
      await executeCommand(commandData);

    } catch (error) {
      console.error('Error processing global command:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process command';
      toast({
        title: "Command Processing Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      speakResponse("Sorry, I couldn't process that complex command. Let me try again with better understanding.");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCommand = async (command: GlobalVoiceCommand) => {
    console.log('🤖 Executing enhanced command:', command);

    try {
      switch (command.action) {
        case 'navigate':
        case 'navigateTo': {
          // Voice agent: Try to detect tab intent for "history" or "prescription"
          const tabTarget =
            command.parameters?.navigateToPatientHistory ||
            (typeof command.response === "string" &&
              /history/i.test(command.response));
          const prescriptionTab =
            command.parameters?.navigateToPrescription ||
            (typeof command.response === "string" &&
              /prescription/i.test(command.response));

          if (tabTarget) {
            // Fire tab switch event
            window.dispatchEvent(
              new CustomEvent('voice-switch-tab', { detail: { tab: 'history' } })
            );
            speakResponse(command.response || `Navigating to history`);
            break;
          } else if (prescriptionTab) {
            window.dispatchEvent(
              new CustomEvent('voice-switch-tab', { detail: { tab: 'prescription' } })
            );
            speakResponse(command.response || `Navigating to prescription`);
            break;
          } else if (command.target) {
            // Only navigate if a "proper" route is provided and not /profile-setup for a tab switch
            if (
              command.target === '/profile-setup'
              && command.parameters?.navigateToPatientHistory
            ) {
              // Do NOT navigate, already switched tab above
              break;
            }
            navigate(command.target);
            speakResponse(
              command.response || `Navigating to ${command.target}`
            );
          }
          break;
        }
        case 'navigateToPatientHistory':
          window.dispatchEvent(
            new CustomEvent('voice-switch-tab', { detail: { tab: 'history' } })
          );
          speakResponse(command.response || 'Navigating to patient history.');
          break;
        case 'navigateToPrescription':
          window.dispatchEvent(
            new CustomEvent('voice-switch-tab', { detail: { tab: 'prescription' } })
          );
          speakResponse(command.response || 'Navigating to prescription.');
          break;
        case 'fill_form': {
            const fillEvent = new CustomEvent('voice-fill-form', { 
              detail: { 
                ...command.parameters,
                searchCriteria: command.parameters?.searchCriteria,
                clearForm: command.parameters?.clearForm,
                prescription: command.parameters?.prescription
              }
            });
            window.dispatchEvent(fillEvent);

            if (command.parameters?.searchCriteria) {
              const searchEvent = new CustomEvent('voice-search', { 
                detail: { 
                  query: command.parameters.searchCriteria.patientName,
                  autoSelect: command.parameters.searchCriteria.autoSelect,
                  switchToExisting: command.parameters.searchCriteria.switchToExisting
                }
              });
              window.dispatchEvent(searchEvent);
              console.log("[VoiceAgent] Dispatched voice-search:", searchEvent.detail);
            }

            // --- ENHANCED: Always trigger voice-download-pdf if prescription.downloadPrescription === true ---
            // Look for prescription.downloadPrescription at any level of parameters
            const maybePrescription = command.parameters?.prescription;
            const shouldDownload =
              maybePrescription && typeof maybePrescription === "object" &&
              ("downloadPrescription" in maybePrescription) && Boolean(maybePrescription.downloadPrescription);
            if (shouldDownload) {
              const patientName =
                command.parameters?.searchCriteria?.patientName ||
                maybePrescription.patientName ||
                "";

              window.dispatchEvent(
                new CustomEvent('voice-download-pdf', {
                  detail: { 
                    patientName,
                    // Pass prescription details if needed
                    prescription: maybePrescription
                  }
                })
              );
              console.log("[VoiceAgent] Dispatched voice-download-pdf for patient:", patientName, "details:", maybePrescription);
            }

            speakResponse(command.response || "Executing your complex prescription workflow");
          }
          break;
        case 'download_pdf':
          const downloadEvent = new CustomEvent('voice-download-pdf', { 
            detail: command.parameters 
          });
          window.dispatchEvent(downloadEvent);
          speakResponse(command.response || "Downloading PDF");
          break;

        case 'export_data':
          const exportEvent = new CustomEvent('voice-export-data', { 
            detail: command.parameters 
          });
          window.dispatchEvent(exportEvent);
          speakResponse(command.response || "Exporting data");
          break;

        case 'switch_tab':
          const tabEvent = new CustomEvent('voice-switch-tab', { 
            detail: { tab: command.target }
          });
          window.dispatchEvent(tabEvent);
          speakResponse(command.response || `Switching to ${command.target} tab`);
          break;

        case 'clear_form':
          const clearEvent = new CustomEvent('voice-clear-form');
          window.dispatchEvent(clearEvent);
          speakResponse(command.response || "Form cleared");
          break;

        case 'sign_out':
        case 'log_out':
        case 'logout':
          await signOut();
          speakResponse(command.response || "Signing out");
          break;

        case 'search':
          const searchEvent = new CustomEvent('voice-search', { 
            detail: { 
              query: command.target,
              autoSelect: command.parameters?.autoSelect
            }
          });
          window.dispatchEvent(searchEvent);
          speakResponse(command.response || `Searching for ${command.target}`);
          break;

        case 'help':
          speakResponse(command.response || "I can help you with complex medical workflows including patient search, prescription filling, and much more. Just tell me what you want to do!");
          break;

        default:
          speakResponse(command.response || "I understood your command and I'm processing it intelligently.");
      }

      toast({
        title: "✅ Complex Command Executed",
        description: command.response || `Executed: ${command.action}`,
      });

    } catch (error) {
      console.error('Error executing command:', error);
      speakResponse("I encountered an error while executing that complex command, but I'm learning from it.");
    }
  };

  const speakResponse = async (text: string) => {
    if (!text.trim()) return;

    setIsSpeaking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voiceId: 'EXAVITQu4vr4xnSDxMaL'
        }
      });

      if (error) {
        console.log('TTS error, but continuing:', error);
        setIsSpeaking(false);
        return;
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
      }

    } catch (error) {
      console.log('TTS failed, but continuing:', error);
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
    lastCommand,
    startListening,
    stopListening,
    speakResponse,
    stopSpeaking
  };
};
