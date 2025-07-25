
export class SecurityService {
  // Password strength validation
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    const isValid = errors.length === 0;
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (isValid) {
      if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 'strong';
      } else if (password.length >= 10) {
        strength = 'medium';
      }
    }

    return { isValid, errors, strength };
  }

  // Input sanitization
  static sanitizeInput(input: string, maxLength: number = 255): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, '') // Basic XSS protection
      .replace(/['"]/g, ''); // SQL injection basic protection
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Rate limiting helper
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, { count: number; resetTime: number }>();
    
    return {
      isAllowed: (key: string): boolean => {
        const now = Date.now();
        const record = attempts.get(key);
        
        if (!record || now > record.resetTime) {
          attempts.set(key, { count: 1, resetTime: now + windowMs });
          return true;
        }
        
        if (record.count >= maxAttempts) {
          return false;
        }
        
        record.count++;
        return true;
      },
      
      reset: (key: string): void => {
        attempts.delete(key);
      }
    };
  }

  // Session token validation
  static validateSessionToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Check if it's a proper JWT-like structure
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Basic validation of JWT structure
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      return !!(header && payload && payload.exp && payload.exp > Date.now() / 1000);
    } catch {
      return false;
    }
  }

  // Generate secure random string
  static generateSecureRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}
