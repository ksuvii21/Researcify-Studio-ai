import {
  CircleCheck,
  FileText,
  Layers3,
  LoaderCircle,
} from "lucide-react";

const UploadStats = ({
  documents,
}) => {
  const ready = documents.filter(
    (document) =>
      document.status === "ready"
  ).length;

  const processing = documents.filter(
    (document) =>
      document.status === "processing"
  ).length;

  const chunks = documents.reduce(
    (total, document) =>
      total + document.chunks,
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
      label: "Processing",
      value: processing,
      icon: LoaderCircle,
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