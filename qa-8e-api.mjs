/*
 * Phase 8E ownership + cascade matrix.
 *
 * Two things the UI suite in qa-8e-ui.mjs cannot prove:
 *
 *   1. Authorization. A second user must get 404 (not 403)
 *      for another user's collection, and for the papers and
 *      documents hanging off it. 404 rather than 403 because a
 *      collection the caller does not own should be
 *      indistinguishable from one that does not exist.
 *
 *   2. Cascade direction. qa-8e-ui.mjs deletes the collection
 *      and confirms the members survive. This goes the other
 *      way: delete the member and confirm the collection
 *      stays intact and its counts stop claiming the deleted
 *      resource.
 *
 * Plain fetch, no browser: these are backend contracts.
 *
 *   node qa-8e-api.mjs
 */

const API = "http://localhost:5000/api/v1";

let pass = 0;
let fail = 0;

const check = (label, ok, detail = "") => {
  if (ok) pass += 1;
  else fail += 1;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`
  );
};

const client = (token) => async (
  method,
  path,
  body
) => {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  return { status: res.status, data: json?.data };
};

const register = async (label) => {
  const email = `qa8e_${label}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 7)}@example.test`;

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `QA ${label}`,
      email,
      password: "QaPassw0rd!23",
      academicField: "Computer Science",
      researchInterests: ["Testing"],
    }),
  });

  const json = await res.json();

  if (!json?.data?.token) {
    throw new Error(
      `register(${label}) failed: ${res.status} ${JSON.stringify(json)}`
    );
  }

  return {
    token: json.data.token,
    userId:
      json.data.user?._id ||
      json.data.user?.id ||
      json.data.userId,
  };
};

const uploadDocument = async (token, title) => {
  const form = new FormData();
  form.append(
    "file",
    new Blob(["ownership + cascade fixture"], {
      type: "text/plain",
    }),
    `qa8e-${Math.random().toString(36).slice(2, 7)}.txt`
  );
  form.append("title", title);

  const res = await fetch(`${API}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = await res.json();

  if (!json?.data?._id) {
    throw new Error(
      `upload failed: ${res.status} ${JSON.stringify(json)}`
    );
  }

  return json.data;
};

const stamp = Math.random().toString(36).slice(2, 8);

const alice = await register("alice");
const bob = await register("bob");

const aliceApi = client(alice.token);
const bobApi = client(bob.token);

console.log(
  `alice=${alice.userId} bob=${bob.userId}\n`
);

/* ---------------------------------------------------------------- */
/* FIXTURES                                                           */
/* ---------------------------------------------------------------- */

const collection = (
  await aliceApi("POST", "/collections", {
    name: `QA Ownership ${stamp}`,
    description: "ownership matrix",
  })
).data;

const paper = (
  await aliceApi("POST", "/papers", {
    title: `QA Ownership Paper ${stamp}`,
    authors: ["QA"],
    year: 2026,
    source: "QA",
  })
).data;

const document = await uploadDocument(
  alice.token,
  `QA Ownership Doc ${stamp}`
);

check(
  "fixtures created for alice",
  Boolean(collection?._id && paper?._id && document?._id)
);

await aliceApi("POST", `/collections/${collection._id}/papers`, {
  paperId: paper._id,
});
await aliceApi(
  "POST",
  `/collections/${collection._id}/documents`,
  { documentId: document._id }
);

const seeded = (
  await aliceApi("GET", `/collections/${collection._id}`)
).data;

check(
  "collection seeded with both members",
  seeded?.paperCount === 1 && seeded?.documentCount === 1,
  `papers=${seeded?.paperCount} docs=${seeded?.documentCount}`
);

console.log("");

/* ---------------------------------------------------------------- */
/* 1. DUPLICATES                                                     */
/* ---------------------------------------------------------------- */

const dupName = await aliceApi("POST", "/collections", {
  name: `QA Ownership ${stamp}`,
});

check(
  "duplicate collection name -> 409",
  dupName.status === 409,
  `HTTP ${dupName.status}`
);

const dupRel = await aliceApi(
  "POST",
  `/collections/${collection._id}/papers`,
  { paperId: paper._id }
);

check(
  "duplicate paper relationship -> 409",
  dupRel.status === 409,
  `HTTP ${dupRel.status}`
);

const caseDup = await aliceApi("POST", "/collections", {
  name: `qa ownership ${stamp}`,
});

check(
  "duplicate name, different case -> 409",
  caseDup.status === 409,
  `HTTP ${caseDup.status}`
);

console.log("");

/* ---------------------------------------------------------------- */
/* 2. CROSS-USER ISOLATION                                           */
/* ---------------------------------------------------------------- */

