import { useState } from "react";
import { UploadCloud, FileType, CheckCircle } from "lucide-react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

export default function UploadReportModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setFile(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal title="Upload Medical Report" onClose={onClose} className="max-w-md">
      {uploadSuccess ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-16 w-16 text-brand-500 mb-4" />
          <p className="text-lg font-medium text-surface-900 dark:text-white">Uploaded Successfully</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 p-6 transition-colors hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800/50">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center w-full"
            >
              {!file ? (
                <>
                  <UploadCloud className="h-10 w-10 text-surface-400" />
                  <div>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">Click to upload</span>
                    <span className="text-surface-500"> or drag and drop</span>
                    <p className="mt-1 text-xs text-surface-500">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </>
              ) : (
                <>
                  <FileType className="h-10 w-10 text-brand-500" />
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-surface-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload Report"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
