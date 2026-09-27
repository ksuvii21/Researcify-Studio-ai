import {
  Bot,
  Copy,
  FileText,
  FolderKanban,
  Layers3,
  Sparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import Modal from "../common/Modal";

const DocumentPreviewModal = ({
  document,
  onClose,
}) => {
  const [activeTab, setActiveTab] =
    useState("overview");

  const [copied, setCopied] =
    useState(false);

  if (!document) return null;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(
        document.extractedText
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open={Boolean(document)}
      onClose={onClose}
      title="Document Intelligence"
      description={document.name}
      icon={FileText}
      size="lg"
    >
      <div className="document-preview">
        <div className="document-preview__hero">
          <span className="document-preview__icon">
            <FileText size={24} />
          </span>

          <div>
            <span>
              {document.type}
            </span>

            <h2>
              {document.name}
            </h2>

            <p>
              {document.size} ·{" "}
              {document.pages} pages ·{" "}
              {document.words.toLocaleString()} words
            </p>
          </div>
        </div>

        <div className="document-preview__context">
          <div>
            <FolderKanban size={16} />

            <span>
              Research Project
            </span>

            <strong>
              {document.project}
            </strong>
          </div>

          <div>
            <Layers3 size={16} />

            <span>
              Indexed Content
            </span>

            <strong>
              {document.chunks} chunks
            </strong>
          </div>
        </div>

        <nav className="document-preview__tabs">
          <button
            type="button"
            className={
              activeTab === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </button>

          <button
            type="button"
            className={
              activeTab === "content"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("content")
            }
          >
            Extracted Content
          </button>
        </nav>

        {activeTab === "overview" && (
          <div className="document-preview__overview">
            <section>
              <span className="document-preview__label">
                AI Summary
              </span>

              <div className="document-preview__summary">
                <Sparkles size={17} />

                <p>
                  {document.summary}
                </p>
              </div>
            </section>

            <section>
              <span className="document-preview__label">
                Research Topics
              </span>

              <div className="document-preview__tags">
                {document.tags.map(
                  (tag) => (
                    <span key={tag}>
                      {tag}
                    </span>
                  )
                )}
              </div>
            </section>

            <section>
              <span className="document-preview__label">
                Document Information
              </span>

              <div className="document-preview__information">
                <div>
                  <span>Uploaded</span>
                  <strong>
                    {document.uploadedAt}
                  </strong>
                </div>

                <div>
                  <span>File type</span>
                  <strong>
                    {document.type}
                  </strong>
                </div>

                <div>
                  <span>Pages</span>
                  <strong>
                    {document.pages}
                  </strong>
                </div>

                <div>
                  <span>Indexed chunks</span>
                  <strong>
                    {document.chunks}
                  </strong>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "content" && (
          <div className="document-preview__content">
            <div className="document-preview__content-header">
              <div>
                <span className="document-preview__label">
                  Extracted Text
                </span>

                <p>
                  Preview of processed document
                  content.
                </p>
              </div>

              <button
                type="button"
                onClick={copyText}
              >
                <Copy size={15} />
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <div className="document-preview__text">
              {document.extractedText}
            </div>
          </div>
        )}

        <div className="document-preview__actions">
          <button type="button">
            <FolderKanban size={15} />
            Change Project
          </button>

          <button
            type="button"
            className="document-preview__ai"
          >
            <Bot size={16} />
            Ask AI About Document
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;