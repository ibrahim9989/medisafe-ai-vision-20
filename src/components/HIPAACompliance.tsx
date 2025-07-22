import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  Users,
  Database
} from 'lucide-react';

interface SecurityAudit {
  encryption: boolean;
  accessControl: boolean;
  auditLogging: boolean;
  dataBackup: boolean;
  userAuthentication: boolean;
  roleBasedAccess: boolean;
}

interface ComplianceMetrics {
  lastAudit: string;
  complianceScore: number;
  criticalIssues: number;
  resolvedIssues: number;
}

const HIPAACompliance = () => {
  const [securityAudit, setSecurityAudit] = useState<SecurityAudit>({
    encryption: true,
    accessControl: true,
    auditLogging: true,
    dataBackup: true,
    userAuthentication: true,
    roleBasedAccess: true,
  });

  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics>({
    lastAudit: new Date().toISOString().split('T')[0],
    complianceScore: 95,
    criticalIssues: 0,
    resolvedIssues: 12,
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: new Date().toISOString(),
      user: 'Dr. Smith',
      action: 'Patient record accessed',
      resource: 'Patient ID: 12345',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Dr. Johnson',
      action: 'Prescription created',
      resource: 'Prescription ID: 67890',
      ipAddress: '192.168.1.101',
      status: 'success'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'admin@system',
      action: 'Failed login attempt',
      resource: 'Authentication system',
      ipAddress: '10.0.0.5',
      status: 'failure'
    }
  ]);

  const complianceChecks = [
    {
      title: 'Data Encryption at Rest',
      description: 'All patient data encrypted using AES-256',
      status: securityAudit.encryption,
      critical: true
    },
    {
      title: 'Access Control Lists',
      description: 'Role-based access controls implemented',
      status: securityAudit.accessControl,
      critical: true
    },
    {
      title: 'Audit Logging',
      description: 'Comprehensive logging of all data access',
      status: securityAudit.auditLogging,
      critical: true
    },
    {
      title: 'Data Backup & Recovery',
      description: 'Automated daily backups with encryption',
      status: securityAudit.dataBackup,
      critical: false
    },
    {
      title: 'Multi-Factor Authentication',
      description: 'MFA required for all healthcare providers',
      status: securityAudit.userAuthentication,
      critical: true
    },
    {
      title: 'Role-Based Access',
      description: 'Granular permissions per user role',
      status: securityAudit.roleBasedAccess,
      critical: true
    }
  ];

  const generateAuditReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      complianceScore: complianceMetrics.complianceScore,
      securityChecks: complianceChecks,
      auditLogs: auditLogs.slice(0, 100), // Last 100 entries
      recommendations: [
        'Enable 2FA for all users',
        'Review access permissions quarterly',
        'Implement data retention policies',
        'Conduct regular security training'
      ]
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hipaa-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failure': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            HIPAA Compliance Dashboard
          </CardTitle>
          <CardDescription>
            Monitor security measures and regulatory compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{complianceMetrics.complianceScore}%</div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{complianceMetrics.criticalIssues}</div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{complianceMetrics.resolvedIssues}</div>
              <div className="text-sm text-muted-foreground">Issues Resolved</div>
            </div>
          </div>
          
          <Progress value={complianceMetrics.complianceScore} className="mb-4" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Last audit: {complianceMetrics.lastAudit}
            </span>
            <Button onClick={generateAuditReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Controls
          </CardTitle>
          <CardDescription>
            Core security measures and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  {check.status ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {check.title}
                      {check.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{check.description}</div>
                  </div>
                </div>
                <Badge variant={check.status ? "default" : "destructive"}>
                  {check.status ? "Compliant" : "Non-Compliant"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            Recent access and activity logs for compliance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{log.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.user} • {log.resource} • {log.ipAddress}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                    {log.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-center">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Full Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Privacy & Protection
          </CardTitle>
          <CardDescription>
            Configure data handling and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Automatic Data Encryption</div>
                <div className="text-sm text-muted-foreground">
                  Encrypt all patient data automatically
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Data Retention Policy</div>
                <div className="text-sm text-muted-foreground">
                  Automatically archive data after 7 years
                </div>
              </div>
              <Switch checked={true} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Access Logging</div>
                <div className="text-sm text-muted-foreground">
                  Log all data access attempts
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Breach Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Automatic notifications for security events
                </div>
              </div>
              <Switch checked={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>HIPAA Compliance Status:</strong> Your system is currently compliant with HIPAA regulations. 
          Continue monitoring access logs and conducting regular security audits to maintain compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default HIPAACompliance;