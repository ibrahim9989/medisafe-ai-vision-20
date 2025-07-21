
/**
 * MedVerse Plugin SDK
 * Enables embedding MedVerse widgets into external EHS/EMS systems
 */

export interface SDKConfig {
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  fhirEndpoint?: string;
  baseUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
}

export interface WidgetConfig {
  container: string | HTMLElement;
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark' | 'auto';
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface PrescriptionWidgetConfig extends WidgetConfig {
  patientId?: string;
  onPrescriptionCreated?: (prescription: any) => void;
  onPrescriptionUpdated?: (prescription: any) => void;
  readOnly?: boolean;
}

export interface ImageInterpreterConfig extends WidgetConfig {
  onInterpretationComplete?: (result: any) => void;
  onImageUploaded?: (imageData: any) => void;
  supportedFormats?: string[];
}

export interface VoiceAssistantConfig extends WidgetConfig {
  onTranscriptReady?: (transcript: string) => void;
  onCommandExecuted?: (command: string, result: any) => void;
  autoStart?: boolean;
}

export interface PatientManagementConfig extends WidgetConfig {
  patientId: string;
  onPatientUpdated?: (patient: any) => void;
  editableFields?: string[];
}

class MedVerseWidget {
  private iframe: HTMLIFrameElement;
  private container: HTMLElement;
  private config: WidgetConfig;
  private messageHandlers: Map<string, Function> = new Map();

  constructor(container: HTMLElement, config: WidgetConfig, widgetType: string, widgetConfig: any) {
    this.container = container;
    this.config = config;
    this.createIframe(widgetType, widgetConfig);
    this.setupMessageHandling();
  }

  private createIframe(widgetType: string, widgetConfig: any) {
    this.iframe = document.createElement('iframe');
    this.iframe.style.width = typeof this.config.width === 'number' 
      ? `${this.config.width}px` 
      : (this.config.width || '100%');
    this.iframe.style.height = typeof this.config.height === 'number' 
      ? `${this.config.height}px` 
      : (this.config.height || '400px');
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '8px';
    
    const params = new URLSearchParams({
      widget: widgetType,
      config: JSON.stringify(widgetConfig),
      theme: this.config.theme || 'auto'
    });
    
    this.iframe.src = `${this.getBaseUrl()}/widget?${params.toString()}`;
    this.container.appendChild(this.iframe);
  }

  private getBaseUrl(): string {
    return window.location.origin; // Will be configurable based on environment
  }

  private setupMessageHandling() {
    window.addEventListener('message', (event) => {
      if (event.source !== this.iframe.contentWindow) return;
      
      const { type, data } = event.data;
      const handler = this.messageHandlers.get(type);
      if (handler) {
        handler(data);
      }
    });
  }

  public sendMessage(type: string, data: any) {
    this.iframe.contentWindow?.postMessage({ type, data }, '*');
  }

  public onMessage(type: string, handler: Function) {
    this.messageHandlers.set(type, handler);
  }

  public destroy() {
    this.iframe.remove();
    this.messageHandlers.clear();
  }
}

export class MedVerseSDK {
  private config: SDKConfig;
  private widgets: Map<string, MedVerseWidget> = new Map();

  constructor(config: SDKConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }
  }

  private getContainer(selector: string | HTMLElement): HTMLElement {
    if (typeof selector === 'string') {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        throw new Error(`Container element not found: ${selector}`);
      }
      return element;
    }
    return selector;
  }

  // Prescription Widget
  public createPrescriptionWidget(config: PrescriptionWidgetConfig): MedVerseWidget {
    const container = this.getContainer(config.container);
    const widget = new MedVerseWidget(container, config, 'prescription', {
      patientId: config.patientId,
      readOnly: config.readOnly || false
    });

    // Setup prescription-specific message handlers
    widget.onMessage('prescriptionCreated', (data) => {
      config.onPrescriptionCreated?.(data);
    });

    widget.onMessage('prescriptionUpdated', (data) => {
      config.onPrescriptionUpdated?.(data);
    });

    widget.onMessage('ready', () => {
      config.onReady?.();
    });

    widget.onMessage('error', (error) => {
      config.onError?.(error);
    });

    this.widgets.set(`prescription-${Date.now()}`, widget);
    return widget;
  }

  // Medical Image Interpreter Widget
  public createImageInterpreterWidget(config: ImageInterpreterConfig): MedVerseWidget {
    const container = this.getContainer(config.container);
    const widget = new MedVerseWidget(container, config, 'imageInterpreter', {
      supportedFormats: config.supportedFormats || ['jpg', 'png', 'dicom', 'nifti']
    });

    widget.onMessage('interpretationComplete', (data) => {
      config.onInterpretationComplete?.(data);
    });

    widget.onMessage('imageUploaded', (data) => {
      config.onImageUploaded?.(data);
    });

    widget.onMessage('ready', () => {
      config.onReady?.();
    });

    this.widgets.set(`imageInterpreter-${Date.now()}`, widget);
    return widget;
  }

  // Voice Assistant Widget
  public createVoiceAssistantWidget(config: VoiceAssistantConfig): MedVerseWidget {
    const container = this.getContainer(config.container);
    const widget = new MedVerseWidget(container, config, 'voiceAssistant', {
      autoStart: config.autoStart || false
    });

    widget.onMessage('transcriptReady', (data) => {
      config.onTranscriptReady?.(data);
    });

    widget.onMessage('commandExecuted', (data) => {
      config.onCommandExecuted?.(data.command, data.result);
    });

    this.widgets.set(`voiceAssistant-${Date.now()}`, widget);
    return widget;
  }

  // Patient Management Widget
  public createPatientManagementWidget(config: PatientManagementConfig): MedVerseWidget {
    const container = this.getContainer(config.container);
    const widget = new MedVerseWidget(container, config, 'patientManagement', {
      patientId: config.patientId,
      editableFields: config.editableFields || []
    });

    widget.onMessage('patientUpdated', (data) => {
      config.onPatientUpdated?.(data);
    });

    this.widgets.set(`patientManagement-${Date.now()}`, widget);
    return widget;
  }

  // Utility Methods
  public destroyAllWidgets() {
    this.widgets.forEach(widget => widget.destroy());
    this.widgets.clear();
  }

  public getWidget(id: string): MedVerseWidget | undefined {
    return this.widgets.get(id);
  }

  // FHIR Integration Methods
  public async syncWithFHIR(fhirData: any): Promise<void> {
    // Implementation for FHIR data synchronization
    try {
      const response = await fetch(`${this.config.baseUrl}/api/plugins/fhir/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        throw new Error(`FHIR sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('FHIR synchronization error:', error);
      throw error;
    }
  }
}

// Export for global usage
(window as any).MedVerseSDK = MedVerseSDK;

export default MedVerseSDK;
