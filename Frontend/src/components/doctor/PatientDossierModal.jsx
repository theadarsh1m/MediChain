import { useState, useEffect } from "react";
import {
  X,
  User,
  HeartPulse,
  FileText,
  ShieldAlert,
  Activity,
  History,
  Pill,
  Upload,
  CheckCircle2,
  FileCheck2,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useDoctorStore } from "../../store/doctorStore";

export default function PatientDossierModal({ isOpen, onClose, patientId, onOpenRx }) {
  const { fetchPatientDossier, currentPatientDossier, addDoctorNotes, uploadToPatient, loading } = useDoctorStore();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "history" | "diagnostics" | "prescriptions" | "actions"
  
  const [notesForm, setNotesForm] = useState({
    diagnosis: "",
    notes: "",
    advice: "",
  });
  const [fileToUpload, setFileToUpload] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDossier(patientId).catch((err) => {
        toast.error(err.message || "Failed to load patient EHR dossier");
      });
    }
  }, [isOpen, patientId, fetchPatientDossier]);

  if (!isOpen) return null;

  const patient = currentPatientDossier?.patient;
  const history = currentPatientDossier?.appointmentHistory || [];

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!notesForm.diagnosis && !notesForm.notes && !notesForm.advice) {
      toast.error("Please fill in diagnosis or notes.");
      return;
    }
    setActionLoading(true);
    try {
      await addDoctorNotes(patientId, notesForm);
      toast.success("Clinical notes recorded successfully!");
      setNotesForm({ diagnosis: "", notes: "", advice: "" });
      fetchPatientDossier(patientId);
    } catch (err) {
      toast.error(err.message || "Failed to save notes.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      toast.error("Please select a file to upload.");
      return;
    }
    setActionLoading(true);
    try {
      await uploadToPatient(patientId, fileToUpload);
      toast.success("Document uploaded to patient record!");
      setFileToUpload(null);
      fetchPatientDossier(patientId);
    } catch (err) {
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-blue-200 dark:border-emerald-500/30">
              {patient?.profilePic ? (
                <img src={patient.profilePic} alt={patient.name} className="h-full w-full object-cover" />
              ) : (
                patient?.name?.charAt(0) || "P"
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{patient?.name || "Patient Dossier"}</h2>
                {patient?.bloodGroup && (
                  <span className="rounded-lg bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>UID: <strong className="font-mono text-slate-700 dark:text-slate-300">{patient?.uid || "N/A"}</strong></span>
                <span>•</span>
                <span>{patient?.gender || "Gender N/A"}</span>
                <span>•</span>
                <span>{patient?.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : "Age N/A"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onOpenRx && (
              <Button
                size="sm"
                variant="primary"
                icon={Pill}
                onClick={() => {
                  onClose();
                  onOpenRx(patient);
                }}
              >
                Write Rx
              </Button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 px-5 pt-2 overflow-x-auto dark:border-slate-800 bg-white dark:bg-slate-900">
          {[
            { id: "overview", label: "Overview & Vitals", icon: Activity },
            { id: "history", label: "Medical History", icon: History },
            { id: "diagnostics", label: "Diagnostics & Labs", icon: FileText },
            { id: "prescriptions", label: "Rx & Notes", icon: Pill },
            { id: "actions", label: "Clinical Actions", icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:border-emerald-400 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {loading && !patient ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Loading patient medical dossier...
            </div>
          ) : !patient ? (
            <div className="text-center py-16 text-sm text-red-500">
              Could not retrieve patient data.
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Emergency & Key Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <ShieldAlert size={16} /> Known Allergies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.medicalHistory?.allergies?.length > 0 ? (
                          patient.medicalHistory.allergies.map((alg, i) => (
                            <span key={i} className="rounded-lg bg-rose-200/60 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                              {alg}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">No known allergies recorded</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950/30 dark:bg-amber-950/20">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <HeartPulse size={16} /> Chronic Conditions
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.medicalHistory?.healthConditions?.length > 0 ? (
                          patient.medicalHistory.healthConditions.map((cond, i) => (
                            <span key={i} className="rounded-lg bg-amber-200/60 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                              {cond}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">None reported</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/30 dark:bg-blue-950/20">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Phone size={16} /> Emergency Contact
                      </div>
                      {patient.emergencyContact?.name ? (
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <p className="font-semibold">{patient.emergencyContact.name} ({patient.emergencyContact.relation || "Contact"})</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{patient.emergencyContact.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">No contact registered</span>
                      )}
                    </div>
                  </div>

                  {/* Demographics & Contact */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Contact & Identification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-slate-400">Email Address</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{patient.email || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Phone Number</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{patient.phone || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Residential Address</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{patient.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Active Medications & Habits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Current Active Medications</h3>
                      {patient.currentHealth?.medications?.length > 0 ? (
                        <div className="space-y-2">
                          {patient.currentHealth.medications.map((m, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{m.name} - {m.dosage}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{m.timing}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No active medications registered.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Lifestyle & Organ Health</h3>
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="text-slate-400">Smoking / Alcohol:</span>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{patient.medicalHistory?.alcoholOrSmoking || "None noted"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Exercise Routine:</span>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{patient.currentHealth?.exerciseRoutine || "Standard"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Organ Health Status:</span>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{patient.medicalHistory?.organHealth || "Normal"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MEDICAL HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Past Surgical Procedures</h3>
                    {patient.medicalHistory?.surgicalProcedures?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {patient.medicalHistory.surgicalProcedures.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">No past surgeries recorded.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Vaccinations & Immunizations</h3>
                    {patient.medicalHistory?.vaccinationRecords?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory.vaccinationRecords.map((v, i) => (
                          <span key={i} className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                            ✓ {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No vaccination records available.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Past Hospitalizations</h3>
                    {patient.medicalHistory?.pastHospitalizations?.length > 0 ? (
                      <div className="space-y-2">
                        {patient.medicalHistory.pastHospitalizations.map((h, i) => (
                          <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                            <p className="font-bold text-slate-900 dark:text-slate-100">{h.hospitalName || "Hospital Facility"}</p>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5">Reason: {h.reason} • Duration: {h.duration}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No past hospitalizations recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: DIAGNOSTICS */}
              {activeTab === "diagnostics" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Diagnostic Lab Reports & Files</h3>
                    {patient.diagnostics?.labReports?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {patient.diagnostics.labReports.map((reportUrl, idx) => (
                          <a
                            key={idx}
                            href={reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-emerald-400 dark:hover:bg-slate-800 transition"
                          >
                            <span className="truncate">Lab Report #{idx + 1}</span>
                            <ExternalLink size={14} />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No lab reports uploaded by patient yet.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Clinical Documents & Records</h3>
                    {patient.admin?.medicalDocuments?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {patient.admin.medicalDocuments.map((docUrl, idx) => (
                          <a
                            key={idx}
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                          >
                            <span className="truncate">Document #{idx + 1}</span>
                            <ExternalLink size={14} />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No clinical documents attached yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: PRESCRIPTIONS & NOTES */}
              {activeTab === "prescriptions" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Latest Doctor Notes */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-950/40 dark:bg-blue-950/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-emerald-400 mb-2">Latest Clinical Notes</h3>
                    {patient.admin?.doctorNotes ? (
                      <pre className="font-sans text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {patient.admin.doctorNotes}
                      </pre>
                    ) : (
                      <p className="text-xs text-slate-500">No clinical notes recorded yet.</p>
                    )}
                  </div>

                  {/* Prescriptions History */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Prescriptions Issued</h3>
                    {patient.admin?.prescriptions?.length > 0 ? (
                      <div className="space-y-2.5">
                        {patient.admin.prescriptions.map((rx, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 whitespace-pre-wrap font-mono">
                            {rx}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No prescriptions issued yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: CLINICAL ACTIONS */}
              {activeTab === "actions" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Add Notes Form */}
                  <form onSubmit={handleSaveNotes} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600 dark:text-emerald-400" />
                      Add Clinical Notes & Diagnosis
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Primary Diagnosis</label>
                      <input
                        type="text"
                        placeholder="e.g. Acute Bronchitis / Hypertension Stage 1"
                        value={notesForm.diagnosis}
                        onChange={(e) => setNotesForm({ ...notesForm, diagnosis: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Observations & Clinical Notes</label>
                      <textarea
                        rows="3"
                        placeholder="Clinical findings, vital stats, follow-up recommendations..."
                        value={notesForm.notes}
                        onChange={(e) => setNotesForm({ ...notesForm, notes: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Medical Advice</label>
                      <input
                        type="text"
                        placeholder="e.g. Bed rest for 3 days, avoid cold drinks..."
                        value={notesForm.advice}
                        onChange={(e) => setNotesForm({ ...notesForm, advice: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <Button type="submit" variant="primary" size="sm" loading={actionLoading} icon={CheckCircle2}>
                      Save Clinical Notes
                    </Button>
                  </form>

                  {/* Upload Medical Document */}
                  <form onSubmit={handleFileUpload} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Upload size={16} className="text-blue-600 dark:text-emerald-400" />
                      Upload Clinical Report / Document to Patient
                    </h3>

                    <div>
                      <input
                        type="file"
                        onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-emerald-500/10 dark:file:text-emerald-400"
                      />
                    </div>

                    <Button type="submit" variant="secondary" size="sm" loading={actionLoading} icon={Upload}>
                      Upload to Patient Record
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
