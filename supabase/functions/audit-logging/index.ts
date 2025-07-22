import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, resource, metadata }: AuditLogEntry = await req.json();

    if (!action || !userId || !resource) {
      throw new Error('Missing required fields: action, userId, resource');
    }

    console.log('Audit log entry:', { action, userId, resource });

    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Log the action to audit table
    const { data, error } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: action,
        resource: resource,
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting audit log:', error);
      throw error;
    }

    // Check for security patterns
    await performSecurityAnalysis(supabaseClient, {
      userId,
      action,
      resource,
      ipAddress: clientIP,
      userAgent
    });

    console.log('Audit log recorded successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        auditId: data.id,
        message: 'Audit log recorded successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Audit logging error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

async function performSecurityAnalysis(supabaseClient: any, logEntry: any) {
  try {
    // Check for suspicious patterns
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Check for rapid successive logins from different IPs
    if (logEntry.action === 'login_success') {
      const { data: recentLogins } = await supabaseClient
        .from('audit_logs')
        .select('ip_address')
        .eq('user_id', logEntry.userId)
        .eq('action', 'login_success')
        .gte('timestamp', fiveMinutesAgo.toISOString());

      if (recentLogins && recentLogins.length > 1) {
        const uniqueIPs = new Set(recentLogins.map((log: any) => log.ip_address));
        if (uniqueIPs.size > 2) {
          await createSecurityAlert(supabaseClient, {
            userId: logEntry.userId,
            alertType: 'suspicious_login_pattern',
            description: `Multiple logins from ${uniqueIPs.size} different IP addresses within 5 minutes`,
            severity: 'high',
            metadata: {
              ipAddresses: Array.from(uniqueIPs),
              timeframe: '5 minutes'
            }
          });
        }
      }
    }

    // Check for failed login attempts
    if (logEntry.action === 'login_failed') {
      const { data: failedAttempts } = await supabaseClient
        .from('audit_logs')
        .select('*')
        .eq('ip_address', logEntry.ipAddress)
        .eq('action', 'login_failed')
        .gte('timestamp', fiveMinutesAgo.toISOString());

      if (failedAttempts && failedAttempts.length >= 5) {
        await createSecurityAlert(supabaseClient, {
          userId: 'system',
          alertType: 'brute_force_attempt',
          description: `${failedAttempts.length} failed login attempts from IP ${logEntry.ipAddress}`,
          severity: 'critical',
          metadata: {
            ipAddress: logEntry.ipAddress,
            attemptCount: failedAttempts.length
          }
        });
      }
    }

    // Check for unusual data access patterns
    if (logEntry.action.includes('patient_data_access')) {
      const { data: recentAccess } = await supabaseClient
        .from('audit_logs')
        .select('resource')
        .eq('user_id', logEntry.userId)
        .like('action', '%patient_data_access%')
        .gte('timestamp', fiveMinutesAgo.toISOString());

      if (recentAccess && recentAccess.length > 10) {
        await createSecurityAlert(supabaseClient, {
          userId: logEntry.userId,
          alertType: 'bulk_data_access',
          description: `User accessed ${recentAccess.length} patient records within 5 minutes`,
          severity: 'medium',
          metadata: {
            recordCount: recentAccess.length,
            timeframe: '5 minutes'
          }
        });
      }
    }

  } catch (error) {
    console.error('Security analysis error:', error);
    // Don't throw - audit logging should still work even if security analysis fails
  }
}

async function createSecurityAlert(supabaseClient: any, alert: any) {
  try {
    const { error } = await supabaseClient
      .from('security_alerts')
      .insert({
        user_id: alert.userId,
        alert_type: alert.alertType,
        description: alert.description,
        severity: alert.severity,
        metadata: alert.metadata,
        status: 'open',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating security alert:', error);
    } else {
      console.log('Security alert created:', alert.alertType);
    }
  } catch (error) {
    console.error('Security alert creation error:', error);
  }
}