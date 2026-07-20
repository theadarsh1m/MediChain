import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { useHospitalStore } from "../../store/hospitalStore";
import { toast } from "react-hot-toast";

export default function UpdateBedsModal({ isOpen, onClose, currentBeds }) {
  const [beds, setBeds] = useState(currentBeds || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateProfile, fetchDashboard } = useHospitalStore();

  useEffect(() => {
    setBeds(currentBeds || 0);
  }, [currentBeds]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ numberOfBeds: Number(beds) });
      await fetchDashboard();
      toast.success("Bed capacity updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update beds");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Update Bed Capacity" onClose={onClose} className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Total Number of Beds
          </label>
          <Input
            type="number"
            min="0"
            required
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            placeholder="e.g. 150"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter the updated bed capacity count for the hospital dashboard metrics.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Capacity"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
