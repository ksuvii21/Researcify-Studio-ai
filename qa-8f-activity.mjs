/*
 * Phase 8F Activity API smoke test.
 *
 * Verifies the activity endpoint works, records correctly,
 * and respects ownership.
 *
 *   node qa-8f-activity.mjs
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
  const email = `qa8f_${label}_${Date.now()}_${Math.random()
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
    new Blob(["activity test fixture"], {
      type: "text/plain",
    }),
    `qa8f-${Math.random().toString(36).slice(2, 7)}.txt`
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
    title: `QA Activity Project ${stamp}`,
    description: "activity test",
  })
).data;

const paper = (
  await aliceApi("POST", "/papers", {
    title: `QA Activity Paper ${stamp}`,
    authors: ["QA"],
    year: 2026,
    source: "QA",
  })
).data;

const note = (
  await aliceApi("POST", "/notes", {
    title: `QA Activity Note ${stamp}`,
    content: "test",
    projectId: project._id,
  })
).data;

const document = await uploadDocument(
  alice.token,
  `QA Activity Doc ${stamp}`
);

const collection = (
  await aliceApi("POST", "/collections", {
    name: `QA Activity Collection ${stamp}`,
    description: "activity test",
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

/* Wait longer for async activity recording */
await new Promise((r) => setTimeout(r, 2000));

check("fixtures created for alice", Boolean(project?._id && paper?._id && note?._id && document?._id && collection?._id));

/* ---------------------------------------------------------------- */
/* GET ACTIVITIES - BASIC                                              */
/* ---------------------------------------------------------------- */

const allActivities = await aliceApi("GET", "/activities");

check("GET /activities -> 200", allActivities.status === 200, `HTTP ${allActivities.status}`);

check("returns activities array", Array.isArray(allActivities.data?.activities));

check("has pagination", Boolean(allActivities.data?.pagination));

check("activities newest first", allActivities.data?.activities?.[0]?.createdAt > allActivities.data?.activities?.[1]?.createdAt, "ordering");

console.log("");

/* ---------------------------------------------------------------- */
/* ACTION TYPES PRESENT                                               */
/* ---------------------------------------------------------------- */

const actions = new Set(
  (allActivities.data?.activities || []).map((a) => a.action)
);

const expected = [
  "project.created",
  "paper.saved",
  "note.created",
  "document.uploaded",
  "collection.created",
  "paper.added_to_project",
  "paper.added_to_collection",
  "document.added_to_collection",
];

for (const exp of expected) {
  check(
    `action ${exp} recorded`,
    actions.has(exp),
    `found: ${Array.from(actions).join(", ")}`
  );
}

console.log("");

/* ---------------------------------------------------------------- */
/* PROJECT-SCOPED QUERY                                               */
/* ---------------------------------------------------------------- */

const projectActivities = await aliceApi("GET", `/activities?projectId=${project._id}`);

check("project-scoped -> 200", projectActivities.status === 200);

const projectActions = new Set(
  (projectActivities.data?.activities || []).map((a) => a.action)
);

check(
  "project activities include project.created",
  projectActions.has("project.created")
);

check(
  "project activities include paper.added_to_project",
  projectActions.has("paper.added_to_project")
);

console.log("");

/* ---------------------------------------------------------------- */
/* FILTERS                                                            */
/* ---------------------------------------------------------------- */

const paperActivities = await aliceApi("GET", "/activities?entityType=paper");

check("entityType=paper filter works", Array.isArray(paperActivities.data?.activities));

const allPaperActs = paperActivities.data?.activities || [];
const allArePapers = allPaperActs.every((a) => a.entityType === "paper");

check("entityType filter enforced", allArePapers);

const page2 = await aliceApi("GET", "/activities?page=2&limit=5");

check("page=2 works", page2.status === 200);

const limit100 = await aliceApi("GET", "/activities?limit=200");

check("limit clamped to 100", limit100.data?.pagination?.limit === 100);

const invalidPage = await aliceApi("GET", "/activities?page=0");

check("invalid page clamps to 1", invalidPage.data?.pagination?.page === 1);

console.log("");

/* ---------------------------------------------------------------- */
/* OWNERSHIP                                                           */
/* ---------------------------------------------------------------- */

const bobSeesAlice = await bobApi("GET", "/activities");

check("bob cannot see alice's activities", bobSeesAlice.data?.activities?.length === 0, `${bobSeesAlice.data?.activities?.length || 0} activities`);

const bobProjectQuery = await bobApi("GET", `/activities?projectId=${project._id}`);

check("bob querying alice's project -> 200 empty", bobProjectQuery.data?.activities?.length === 0, `HTTP ${bobProjectQuery.status}`);

/* ---------------------------------------------------------------- */
/* NO note.updated SPAM                                              */
/* ---------------------------------------------------------------- */

await aliceApi("PATCH", `/notes/${note._id}`, { content: "edit 1" });
await aliceApi("PATCH", `/notes/${note._id}`, { content: "edit 2" });
await aliceApi("PATCH", `/notes/${note._id}`, { content: "edit 3" });

await new Promise((r) => setTimeout(r, 1000));

const afterEdits = await aliceApi("GET", "/activities?action=note.updated");

check("no note.updated on edits", afterEdits.data?.activities?.length === 0, `${afterEdits.data?.activities?.length || 0} note.updated events`);

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
console.log(`ACTIVITY RESULT: ${pass} passed, ${fail} failed`);

process.exit(fail > 0 ? 1 : 0);