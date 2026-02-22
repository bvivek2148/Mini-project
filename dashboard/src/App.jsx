import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardOverviewPage from './pages/DashboardOverviewPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RealTimeAlertsPage from './pages/RealTimeAlertsPage.jsx'
import IncidentsPage from './pages/IncidentsPage.jsx'
import EntropyAnalysisPage from './pages/EntropyAnalysisPage.jsx'
import ThresholdConfigurationPage from './pages/ThresholdConfigurationPage.jsx'
import NetworkTopologyViewPage from './pages/NetworkTopologyViewPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ProcessTerminationLogPage from './pages/ProcessTerminationLogPage.jsx'
import HoneytokenManagementPage from './pages/HoneytokenManagementPage.jsx'
import HoneytokenAccessLogsPage from './pages/HoneytokenAccessLogsPage.jsx'
import { UserManagementPage } from './pages/Placeholders.jsx'
import AnalystsPage from './pages/AnalystsPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        {/* /Incidents = AlertDetailsPage, auto-loads latest alert when no :id */}
        <Route path="/Incidents" element={<IncidentsPage />} />
        {/* Full alert list */}
        <Route path="/alerts/list" element={<RealTimeAlertsPage />} />
        {/* Legacy alias */}
        <Route path="/alerts/real-time" element={<Navigate to="/alerts/list" replace />} />
        {/* Individual alert detail */}
        <Route path="/alerts/:id" element={<IncidentsPage />} />
        <Route path="/entropy" element={<EntropyAnalysisPage />} />
        <Route path="/honeytokens/logs" element={<HoneytokenAccessLogsPage />} />
        <Route path="/honeytokens/manage" element={<HoneytokenManagementPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/analysts" element={<AnalystsPage />} />
        <Route path="/config/thresholds" element={<ThresholdConfigurationPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/processes/termination-log" element={<ProcessTerminationLogPage />} />
        <Route path="/network" element={<NetworkTopologyViewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
