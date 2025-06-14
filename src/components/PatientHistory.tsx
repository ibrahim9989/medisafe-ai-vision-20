
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar, 
  User, 
  Phone, 
  Search, 
  Eye, 
  FileText,
  Clock
} from 'lucide-react';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import PatientHistoryPDFExport from './PatientHistoryPDFExport';
import { format } from 'date-fns';

const PatientHistory = () => {
  const { patients, patientVisits, prescriptions, loading } = usePrescriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientVisits = (patientId: string) => {
    return patientVisits.filter(visit => visit.patient_id === patientId);
  };

  const getPrescriptionDetails = (prescriptionId: string) => {
    return prescriptions.find(p => p.id === prescriptionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cb6ce6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Patient History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/60 border-white/30"
              />
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{patients.length} Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{patientVisits.length} Visits</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Patients List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {patients.length === 0 ? 'No patients found. Create your first prescription to add patients.' : 'No patients match your search.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const visits = getPatientVisits(patient.id);
                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono text-sm">
                        {patient.patient_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {patient.full_name}
                      </TableCell>
                      <TableCell>{patient.age || '-'}</TableCell>
                      <TableCell>{patient.gender || '-'}</TableCell>
                      <TableCell>
                        {patient.phone_number ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone_number}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {visits.length} visit{visits.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatient(
                            selectedPatient === patient.id ? null : patient.id
                          )}
                          className="bg-white/60"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {selectedPatient === patient.id ? 'Hide' : 'View'} History
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Selected Patient Visit History */}
      {selectedPatient && (
        <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">
              Visit History - {patients.find(p => p.id === selectedPatient)?.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const visits = getPatientVisits(selectedPatient);
              const patient = patients.find(p => p.id === selectedPatient);
              
              if (visits.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    No visits recorded for this patient.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {visits.map((visit) => {
                    const prescription = visit.prescription_id ? 
                      getPrescriptionDetails(visit.prescription_id) : null;
                    
                    return (
                      <div 
                        key={visit.id} 
                        className="bg-white/60 rounded-lg p-4 border border-white/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {format(new Date(visit.visit_date), 'PPP')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Visit #{visit.id.slice(-8)}
                            </Badge>
                            {patient && (
                              <PatientHistoryPDFExport 
                                visit={visit} 
                                patient={patient} 
                                prescription={prescription} 
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Reason:</span>
                            <p className="text-gray-600 mt-1">
                              {visit.reason_for_visit || 'General consultation'}
                            </p>
                          </div>
                          
                          {visit.diagnosis && (
                            <div>
                              <span className="font-medium text-gray-700">Diagnosis:</span>
                              <p className="text-gray-600 mt-1">{visit.diagnosis}</p>
                            </div>
                          )}
                          
                          {prescription && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Medications:</span>
                              <div className="mt-2 space-y-1">
                                {prescription.medications.map((med: any, index: number) => (
                                  <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                                    <span className="font-medium">{med.name}</span> - 
                                    {med.dosage} {med.frequency} for {med.duration}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {visit.notes && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Notes:</span>
                              <p className="text-gray-600 mt-1">{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientHistory;
