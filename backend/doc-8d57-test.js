require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");

const UploadedDocument = require("./models/UploadedDocument");
const RecordChunk = require("./models/RecordChunk");
const Note = require("./models/Note");

const BASE = "http://localhost:5000/api/v1";

const results = [];
const check = (label, pass, extra = "") => {
  results.push({ label, pass });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label}${extra ? `  ${extra}` : ""}`);
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
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    try {
      json = await res.json();
    } catch {
      /* no body */
    }
  }

  return {
    status: res.status,
    data: json?.data ?? null,
    message: json?.message,
    headers: res.headers,
    raw: json,
  };
};

/*
 * Download returns binary, not JSON, so it needs its own
 * helper that keeps the bytes.
 */
const downloadReq = async (p, token) => {
  const res = await fetch(`${BASE}${p}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const buffer = Buffer.from(await res.arrayBuffer());

  return {
    status: res.status,
    buffer,
    disposition: res.headers.get("content-disposition") || "",
    contentType: res.headers.get("content-type") || "",
  };
};

const makeForm = (filename, mimeType, content, extra = {}) => {
  const form = new FormData();
  form.append("file", new Blob([content], { type: mimeType }), filename);
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null) form.append(k, v);
  }
  return form;
};

const register = async (tag, stamp) =>
  (
    await req("POST", "/auth/register", null, {
      name: `D57 ${tag}`,
      email: `d57.${tag}.${stamp}@researcify.test`,
      password: "testpass123",
      academicField: "CS",
    })
  ).data;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const stamp = Date.now();

  const A = await register("a", stamp);
  const B = await register("b", stamp);

  const tA = A.token;
  const tB = B.token;

  console.log(`userA=${A.user.id}\nuserB=${B.user.id}\n`);

  const projA = (
    await req("POST", "/projects", tA, { title: `D57 Proj A ${stamp}` })
  ).data._id;

  const content = "Document 8D.5-8D.7 regression content.";

  // ================= PROCESSING METADATA =================
  console.log("=== 8D.7 PROCESSING METADATA ===");

  const doc = (
    await req(
      "POST",
      "/documents",
      tA,
      makeForm("metadata.txt", "text/plain", content, {
        title: "Metadata Doc",
        projectId: projA,
      }),
      true
    )
  ).data;

  check("upload -> 201", !!doc?._id);

  check(
    "new upload status is 'Uploaded'",
    doc?.processingStatus === "Uploaded",
    `got ${doc?.processingStatus}`
  );

  check("fileHash exists", !!doc?.fileHash);
  check(
    "fileHash is 64 hex chars (SHA-256)",
    /^[a-f0-9]{64}$/.test(doc?.fileHash || ""),
    `${(doc?.fileHash || "").length} chars`
  );

  // Independently verify the hash matches the bytes on disk.
  const stored = await UploadedDocument.findById(doc._id).lean();

  const actualHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(stored.storagePath))
    .digest("hex");

  check(
    "fileHash matches SHA-256 of stored bytes",
    actualHash === doc.fileHash,
    actualHash.slice(0, 12) + "..."
  );

  check(
    "extractedTextAvailable === false",
    doc?.extractedTextAvailable === false
  );
  check("chunkCount === 0", doc?.chunkCount === 0);
  check("processedAt === null", doc?.processedAt === null);
  check("processingVersion === 1", doc?.processingVersion === 1);

  // Legacy migration check: no old enum values may remain.
  const legacy = await UploadedDocument.find({
    processingStatus: {
      $in: ["Pending", "Processing", "Completed"],
    },
  })
    .select("processingStatus")
    .lean();

  check(
    "no legacy status values remain in DB",
    legacy.length === 0,
    `${legacy.length} found`
  );

  // ================= METADATA EDITING =================
  console.log("\n=== 8D.5 METADATA EDITING ===");

  const editTitle = await req("PATCH", `/documents/${doc._id}`, tA, {
    title: "Renamed Doc",
    description: "Updated description",
  });

  check("edit title+description -> 200", editTitle.status === 200, `got ${editTitle.status}`);
  check("title persisted", editTitle.data?.title === "Renamed Doc");
  check(
    "description persisted",
    editTitle.data?.description === "Updated description"
  );

  /*
   * Server-owned fields must be ignored even when supplied,
   * otherwise a client could rewrite storage metadata.
   */
  const tamper = await req("PATCH", `/documents/${doc._id}`, tA, {
    title: "Tamper Test",
    fileHash: "deadbeef",
    storedName: "../../evil.txt",
    storagePath: "/etc/passwd",
    mimeType: "application/x-msdownload",
    fileSize: 999,
    processingStatus: "Ready",
    chunkCount: 500,
    extractedTextAvailable: true,
    userId: B.user.id,
  });

  check("tamper attempt -> 200 (ignored, not rejected)", tamper.status === 200);

  const afterTamper = await UploadedDocument.findById(doc._id).lean();

  check("storedName not overwritten", afterTamper.storedName === doc.storedName);
  check("storagePath not overwritten", afterTamper.storagePath === stored.storagePath);
  check("mimeType not overwritten", afterTamper.mimeType === "text/plain");
  check("fileSize not overwritten", afterTamper.fileSize === doc.fileSize);
  check("fileHash not overwritten", afterTamper.fileHash === doc.fileHash);
  check(
    "processingStatus not overwritten",
    afterTamper.processingStatus === "Uploaded"
  );
  check("chunkCount not overwritten", afterTamper.chunkCount === 0);
  check("userId not overwritten", String(afterTamper.userId) === String(A.user.id));

  // Empty title is a genuine validation error.
  const emptyTitle = await req("PATCH", `/documents/${doc._id}`, tA, {
    title: "   ",
  });
  check("blank title -> 400", emptyTitle.status === 400, `got ${emptyTitle.status}`);

  // ================= PROJECT LINK / UNLINK =================
  console.log("\n=== PROJECT LINK / UNLINK ===");

  const unlink = await req("PATCH", `/documents/${doc._id}`, tA, {
    projectId: null,
  });

  check("unlink with projectId:null -> 200", unlink.status === 200, `got ${unlink.status}`);
  check("projectId is null after unlink", unlink.data?.projectId === null);

  const relink = await req("PATCH", `/documents/${doc._id}`, tA, {
    projectId: projA,
  });
  check("relink -> 200", relink.status === 200);

  const foreignProj = (
    await req("POST", "/projects", tB, {
      title: `D57 Proj B ${stamp}`,
    })
  ).data._id;

  const foreign = await req("PATCH", `/documents/${doc._id}`, tA, {
    projectId: foreignProj,
  });
  check("link to foreign project -> 404", foreign.status === 404, `got ${foreign.status}`);

  // ================= DOWNLOAD SECURITY =================
  console.log("\n=== 8D.5 DOWNLOAD SECURITY ===");

  const dl = await downloadReq(`/documents/${doc._id}/download`, tA);

  check("owner download -> 200", dl.status === 200, `got ${dl.status}`);
  check("bytes match uploaded content", dl.buffer.toString() === content);
  check(
    "Content-Disposition carries originalName",
    dl.disposition.includes("metadata.txt"),
    dl.disposition
  );
  check(
    "X-Content-Type-Options: nosniff",
    (await fetch(`${BASE}/documents/${doc._id}/download`, {
      headers: { Authorization: `Bearer ${tA}` },
    })).headers.get("x-content-type-options") === "nosniff"
  );

  const foreignDl = await downloadReq(`/documents/${doc._id}/download`, tB);
  check("B download -> 404 (not 403)", foreignDl.status === 404, `got ${foreignDl.status}`);

  const anonDl = await downloadReq(`/documents/${doc._id}/download`, null);
  check("no auth -> 401", anonDl.status === 401, `got ${anonDl.status}`);

  const randomDl = await downloadReq(
    "/documents/000/download",
    tA
  );
  check("random id -> 404", randomDl.status === 404, `got ${randomDl.status}`);

  // Missing physical file -> controlled 404, not a 500.
  const tempDoc = (
    await req(
      "POST",
      "/documents",
      tA,
      makeForm("vanished.txt", "text/plain", "gone", { title: "Vanished" }),
      true
    )
  ).data;

  const tempStored = await UploadedDocument.findById(tempDoc._id).lean();

  fs.unlinkSync(tempStored.storagePath);

  const missingDl = await downloadReq(`/documents/${tempDoc._id}/download`, tA);
  check(
    "missing physical file -> 404 (not 500)",
    missingDl.status === 404,
    `got ${missingDl.status}`
  );

  // ================= LIFECYCLE =================
  console.log("\n=== 8D.7 LIFECYCLE ===");

  const tempProj = (
    await req("POST", "/projects", tA, { title: `D57 Temp ${stamp}` })
  ).data._id;

  const lifeDoc = (
    await req(
      "POST",
      "/documents",
      tA,
      makeForm("lifecycle.txt", "text/plain", "lifecycle", {
        title: "Lifecycle Doc",
        projectId: tempProj,
      }),
      true
    )
  ).data;

  const lifeStored = await UploadedDocument.findById(lifeDoc._id).lean();
  const lifePath = lifeStored.storagePath;

  const lifeNote = (
    await req("POST", "/notes", tA, {
      title: "Note on lifecycle doc",
      content: "references document",
    })
  ).data;

  await Note.updateOne(
    { _id: lifeNote._id },
    { $set: { documentId: lifeDoc._id } }
  );

  // Insert a chunk row directly: the schema requires an
  // embedding, and nothing writes chunks yet (that is 8G).
  await RecordChunk.create({
    chunkId: `qa-chunk-${stamp}`,
    documentId: lifeDoc._id,
    userId: A.user.id,
    projectId: tempProj,
    content: "chunk content",
    pageNumber: 1,
    embedding: [0.1, 0.2, 0.3],
  });

  check("chunk row created", (await RecordChunk.countDocuments({ documentId: lifeDoc._id })) === 1);

  // --- delete the PROJECT ---
  const delProj = await req("DELETE", `/projects/${tempProj}`, tA);
  check("project deleted -> 200", delProj.status === 200, `got ${delProj.status}`);

  const docAfterProj = await UploadedDocument.findById(lifeDoc._id).lean();
  check("document survives project deletion", !!docAfterProj);
  check(
    "document.projectId cleared to null",
    docAfterProj?.projectId === null,
    `got ${JSON.stringify(docAfterProj?.projectId)}`
  );
  check(
    "physical file survives project deletion",
    fs.existsSync(lifePath)
  );

  const noteAfterProj = await Note.findById(lifeNote._id).lean();
  check("note survives project deletion", !!noteAfterProj);

  // --- delete the DOCUMENT ---
  const delDoc = await req("DELETE", `/documents/${lifeDoc._id}`, tA);
  check("document deleted -> 200", delDoc.status === 200, `got ${delDoc.status}`);

  check(
    "mongo document gone",
    !(await UploadedDocument.findById(lifeDoc._id).lean())
  );
  check("physical file gone", !fs.existsSync(lifePath));
  check(
    "chunks for document deleted",
    (await RecordChunk.countDocuments({ documentId: lifeDoc._id })) === 0
  );

  const noteAfterDoc = await Note.findById(lifeNote._id).lean();
  check("note survives document deletion", !!noteAfterDoc);
  check(
    "note.documentId cleared to null",
    noteAfterDoc?.documentId === null,
    `got ${JSON.stringify(noteAfterDoc?.documentId)}`
  );

  // Note deletion should clean up its own reference too.
  await req("DELETE", `/notes/${lifeNote._id}`, tA);

  // ================= OWNERSHIP REGRESSION =================
  console.log("\n=== OWNERSHIP REGRESSION ===");

  check("B GET A doc -> 404", (await req("GET", `/documents/${doc._id}`, tB)).status === 404);
  check("B PATCH A doc -> 404", (await req("PATCH", `/documents/${doc._id}`, tB, { title: "x" })).status === 404);
  check("B DELETE A doc -> 404", (await req("DELETE", `/documents/${doc._id}`, tB)).status === 404);

  const listA = await req("GET", "/documents", tA);
  check(
    "A list contains only A documents",
    listA.data.every((d) => String(d.userId) === String(A.user.id))
  );

  const listB = await req("GET", "/documents", tB);
  check("B list contains no A documents", listB.data.length === 0, `got ${listB.data.length}`);

  // ================= STATUS FILTER =================
  console.log("\n=== STATUS FILTER (new enum) ===");

  for (const status of ["Uploaded", "Extracting", "Chunking", "Ready", "Failed"]) {
    const r = await req("GET", `/documents?status=${status}`, tA);
    check(`filter status=${status} -> 200`, r.status === 200, `got ${r.status}`);
  }

  const uploadedFilter = await req("GET", "/documents?status=Uploaded", tA);
  check(
    "status=Uploaded returns the new documents",
    uploadedFilter.data.length >= 1,
    `${uploadedFilter.data.length}`
  );

  await mongoose.disconnect();

  const failed = results.filter((r) => !r.pass);

  console.log(
    `\n=== ${results.length - failed.length}/${results.length} PASSED ===`
  );

  if (failed.length) {
    console.log("FAILURES:");
    failed.forEach((f) => console.log(`  - ${f.label}`));
  }

  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error("HARNESS FAILED:", e.message, e.stack);
  process.exit(1);
});
