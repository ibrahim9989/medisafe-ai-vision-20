
import React from 'react';
import PrescriptionForm from '../components/PrescriptionForm';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI-Powered Prescription Management
            </h1>
            <p className="text-gray-600 text-lg">
              Intelligent medication analysis and safety monitoring
            </p>
          </div>
          <PrescriptionForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
