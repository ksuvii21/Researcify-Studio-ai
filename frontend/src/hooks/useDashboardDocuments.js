import { useEffect, useState } from "react";

import { getDocuments } from "../api/documentApi";

/*
 * Dashboard document data.
 *
 * Mirrors useDashboardNotes so dashboard surfaces share one
 * shape.
 *
 * Only real stored values are derived here. 'Ready' counts
 * documents that finished processing, which is 0 until
 * extraction lands in 8G, so it is exposed but must not be
 * presented as a meaningful KPI yet.
 */
const useDashboardDocuments = () => {
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDocuments({
          sort: "updatedAt",
          order: "desc",
        });

        if (!active) return;

        setDocuments(response?.data || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "[Dashboard] Documents error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load document data."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const countByStatus = (status) =>
    documents.filter(
      (document) => document.processingStatus === status
    ).length;

  return {
    documents,

    totalDocuments: documents.length,

    recentDocuments: documents.slice(0, 4),

    /*
     * 'Uploaded', 'Extracting' and 'Chunking' all mean
     * "not yet searchable", so they are grouped.
     */
    pendingDocuments:
      countByStatus("Uploaded") +
      countByStatus("Extracting") +
      countByStatus("Chunking"),

    readyDocuments: countByStatus("Ready"),

    failedDocuments: countByStatus("Failed"),

    loading,
    error,
  };
};

export default useDashboardDocuments;
