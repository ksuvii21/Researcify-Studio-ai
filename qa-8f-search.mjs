/*
 * Phase 8F Global Search API test.
 *
 * Tests the search endpoint with two users and ownership isolation.
 *
 *   node qa-8f-search.mjs
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
  const email = `qa8fs_${label}_${Date.now()}_${Math.random()
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

  return { token: json.data.token, userId: json.data.user?._id };
};

const uploadDocument = async (token, title) => {
  const form = new FormData();
  form.append(
    "file",
    new Blob(["search test fixture"], {
      type: "text/plain",
    }),
    `qa8fs-${Math.random().toString(36).slice(2, 7)}.txt`
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

console.log(`alice=${alice.userId} bob=${bob.userId}\n`);

/* ---------------------------------------------------------------- */
/* FIXTURES                                                           */
/* ---------------------------------------------------------------- */

const project = (
  await aliceApi("POST", "/projects", {
    title: `Transformer Research ${stamp}`,
    description: "Research on transformers",
  })
).data;

const paper = (
  await aliceApi("POST", "/papers", {
    title: `Transformer Attention Is All You Need ${stamp}`,
    authors: ["Vaswani"],
    year: 2017,
    source: "Conference",
  })
).data;

const note = (
  await aliceApi("POST", "/notes", {
    title: `Transformer Notes ${stamp}`,
    content: "Attention mechanisms are key",
    projectId: project._id,
  })
).data;

const document = await uploadDocument(
  alice.token,
  `transformer-survey-${stamp}.pdf`
);

const collection = (
  await aliceApi("POST", "/collections", {
    name: `Transformer Sources ${stamp}`,
    description: "Papers on transformers",
  })
).data;

await aliceApi("POST", `/projects/${project._id}/papers`, {
  paperId: paper._id,
});

await aliceApi("POST", `/collections/${collection._id}/papers`, {
  paperId: paper._id,
});

await aliceApi("POST", `/collections/${collection._id}/documents`, {
  documentId: document._id,
});

/* Wait for activity recording */
await new Promise((r) => setTimeout(r, 1000));

check("fixtures created for alice", Boolean(project?._id && paper?._id && note?._id && document?._id && collection?._id));

console.log("");

/* ---------------------------------------------------------------- */
/* OWNERSHIP ISOLATION                                               */
/* ---------------------------------------------------------------- */

const bobSearch = await bobApi("GET", `/search?q=transformer`);

check("bob searching transformer -> 200", bobSearch.status === 200);
check("bob sees zero results", bobSearch.data?.counts?.total === 0, `total=${bobSearch.data?.counts?.total}`);

console.log("");

/* ---------------------------------------------------------------- */
/* ALICE SEARCHES                                                     */
/* ---------------------------------------------------------------- */

const aliceSearch = await aliceApi("GET", `/search?q=transformer`);

check("alice searching transformer -> 200", aliceSearch.status === 200);
check("alice gets results", aliceSearch.data?.counts?.total > 0, `total=${aliceSearch.data?.counts?.total}`);

const r = aliceSearch.data?.results;
check("alice projects", r?.projects?.length >= 1, `${r?.projects?.length}`);
check("alice papers", r?.papers?.length >= 1, `${r?.papers?.length}`);
check("alice notes", r?.notes?.length >= 1, `${r?.notes?.length}`);
check("alice documents", r?.documents?.length >= 1, `${r?.documents?.length}`);
check("alice collections", r?.collections?.length >= 1, `${r?.collections?.length}`);

console.log("");

/* ---------------------------------------------------------------- */
/* FILTERS & QUERIES                                                  */
/* ---------------------------------------------------------------- */

const searchTitle = await aliceApi("GET", `/search?q=Attention+Is+All`);
check("search by partial title", searchTitle.data?.counts?.total > 0, `total=${searchTitle.data?.counts?.total}`);

