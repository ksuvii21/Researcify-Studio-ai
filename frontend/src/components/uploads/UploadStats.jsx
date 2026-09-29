import {
  CircleCheck,
  FileText,
  HardDrive,
  Layers3,
} from "lucide-react";

import { formatFileSize } from "../../utils/fileFormat";

const UploadStats = ({ documents }) => {
  /*
   * 'Ready' is the terminal success state of the RAG
   * pipeline. Nothing reaches it yet: extraction and
   * chunking arrive in 8G, so uploads sit at 'Uploaded'.
   *
   * This counts real stored values rather than an
   * invented number, which means it correctly reads 0
   * until processing exists.
   */
  const ready = documents.filter(
    (document) =>
      document.processingStatus === "Ready"
  ).length;

  const totalSize = documents.reduce(
    (total, document) =>
      total + (document.fileSize || 0),
    0
  );

  /*
   * Chunk counts stay 0 until extraction lands in 8G,
   * so this reports the real stored value rather than
   * an invented number.
   */
  const chunks = documents.reduce(
    (total, document) =>
      total + (document.chunkCount || 0),
    0
  );

  const stats = [
    {
      label: "Documents",
      value: documents.length,
      icon: FileText,
    },
    {
      label: "Ready for Research",
      value: ready,
      icon: CircleCheck,
    },
    {
      label: "Storage Used",
      value: formatFileSize(totalSize),
      icon: HardDrive,
    },
    {
      label: "Indexed Chunks",
      value: chunks,
      icon: Layers3,
    },
  ];

  return (
    <section className="upload-stats">
      {stats.map(
        ({
          label,
          value,
          icon: Icon,
        }) => (
          <article
            key={label}
            className="upload-stat"
          >
            <span>
              <Icon size={20} />
            </span>

            <div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          </article>
        )
      )}
    </section>
  );
};

export default UploadStats;