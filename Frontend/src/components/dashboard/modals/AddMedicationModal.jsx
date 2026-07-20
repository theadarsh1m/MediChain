import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

export default function AddMedicationModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", dosage: "", timing: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: "", dosage: "", timing: "" });
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Add Medication" onClose={onClose} className="max-w-md">
      {success ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-16 w-16 text-brand-500 mb-4" />
          <p className="text-lg font-medium text-surface-900 dark:text-white">Medication Added</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Medication Name</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-surface-200 p-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
              placeholder="e.g. Paracetamol 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Dosage Instructions</label>
            <input
              type="text"
              className="w-full rounded-lg border border-surface-200 p-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
              placeholder="e.g. 1 Tablet"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Timing</label>
            <select
              className="w-full rounded-lg border border-surface-200 p-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
              value={formData.timing}
              onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
            >
              <option value="">Select Timing</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
              <option value="Twice a Day">Twice a Day</option>
              <option value="Thrice a Day">Thrice a Day</option>
              <option value="As Needed">As Needed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={!formData.name || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Medication"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
