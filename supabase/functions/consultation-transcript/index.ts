
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_API_KEY = 'FZ9RZqAVfAtln3qn1Y8CvVJck70dw2ijPZB51KFLbOg9EVWXyUtDJQQJ99BEACHYHv6XJ3w3AAAAACOGbxmN';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, patientId, doctorId } = await req.json();

    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing consultation audio for patient:', patientId);
    console.log('Audio data length:', audio.length);

    // Step 1: Convert audio to text using Azure OpenAI GPT-4o-mini-transcribe
    let transcript = '';
    
    try {
      console.log('Starting audio transcription with Azure OpenAI GPT-4o-mini-transcribe...');
      
      if (!audio || typeof audio !== 'string') {
        throw new Error('Invalid audio data format');
      }

      let audioBuffer;
      try {
        const binaryString = atob(audio);
        audioBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          audioBuffer[i] = binaryString.charCodeAt(i);
        }
        console.log('Audio buffer created, size:', audioBuffer.length);
      } catch (decodeError) {
        console.error('Base64 decode error:', decodeError);
        throw new Error('Failed to decode audio data');
      }

      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'consultation.webm');

      console.log('Sending request to Azure OpenAI GPT-4o-mini-transcribe...');

      const transcribeResponse = await fetch('https://razam-mac1ml8q-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-transcribe/audio/transcriptions?api-version=2025-03-01-preview', {
        method: 'POST',
        headers: {
          'api-key': AZURE_API_KEY,
        },
        body: formData,
      });

      console.log('Azure OpenAI transcribe response status:', transcribeResponse.status);

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        console.error('Azure OpenAI transcribe error:', errorText);
        throw new Error(`Azure OpenAI transcribe error (${transcribeResponse.status}): ${errorText}`);
      }

      const transcribeResult = await transcribeResponse.json();
      transcript = transcribeResult.text || '';
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('No transcription received from Azure OpenAI API');
      }

      console.log('Transcription completed successfully. Length:', transcript.length);
      console.log('Transcript preview:', transcript.substring(0, 200) + '...');
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }

    // Step 2: Process transcript with Azure OpenAI GPT-4.1
    console.log('Starting AI analysis with Azure OpenAI GPT-4.1...');

    const analysisPrompt = `You are an expert medical AI assistant analyzing a doctor-patient consultation transcript. Extract structured medical information and create comprehensive consultation notes.

CONSULTATION TRANSCRIPT:
"${transcript}"

EXTRACT AND STRUCTURE THE FOLLOWING INFORMATION:

1. PATIENT INFORMATION:
   - Name, age, gender if mentioned
   - Contact information if provided

2. CHIEF COMPLAINT & SYMPTOMS:
   - Primary reason for visit
   - All symptoms mentioned
   - Duration and severity

3. MEDICAL HISTORY:
   - Past medical conditions
   - Current medications
   - Allergies
   - Family history if mentioned

4. PHYSICAL EXAMINATION:
   - Vital signs (temperature, BP, heart rate, etc.)
   - Physical findings
   - Any tests performed

5. ASSESSMENT & DIAGNOSIS:
   - Working diagnosis
   - Differential diagnoses
   - Clinical impression

6. TREATMENT PLAN:
   - Medications prescribed with dosages
   - Non-pharmacological treatments
   - Lifestyle recommendations

7. FOLLOW-UP:
   - Next appointment schedule
   - Instructions for patient
   - When to return if symptoms worsen

8. ACTION ITEMS:
   - For doctor (lab orders, referrals, etc.)
   - For patient (lifestyle changes, medication compliance, etc.)

9. PRESCRIPTION DATA (if medications discussed):
   - Extract in format: {"name": "medication", "dosage": "amount", "frequency": "schedule", "duration": "period"}

RETURN RESPONSE AS JSON:
{
  "transcript": "full transcript text",
  "summary": "brief consultation summary",
  "patientInfo": {
    "name": "patient name",
    "age": number,
    "gender": "male/female",
    "contact": "phone/email"
  },
  "chiefComplaint": "primary reason for visit",
  "symptoms": ["symptom1", "symptom2"],
  "medicalHistory": {
    "conditions": ["condition1", "condition2"],
    "medications": ["med1", "med2"],
    "allergies": ["allergy1", "allergy2"]
  },
  "physicalExam": {
    "vitalSigns": {
      "temperature": number,
      "bloodPressure": "120/80",
      "heartRate": number
    },
    "findings": ["finding1", "finding2"]
  },
  "diagnosis": "primary diagnosis",
  "diagnosisDetails": "detailed diagnosis explanation",
  "underlyingConditions": "any underlying conditions",
  "treatmentPlan": {
    "medications": [
      {"name": "med", "dosage": "amount", "frequency": "schedule", "duration": "period"}
    ],
    "instructions": ["instruction1", "instruction2"]
  },
  "followUp": {
    "nextAppointment": "date/timeframe",
    "instructions": ["instruction1", "instruction2"]
  },
  "actionItems": {
    "doctor": ["action1", "action2"],
    "patient": ["action1", "action2"]
  },
  "clinicalNotes": "comprehensive clinical notes combining all relevant information",
  "prescriptionData": {
    "patientName": "name",
    "age": number,
    "gender": "male/female",
    "temperature": number,
    "bp": "120/80",
    "diagnosis": "diagnosis",
    "medications": [{"name": "med", "dosage": "amount", "frequency": "schedule", "duration": "period"}],
    "notes": "clinical notes and observations",
    "followUpDate": "YYYY-MM-DD"
  }
}`;

    let analysisData;
    try {
      const gptResponse = await fetch('https://razam-mac1ml8q-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY,
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: analysisPrompt
          }],
          max_tokens: 4096,
          temperature: 0.1,
        }),
      });

      console.log('Azure OpenAI GPT-4.1 response status:', gptResponse.status);

      if (!gptResponse.ok) {
        const errorText = await gptResponse.text();
        console.error('Azure OpenAI GPT-4.1 error:', errorText);
        throw new Error(`Azure OpenAI GPT-4.1 error (${gptResponse.status}): ${errorText}`);
      }

      const gptResult = await gptResponse.json();
      const analysisText = gptResult.choices?.[0]?.message?.content || '';
      
      if (!analysisText) {
        throw new Error('No analysis received from Azure OpenAI GPT-4.1');
      }

      console.log('GPT-4.1 analysis received, length:', analysisText.length);
      
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in analysis response');
        }
      } catch (parseError) {
        console.error('Failed to parse analysis JSON:', analysisText);
        throw new Error('Failed to parse consultation analysis');
      }

      console.log('Consultation analysis completed successfully');

    } catch (error) {
      console.error('GPT-4.1 analysis error:', error);
      throw new Error(`Failed to analyze consultation: ${error.message}`);
    }

    // Step 3: Store consultation data in Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: consultationRecord, error: consultationError } = await supabase
          .from('consultation_transcripts')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            transcript: transcript,
            analysis_data: analysisData,
            summary: analysisData.summary,
            chief_complaint: analysisData.chiefComplaint,
            diagnosis: analysisData.diagnosis,
            underlying_conditions: analysisData.underlyingConditions,
            action_items: analysisData.actionItems,
            follow_up_instructions: analysisData.followUp,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (consultationError) {
          console.error('Error storing consultation:', consultationError);
        } else {
          console.log('Consultation stored successfully:', consultationRecord.id);
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      transcript: transcript,
      summary: analysisData.summary,
      diagnosis: analysisData.diagnosis,
      diagnosis_details: analysisData.diagnosisDetails,
      underlying_conditions: analysisData.underlyingConditions,
      chief_complaint: analysisData.chiefComplaint,
      action_items: analysisData.actionItems,
      follow_up_instructions: analysisData.followUp,
      analysis_data: analysisData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Consultation transcript error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
