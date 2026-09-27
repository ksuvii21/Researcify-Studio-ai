import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import Modal from "../../common/Modal";
import useToast from "../../../hooks/useToast";

const MAX_FILE_SIZE =
  25 * 1024 * 1024;

const allowedExtensions = [
  "pdf",
  "doc",
  "docx",
];

const UploadDocumentModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] =
    useState(false);

  const [error, setError] = useState("");
  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      !allowedExtensions.includes(extension)
    ) {
      setError(
        "Please select a PDF, DOC or DOCX file."
      );

      return false;
    }

    if (
      selectedFile.size > MAX_FILE_SIZE
    ) {
      setError(
        "File size must be under 25 MB."
      );

      return false;
    }

    setError("");
    return true;
  };

  const selectFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setProgress(0);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    selectFile(
      event.dataTransfer.files?.[0]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Select a document before uploading."
      );
      return;
    }

    setUploading(true);
    setProgress(0);

    // Temporary frontend simulation.
    // Replace with API upload progress in Phase 8.

    for (const value of [
      18, 35, 52, 71, 86, 100,
    ]) {
      await new Promise((resolve) =>
        setTimeout(resolve, 180)
      );

      setProgress(value);
    }

    toast.success(
      "Document uploaded",
      `${file.name} is ready for processing.`
    );

    setUploading(false);
    setFile(null);
    setProgress(0);

    onClose();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={UploadCloud}
      title="Upload Document"
      description="Add a research paper or document to your workspace."
      size="lg"
      closeOnBackdrop={!uploading}
    >
      <div className="upload-workflow">
        {!file ? (
          <div
            className={`upload-dropzone ${
              dragging ? "is-dragging" : ""
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDragLeave={() =>
              setDragging(false)
            }
            onDrop={handleDrop}
          >
            <div className="upload-dropzone__icon">
              <UploadCloud size={25} />
            </div>

            <h3>
              Drop your research document here
            </h3>

            <p>
              PDF, DOC or DOCX · Maximum 25 MB
            </p>

            <span>or</span>

            <button
              type="button"
              className="interaction-btn interaction-btn--secondary"
              onClick={() =>
                inputRef.current?.click()
              }
            >
              Browse Files
            </button>

            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                selectFile(
                  event.target.files?.[0]
                )
              }
            />
          </div>
        ) : (
          <div className="selected-file">
            <div className="selected-file__icon">
              <FileText size={22} />
            </div>

            <div className="selected-file__info">
              <strong>{file.name}</strong>
              <span>
                {formatSize(file.size)}
              </span>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setProgress(0);
                }}
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="upload-error">
            {error}
          </p>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="upload-progress__heading">
              <span>
                {progress === 100
                  ? "Processing document..."
                  : "Uploading document..."}
              </span>

              <strong>{progress}%</strong>
            </div>

            <div className="upload-progress__track">
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {progress === 100 && (
              <small>
                <CheckCircle2 size={12} />
                Upload complete
              </small>
            )}
          </div>
        )}

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="interaction-btn interaction-btn--primary"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <>
                <Loader2
                  size={14}
                  className="spin"
                />
                Uploading
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadDocumentModal;