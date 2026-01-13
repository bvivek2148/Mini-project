import React from 'react'

function SimplePage({ title, description }) {
  return (
    <div className="bg-background-dark text-white min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-[#92adc9] text-sm max-w-2xl">{description}</p>}
        <div className="mt-4 rounded-xl border border-[#1f2937] bg-[#020617] p-6 text-sm text-[#9ca3af]">
          <p>
            This page is wired into the React SPA routing and styled to match the console.
            You can now migrate your detailed HTML/Tailwind design from the static
            dashboard HTML file into this React component.
          </p>
        </div>
      </div>
    </div>
  )
}

export const AlertDetailsPage = () => (
  <SimplePage
    title="Alert Details"
    description="Drill-down view for a single ransomware or honeytoken alert."
  />
)

export const EntropyAnalysisPage = () => (
  <SimplePage
    title="Entropy Analysis"
    description="Visualize Shannon entropy trends and affected files over time."
  />
)

export const HoneytokenAccessLogsPage = () => (
  <SimplePage
    title="Honeytoken Access Logs"
    description="Timeline of all honeytoken file access events across monitored hosts."
  />
)

export const HoneytokenManagementPage = () => (
  <SimplePage
    title="Honeytoken Management"
    description="Configure, deploy and monitor honeytokens across your environment."
  />
)

export const UserManagementPage = () => (
  <SimplePage
    title="User Management"
    description="Manage SecOps users, roles and access policies for the console."
  />
)

export const ThresholdConfigurationPage = () => (
  <SimplePage
    title="Threshold Configuration"
    description="Tune entropy thresholds and detection parameters for the Ransom-Trap agent."
  />
)

export const ReportsPage = () => (
  <SimplePage
    title="Reports"
    description="Generate incident and compliance reports based on collected alerts."
  />
)

export const ProcessTerminationLogPage = () => (
  <SimplePage
    title="Process Termination Log"
    description="Audit trail of automated process kills performed by the agent."
  />
)

export const NetworkTopologyViewPage = () => (
  <SimplePage
    title="Network Topology View"
    description="High-level view of endpoints and their security status across the network."
  />
)
