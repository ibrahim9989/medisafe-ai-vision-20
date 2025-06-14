
/**
 * Utility functions for date conversion and formatting
 */

/**
 * Convert MM/DD/YYYY format to YYYY-MM-DD format for HTML date inputs
 */
export const convertToDateInputFormat = (mmddyyyy: string): string => {
  if (!mmddyyyy || typeof mmddyyyy !== 'string') {
    return '';
  }

  // Check if it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(mmddyyyy)) {
    return mmddyyyy;
  }

  // Parse MM/DD/YYYY format
  const mmddyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = mmddyyyy.match(mmddyyyyPattern);
  
  if (!match) {
    console.warn('Invalid date format:', mmddyyyy);
    return '';
  }

  const [, month, day, year] = match;
  
  // Pad month and day with leading zeros if needed
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  
  // Return in YYYY-MM-DD format
  return `${year}-${paddedMonth}-${paddedDay}`;
};

/**
 * Convert YYYY-MM-DD format to MM/DD/YYYY format for display
 */
export const convertFromDateInputFormat = (yyyymmdd: string): string => {
  if (!yyyymmdd || typeof yyyymmdd !== 'string') {
    return '';
  }

  // Check if it's already in MM/DD/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(yyyymmdd)) {
    return yyyymmdd;
  }

  // Parse YYYY-MM-DD format
  const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = yyyymmdd.match(yyyymmddPattern);
  
  if (!match) {
    console.warn('Invalid date format:', yyyymmdd);
    return '';
  }

  const [, year, month, day] = match;
  
  // Remove leading zeros and return in MM/DD/YYYY format
  return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
};

/**
 * Validate if a date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return inputDate > today;
};
