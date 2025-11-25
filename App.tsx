import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductStudio from './components/ProductStudio';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedTrend, setSelectedTrend] = useState<string>('');

  const handleTrendSelect = (productName: string) => {
    setSelectedTrend(productName);
    setCurrentView(AppView.STUDIO);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onSelectProduct={handleTrendSelect} />;
      case AppView.STUDIO:
        return <ProductStudio initialProduct={selectedTrend} />;
      case AppView.SETTINGS:
        return <div className="p-10 text-center text-slate-500">Settings Placeholder</div>;
      default:
        return <Dashboard onSelectProduct={handleTrendSelect} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;