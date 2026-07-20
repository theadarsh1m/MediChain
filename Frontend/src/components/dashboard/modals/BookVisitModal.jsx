import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

export default function BookVisitModal({ isOpen, onClose, onBook }) {
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;

    setIsSubmitting(true);
    try {
      await onBook(date);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDate("");
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Book Visit" onClose={onClose} className="max-w-sm">
      {success ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-16 w-16 text-brand-500 mb-4" />
          <p className="text-lg font-medium text-surface-900 dark:text-white">Visit Booked</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Select Date & Time</label>
            <input
              type="datetime-local"
              required
              className="w-full rounded-lg border border-surface-200 p-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="mt-2 text-xs text-surface-500">
              This will automatically add the appointment to your records.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={!date || isSubmitting}>
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
