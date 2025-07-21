import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AuthRequest {
  operation: 'VALIDATE_API_KEY' | 'CREATE_SESSION' | 'REFRESH_TOKEN' | 'SSO_VALIDATE';
  apiKey?: string;
  sessionToken?: string;
  refreshToken?: string;
  ssoToken?: string;
  ehrSystem?: string;
  userId?: string;
}

interface PluginSession {
  sessionId: string;
  userId: string;
  ehrSystem: string;
  permissions: string[];
  expiresAt: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authRequest: AuthRequest = await req.json();

    switch (authRequest.operation) {
      case 'VALIDATE_API_KEY':
        return await validateApiKey(authRequest.apiKey!);
      
      case 'CREATE_SESSION':
        return await createPluginSession(authRequest);
      
      case 'REFRESH_TOKEN':
        return await refreshSession(authRequest.refreshToken!);
      
      case 'SSO_VALIDATE':
        return await validateSSOToken(authRequest);
      
      default:
        throw new Error(`Unsupported auth operation: ${authRequest.operation}`);
    }

  } catch (error) {
    console.error('Plugin auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function validateApiKey(apiKey: string) {
  try {
    // In production, this would validate against a proper API key registry
    // For now, we'll use a simple validation scheme
    if (!apiKey || !apiKey.startsWith('mvs_')) {
      throw new Error('Invalid API key format');
    }

    // Extract metadata from API key (simplified)
    const keyParts = apiKey.split('_');
    if (keyParts.length < 3) {
      throw new Error('Invalid API key structure');
    }

    const environment = keyParts[1]; // dev, staging, prod
    const keyId = keyParts[2];

    // Validate key exists and is active (mock validation)
    const isValid = keyId.length >= 32; // Simple validation
    
    if (!isValid) {
      throw new Error('API key is invalid or expired');
    }

    const permissions = getPermissionsForKey(keyId);

    return new Response(
      JSON.stringify({
        valid: true,
        keyId,
        environment,
        permissions,
        rateLimit: {
          limit: 1000,
          remaining: 950,
          resetTime: new Date(Date.now() + 3600000).toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message 
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function createPluginSession(authRequest: AuthRequest) {
  try {
    const { apiKey, ehrSystem, userId } = authRequest;

    if (!apiKey || !ehrSystem || !userId) {
      throw new Error('API key, EHR system, and user ID are required');
    }

    // Validate API key first
    const keyValidation = await validateApiKey(apiKey);
    const keyData = await keyValidation.json();
    
    if (!keyData.valid) {
      throw new Error('Invalid API key');
    }

    // Generate session token
    const sessionId = crypto.randomUUID();
    const sessionToken = generateSessionToken(sessionId);
    const refreshToken = generateRefreshToken(sessionId);
    
    const session: PluginSession = {
      sessionId,
      userId,
      ehrSystem,
      permissions: keyData.permissions,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      metadata: {
        createdAt: new Date().toISOString(),
        apiKeyId: keyData.keyId,
        environment: keyData.environment
      }
    };

    // Store session in database (using a sessions table in production)
    // For now, we'll return the session data

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          sessionToken,
          refreshToken,
          expiresAt: session.expiresAt,
          permissions: session.permissions,
          user: {
            id: userId,
            ehrSystem
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
}

async function refreshSession(refreshToken: string) {
  try {
    // Validate refresh token
    const sessionData = validateRefreshToken(refreshToken);
    
    if (!sessionData) {
      throw new Error('Invalid or expired refresh token');
    }

    // Generate new session token
    const newSessionToken = generateSessionToken(sessionData.sessionId);
    const newRefreshToken = generateRefreshToken(sessionData.sessionId);
    
    return new Response(
      JSON.stringify({
        success: true,
        session: {
          sessionToken: newSessionToken,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          permissions: sessionData.permissions
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`Failed to refresh session: ${error.message}`);
  }
}

async function validateSSOToken(authRequest: AuthRequest) {
  try {
    const { ssoToken, ehrSystem } = authRequest;

    if (!ssoToken || !ehrSystem) {
      throw new Error('SSO token and EHR system are required');
    }

    // Validate SSO token with EHR system
    // This would integrate with SAML, OAuth, or other SSO providers
    const ssoValidation = await validateWithEHRSystem(ssoToken, ehrSystem);
    
    if (!ssoValidation.valid) {
      throw new Error('SSO token validation failed');
    }

    // Create session for SSO user
    const sessionId = crypto.randomUUID();
    const sessionToken = generateSessionToken(sessionId);
    
    return new Response(
      JSON.stringify({
        success: true,
        session: {
          sessionToken,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          user: ssoValidation.user,
          permissions: ssoValidation.permissions
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`SSO validation failed: ${error.message}`);
  }
}

// Helper functions
function getPermissionsForKey(keyId: string): string[] {
  // In production, this would query a database
  // For demo, return standard permissions based on key pattern
  const basePermissions = [
    'read:patients',
    'write:prescriptions',
    'read:prescriptions'
  ];

  // Premium keys get additional permissions
  if (keyId.includes('premium') || keyId.includes('enterprise')) {
    return [
      ...basePermissions,
      'read:analytics',
      'write:patients',
      'admin:widgets'
    ];
  }

  return basePermissions;
}

function generateSessionToken(sessionId: string): string {
  // In production, use proper JWT or encrypted tokens
  const tokenData = {
    sessionId,
    type: 'session',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
  };
  
  // Simple base64 encoding for demo (use proper JWT in production)
  return 'mvs_session_' + btoa(JSON.stringify(tokenData));
}

function generateRefreshToken(sessionId: string): string {
  // In production, use proper JWT or encrypted tokens
  const tokenData = {
    sessionId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  return 'mvs_refresh_' + btoa(JSON.stringify(tokenData));
}

function validateRefreshToken(refreshToken: string): any {
  try {
    if (!refreshToken.startsWith('mvs_refresh_')) {
      return null;
    }

    const tokenData = JSON.parse(atob(refreshToken.split('mvs_refresh_')[1]));
    
    // Check if token is expired
    if (tokenData.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sessionId: tokenData.sessionId,
      permissions: ['read:patients', 'write:prescriptions'] // Would get from session store
    };
  } catch {
    return null;
  }
}

async function validateWithEHRSystem(ssoToken: string, ehrSystem: string): Promise<any> {
  // Mock SSO validation - in production, this would call the actual EHR SSO endpoint
  switch (ehrSystem.toLowerCase()) {
    case 'epic':
      return validateEpicSSO(ssoToken);
    case 'cerner':
      return validateCernerSSO(ssoToken);
    case 'allscripts':
      return validateAllscriptsSSO(ssoToken);
    default:
      throw new Error(`Unsupported EHR system: ${ehrSystem}`);
  }
}

async function validateEpicSSO(token: string): Promise<any> {
  // Mock Epic SSO validation
  return {
    valid: token.length > 10, // Simple validation for demo
    user: {
      id: 'epic_user_123',
      name: 'Dr. Epic User',
      email: 'epic.user@hospital.com',
      role: 'physician'
    },
    permissions: ['read:patients', 'write:prescriptions', 'read:analytics']
  };
}

async function validateCernerSSO(token: string): Promise<any> {
  // Mock Cerner SSO validation
  return {
    valid: token.length > 10,
    user: {
      id: 'cerner_user_456',
      name: 'Dr. Cerner User',
      email: 'cerner.user@health.org',
      role: 'physician'
    },
    permissions: ['read:patients', 'write:prescriptions']
  };
}

async function validateAllscriptsSSO(token: string): Promise<any> {
  // Mock Allscripts SSO validation
  return {
    valid: token.length > 10,
    user: {
      id: 'as_user_789',
      name: 'Dr. Allscripts User',
      email: 'as.user@clinic.com',
      role: 'physician'
    },
    permissions: ['read:patients', 'write:prescriptions', 'read:analytics']
  };
}