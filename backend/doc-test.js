require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const BASE = "http://localhost:5000/api/v1";
const UploadedDocument = require("./models/UploadedDocument");

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
    ...(body
      ? { body: isForm ? body : JSON.stringify(body) }
      : {}),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }

  return { status: res.status, data: json?.data ?? null, message: json?.message };
};

const reg = async (tag, stamp) =>
  (
    await req("POST", "/auth/register", null, {
      name: `DOC ${tag}`,
      email: `doc.${tag}.${stamp}@researcify.test`,
      password: "testpass123",
      academicField: "CS",
    })
  ).data;

// Build a multipart body from a buffer.
const makeForm = (filename, mimeType, content, extra = {}) => {
  const form = new FormData();
  form.append("file", new Blob([content], { type: mimeType }), filename);
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null) form.append(k, v);
  }
  return form;
};

(async () => {
  // Connect before any Mongoose query is issued.
  await mongoose.connect(process.env.MONGO_URI);

  const stamp = Date.now();
  const A = await reg("a", stamp);
  const B = await reg("b", stamp);
  const tA = A.token;
  const tB = B.token;

  console.log(`userA=${A.user.id}\nuserB=${B.user.id}\n`);

  const projA = (
    await req("POST", "/projects", tA, { title: `DOC Proj A ${stamp}` })
  ).data._id;
  const projB = (
    await req("POST", "/projects", tB, { title: `DOC Proj B ${stamp}` })
  ).data._id;

  const txt = "Researchify document upload test content.";

  // ================= UPLOADS =================
  console.log("=== UPLOAD ===");

  const general = await req(
    "POST",
    "/documents",
    tA,
    makeForm("notes.txt", "text/plain", txt, { title: "General TXT" }),
    true
  );
  check("A uploads general TXT -> 201", general.status === 201, `got ${general.status}`);

  const toProj = await req(
    "POST",
    "/documents",
    tA,
    makeForm("project.txt", "text/plain", txt, {
      title: "Project TXT",
      projectId: projA,
    }),
    true
  );
  check("A uploads to Project A -> 201", toProj.status === 201, `got ${toProj.status}`);
  check(
    "projectId stored",
    String(toProj.data?.projectId) === String(projA) ||
      String(toProj.data?.projectId?._id) === String(projA)
  );

  const toForeign = await req(
    "POST",
    "/documents",
    tA,
    makeForm("foreign.txt", "text/plain", txt, {
      title: "Foreign",
      projectId: projB,
    }),
    true
  );
  check("A uploads to Project B -> 404", toForeign.status === 404, `got ${toForeign.status}`);

  // orphan-file check: the rejected upload must not leave bytes behind
  const uploadsDir = path.join(__dirname, "uploads/documents");
  const filesAfterReject = fs.readdirSync(uploadsDir);
  const orphan = filesAfterReject.find((f) => f.includes("foreign"));
  check("no orphan file left by rejected upload", !orphan);

  // ================= MIME / SIZE =================
  console.log("\n=== MIME / SIZE REJECTION ===");

  const png = await req(
    "POST",
    "/documents",
    tA,
    makeForm("image.png", "image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      title: "PNG",
    }),
    true
  );
  check("PNG rejected -> 400", png.status === 400, `got ${png.status}`);

  const exe = await req(
    "POST",
    "/documents",
    tA,
    makeForm("malware.pdf", "application/x-msdownload", Buffer.from("MZ"), {
      title: "EXE renamed",
    }),
    true
  );
  check(
    "EXE renamed .pdf rejected -> 400",
    exe.status === 400,
    `got ${exe.status}`
  );

  const big = Buffer.alloc(11 * 1024 * 1024, 0x41);
  const tooBig = await req(
    "POST",
    "/documents",
    tA,
    makeForm("big.pdf", "application/pdf", big, { title: "Big" }),
    true
  );
  check("11 MB PDF rejected -> 413", tooBig.status === 413, `got ${tooBig.status}`);

  const noFile = await req("POST", "/documents", tA, new FormData(), true);
  check("missing file -> 400", noFile.status === 400, `got ${noFile.status}`);

  // ================= LIST / READ =================
  console.log("\n=== LIST / READ ===");

  const listA = await req("GET", "/documents", tA);
  check("A lists own documents -> 200", listA.status === 200);
  check(
    "A sees own documents only",
    listA.data.every((d) => String(d.userId) === String(A.user.id)),
    `${listA.data.length} doc(s)`
  );

  const byProj = await req("GET", `/documents?projectId=${projA}`, tA);
  check("filter by projectId", byProj.data.length === 1, `got ${byProj.data.length}`);

  const sTitle = await req("GET", "/documents?search=General TXT", tA);
  check("search by title", sTitle.data.length === 1, `got ${sTitle.data.length}`);

  const sFile = await req("GET", "/documents?search=project.txt", tA);
  check("search by filename", sFile.data.length === 1, `got ${sFile.data.length}`);

  const readOwn = await req("GET", `/documents/${general.data._id}`, tA);
  check("A reads own document -> 200", readOwn.status === 200);

  const bRead = await req("GET", `/documents/${general.data._id}`, tB);
  check("B reads A document -> 404", bRead.status === 404, `got ${bRead.status}`);

  const bPatch = await req("PATCH", `/documents/${general.data._id}`, tB, {
    title: "hijack",
  });
  check("B updates A document -> 404", bPatch.status === 404, `got ${bPatch.status}`);

  const bDel = await req("DELETE", `/documents/${general.data._id}`, tB);
  check("B deletes A document -> 404", bDel.status === 404, `got ${bDel.status}`);

  const bList = await req("GET", "/documents", tB);
  check("B list contains no A documents", bList.data.length === 0, `got ${bList.data.length}`);

  // ================= UPDATE =================
  console.log("\n=== UPDATE / RELINK ===");

  const moveA = await req("PATCH", `/documents/${general.data._id}`, tA, {
    projectId: projA,
  });
  check("A moves document -> Project A -> 200", moveA.status === 200, `got ${moveA.status}`);

  const moveForeign = await req("PATCH", `/documents/${general.data._id}`, tA, {
    projectId: projB,
  });
  check("A moves document -> Project B -> 404", moveForeign.status === 404, `got ${moveForeign.status}`);

  const unlink = await req("PATCH", `/documents/${general.data._id}`, tA, {
    projectId: null,
  });
  check("A unlinks with projectId:null -> 200", unlink.status === 200, `got ${unlink.status}`);
  check(
    "projectId is null after unlink",
    unlink.data?.projectId === null,
    `got ${JSON.stringify(unlink.data?.projectId)}`
  );

  // ================= PHYSICAL FILE =================
  console.log("\n=== PHYSICAL FILE ===");

  const doc = await UploadedDocument.findById(general.data._id).lean();
  check("Mongo record has storagePath", !!doc?.storagePath);
  check("physical file exists after upload", fs.existsSync(doc.storagePath));

  const storedPath = doc.storagePath;

  // ================= DELETE + NOTE UNLINK =================
  console.log("\n=== DELETE / SAFE UNLINK ===");

  const note = (
    await req("POST", "/notes", tA, {
      title: "Note on document",
      content: "references a document",
    })
  ).data;

  // link the note to the document via direct write (no API surface yet)
  const Note = require("./models/Note");
  await Note.updateOne(
    { _id: note._id },
    { $set: { documentId: general.data._id } }
  );
  const linked = await Note.findById(note._id).lean();
  check("note linked to document", !!linked.documentId);

  const del = await req("DELETE", `/documents/${general.data._id}`, tA);
  check("A deletes own document -> 200", del.status === 200, `got ${del.status}`);

  const gone = await UploadedDocument.findById(general.data._id).lean();
  check("Mongo record removed", !gone);

  check("physical file removed", !fs.existsSync(storedPath));

  const noteAfter = await Note.findById(note._id).lean();
  check("linked note survives deletion", !!noteAfter);
  check(
    "note.documentId cleared to null",
    noteAfter?.documentId === null,
    `got ${JSON.stringify(noteAfter?.documentId)}`
  );

  // ================= ENOENT RESILIENCE =================
  console.log("\n=== ENOENT RESILIENCE ===");

  const second = await req(
    "POST",
    "/documents",
    tA,
    makeForm("second.txt", "text/plain", txt, { title: "Second" }),
    true
  );
  const secondDoc = await UploadedDocument.findById(second.data._id).lean();

  // Manually remove the file, then delete the record.
  fs.unlinkSync(secondDoc.storagePath);
  const delMissing = await req("DELETE", `/documents/${second.data._id}`, tA);
  check("delete with missing file -> 200 (ENOENT ignored)", delMissing.status === 200, `got ${delMissing.status}`);
  check(
    "record removed despite missing file",
    !(await UploadedDocument.findById(second.data._id).lean())
  );

  // ================= NO DANGLING =================
  console.log("\n=== DANGLING SCAN ===");

  const allDocs = await UploadedDocument.find({ userId: A.user.id }).lean();
  let dangling = 0;
  for (const d of allDocs) {
    if (d.projectId) {
      const exists = await mongoose.connection.db
        .collection("researchprojects")
        .countDocuments({ _id: d.projectId });
      if (!exists) dangling += 1;
    }
  }
  check("no dangling project refs", dangling === 0, `${dangling}`);

  // ================= REMAINING FILES =================
  console.log("\n=== FILE HYGIENE ===");
  const remainingFiles = fs.readdirSync(uploadsDir);
  const remainingIds = allDocs.map((d) => d.storedName);
  const stray = remainingFiles.filter(
    (f) => !remainingIds.includes(f)
  );
  check(
    "no stray files left on disk",
    stray.length === 0,
    stray.length ? `stray: ${stray.join(", ")}` : `${remainingFiles.length} file(s)`
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
})().catch((e) => {
  console.error("HARNESS FAILED:", e.message, e.stack);
  process.exit(1);
});