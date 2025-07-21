
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Widget from '@/pages/Widget';

const PluginRoutes = () => {
  return (
    <Routes>
      <Route path="/widget" element={<Widget />} />
    </Routes>
  );
};

export default PluginRoutes;