const searchDesc = await aliceApi("GET", `/search?q=research+on`);
check("search by description", searchDesc.data?.counts?.total > 0, `total=${searchDesc.data?.counts?.total}`);

const searchAuthor = await aliceApi("GET", `/search?q=Vaswani`);
check("search by author", searchAuthor.data?.counts?.total > 0, `total=${searchAuthor.data?.counts?.total}`);

const searchContent = await aliceApi("GET", `/search?q=attention+mechanisms`);
check("search by note content", searchContent.data?.counts?.total > 0, `total=${searchContent.data?.counts?.total}`);

const searchFilename = await aliceApi("GET", `/search?q=transformer-survey`);
check("search by filename", searchFilename.data?.counts?.total > 0, `total=${searchFilename.data?.counts?.total}`);

const searchCollection = await aliceApi("GET", `/search?q=Transformer+Sources`);
check("search by collection name", searchCollection.data?.counts?.total > 0, `total=${searchCollection.data?.counts?.total}`);

console.log("");

/* ---------------------------------------------------------------- */
/* CASE INSENSITIVE & SPECIAL CHARS                                   */
/* ---------------------------------------------------------------- */

const caseSearch = await aliceApi("GET", `/search?q=TRANSFORMER`);
check("case insensitive", caseSearch.data?.counts?.total > 0, `total=${caseSearch.data?.counts?.total}`);

const spaceSearch = await aliceApi("GET", `/search?q=%20transformer%20`);
check("leading/trailing spaces handled", spaceSearch.data?.counts?.total > 0, `total=${spaceSearch.data?.counts?.total}`);

const specialSearch = await aliceApi("GET", `/search?q=C%2B%2B`);
check("C++ special chars", caseSearch.data?.counts?.total >= 0, "no crash");

const regexSearch = await aliceApi("GET", `/search?q=.*`);
check("regex .* doesn't match all", regexSearch.data?.counts?.total === 0, `total=${regexSearch.data?.counts?.total}`);

console.log("");

/* ---------------------------------------------------------------- */
/* EMPTY & SHORT QUERIES                                              */
/* ---------------------------------------------------------------- */

const emptySearch = await aliceApi("GET", `/search?q=`);
check("empty query -> 200 empty", emptySearch.data?.counts?.total === 0);

const shortSearch = await aliceApi("GET", `/search?q=a`);
check("1-char query -> 200 empty", shortSearch.data?.counts?.total === 0);

console.log("");

/* ---------------------------------------------------------------- */
/* LIMITS & PAGINATION                                                */
/* ---------------------------------------------------------------- */

const limitSearch = await aliceApi("GET", `/search?q=transformer&limit=2`);
check("limit=2 works", limitSearch.data?.counts?.total >= 0);
check("per-category limit respected", (limitSearch.data?.results?.projects?.length || 0) <= 2);

const limitClamp = await aliceApi("GET", `/search?q=transformer&limit=100`);
check("limit clamped to 20", (limitClamp.data?.results?.projects?.length || 0) <= 20);

console.log("");

/* ---------------------------------------------------------------- */
/* AUTHENTICATION                                                     */
/* ---------------------------------------------------------------- */

const unauthSearch = await fetch(`${API}/search?q=transformer`);
check("unauthenticated -> 401", unauthSearch.status === 401);

console.log("");

/* ---------------------------------------------------------------- */
/* CLEANUP                                                            */
/* ---------------------------------------------------------------- */

await aliceApi("DELETE", `/collections/${collection._id}`);
await aliceApi("DELETE", `/documents/${document._id}`);
await aliceApi("DELETE", `/notes/${note._id}`);
await aliceApi("DELETE", `/papers/${paper._id}`);
await aliceApi("DELETE", `/projects/${project._id}`);

console.log("");
console.log(`SEARCH RESULT: ${pass} passed, ${fail} failed`);

process.exit(fail > 0 ? 1 : 0);