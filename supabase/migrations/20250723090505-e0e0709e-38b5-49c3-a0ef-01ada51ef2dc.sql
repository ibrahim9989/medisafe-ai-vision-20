-- Create audit logging and security tables for HIPAA compliance

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security alerts table
CREATE TABLE public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data access permissions table
CREATE TABLE public.data_access_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance reports table
CREATE TABLE public.compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL,
  generated_by UUID NOT NULL,
  report_data JSONB NOT NULL,
  compliance_score INTEGER,
  critical_issues INTEGER DEFAULT 0,
  resolved_issues INTEGER DEFAULT 0,
  recommendations TEXT[],
  period_start DATE,
  period_end DATE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- Audit logs policies (admins and compliance officers can view all, users can view their own)
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'compliance_officer')
  )
);

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true); -- Allow system to insert logs

-- Security alerts policies
CREATE POLICY "Admins can manage security alerts" 
ON public.security_alerts 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'security_officer')
  )
);

CREATE POLICY "Users can view alerts about themselves" 
ON public.security_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Data access permissions policies
CREATE POLICY "Admins can manage data access permissions" 
ON public.data_access_permissions 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'compliance_officer')
  )
);

CREATE POLICY "Users can view their own permissions" 
ON public.data_access_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Compliance reports policies
CREATE POLICY "Admins can manage compliance reports" 
ON public.compliance_reports 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'compliance_officer')
  )
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_ip_address ON public.audit_logs(ip_address);

CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at);

CREATE INDEX idx_data_access_permissions_user_id ON public.data_access_permissions(user_id);
CREATE INDEX idx_data_access_permissions_resource ON public.data_access_permissions(resource_type, resource_id);

CREATE INDEX idx_compliance_reports_generated_at ON public.compliance_reports(generated_at);
CREATE INDEX idx_compliance_reports_type ON public.compliance_reports(report_type);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_access_permissions_updated_at
  BEFORE UPDATE ON public.data_access_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log data access automatically
CREATE OR REPLACE FUNCTION public.log_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log patient data access
  IF TG_TABLE_NAME = 'patients' AND TG_OP = 'SELECT' THEN
    INSERT INTO public.audit_logs (user_id, action, resource, metadata)
    VALUES (
      auth.uid(),
      'patient_data_access',
      'patient_id:' || NEW.id,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically expire permissions
CREATE OR REPLACE FUNCTION public.expire_access_permissions()
RETURNS void AS $$
BEGIN
  UPDATE public.data_access_permissions 
  SET 
    revoked_at = now(),
    revoked_by = '00000000-0000-0000-0000-000000000000', -- System user
    reason = 'Automatic expiration'
  WHERE 
    expires_at <= now() 
    AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to generate compliance reports
CREATE OR REPLACE FUNCTION public.generate_compliance_report(
  p_report_type TEXT,
  p_period_start DATE DEFAULT NULL,
  p_period_end DATE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  report_id UUID;
  audit_count INTEGER;
  alert_count INTEGER;
  resolved_count INTEGER;
  compliance_score INTEGER;
BEGIN
  -- Set default period if not provided
  IF p_period_start IS NULL THEN
    p_period_start := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF p_period_end IS NULL THEN
    p_period_end := CURRENT_DATE;
  END IF;
  
  -- Count audit logs in period
  SELECT COUNT(*) INTO audit_count
  FROM public.audit_logs
  WHERE timestamp >= p_period_start AND timestamp <= p_period_end;
  
  -- Count security alerts
  SELECT COUNT(*) INTO alert_count
  FROM public.security_alerts
  WHERE created_at >= p_period_start AND created_at <= p_period_end
  AND status = 'open';
  
  -- Count resolved alerts
  SELECT COUNT(*) INTO resolved_count
  FROM public.security_alerts
  WHERE resolved_at >= p_period_start AND resolved_at <= p_period_end;
  
  -- Calculate compliance score (simplified)
  compliance_score := CASE 
    WHEN alert_count = 0 THEN 100
    WHEN alert_count <= 5 THEN 95
    WHEN alert_count <= 10 THEN 85
    ELSE 70
  END;
  
  -- Insert compliance report
  INSERT INTO public.compliance_reports (
    report_type,
    generated_by,
    report_data,
    compliance_score,
    critical_issues,
    resolved_issues,
    period_start,
    period_end
  ) VALUES (
    p_report_type,
    auth.uid(),
    jsonb_build_object(
      'audit_logs_count', audit_count,
      'open_alerts', alert_count,
      'resolved_alerts', resolved_count,
      'period_days', p_period_end - p_period_start
    ),
    compliance_score,
    alert_count,
    resolved_count,
    p_period_start,
    p_period_end
  ) RETURNING id INTO report_id;
  
  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;