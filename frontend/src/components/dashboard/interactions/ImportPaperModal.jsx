import {
  ArrowRight,
  BookOpen,
  Link2,
  Loader2,
} from "lucide-react";

import { useState } from "react";

import Modal from "../../common/Modal";
import useToast from "../../../hooks/useToast";

const tabs = [
  {
    id: "doi",
    label: "DOI",
  },
  {
    id: "url",
    label: "URL",
  },
  {
    id: "arxiv",
    label: "arXiv",
  },
];

const placeholders = {
  doi: "10.1038/s41586-026-00000-0",
  url: "https://example.com/research-paper",
  arxiv: "2609.12345",
};

const ImportPaperModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] =
    useState("doi");

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] =
    useState(false);

  const validate = () => {
    const clean = value.trim();

    if (!clean) {
      setError(
        `Enter a ${activeTab.toUpperCase()} value.`
      );
      return false;
    }

    if (
      activeTab === "doi" &&
      !clean.startsWith("10.")
    ) {
      setError(
        "Enter a valid DOI beginning with 10."
      );
      return false;
    }

    if (activeTab === "url") {
      try {
        new URL(clean);
      } catch {
        setError(
          "Enter a valid paper URL."
        );
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleImport = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setImporting(true);

    // Phase 8:
    // Resolve metadata through backend service.

    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    toast.success(
      "Paper imported",
      "The paper was added to your research workspace."
    );

    setImporting(false);
    setValue("");
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={BookOpen}
      title="Import Research Paper"
      description="Add a paper using its DOI, web URL or arXiv identifier."
    >
      <form
        className="interaction-form"
        onSubmit={handleImport}
      >
        <div className="import-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveTab(tab.id);
                setValue("");
                setError("");
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="form-field">
          <label htmlFor="paper-identifier">
            {activeTab === "doi"
              ? "DOI"
              : activeTab === "url"
              ? "Paper URL"
              : "arXiv Identifier"}
          </label>

          <div className="input-with-icon">
            <Link2 size={15} />

            <input
              id="paper-identifier"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError("");
              }}
              placeholder={
                placeholders[activeTab]
              }
              autoFocus
            />
          </div>

          {error && (
            <small className="form-error">
              {error}
            </small>
          )}
        </div>

        <div className="import-info">
          <BookOpen size={16} />

          <div>
            <strong>
              Automatic metadata
            </strong>

            <p>
              Researcify will retrieve the
              paper title, authors, abstract,
              publication information and
              available metadata during backend
              integration.
            </p>
          </div>
        </div>

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="interaction-btn interaction-btn--primary"
            disabled={importing}
          >
            {importing ? (
              <>
                <Loader2
                  size={14}
                  className="spin"
                />
                Importing...
              </>
            ) : (
              <>
                Import Paper
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ImportPaperModal;