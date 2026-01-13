import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardOverviewPage from './pages/DashboardOverviewPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RealTimeAlertsPage from './pages/RealTimeAlertsPage.jsx'
import AlertDetailsPage from './pages/AlertDetailsPage.jsx'
import EntropyAnalysisPage from './pages/EntropyAnalysisPage.jsx'
import NetworkTopologyViewPage from './pages/NetworkTopologyViewPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import {
  HoneytokenAccessLogsPage,
  HoneytokenManagementPage,
  UserManagementPage,
  ThresholdConfigurationPage,
  ProcessTerminationLogPage,
} from './pages/Placeholders.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/alerts/real-time" element={<RealTimeAlertsPage />} />
        <Route path="/alerts/:id" element={<AlertDetailsPage />} />
        <Route path="/entropy" element={<EntropyAnalysisPage />} />
        <Route path="/honeytokens/logs" element={<HoneytokenAccessLogsPage />} />
        <Route path="/honeytokens/manage" element={<HoneytokenManagementPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/config/thresholds" element={<ThresholdConfigurationPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/processes/termination-log" element={<ProcessTerminationLogPage />} />
        <Route path="/network" element={<NetworkTopologyViewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
