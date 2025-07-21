
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrescriptionWidget from './PrescriptionWidget';
import ImageInterpreterWidget from './ImageInterpreterWidget';
import VoiceAssistantWidget from './VoiceAssistantWidget';
import PatientManagementWidget from './PatientManagementWidget';

interface WidgetContainerProps {
  // Props will be passed via URL parameters for iframe embedding
}

const WidgetContainer: React.FC<WidgetContainerProps> = () => {
  const [searchParams] = useSearchParams();
  const [widgetConfig, setWidgetConfig] = useState<any>({});
  const [isReady, setIsReady] = useState(false);

  const widgetType = searchParams.get('widget');
  const configParam = searchParams.get('config');
  const theme = searchParams.get('theme') || 'auto';

  useEffect(() => {
    // Parse widget configuration
    if (configParam) {
      try {
        const config = JSON.parse(decodeURIComponent(configParam));
        setWidgetConfig(config);
      } catch (error) {
        console.error('Failed to parse widget config:', error);
        postMessage({ type: 'error', data: 'Invalid widget configuration' });
      }
    }
  }, [configParam]);

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Notify parent that widget is ready
    if (widgetType && Object.keys(widgetConfig).length > 0) {
      setIsReady(true);
      postMessage({ type: 'ready', data: { widgetType, config: widgetConfig } });
    }
  }, [widgetType, widgetConfig]);

  const postMessage = (message: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  };

  const handleWidgetEvent = (eventType: string, data: any) => {
    postMessage({ type: eventType, data });
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cb6ce6]"></div>
      </div>
    );
  }

  const renderWidget = () => {
    switch (widgetType) {
      case 'prescription':
        return (
          <PrescriptionWidget
            config={widgetConfig}
            onEvent={handleWidgetEvent}
          />
        );
      case 'imageInterpreter':
        return (
          <ImageInterpreterWidget
            config={widgetConfig}
            onEvent={handleWidgetEvent}
          />
        );
      case 'voiceAssistant':
        return (
          <VoiceAssistantWidget
            config={widgetConfig}
            onEvent={handleWidgetEvent}
          />
        );
      case 'patientManagement':
        return (
          <PatientManagementWidget
            config={widgetConfig}
            onEvent={handleWidgetEvent}
          />
        );
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-red-500">Unknown widget type: {widgetType}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-background text-foreground">
      {renderWidget()}
    </div>
  );
};

export default WidgetContainer;
