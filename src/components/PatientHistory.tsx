
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
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import PrescriptionPDFExport from './PrescriptionPDFExport';
import AIAnalysisPDFExport from './AIAnalysisPDFExport';

const PatientHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
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
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Patient History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
          </div>

          <div className="space-y-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistory;
