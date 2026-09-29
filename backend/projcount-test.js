require("dotenv").config();

const mongoose = require("mongoose");

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

(async () => {
  const stamp = Date.now();

  const A = (
    await req("POST", "/auth/register", null, {
      name: "PC A",
      email: `pc.a.${stamp}@researcify.test`,
      password: "testpass123",
      academicField: "CS",
    })
  ).data;

  const tA = A.token;

  console.log(`userA=${A.user.id}\n`);

  // Two projects: one will hold documents, one will stay empty.
  const projA = (
    await req("POST", "/projects", tA, { title: `PC Full ${stamp}` })
  ).data._id;

  const projEmpty = (
    await req("POST", "/projects", tA, { title: `PC Empty ${stamp}` })
  ).data._id;

  const txt = "count test";

  console.log("=== UPLOAD ===");

  // 3 documents into projA, 1 general (no project).
  for (let i = 1; i <= 3; i += 1) {
    const r = await req(
      "POST",
      "/documents",
      tA,
      makeForm(`c${i}.txt`, "text/plain", txt, {
        title: `Count ${i}`,
        projectId: projA,
      }),
      true
    );
    check(`upload ${i} into project -> 201`, r.status === 201, `got ${r.status}`);
  }

  await req(
    "POST",
    "/documents",
    tA,
    makeForm("general.txt", "text/plain", txt, { title: "General" }),
    true
  );

  console.log("\n=== COUNTS VIA GET /projects ===");

  const list = await req("GET", "/projects", tA);
  check("GET /projects -> 200", list.status === 200, `got ${list.status}`);

  const full = list.data.find((p) => String(p._id) === String(projA));
  const empty = list.data.find((p) => String(p._id) === String(projEmpty));

  check(
    "project with 3 documents reports documentCount = 3",
    full?.documentCount === 3,
    `got ${JSON.stringify(full?.documentCount)}`
  );

  check(
    "empty project reports documentCount = 0",
    empty?.documentCount === 0,
    `got ${JSON.stringify(empty?.documentCount)}`
  );

  check(
    "documentCount is present on every project",
    list.data.every((p) => typeof p.documentCount === "number")
  );

  // The general document must not inflate any project's count.
  const totalReported = list.data.reduce(
    (sum, p) => sum + p.documentCount,
    0
  );
  check(
    "general document does not inflate project counts",
    totalReported === 3,
    `sum=${totalReported}`
  );

  console.log("\n=== COUNT TRACKS MUTATIONS ===");

  // Move one document out of the project -> count must drop.
  const docs = (await req("GET", `/documents?projectId=${projA}`, tA)).data;
  const moveId = docs[0]._id;

  await req("PATCH", `/documents/${moveId}`, tA, { projectId: null });

  const afterMove = (await req("GET", "/projects", tA)).data.find(
    (p) => String(p._id) === String(projA)
  );
  check(
    "unlinking a document drops count to 2",
    afterMove?.documentCount === 2,
    `got ${JSON.stringify(afterMove?.documentCount)}`
  );

  // Move it into the empty project -> that project must rise to 1.
  await req("PATCH", `/documents/${moveId}`, tA, { projectId: projEmpty });

  const afterRelink = (await req("GET", "/projects", tA)).data;

  check(
    "relinked document raises other project to 1",
    afterRelink.find((p) => String(p._id) === String(projEmpty))
      ?.documentCount === 1
  );

  // Delete a document -> count must drop again.
  const stillInFull = (await req("GET", `/documents?projectId=${projA}`, tA))
    .data;

  await req("DELETE", `/documents/${stillInFull[0]._id}`, tA);

  const afterDelete = (await req("GET", "/projects", tA)).data.find(
    (p) => String(p._id) === String(projA)
  );
  check(
    "deleting a document drops count to 1",
    afterDelete?.documentCount === 1,
    `got ${JSON.stringify(afterDelete?.documentCount)}`
  );

  console.log("\n=== ISOLATION ===");

  const B = (
    await req("POST", "/auth/register", null, {
      name: "PC B",
      email: `pc.b.${stamp}@researcify.test`,
      password: "testpass123",
      academicField: "CS",
    })
  ).data;

  const bList = await req("GET", "/projects", B.token);
  check(
    "B sees no projects of A",
    bList.data.every((p) => String(p.userId) === String(B.user.id)),
    `${bList.data.length} project(s)`
  );

  console.log("\n=== SEARCH + SORT STILL WORK ===");

  const searched = await req("GET", `/projects?search=PC Full ${stamp}`, tA);
  check(
    "search returns the project with its count",
    searched.data.length === 1 && searched.data[0].documentCount === 1,
    `n=${searched.data.length} count=${searched.data[0]?.documentCount}`
  );

  const sorted = await req("GET", "/projects?sort=title&order=asc", tA);
  check(
    "sorted list still carries counts",
    sorted.data.every((p) => typeof p.documentCount === "number")
  );

  const failed = results.filter((r) => !r.pass);

  console.log(
    `\n=== ${results.length - failed.length}/${results.length} PASSED ===`
  );

  if (failed.length) {
    console.log("FAILURES:");
    failed.forEach((f) => console.log(`  - ${f.label}`));
  }

  await mongoose.disconnect();
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error("HARNESS FAILED:", e.message, e.stack);
  process.exit(1);
});
