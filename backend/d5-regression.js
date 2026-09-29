require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");

const BASE = "http://localhost:5000/api/v1";

const UploadedDocument = require("./models/UploadedDocument");
const RecordChunk = require("./models/RecordChunk");
const Note = require("./models/Note");

const results = [];
const check = (label, pass, extra = "") => {
  results.push({ label, pass });
  console.log(
    `  ${pass ? "PASS" : "FAIL"}  ${label}${extra ? `  ${extra}` : ""}`
  );
};

const req = async (method, p, token, body, isForm = false) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${p}`, {
    method,
    headers,
    ...(body ? { body: isForm ? body : JSON.stringify(body) } : {}),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }

  return { status: res.status, data: json?.data ?? null, message: json?.message };
};

const makeForm = (filename, mimeType, content, extra = {}) => {
  const form = new FormData();
  form.append("file", new Blob([content], { type: mimeType }), filename);
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null) form.append(k, v);
  }
  return form;
};

const uploadsDir = path.join(__dirname, "uploads/documents");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const stamp = Date.now();

  const reg = async (tag) =>
    (
      await req("POST", "/auth/register", null, {
        name: `D5 ${tag}`,
        email: `d5.${tag}.${stamp}@researcify.test`,
        password: "testpass123",
        academicField: "CS",
      })
    ).data;

  const A = await reg("a");
  const B = await reg("b");
  const tA = A.token;
  const tB = B.token;

  const txt = "Phase 8D.5-8D.7 verification content.";

  const projA = (
    await req("POST", "/projects", tA, { title: `D5 Proj A ${stamp}` })
  ).data._id;

  const projB = (
    await req("POST", "/projects", tB, { title: `D5 Proj B ${stamp}` })
  ).data._id;

  // ================= 19-24 PROCESSING METADATA =================
  console.log("=== PROCESSING METADATA ===");

  const doc = (
    await req(
      "POST",
      "/documents",
      tA,
      makeForm("metadata.txt", "text/plain", txt, {
        title: "Metadata Doc",
        projectId: projA,
      }),
      true
    )
  ).data;

  check("new upload -> 201", !!doc?._id);

  check(
    "processingStatus is 'Uploaded'",
    doc?.processingStatus === "Uploaded",
    `got ${doc?.processingStatus}`
  );

  check("fileHash exists", typeof doc?.fileHash === "string" && doc.fileHash.length > 0);

  check(
    "fileHash is 64 hex chars (SHA-256)",
    /^[a-f0-9]{64}$/.test(doc?.fileHash || ""),
    doc?.fileHash?.slice(0, 16) + "..."
  );

  // Independent hash of the same bytes must match.
  const expectedHash = crypto.createHash("sha256").update(txt).digest("hex");
  check("fileHash matches an independent SHA-256", doc?.fileHash === expectedHash);

  check("extractedTextAvailable === false", doc?.extractedTextAvailable === false);
  check("chunkCount === 0", doc?.chunkCount === 0);
  check("processedAt === null", doc?.processedAt === null);
  check("processingVersion === 1", doc?.processingVersion === 1);

  // ================= 25 LEGACY MIGRATION =================
  console.log("\n=== LEGACY STATUS MIGRATION ===");

  const legacyCount = await UploadedDocument.countDocuments({
    processingStatus: { $nin: ["Uploaded", "Extracting", "Chunking", "Ready", "Failed"] },
  });

  check("no documents hold a pre-8D.7 status", legacyCount === 0, `${legacyCount}`);

  // ================= 4-7 METADATA EDITING =================
  console.log("\n=== METADATA EDITING ===");

  const edit = await req("PATCH", `/documents/${doc._id}`, tA, {
    title: "Renamed Doc",
    description: "now has a description",
  });

  check("edit title+description -> 200", edit.status === 200, `got ${edit.status}`);
  check("title persisted", edit.data?.title === "Renamed Doc");
  check("description persisted", edit.data?.description === "now has a description");

  const reread = await req("GET", `/documents/${doc._id}`, tA);
  check("edit persists across a fresh read", reread.data?.title === "Renamed Doc");

  // ================= SERVER-OWNED FIELDS ARE NOT EDITABLE =================
  console.log("\n=== WHITELIST ENFORCEMENT ===");

  await req("PATCH", `/documents/${doc._id}`, tA, {
    originalFileName: "hacked.pdf",
    storagePath: "/etc/passwd",
    mimeType: "application/x-msdownload",
    fileSize: 999,
    processingStatus: "Ready",
    chunkCount: 9999,
    fileHash: "deadbeef",
    userId: B.user.id,
  });

  const afterAttack = await req("GET", `/documents/${doc._id}`, tA);

  check(
    "originalFileName unchanged",
    afterAttack.data?.originalFileName === "metadata.txt",
    afterAttack.data?.originalFileName
  );
  check(
    "storagePath unchanged",
    afterAttack.data?.storagePath === doc.storagePath,
    afterAttack.data?.storagePath
  );
  check("mimeType unchanged", afterAttack.data?.mimeType === "text/plain");
  check("fileSize unchanged", afterAttack.data?.fileSize === doc.fileSize);
  check(
    "processingStatus unchanged",
    afterAttack.data?.processingStatus === "Uploaded",
    afterAttack.data?.processingStatus
  );
  check("chunkCount unchanged", afterAttack.data?.chunkCount === 0);
  check("fileHash unchanged", afterAttack.data?.fileHash === expectedHash);
  check(
    "userId unchanged",
    String(afterAttack.data?.userId) === String(A.user.id)
  );

  // ================= 8-12 PROJECT ASSIGNMENT =================
  console.log("\n=== PROJECT ASSIGNMENT ===");

  const unlink = await req("PATCH", `/documents/${doc._id}`, tA, {
    projectId: null,
  });

  check("unlink with projectId:null -> 200", unlink.status === 200, `got ${unlink.status}`);
  check("projectId is null after unlink", unlink.data?.projectId === null);

  const relink = await req("PATCH", `/documents/${doc._id}`, tA, {
    projectId: projA,
  });

  check("relink to owned project -> 200", relink.status === 200);

  const foreign = await req("PATCH", `/documents/${doc._id}`, tA, {
    projectId: projB,
  });

  check("assign foreign project -> 404", foreign.status === 404, `got ${foreign.status}`);

  // ================= 13-18 DOWNLOAD =================
  console.log("\n=== SECURE DOWNLOAD ===");

  const dl = await fetch(`${BASE}/documents/${doc._id}/download`, {
    headers: { Authorization: `Bearer ${tA}` },
  });

  check("owner download -> 200", dl.status === 200, `got ${dl.status}`);

  const disposition = dl.headers.get("content-disposition") || "";

  check(
    "Content-Disposition carries originalName",
    disposition.includes("metadata.txt"),
    disposition
  );

  const body = await dl.text();
  check("downloaded bytes match uploaded bytes", body === txt, `${body.length} bytes`);

  const bDl = await fetch(`${BASE}/documents/${doc._id}/download`, {
    headers: { Authorization: `Bearer ${tB}` },
  });

  check("foreign download -> 404", bDl.status === 404, `got ${bDl.status}`);

  const noAuth = await fetch(`${BASE}/documents/${doc._id}/download`);
  check("no auth -> 401", noAuth.status === 401, `got ${noAuth.status}`);

  const randomId = await fetch(
    `${BASE}/documents/000/download`,
    { headers: { Authorization: `Bearer ${tA}` } }
  );

  check("random id -> 404", randomId.status === 404, `got ${randomId.status}`);

  // Missing physical file -> controlled 404, not 500.
  const brokenDoc = (
    await req(
      "POST",
      "/documents",
      tA,
      makeForm("broken.txt", "text/plain", txt, { title: "Broken" }),
      true
    )
  ).data;

  const brokenRecord = await UploadedDocument.findById(brokenDoc._id);
  fs.unlinkSync(brokenRecord.storagePath);

  const brokenDl = await fetch(`${BASE}/documents/${brokenDoc._id}/download`, {
    headers: { Authorization: `Bearer ${tA}` },
  });

  check(
    "download with file missing -> 404 (not 500)",
    brokenDl.status === 404,
    `got ${brokenDl.status}`
  );

  await req("DELETE", `/documents/${brokenDoc._id}`, tA);

  // ================= 26-33 LIFECYCLE =================
  console.log("\n=== LIFECYCLE ===");

  const tempProj = (
    await req("POST", "/projects", tA, { title: `D5 Temp ${stamp}` })
  ).data._id;

  const tempDoc = (
    await req(
      "POST",
      "/documents",
      tA,
      makeForm("temp.txt", "text/plain", txt, {
        title: "Temp Doc",
        projectId: tempProj,
      }),
      true
    )
  ).data;

  const tempRecord = await UploadedDocument.findById(tempDoc._id);
  const tempPath = tempRecord.storagePath;

  // Note linked to the document.
  const note = (
    await req("POST", "/notes", tA, {
      title: "Note on temp doc",
      content: "linked",
    })
  ).data;

  await Note.updateOne({ _id: note._id }, { $set: { documentId: tempDoc._id } });

  // A chunk row, to prove chunk deletion is wired.
  await RecordChunk.create({
    chunkId: `qa-chunk-${stamp}`,
    documentId: tempDoc._id,
    userId: A.user.id,
    projectId: tempProj,
    content: "chunk content",
    pageNumber: 1,
    embedding: [0.1, 0.2],
  });

  const chunkBefore = await RecordChunk.countDocuments({ documentId: tempDoc._id });
  check("dummy RecordChunk row created", chunkBefore === 1, `${chunkBefore}`);

  // 29-31 delete project -> document survives, detached.
  const delProj = await req("DELETE", `/projects/${tempProj}`, tA);
  check("delete project -> 200", delProj.status === 200);

  const docAfterProjDelete = await UploadedDocument.findById(tempDoc._id).lean();
  check("document survives project deletion", !!docAfterProjDelete);
  check(
    "document.projectId cleared to null",
    docAfterProjDelete?.projectId === null,
    JSON.stringify(docAfterProjDelete?.projectId)
  );
  check("physical file survives project deletion", fs.existsSync(tempPath));

  // 34-39 delete document -> cascades.
  const delDoc = await req("DELETE", `/documents/${tempDoc._id}`, tA);
  check("delete document -> 200", delDoc.status === 200);

  check(
    "Mongo document gone",
    !(await UploadedDocument.findById(tempDoc._id).lean())
  );
  check("physical file gone", !fs.existsSync(tempPath));

  const noteAfter = await Note.findById(note._id).lean();
  check("linked note survives", !!noteAfter);
  check(
    "note.documentId cleared to null",
    noteAfter?.documentId === null,
    JSON.stringify(noteAfter?.documentId)
  );

  const chunksAfter = await RecordChunk.countDocuments({ documentId: tempDoc._id });
  check("chunks for document deleted", chunksAfter === 0, `${chunksAfter}`);

  // ================= OWNERSHIP REGRESSION =================
  console.log("\n=== OWNERSHIP REGRESSION ===");

  check("B reads A doc -> 404", (await req("GET", `/documents/${doc._id}`, tB)).status === 404);
  check(
    "B updates A doc -> 404",
    (await req("PATCH", `/documents/${doc._id}`, tB, { title: "x" })).status === 404
  );
  check(
    "B deletes A doc -> 404",
    (await req("DELETE", `/documents/${doc._id}`, tB)).status === 404
  );

  const bList = await req("GET", "/documents", tB);
  check(
    "B list contains no A documents",
    bList.data.every((d) => String(d.userId) === String(B.user.id)),
    `${bList.data.length}`
  );

  // ================= LIST / FILTER =================
  console.log("\n=== LIST / FILTER ===");

  const byStatus = await req("GET", "/documents?status=Uploaded", tA);
  check(
    "filter by status=Uploaded works",
    byStatus.data.every((d) => d.processingStatus === "Uploaded"),
    `${byStatus.data.length}`
  );

  const byProject = await req("GET", `/documents?projectId=${projA}`, tA);
  check("filter by projectId works", byProject.data.length >= 1, `${byProject.data.length}`);

  const searched = await req("GET", "/documents?search=Renamed", tA);
  check("search by title works", searched.data.length >= 1, `${searched.data.length}`);

  // ================= PROJECT COUNT CONSISTENCY =================
  console.log("\n=== PROJECT COUNT ===");

  const projectList = await req("GET", "/projects", tA);
  const projAEntry = projectList.data.find((p) => String(p._id) === String(projA));

  const actualInProject = await UploadedDocument.countDocuments({
    userId: A.user.id,
    projectId: projA,
  });

  check(
    "project documentCount matches reality",
    projAEntry?.documentCount === actualInProject,
    `reported ${projAEntry?.documentCount}, actual ${actualInProject}`
  );

  // ================= FILE HYGIENE (scoped to this run) =================
  console.log("\n=== FILE HYGIENE ===");

  const runDocs = await UploadedDocument.find({
    userId: { $in: [A.user.id, B.user.id] },
  }).lean();

  const runNames = new Set(runDocs.map((d) => d.storedName));

  let missingFiles = 0;
  for (const d of runDocs) {
    if (!fs.existsSync(d.storagePath)) missingFiles += 1;
  }

  check("every record has its file on disk", missingFiles === 0, `${missingFiles} missing`);

  const onDisk = fs.readdirSync(uploadsDir);
  const orphansForRun = onDisk.filter(
    (f) => f.includes(stamp.toString()) && !runNames.has(f)
  );

  check("no orphan files left by this run", orphansForRun.length === 0, `${orphansForRun.length}`);

  await mongoose.disconnect();

  const failed = results.filter((r) => !r.pass);

  console.log(
    `\n=== ${results.length - failed.length}/${results.length} PASSED ===`
  );

  if (failed.length) {
    console.log("FAILURES:");
    failed.forEach((f) => console.log(`  - ${f.label}`));
    process.exit(1);
  }
})().catch((e) => {
  console.error("HARNESS FAILED:", e.message, e.stack);
  process.exit(1);
});
