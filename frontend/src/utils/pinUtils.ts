/**
 * Shared PIN utility functions for classroom management
 * Ensures consistent PIN generation and validation across the application
 */

// Characters used for PIN generation (digits + uppercase letters)
const PIN_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PIN_LENGTH = 8;

/**
 * Generates a unique 8-character PIN using digits and uppercase letters
 * @returns {string} Generated PIN
 */
export const generatePin = (): string => {
  let pin = '';
  for (let i = 0; i < PIN_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * PIN_CHARACTERS.length);
    pin += PIN_CHARACTERS[randomIndex];
  }
  return pin;
};

/**
 * Validates PIN format (8 characters, alphanumeric uppercase)
 * @param {string} pin - PIN to validate
 * @returns {boolean} True if PIN format is valid
 */
export const isValidPinFormat = (pin: string): boolean => {
  if (!pin || typeof pin !== 'string') {
    return false;
  }
  
  // Check length
  if (pin.length !== PIN_LENGTH) {
    return false;
  }
  
  // Check if all characters are valid (digits or uppercase letters)
  const validCharRegex = /^[0-9A-Z]+$/;
  return validCharRegex.test(pin);
};

/**
 * Normalizes PIN input (removes spaces, converts to uppercase)
 * @param {string} pin - Raw PIN input
 * @returns {string} Normalized PIN
 */
export const normalizePin = (pin: string): string => {
  if (!pin || typeof pin !== 'string') {
    return '';
  }
  
  return pin.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
};

/**
 * Validates PIN against stored classroom PINs
 * This function should be used by both frontend validation and backend verification
 * @param {string} inputPin - PIN entered by student
 * @param {Array} classrooms - Array of classroom objects with PIN property
 * @returns {Object} Validation result with success status and classroom data
 */
export const validatePin = (inputPin: string, classrooms: any[]): {
  success: boolean;
  classroom?: any;
  error?: string;
} => {
  const normalizedPin = normalizePin(inputPin);
  
  // Check PIN format first
  if (!isValidPinFormat(normalizedPin)) {
    return {
      success: false,
      error: `Invalid PIN format. PIN must be exactly ${PIN_LENGTH} characters using digits and uppercase letters.`
    };
  }
  
  // Find matching classroom
  const matchedClassroom = classrooms.find(classroom => 
    classroom.pin === normalizedPin
  );
  
  if (matchedClassroom) {
    return {
      success: true,
      classroom: matchedClassroom
    };
  } else {
    return {
      success: false,
      error: 'Invalid PIN. No classroom found with this PIN.'
    };
  }
};

/**
 * Generates a unique PIN that doesn't conflict with existing classroom PINs
 * @param {Array} existingPins - Array of existing PINs to avoid duplicates
 * @param {number} maxAttempts - Maximum attempts to generate unique PIN
 * @returns {string} Unique PIN
 */
export const generateUniquePin = (existingPins: string[] = [], maxAttempts: number = 100): string => {
  let attempts = 0;
  let newPin: string;
  
  do {
    newPin = generatePin();
    attempts++;
    
    if (attempts >= maxAttempts) {
      // Fallback: add timestamp suffix to ensure uniqueness
      const timestamp = Date.now().toString().slice(-4);
      newPin = generatePin().slice(0, 4) + timestamp;
      break;
    }
  } while (existingPins.includes(newPin));
  
  return newPin;
};

/**
 * Mock classroom data for testing PIN validation
 * This should be replaced with actual database queries in production
 */
export const getMockClassrooms = () => [
  {
    id: '1',
    name: 'Mathematics Advanced',
    subject: 'Mathematics',
    pin: 'ABC12345',
    teacherId: 'teacher1',
    studentCount: 25
  },
  {
    id: '2',
    name: 'Physics Fundamentals',
    subject: 'Physics',
    pin: 'XYZ67890',
    teacherId: 'teacher1',
    studentCount: 18
  },
  {
    id: '3',
    name: 'Chemistry Lab',
    subject: 'Chemistry',
    pin: 'DEF13579',
    teacherId: 'teacher1',
    studentCount: 22
  },
  {
    id: '4',
    name: 'gradwerchtj',
    subject: 'wewrgt',
    pin: '54084518',
    teacherId: 'teacher1',
    studentCount: 0
  }
];

export default {
  generatePin,
  generateUniquePin,
  validatePin,
  isValidPinFormat,
  normalizePin,
  getMockClassrooms
};
