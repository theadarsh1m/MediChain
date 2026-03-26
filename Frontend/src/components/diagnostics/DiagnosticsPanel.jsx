import { FileHeart, FileText, Pill, ShieldAlert } from "lucide-react";

import Badge from "../ui/Badge";
import MetricCard from "../ui/MetricCard";
import Section from "../ui/Section";
import { formatField, normalizeList } from "../../lib/patient";

export default function DiagnosticsPanel({ patient }) {
  const diagnostics = patient?.diagnostics;
  const reports = [
    ...new Set([
      ...normalizeList(diagnostics?.labReports),
      ...normalizeList(patient?.admin?.medicalDocuments),
    ]),
  ];
  const reminders = normalizeList(diagnostics?.immunizationReminders);
  const conditions = normalizeList(patient?.medicalHistory?.healthConditions);
  const allergies = normalizeList(patient?.medicalHistory?.allergies);
  const medications = normalizeList(patient?.currentHealth?.medications);
  const prescriptions = normalizeList(patient?.admin?.prescriptions);
  const firstMedication = medications[0];

  const medicationSummary = firstMedication
    ? [firstMedication?.name, firstMedication?.dosage].filter(Boolean).join(" | ")
    : "No current medications added";

  return (
    <div className="space-y-6">
      <Section
        title="Diagnostics"
        description="Stable clinical records, medications, and linked reports in one place."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={FileHeart}
            label="Health Conditions"
            value={conditions.length ? `${conditions.length} recorded` : "None recorded"}
            helper={conditions[0] || "No ongoing conditions listed"}
          />
          <MetricCard
            icon={ShieldAlert}
            label="Allergies"
            value={allergies.length ? `${allergies.length} recorded` : "None recorded"}
            helper={allergies[0] || "No allergy alerts on file"}
            accent="bg-rose-50 text-rose-600"
          />
          <MetricCard
            icon={Pill}
            label="Current Medications"
            value={medications.length ? `${medications.length} listed` : "None added"}
            helper={medicationSummary}
            accent="bg-amber-50 text-amber-600"
          />
          <MetricCard
            icon={FileText}
            label="Reports"
            value={reports.length ? `${reports.length} linked` : "No reports"}
            helper="Lab reports and uploaded documents"
            accent="bg-emerald-50 text-emerald-600"
          />
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Section
          title="Reports"
          description="Lab reports and medical documents shared by your care team."
        >
          {reports.length ? (
            <div className="space-y-3">
              {reports.map((report, index) => (
                <a
                  key={`${report}-${index}`}
                  href={report}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950/60 dark:text-emerald-200 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                >
                  Open report {index + 1}
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              No reports are linked yet.
            </div>
          )}
        </Section>

        <Section
          title="Current medications"
          description="Treatments that are part of your active care plan."
        >
          {medications.length ? (
            <div className="grid gap-4">
              {medications.map((medication, index) => (
                <div
                  key={`${medication?.name || "medication"}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {medication?.name || "Medication"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {medication?.dosage || "Dosage not specified"}
                      </p>
                    </div>
                    <Badge className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {medication?.timing || "Timing TBD"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              No current medications have been added yet.
            </div>
          )}
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Section
          title="Conditions and allergies"
          description="Longer-term health details that usually stay relevant across visits."
        >
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Health conditions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {conditions.length ? (
                  conditions.map((condition) => <Badge key={condition}>{condition}</Badge>)
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">No health conditions recorded.</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Allergies</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {allergies.length ? (
                  allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      className="border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                    >
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">No allergies recorded.</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Past prescriptions</p>
              <div className="mt-3 space-y-2">
                {prescriptions.length ? (
                  prescriptions.map((prescription, index) => (
                    <div
                      key={`${prescription}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
                    >
                      {prescription}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">No prescription history recorded.</span>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Organ function"
          description="Latest notes captured for major organ systems."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Liver
              </p>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                {formatField(diagnostics?.organFunction?.liver, "No liver note.")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Kidney
              </p>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                {formatField(diagnostics?.organFunction?.kidney, "No kidney note.")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Others
              </p>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                {formatField(diagnostics?.organFunction?.others, "No additional notes.")}
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Immunization reminders"
        description="Upcoming reminders based on the records available."
      >
        {reminders.length ? (
          <div className="flex flex-wrap gap-2">
            {reminders.map((reminder) => (
              <Badge key={reminder} className="border-emerald-100 bg-emerald-50 text-emerald-700">
                {reminder}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            No immunization reminders available.
          </div>
        )}
      </Section>
    </div>
  );
}
