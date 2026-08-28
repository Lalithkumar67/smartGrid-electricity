import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewPage } from './pages/OverviewPage';
import { SubstationsPage } from './pages/SubstationsPage';
import { SubstationDetailPage } from './pages/SubstationDetailPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { OutagesPage } from './pages/OutagesPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAlerts } from './hooks';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alerts } = useAlerts();
  const alertCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} alertCount={alertCount} />
        <main className="main-content">
          <Topbar onMenu={() => setSidebarOpen(true)} alertCount={alertCount} />
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/substations" element={<SubstationsPage />} />
            <Route path="/substations/:id" element={<SubstationDetailPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/optimization" element={<OptimizationPage />} />
            <Route path="/outages" element={<OutagesPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
