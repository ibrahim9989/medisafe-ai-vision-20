
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Search, 
  User, 
  FileText, 
  Clock,
  Filter,
  Download,
  Eye,
  UserCircle,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import PrescriptionPDFExport from './PrescriptionPDFExport';
import AIAnalysisPDFExport from './AIAnalysisPDFExport';

interface PatientProfile {
  name: string;
  prescriptions: any[];
  totalVisits: number;
  lastVisit: string;
  commonDiagnoses: string[];
}

const PatientHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'prescriptions' | 'profiles'>('prescriptions');
  
  const { prescriptions, isLoading } = usePrescriptions();

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (selectedDateRange === 'all') return true;
    
    const prescriptionDate = new Date(prescription.created_at);
    const now = new Date();
    
    switch (selectedDateRange) {
      case 'today':
        return prescriptionDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return prescriptionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return prescriptionDate >= monthAgo;
      default:
        return true;
    }
  });

  // Create patient profiles from prescriptions
  const patientProfiles: PatientProfile[] = React.useMemo(() => {
    const profileMap = new Map<string, PatientProfile>();
    
    prescriptions.forEach(prescription => {
      const patientName = prescription.patient_name;
      
      if (!profileMap.has(patientName)) {
        profileMap.set(patientName, {
          name: patientName,
          prescriptions: [],
          totalVisits: 0,
          lastVisit: prescription.created_at,
          commonDiagnoses: []
        });
      }
      
      const profile = profileMap.get(patientName)!;
      profile.prescriptions.push(prescription);
      profile.totalVisits++;
      
      // Update last visit if this prescription is more recent
      if (new Date(prescription.created_at) > new Date(profile.lastVisit)) {
        profile.lastVisit = prescription.created_at;
      }
      
      // Add diagnosis to common diagnoses
      if (prescription.diagnosis && !profile.commonDiagnoses.includes(prescription.diagnosis)) {
        profile.commonDiagnoses.push(prescription.diagnosis);
      }
    });
    
    return Array.from(profileMap.values()).sort((a, b) => 
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  }, [prescriptions]);

  const selectedPatientProfile = selectedPatient 
    ? patientProfiles.find(p => p.name === selectedPatient)
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Patient History</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'prescriptions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('prescriptions');
                  setSelectedPatient(null);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Prescriptions
              </Button>
              <Button
                variant={viewMode === 'profiles' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('profiles')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Patient Profiles
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={viewMode === 'profiles' ? "Search patient names..." : "Search by patient or doctor name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {viewMode === 'prescriptions' && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            )}
          </div>

          {/* Back to profiles button when viewing patient details */}
          {selectedPatient && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPatient(null)}
              >
                ← Back to Patient Profiles
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {/* Patient Profiles View */}
            {viewMode === 'profiles' && !selectedPatient && (
              <>
                {patientProfiles.filter(profile => 
                  profile.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No patient profiles found</p>
                  </div>
                ) : (
                  patientProfiles
                    .filter(profile => profile.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((profile, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <UserCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{profile.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Activity className="h-4 w-4 mr-1" />
                                  {profile.totalVisits} visits
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Last visit: {format(new Date(profile.lastVisit), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {profile.commonDiagnoses.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Common Diagnoses:</h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.commonDiagnoses.slice(0, 3).map((diagnosis, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {diagnosis}
                                </Badge>
                              ))}
                              {profile.commonDiagnoses.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{profile.commonDiagnoses.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => setSelectedPatient(profile.name)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Patient History ({profile.totalVisits} prescriptions)
                        </Button>
                      </div>
                    ))
                )}
              </>
            )}

            {/* Selected Patient's Prescriptions */}
            {selectedPatient && selectedPatientProfile && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {selectedPatientProfile.name} - Medical History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Visits:</span> {selectedPatientProfile.totalVisits}
                    </div>
                    <div>
                      <span className="font-medium">Last Visit:</span> {format(new Date(selectedPatientProfile.lastVisit), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Diagnoses:</span> {selectedPatientProfile.commonDiagnoses.length}
                    </div>
                  </div>
                </div>

                {selectedPatientProfile.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 bg-white/60 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span>{prescription.patient_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {prescription.gender}, {prescription.age}y
                          </Badge>
                        </h3>
                        <p className="text-sm text-gray-600">Dr. {prescription.doctor_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(prescription.created_at), 'HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Vital Signs</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Temperature: {prescription.temperature}°F</div>
                          <div>Blood Pressure: {prescription.bp}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Medications</h4>
                        <div className="text-sm text-gray-600">
                          {prescription.medications.length} medication(s) prescribed
                        </div>
                      </div>
                    </div>

                    {prescription.diagnosis && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-1">Diagnosis</h4>
                        <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                        {prescription.diagnosis_details && (
                          <p className="text-sm text-gray-500 mt-1">Details: {prescription.diagnosis_details}</p>
                        )}
                      </div>
                    )}

                    {prescription.underlying_conditions && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-1">Underlying Conditions</h4>
                        <p className="text-sm text-gray-600">{prescription.underlying_conditions}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPrescription(prescription)}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <PrescriptionPDFExport
                        prescriptionData={{
                          doctorName: prescription.doctor_name,
                          patientName: prescription.patient_name,
                          age: prescription.age,
                          gender: prescription.gender,
                          contact: prescription.contact || '',
                          temperature: prescription.temperature,
                          bp: prescription.bp || '',
                          medications: prescription.medications,
                          diagnosis: prescription.diagnosis || '',
                          diagnosisDetails: prescription.diagnosis_details || '',
                          underlyingConditions: prescription.underlying_conditions || '',
                          notes: prescription.notes || '',
                          consultationNotes: prescription.consultation_notes || '',
                          recommendedTests: prescription.recommended_tests || [],
                          labReports: [],
                          labAnalysis: prescription.lab_analysis || '',
                          followUpDate: prescription.follow_up_date || '',
                          isFollowUp: false,
                          originalPrescriptionId: ''
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Regular Prescriptions View */}
            {viewMode === 'prescriptions' && (
              <>
                {filteredPrescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No prescriptions found</p>
                  </div>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 bg-white/60 backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span>{prescription.patient_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {prescription.gender}, {prescription.age}y
                            </Badge>
                          </h3>
                          <p className="text-sm text-gray-600">Dr. {prescription.doctor_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(prescription.created_at), 'HH:mm')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Vital Signs</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Temperature: {prescription.temperature}°F</div>
                            <div>Blood Pressure: {prescription.bp}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Medications</h4>
                          <div className="text-sm text-gray-600">
                            {prescription.medications.length} medication(s) prescribed
                          </div>
                        </div>
                      </div>

                      {prescription.diagnosis && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-1">Diagnosis</h4>
                          <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPrescription(prescription)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <PrescriptionPDFExport
                          prescriptionData={{
                            doctorName: prescription.doctor_name,
                            patientName: prescription.patient_name,
                            age: prescription.age,
                            gender: prescription.gender,
                            contact: prescription.contact || '',
                            temperature: prescription.temperature,
                            bp: prescription.bp || '',
                            medications: prescription.medications,
                            diagnosis: prescription.diagnosis || '',
                            diagnosisDetails: prescription.diagnosis_details || '',
                            underlyingConditions: prescription.underlying_conditions || '',
                            notes: prescription.notes || '',
                            consultationNotes: prescription.consultation_notes || '',
                            recommendedTests: prescription.recommended_tests || [],
                            labReports: [],
                            labAnalysis: prescription.lab_analysis || '',
                            followUpDate: prescription.follow_up_date || '',
                            isFollowUp: false,
                            originalPrescriptionId: ''
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistory;
