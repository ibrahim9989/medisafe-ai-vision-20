
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

interface VoiceAssistantWidgetProps {
  config: {
    autoStart?: boolean;
  };
  onEvent: (eventType: string, data: any) => void;
}

const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({ config, onEvent }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [commands, setCommands] = useState<Array<{ command: string; result: string; timestamp: Date }>>([]);

  const {
    isListening,
    isProcessing,
    isSpeaking,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoiceAssistant({
    onTranscript: (text) => {
      setTranscript(text);
      onEvent('transcriptReady', text);
      processVoiceCommand(text);
    },
    onError: (error) => {
      onEvent('error', error);
    }
  });

  const processVoiceCommand = async (command: string) => {
    try {
      // Process the voice command through your existing global voice commands
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      if (response.ok) {
        const result = await response.json();
        const newCommand = {
          command,
          result: result.response || 'Command executed successfully',
          timestamp: new Date()
        };
        
        setCommands(prev => [newCommand, ...prev.slice(0, 9)]); // Keep last 10 commands
        onEvent('commandExecuted', { command, result: result.response });
        
        // Speak the response if available
        if (result.response) {
          speakText(result.response);
        }
      }
    } catch (error) {
      console.error('Command processing failed:', error);
      onEvent('error', 'Failed to process voice command');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleToggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // Test speech with a sample phrase
      speakText('Voice assistant is ready to help you.');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voice Assistant</span>
            <div className="flex space-x-2">
              {isListening && <Badge variant="destructive">Listening</Badge>}
              {isProcessing && <Badge variant="outline">Processing</Badge>}
              {isSpeaking && <Badge variant="secondary">Speaking</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleToggleListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="flex items-center space-x-2"
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
            </Button>

            <Button
              onClick={handleToggleSpeaking}
              variant={isSpeaking ? "destructive" : "outline"}
              size="lg"
              className="flex items-center space-x-2"
            >
              {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              <span>{isSpeaking ? 'Stop Speaking' : 'Test Speech'}</span>
            </Button>
          </div>

          {/* Current Transcript */}
          {transcript && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Transcript:</h4>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Voice Commands Help */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Available Voice Commands:</h4>
            <ul className="text-sm space-y-1">
              <li>• "Create new prescription" - Start a new prescription</li>
              <li>• "Analyze medical image" - Open image interpreter</li>
              <li>• "Show patient history" - Display patient information</li>
              <li>• "Generate report" - Create medical report</li>
              <li>• "Search medication [name]" - Look up drug information</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      {commands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commands.map((cmd, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">"{cmd.command}"</p>
                      <p className="text-xs text-gray-600 mt-1">{cmd.result}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {cmd.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceAssistantWidget;
