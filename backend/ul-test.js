require("dotenv").config();

const BASE = "http://localhost:5000/api/v1";

const req = async (method, path, token, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, data: json?.data ?? null };
};

const check = (label, cond, extra = "") =>
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}${extra ? `  ${extra}` : ""}`);

(async () => {
  const stamp = Date.now();

  const reg = async (tag) =>
    (
      await req("POST", "/auth/register", null, {
        name: `UL ${tag}`,
        email: `ul.${tag}.${stamp}@researcify.test`,
        password: "testpass123",
        academicField: "CS",
      })
    ).data;

  const A = await reg("a");
  const B = await reg("b");
  const tA = A.token;
  const tB = B.token;

  console.log(`userA=${A.user.id}\nuserB=${B.user.id}\n`);

  // ---------- POPULATED RELATIONSHIPS ----------
  console.log("=== POPULATED RELATIONSHIP TITLES ===");

  const proj = (
    await req("POST", "/projects", tA, {
      title: `UL Project ${stamp}`,
    })
  ).data._id;

  const paper = (
    await req("POST", "/papers", tA, {
      title: "UL Paper Title",
      authors: ["Ada Lovelace"],
      source: "Manual",
      doi: `10.0000/ul.${stamp}`,
    })
  ).data._id;

  const note = (
    await req("POST", "/notes", tA, {
      title: "UL linked note",
      content: "linked to both",
      projectId: proj,
      paperId: paper,
    })
  ).data;

  const list = await req("GET", "/notes", tA);
  const found = list.data.find((n) => n._id === note._id);
  check(
    "list populates projectId.title",
    found?.projectId?.title === `UL Project ${stamp}`,
    `got "${found?.projectId?.title}"`
  );
  check(
    "list populates paperId.title",
    found?.paperId?.title === "UL Paper Title",
    `got "${found?.paperId?.title}"`
  );
  check(
    "list populates paperId.authors",
    Array.isArray(found?.paperId?.authors),
    JSON.stringify(found?.paperId?.authors)
  );

  const single = await req("GET", `/notes/${note._id}`, tA);
  check(
    "getNoteById populates titles",
    single.data?.projectId?.title === `UL Project ${stamp}` &&
    single.data?.paperId?.title === "UL Paper Title"
  );

  // ---------- SECURITY REGRESSION ----------
  console.log("\n=== SECURITY REGRESSION ===");
  check("B GET A note -> 404", (await req("GET", `/notes/${note._id}`, tB)).status === 404);
  check("B PATCH A note -> 404", (await req("PATCH", `/notes/${note._id}`, tB, { title: "x" })).status === 404);
  check("B DELETE A note -> 404", (await req("DELETE", `/notes/${note._id}`, tB)).status === 404);

  const foreignProj = (
    await req("POST", "/projects", tB, { title: `UL B ${stamp}` })
  ).data._id;
  check(
    "A attaches foreign project -> 404",
    (await req("PATCH", `/notes/${note._id}`, tA, { projectId: foreignProj })).status === 404
  );

  // ---------- SAFE UNLINK: PROJECT ----------
  console.log("\n=== SAFE UNLINK (project) ===");

  const delProj = await req("DELETE", `/projects/${proj}`, tA);
  check("project deleted -> 200", delProj.status === 200);

  const afterProj = await req("GET", `/notes/${note._id}`, tA);
  check("note still exists", afterProj.status === 200);
  check("note content intact", afterProj.data?.content === "linked to both");
  check(
    "projectId cleared to null",
    afterProj.data?.projectId === null,
    `got ${JSON.stringify(afterProj.data?.projectId)}`
  );
  check(
    "paperId preserved",
    afterProj.data?.paperId?.title === "UL Paper Title",
    `got "${afterProj.data?.paperId?.title}"`
  );

  // ---------- SAFE UNLINK: PAPER ----------
  console.log("\n=== SAFE UNLINK (paper) ===");

  const delPaper = await req("DELETE", `/papers/${paper}`, tA);
  check("paper deleted -> 200", delPaper.status === 200);

  const afterPaper = await req("GET", `/notes/${note._id}`, tA);
  check("note still exists", afterPaper.status === 200);
  check("note title intact", afterPaper.data?.title === "UL linked note");
  check(
    "paperId cleared to null",
    afterPaper.data?.paperId === null,
    `got ${JSON.stringify(afterPaper.data?.paperId)}`
  );

  // ---------- NO DANGLING REFS ----------
  console.log("\n=== DANGLING REFERENCE SCAN ===");

  const mongoose = require("mongoose");
  const Note = require("./models/Note");
  const Paper = require("./models/Paper");
  const ResearchProject = require("./models/ResearchProject");

  await mongoose.connect(process.env.MONGO_URI);

  const allNotes = await Note.find({ userId: A.user.id }).lean();

  let danglingProjects = 0;
  let danglingPapers = 0;

  for (const n of allNotes) {
    if (n.projectId) {
      const exists = await ResearchProject.exists({ _id: n.projectId });
      if (!exists) danglingProjects += 1;
    }
    if (n.paperId) {
      const exists = await Paper.exists({ _id: n.paperId });
      if (!exists) danglingPapers += 1;
    }
  }

  check("no dangling project refs", danglingProjects === 0, `${danglingProjects}`);
  check("no dangling paper refs", danglingPapers === 0, `${danglingPapers}`);
  check(
    "all notes survived both deletes",
    allNotes.length >= 1,
    `${allNotes.length} note(s)`
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error("HARNESS FAILED:", e.message);
  process.exit(1);
});