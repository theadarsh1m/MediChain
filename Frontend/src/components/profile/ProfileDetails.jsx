import Button from "../ui/Button";
import Card from "../ui/Card";
import Section from "../ui/Section";
import {
  calculateAge,
  formatDate,
  formatField,
  getInitials,
} from "../../lib/patient";
import { CheckCircle2, Edit2, LogOut } from "lucide-react";

function InfoItem({ label, value, onEdit }) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-surface-100 bg-surface-50 p-5 transition-colors hover:bg-white hover:shadow-soft dark:border-surface-800 dark:bg-surface-800/40 dark:hover:bg-surface-800">
      <div className="flex w-full items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-surface-500 dark:text-surface-400">
          {label}
        </p>
        {onEdit && (
          <button 
            onClick={onEdit} 
            className="text-surface-400 opacity-0 transition-opacity hover:text-brand-600 group-hover:opacity-100"
            title="Edit field"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-surface-900 dark:text-surface-100">
        {value || <span className="italic text-surface-400">Not provided</span>}
      </p>
    </div>
  );
}

export default function ProfileDetails({ patient, onEdit, onLogout }) {
  if (!patient) {
    return (
      <Card className="animate-pulse">
        <div className="h-6 w-1/3 rounded-md bg-surface-200 dark:bg-surface-700"></div>
        <div className="mt-4 h-4 w-1/2 rounded-md bg-surface-200 dark:bg-surface-800"></div>
      </Card>
    );
  }

  const age = calculateAge(patient?.dob);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-100 text-2xl font-semibold text-surface-700 dark:bg-surface-800 dark:text-surface-100 border-2 border-surface-200 dark:border-surface-700 shadow-sm">
              {patient?.profilePic ? (
                <img src={patient.profilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                getInitials(patient?.name)
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">
                  {patient?.name || "Patient Profile"}
                </h2>
              </div>
              <p className="mt-1 text-sm font-medium text-surface-500 dark:text-surface-400">
                {patient?.email || "Email unavailable"}
              </p>
              {patient?.uid && (
                <p className="mt-2 inline-flex rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  ID: {patient.uid}
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-auto lg:items-end">
            <div className="flex flex-wrap gap-3">
              <Button onClick={onEdit} className="inline-flex items-center gap-1.5">
                <Edit2 size={16} /> Edit full profile
              </Button>
              {onLogout ? (
                <Button variant="danger" onClick={onLogout} className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20">
                  <LogOut size={16} /> Logout
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Section
            title="Basic Information"
            description="Core demographic details used across the portal."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="Date of birth" value={formatDate(patient?.dob)} onEdit={() => console.log('Edit DOB')} />
              <InfoItem label="Age" value={age ? `${age} years` : ""} />
              <InfoItem label="Gender" value={formatField(patient?.gender)} onEdit={() => console.log('Edit Gender')} />
              <InfoItem label="Blood group" value={formatField(patient?.bloodGroup)} onEdit={() => console.log('Edit Blood group')} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section
            title="Contact Details"
            description="How your care team can reach you."
          >
            <div className="grid gap-4 sm:grid-cols-1">
              <InfoItem label="Phone Number" value={formatField(patient?.phone)} onEdit={() => console.log('Edit Phone')} />
              <InfoItem label="Residential Address" value={formatField(patient?.address)} onEdit={() => console.log('Edit Address')} />
            </div>
          </Section>
        </div>
      </div>

      <Section
        title="Emergency Contact"
        description="Saved contact information for urgent communication."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InfoItem label="Contact Name" value={formatField(patient?.emergencyContact?.name)} onEdit={() => console.log('Edit EC Name')} />
          <InfoItem label="Relationship" value={formatField(patient?.emergencyContact?.relation)} onEdit={() => console.log('Edit EC Relation')} />
          <InfoItem label="Phone Number" value={formatField(patient?.emergencyContact?.phone)} onEdit={() => console.log('Edit EC Phone')} />
        </div>
      </Section>
    </div>
  );
}
