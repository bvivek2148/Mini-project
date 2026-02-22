import React from 'react'
import { Link } from 'react-router-dom'

function SimplePage({ title, description, breadcrumbs }) {
  return (
    <div className="bg-background-dark text-white min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {breadcrumbs?.length ? (
          <nav className="flex items-center text-sm">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              const content = crumb.to && !isLast ? (
                <Link className="text-text-secondary hover:text-white transition-colors" to={crumb.to}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-white font-medium' : 'text-text-secondary'}>{crumb.label}</span>
              )

              return (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {content}
                  {!isLast && <span className="text-text-secondary mx-2">/</span>}
                </React.Fragment>
              )
            })}
          </nav>
        ) : null}

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

export const ProcessTerminationLogPage = () => (
  <SimplePage
    title="Process Termination Log"
    description="Audit trail of automated process kills performed by the agent."
    breadcrumbs={[
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Incidents', to: '/Incidents' },
      { label: 'Termination Log' },
    ]}
  />
)

