
/**
 * Utility functions for medication handling in voice commands
 */

import { PrescriptionData } from '@/components/PrescriptionForm';

export interface VoiceMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

/**
 * Add or update medications from voice command
 */
export const processMedicationsFromVoice = (
  currentMedications: PrescriptionData['medications'],
  voiceMedications: VoiceMedication[]
): PrescriptionData['medications'] => {
  if (!voiceMedications || voiceMedications.length === 0) {
    return currentMedications;
  }

  // Start with current medications as base
  const updatedMedications = [...currentMedications];
  
  voiceMedications.forEach((voiceMed, index) => {
    if (voiceMed.name && voiceMed.name.trim()) {
      // Ensure we have enough medication slots
      while (updatedMedications.length <= index) {
        updatedMedications.push({ name: '', dosage: '', frequency: '', duration: '' });
      }
      
      // Update or fill the medication at the specific index
      updatedMedications[index] = {
        name: voiceMed.name.trim(),
        dosage: voiceMed.dosage || updatedMedications[index].dosage || '',
        frequency: voiceMed.frequency || updatedMedications[index].frequency || '',
        duration: voiceMed.duration || updatedMedications[index].duration || ''
      };
    }
  });

  // Ensure we always have at least one medication slot
  if (updatedMedications.length === 0) {
    updatedMedications.push({ name: '', dosage: '', frequency: '', duration: '' });
  }

  return updatedMedications;
};

/**
 * Find the best available slot for a new medication
 */
export const findAvailableMedicationSlot = (
  medications: PrescriptionData['medications']
): number => {
  // Find first empty slot
  const emptySlotIndex = medications.findIndex(med => !med.name || med.name.trim() === '');
  if (emptySlotIndex !== -1) {
    return emptySlotIndex;
  }
  
  // Return next available index (will create new slot)
  return medications.length;
};

/**
 * Validate frequency against predefined options
 */
export const validateFrequency = (frequency: string): string => {
  const validFrequencies = [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  if (!frequency) return '';
  
  // Find exact match first
  const exactMatch = validFrequencies.find(
    valid => valid.toLowerCase() === frequency.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Find partial match
  const partialMatch = validFrequencies.find(
    valid => valid.toLowerCase().includes(frequency.toLowerCase()) ||
             frequency.toLowerCase().includes(valid.toLowerCase())
  );
  
  return partialMatch || frequency;
};

/**
 * Process single medication into the medications array
 */
export const addSingleMedicationToArray = (
  currentMedications: PrescriptionData['medications'],
  medicationName: string,
  dosage?: string,
  frequency?: string,
  duration?: string
): PrescriptionData['medications'] => {
  const voiceMedication: VoiceMedication = {
    name: medicationName,
    dosage: dosage || '',
    frequency: validateFrequency(frequency || ''),
    duration: duration || ''
  };
  
  return processMedicationsFromVoice(currentMedications, [voiceMedication]);
};
