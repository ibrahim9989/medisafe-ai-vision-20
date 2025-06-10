
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Pill, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  User,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { PatientHistoryData } from '@/hooks/usePatientHistory';

interface PatientHistoryViewProps {
  patientHistory: PatientHistoryData;
  onUpdatePatient?: () => void;
}

const PatientHistoryView = ({ patientHistory, onUpdatePatient }: PatientHistoryViewProps) => {
  const { patient, visits, lastVisit, totalVisits, chronicConditions, currentMedications } = patientHistory;

  return (
    <div className="space-y-6">
      {/* Patient Summary Card */}
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-medium">Patient Summary</span>
            </div>
            {onUpdatePatient && (
              <Button variant="outline" size="sm" onClick={onUpdatePatient}>
                Update Info
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age & Gender</p>
              <p className="font-medium">{patient.age} years, {patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <p className="font-medium">{patient.phone_number || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="font-medium font-mono text-sm">{patient.patient_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Last Visit</p>
                <p className="text-lg font-semibold">
                  {lastVisit ? format(new Date(lastVisit.visit_date), 'MMM dd, yyyy') : 'No visits'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Chronic Conditions</p>
                <p className="text-2xl font-bold">{chronicConditions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chronic Conditions */}
      {chronicConditions.length > 0 && (
        <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-medium">Chronic Conditions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {chronicConditions.map((condition, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Medications */}
      {currentMedications.length > 0 && (
        <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-medium">Current Medications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentMedications.map((med: any, index: number) => (
                <div key={index} className="bg-white/60 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">
                        {med.dosage} - {med.frequency} for {med.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit History */}
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Visit History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {visits.map((visit) => (
              <div key={visit.id} className="bg-white/60 rounded-lg p-4 border border-white/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {format(new Date(visit.visit_date), 'PPP')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Visit #{visit.id.slice(-8)}
                  </Badge>
                </div>
                
                {visit.diagnosis && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Diagnosis: </span>
                    <span className="text-sm">{visit.diagnosis}</span>
                  </div>
                )}
                
                {visit.reason_for_visit && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Reason: </span>
                    <span className="text-sm">{visit.reason_for_visit}</span>
                  </div>
                )}
                
                {visit.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes: </span>
                    <span className="text-sm">{visit.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistoryView;
