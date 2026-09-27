import {
  useMemo,
  useState,
} from "react";

import UploadsHeader from "../components/uploads/UploadsHeader";
import UploadStats from "../components/uploads/UploadStats";
import UploadToolbar from "../components/uploads/UploadToolbar";
import DocumentsView from "../components/uploads/DocumentsView";
import DocumentPreviewModal from "../components/uploads/DocumentPreviewModal";

import {
  initialUploadedDocuments,
} from "../data/uploadsMockData";

import "../components/uploads/uploads.css";

const UploadsPage = () => {
  const [
    documents,
    setDocuments,
  ] = useState(
    initialUploadedDocuments
  );

  const [query, setQuery] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [project, setProject] =
    useState("all");

  const [sort, setSort] =
    useState("recent");

  const [view, setView] =
    useState("grid");

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState(null);

  const filteredDocuments =
    useMemo(() => {
      let result = [...documents];

      const normalizedQuery =
        query.trim().toLowerCase();

      if (normalizedQuery) {
        result = result.filter(
          (document) =>
            [
              document.name,
              document.type,
              document.project,
              document.summary,
              ...document.tags,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
        );
      }

      if (status !== "all") {
        result = result.filter(
          (document) =>
            document.status === status
        );
      }

      if (project !== "all") {
        result = result.filter(
          (document) =>
            document.project === project
        );
      }

      if (sort === "name") {
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }

      if (sort === "size") {
        result.sort(
          (a, b) =>
            parseFloat(b.size) -
            parseFloat(a.size)
        );
      }

      return result;
    }, [
      documents,
      query,
      status,
      project,
      sort,
    ]);

  const deleteDocument = (
    documentId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this uploaded document?"
      );

    if (!confirmed) return;

    setDocuments((current) =>
      current.filter(
        (document) =>
          document.id !== documentId
      )
    );

    setSelectedDocument((current) =>
      current?.id === documentId
        ? null
        : current
    );
  };

  const retryDocument = (
    documentId
  ) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status: "processing",
              progress: 18,
            }
          : document
      )
    );
  };

  return (
    <div className="uploads-page">
      <UploadsHeader />

      <UploadStats
        documents={documents}
      />

      <UploadToolbar
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        project={project}
        setProject={setProject}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        count={
          filteredDocuments.length
        }
      />

      <DocumentsView
        documents={
          filteredDocuments
        }
        view={view}
        onPreview={
          setSelectedDocument
        }
        onDelete={
          deleteDocument
        }
        onRetry={
          retryDocument
        }
      />

      <DocumentPreviewModal
        document={selectedDocument}
        onClose={() =>
          setSelectedDocument(null)
        }
      />
    </div>
  );
};

export default UploadsPage;