import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardOverviewPage from './pages/DashboardOverviewPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import RealTimeAlertsPage from './pages/RealTimeAlertsPage.jsx'
import IncidentsViewPage from './pages/IncidentsViewPage.jsx'
import SpecificAlertViewPage from './pages/SpecificAlertViewPage.jsx'
import EntropyAnalysisPage from './pages/EntropyAnalysisPage.jsx'
import SystemSettingsPage from './pages/SystemSettingsPage.jsx'
import NetworkTopologyViewPage from './pages/NetworkTopologyViewPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ProcessTerminationLogPage from './pages/ProcessTerminationLogPage.jsx'
import HoneytokenManagementPage from './pages/HoneytokenManagementPage.jsx'
import HoneytokenAccessLogsPage from './pages/HoneytokenAccessLogsPage.jsx'
import { UserManagementPage } from './pages/Placeholders.jsx'
import AnalystsPage from './pages/AnalystsPage.jsx'
import ManualScanPage from './pages/ManualScanPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardOverviewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/scan" element={<ManualScanPage />} />
        {/* /Incidents = Main Incident Dashboard */}
        <Route path="/Incidents" element={<IncidentsViewPage />} />
        {/* Full alert list */}
        <Route path="/alerts" element={<RealTimeAlertsPage />} />
        {/* Individual alert detail */}
        <Route path="/alerts/:id" element={<SpecificAlertViewPage />} />
        <Route path="/entropy" element={<EntropyAnalysisPage />} />
        <Route path="/accesslogs" element={<HoneytokenAccessLogsPage />} />
        <Route path="/honeytokens" element={<HoneytokenManagementPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/Incidents/analysts" element={<AnalystsPage />} />
        <Route path="/settings" element={<SystemSettingsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/Incidents/terminationlog" element={<ProcessTerminationLogPage />} />
        <Route path="/network" element={<NetworkTopologyViewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
