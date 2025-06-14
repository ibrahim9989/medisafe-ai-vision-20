
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { PrescriptionData } from './PrescriptionForm';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  prescriptionData: PrescriptionData;
  onPrescriptionChange: (data: PrescriptionData) => void;
  className?: string;
}

const VoiceAssistant = ({ prescriptionData, onPrescriptionChange, className }: VoiceAssistantProps) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
  }>>([]);

  const processVoiceCommand = (transcript: string) => {
    // Add user message to conversation
    setConversationHistory(prev => [...prev, {
      type: 'user',
      text: transcript,
      timestamp: new Date()
    }]);

    // Process different types of voice commands
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('patient name') || lowerTranscript.includes('add patient')) {
      const nameMatch = transcript.match(/(?:patient name|add patient)\s+(?:is\s+)?([a-zA-Z\s]+)/i);
      if (nameMatch) {
        const patientName = nameMatch[1].trim();
        onPrescriptionChange({
          ...prescriptionData,
          patientName: patientName
        });
        speakResponse(`Patient name set to ${patientName}`);
      }
    } else if (lowerTranscript.includes('age')) {
      const ageMatch = transcript.match(/age\s+(?:is\s+)?(\d+)/i);
      if (ageMatch) {
        const age = parseInt(ageMatch[1]);
        onPrescriptionChange({
          ...prescriptionData,
          age: age
        });
        speakResponse(`Age set to ${age} years old`);
      }
    } else if (lowerTranscript.includes('temperature')) {
      const tempMatch = transcript.match(/temperature\s+(?:is\s+)?(\d+\.?\d*)/i);
      if (tempMatch) {
        const temperature = parseFloat(tempMatch[1]);
        onPrescriptionChange({
          ...prescriptionData,
          temperature: temperature
        });
        speakResponse(`Temperature set to ${temperature} degrees`);
      }
    } else if (lowerTranscript.includes('blood pressure')) {
      const bpMatch = transcript.match(/blood pressure\s+(?:is\s+)?(\d+\/\d+)/i);
      if (bpMatch) {
        const bp = bpMatch[1];
        onPrescriptionChange({
          ...prescriptionData,
          bp: bp
        });
        speakResponse(`Blood pressure set to ${bp}`);
      }
    } else if (lowerTranscript.includes('add medication') || lowerTranscript.includes('medication')) {
      const medicationMatch = transcript.match(/(?:add medication|medication)\s+([a-zA-Z\s]+?)(?:\s+(\d+\s*mg|\d+\s*ml))?/i);
      if (medicationMatch) {
        const medicationName = medicationMatch[1].trim();
        const dosage = medicationMatch[2] || '';
        
        const newMedications = [...prescriptionData.medications];
        const emptyIndex = newMedications.findIndex(med => !med.name);
        
        if (emptyIndex !== -1) {
          newMedications[emptyIndex] = {
            ...newMedications[emptyIndex],
            name: medicationName,
            dosage: dosage
          };
        } else {
          newMedications.push({
            name: medicationName,
            dosage: dosage,
            frequency: '',
            duration: ''
          });
        }
        
        onPrescriptionChange({
          ...prescriptionData,
          medications: newMedications
        });
        
        speakResponse(`Added medication ${medicationName}${dosage ? ` with dosage ${dosage}` : ''}`);
      }
    } else if (lowerTranscript.includes('diagnosis')) {
      const diagnosisMatch = transcript.match(/diagnosis\s+(?:is\s+)?(.+)/i);
      if (diagnosisMatch) {
        const diagnosis = diagnosisMatch[1].trim();
        onPrescriptionChange({
          ...prescriptionData,
          diagnosis: diagnosis
        });
        speakResponse(`Diagnosis set to ${diagnosis}`);
      }
    } else if (lowerTranscript.includes('help') || lowerTranscript.includes('what can you do')) {
      const helpMessage = `I can help you fill out prescriptions with voice commands. You can say things like: 
        Patient name is John Smith, 
        Age is 45, 
        Temperature is 101.2, 
        Blood pressure is 140 over 90, 
        Add medication amoxicillin 500mg, 
        or Diagnosis is acute bronchitis.`;
      speakResponse(helpMessage);
    } else {
      speakResponse("I didn't understand that command. Try saying 'help' to see what I can do.");
    }
  };

  const speakResponse = (text: string) => {
    // Add assistant response to conversation
    setConversationHistory(prev => [...prev, {
      type: 'assistant',
      text: text,
      timestamp: new Date()
    }]);
    
    speakText(text);
  };

  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoiceAssistant({
    onTranscript: processVoiceCommand,
    voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
  });

  return (
    <Card className={cn(
      "border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl lg:rounded-2xl ring-1 ring-white/20 relative overflow-hidden",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-50/10 rounded-xl lg:rounded-2xl pointer-events-none"></div>
      
      <div className="relative p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl opacity-20 blur-lg"></div>
              <div className="relative p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
            </div>
            <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">Voice Assistant</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {showTranscript ? 'Hide' : 'Show'} Transcript
          </Button>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
            className={cn(
              "relative px-6 py-6 rounded-full min-w-[80px] min-h-[80px] transition-all duration-300",
              isListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            )}
          >
            {isListening ? (
              <MicOff className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </Button>

          <Button
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking}
            variant="outline"
            className={cn(
              "px-4 py-4 rounded-full",
              isSpeaking && "bg-green-50 border-green-300 text-green-700"
            )}
          >
            {isSpeaking ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="text-center mb-4">
          {isListening && (
            <div className="text-red-600 font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening...</span>
            </div>
          )}
          {isProcessing && (
            <div className="text-blue-600 font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <span>Processing speech...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="text-green-600 font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Speaking...</span>
            </div>
          )}
          {!isListening && !isProcessing && !isSpeaking && (
            <div className="text-gray-500">Click the microphone to start</div>
          )}
        </div>

        {/* Live Transcript */}
        {showTranscript && (
          <div className="space-y-3">
            {transcript && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">Latest Command:</div>
                <div className="text-blue-900">{transcript}</div>
              </div>
            )}

            {/* Conversation History */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {conversationHistory.slice(-5).map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    message.type === 'user'
                      ? "bg-gray-50 border border-gray-200 ml-4"
                      : "bg-purple-50 border border-purple-200 mr-4"
                  )}
                >
                  <div className={cn(
                    "font-medium mb-1",
                    message.type === 'user' ? "text-gray-700" : "text-purple-700"
                  )}>
                    {message.type === 'user' ? 'You:' : 'Assistant:'}
                  </div>
                  <div className={message.type === 'user' ? "text-gray-900" : "text-purple-900"}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Voice Commands:</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• "Patient name is John Smith"</div>
            <div>• "Age is 45"</div>
            <div>• "Temperature is 101.2"</div>
            <div>• "Blood pressure is 140 over 90"</div>
            <div>• "Add medication amoxicillin 500mg"</div>
            <div>• "Diagnosis is acute bronchitis"</div>
            <div>• "Help" - for more commands</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
