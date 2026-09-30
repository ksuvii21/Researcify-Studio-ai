const escapeRegex = (value = "") =>
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

const ResearchProject = require("../models/ResearchProject");
const Paper = require("../models/Paper");
const Note = require("../models/Note");
const UploadedDocument = require("../models/UploadedDocument");
const Collection = require("../models/Collection");

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const MIN_QUERY_LENGTH = 2;

const buildRegex = (query) => {
  const safe = escapeRegex(query.trim());
  return new RegExp(safe, "i");
};

const searchProjects = async (userId, regex, limit) => {
  const query = {
    userId,
    $or: [
      { title: regex },
      { description: regex },
      { researchQuestion: regex },
    ],
  };

  return ResearchProject.find(query)
    .select("title description researchQuestion updatedAt")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

const searchPapers = async (userId, regex, limit) => {
  const query = {
    userId,
    $or: [
      { title: regex },
      { authors: regex },
      { journal: regex },
      { keywords: regex },
      { doi: regex },
      { source: regex },
    ],
  };

  return Paper.find(query)
    .select("title authors journal year doi source updatedAt")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

const searchNotes = async (userId, regex, limit) => {
  const query = {
    userId,
    $or: [
      { title: regex },
      { content: regex },
      { tags: regex },
    ],
  };

  return Note.find(query)
    .select("title content tags updatedAt")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

const searchDocuments = async (userId, regex, limit) => {
  const query = {
    userId,
    $or: [
      { title: regex },
      { originalFileName: regex },
      { description: regex },
    ],
  };

  return UploadedDocument.find(query)
    .select("title originalFileName description mimeType fileSize updatedAt")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

const searchCollections = async (userId, regex, limit) => {
  const query = {
    userId,
    $or: [
      { name: regex },
      { description: regex },
    ],
  };

  return Collection.find(query)
    .select("name description updatedAt")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

const normalizeProject = (project) => ({
  type: "project",
  id: project._id.toString(),
  title: project.title,
  subtitle: project.researchQuestion
    ? project.researchQuestion.slice(0, 120)
    : project.description
    ? project.description.slice(0, 120)
    : "Research Project",
  meta: project.updatedAt,
  updatedAt: project.updatedAt,
});

const normalizePaper = (paper) => ({
  type: "paper",
  id: paper._id.toString(),
  title: paper.title,
  subtitle: paper.authors?.length
    ? `${paper.authors[0]}${paper.authors.length > 1 ? " et al." : ""}`
    : paper.source || "Paper",
  meta: paper.year ? String(paper.year) : paper.source,
  updatedAt: paper.updatedAt,
});

const normalizeNote = (note) => ({
  type: "note",
  id: note._id.toString(),
  title: note.title,
  subtitle: note.content
    ? note.content.slice(0, 120)
    : "Note",
  meta: note.tags?.length
    ? `#${note.tags.join(" #")}`
    : "Note",
  updatedAt: note.updatedAt,
});

const normalizeDocument = (doc) => ({
  type: "document",
  id: doc._id.toString(),
  title: doc.title,
  subtitle: doc.originalFileName || "Document",
  meta: doc.mimeType
    ? doc.mimeType.split("/").pop().toUpperCase()
    : "Document",
  updatedAt: doc.updatedAt,
});

const normalizeCollection = (collection) => ({
  type: "collection",
  id: collection._id.toString(),
  title: collection.name,
  subtitle: collection.description
    ? collection.description.slice(0, 120)
    : "Collection",
  meta: collection.updatedAt,
  updatedAt: collection.updatedAt,
});

const search = async (userId, rawQuery, limit = DEFAULT_LIMIT) => {
  const query = rawQuery?.trim() || "";

  if (query.length < MIN_QUERY_LENGTH) {
    return {
      query: rawQuery || "",
      results: {
        projects: [],
        papers: [],
        notes: [],
        documents: [],
        collections: [],
      },
      counts: {
        projects: 0,
        papers: 0,
        notes: 0,
        documents: 0,
        collections: 0,
        total: 0,
      },
    };
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const regex = buildRegex(query);

  const [
    projects,
    papers,
    notes,
    documents,
    collections,
  ] = await Promise.all([
    searchProjects(userId, regex, safeLimit),
    searchPapers(userId, regex, safeLimit),
    searchNotes(userId, regex, safeLimit),
    searchDocuments(userId, regex, safeLimit),
    searchCollections(userId, regex, safeLimit),
  ]);

  const results = {
    projects: projects.map(normalizeProject),
    papers: papers.map(normalizePaper),
    notes: notes.map(normalizeNote),
    documents: documents.map(normalizeDocument),
    collections: collections.map(normalizeCollection),
  };

  const counts = {
    projects: results.projects.length,
    papers: results.papers.length,
    notes: results.notes.length,
    documents: results.documents.length,
    collections: results.collections.length,
    total:
      results.projects.length +
      results.papers.length +
      results.notes.length +
      results.documents.length +
      results.collections.length,
  };

  return { query, results, counts };
};

module.exports = { search };