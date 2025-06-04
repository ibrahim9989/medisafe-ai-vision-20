
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              <div className="bg-white rounded-full px-8 py-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  AI-Powered Prescription Management
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-xl font-light">
              Intelligent medication analysis and safety monitoring with modern precision
            </p>
          </div>
          <PrescriptionForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