const probes = [
  ["GET collection", "GET", `/collections/${collection._id}`],
  ["PATCH collection", "PATCH", `/collections/${collection._id}`, { name: "hijacked" }],
  ["DELETE collection", "DELETE", `/collections/${collection._id}`],
  ["POST paper", "POST", `/collections/${collection._id}/papers`, { paperId: paper._id }],
  ["DELETE paper rel", "DELETE", `/collections/${collection._id}/papers/${paper._id}`],
  ["POST document", "POST", `/collections/${collection._id}/documents`, { documentId: document._id }],
  ["DELETE document rel", "DELETE", `/collections/${collection._id}/documents/${document._id}`],
  ["GET alice paper", "GET", `/papers/${paper._id}`],
  ["GET alice document", "GET", `/documents/${document._id}`],
  ["DELETE alice paper", "DELETE", `/papers/${paper._id}`],
  ["DELETE alice document", "DELETE", `/documents/${document._id}`],
];

for (const [label, method, path, body] of probes) {
  const r = await bobApi(method, path, body);

  check(
    `bob ${label} -> 404`,
    r.status === 404,
    `HTTP ${r.status}`
  );
}

const bobList = (await bobApi("GET", "/collections?archived=all")).data;

check(
  "alice collection absent from bob's list",
  !bobList.some((c) => c._id === collection._id),
  `${bobList.length} collections visible to bob`
);

const stillIntact = (
  await aliceApi("GET", `/collections/${collection._id}`)
).data;

check(
  "collection undamaged after bob's attempts",
  stillIntact?.name === `QA Ownership ${stamp}` &&
    stillIntact?.paperCount === 1 &&
    stillIntact?.documentCount === 1,
  `name="${stillIntact?.name}" papers=${stillIntact?.paperCount} docs=${stillIntact?.documentCount}`
);

console.log("");

/* ---------------------------------------------------------------- */
/* 3. MALFORMED INPUT                                                */
/* ---------------------------------------------------------------- */

for (const bad of [
  "not-an-id",
  "000000000000000000000000",
  "../../etc/passwd",
]) {
  const r = await aliceApi("GET", `/collections/${bad}`);

  check(
    `malformed id "${bad}" rejected`,
    r.status === 404 || r.status === 400,
    `HTTP ${r.status}`
  );
}

console.log("");

/* ---------------------------------------------------------------- */
/* 4. CASCADE: DELETE THE MEMBER, NOT THE COLLECTION                */
/* ---------------------------------------------------------------- */

const delPaper = await aliceApi("DELETE", `/papers/${paper._id}`);

check("paper deleted by owner", delPaper.status === 200, `HTTP ${delPaper.status}`);

const afterPaperDelete = (
  await aliceApi("GET", `/collections/${collection._id}`)
).data;

check(
  "collection survives paper deletion",
  Boolean(afterPaperDelete?._id),
  afterPaperDelete?._id
);

check(
  "paperCount no longer counts the deleted paper",
  afterPaperDelete?.paperCount === 0,
  `paperCount=${afterPaperDelete?.paperCount}`
);

check(
  "documentCount unaffected by paper deletion",
  afterPaperDelete?.documentCount === 1,
  `documentCount=${afterPaperDelete?.documentCount}`
);

const delDoc = await aliceApi("DELETE", `/documents/${document._id}`);

check("document deleted by owner", delDoc.status === 200, `HTTP ${delDoc.status}`);

const afterDocDelete = (
  await aliceApi("GET", `/collections/${collection._id}`)
).data;

check(
  "collection survives document deletion",
  Boolean(afterDocDelete?._id)
);

check(
  "counts return to zero",
  afterDocDelete?.paperCount === 0 &&
    afterDocDelete?.documentCount === 0,
  `papers=${afterDocDelete?.paperCount} docs=${afterDocDelete?.documentCount}`
);

/* Re-adding a deleted member must not resurrect a ref. */

const reAdd = await aliceApi(
  "POST",
  `/collections/${collection._id}/papers`,
  { paperId: paper._id }
);

check(
  "re-adding a deleted paper is rejected",
  reAdd.status === 404 || reAdd.status === 409,
  `HTTP ${reAdd.status}`
);

const afterReAdd = (
  await aliceApi("GET", `/collections/${collection._id}`)
).data;

check(
  "count still zero after rejected re-add",
  afterReAdd?.paperCount === 0,
  `paperCount=${afterReAdd?.paperCount}`
);

/* ---------------------------------------------------------------- */
/* 5. CLEANUP                                                        */
/* ---------------------------------------------------------------- */

await aliceApi("DELETE", `/collections/${collection._id}`);

console.log("");
console.log(`API RESULT: ${pass} passed, ${fail} failed`);

process.exit(fail > 0 ? 1 : 0);
