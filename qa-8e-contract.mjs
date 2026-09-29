import fs from "node:fs";

/*
 * Phase 8E ownership + cascade contract, run directly
 * against the live API:
 *
 *   node qa-8e-contract.mjs
 *
 * The browser suite (qa-8e-ui.mjs) covers the same rules
 * through the real UI; this script exists so the
 * security-critical assertions can be executed without a
 * browser harness. qa-8e-api.mjs extends it with the
 * cross-user isolation matrix.
 */

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const API = "http://localhost:5000/api/v1";

let passed = 0;
let failed = 0;

const pass = (label, ok, actual = "") => {
  if (ok) passed += 1;
  else failed += 1;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}  (${actual})`
  );
};

const call = async (token, method, path, body) => {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
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

const get = (token, path) =>
  call(token, "GET", path).then((r) => r.data);

const stamp = Date.now().toString();

// ============================================================
// TWO USERS
// ============================================================

const makeUser = async (label) => {
  const email = `qa8e_${label}_${stamp}@example.com`;
  const password = "QaPass123!";

  let res = await call(null, "POST", "/auth/register", {
    name: `QA ${label} ${stamp}`,
    email,
    password,
    academicField: "Computer Science",
    researchInterests: [],
  });

  if (res.status !== 201) {
    res = await call(null, "POST", "/auth/login", {
      email,
      password,
    });
  }

  if (!res.data?.token) {
    throw new Error(
      `could not authenticate user ${label}: ${res.status}`
    );
  }

  return { token: res.data.token, label };
};

const seed = async (user) => {
  const t = user.token;

  const paper = await call(t, "POST", "/papers", {
    title: `QA Contract Paper ${user.label} ${stamp}`,
    authors: ["QA Author"],
    abstract: "Contract fixture.",
    year: 2026,
    source: "QA",
  });

  const collection = await call(
    t,
    "POST",
    "/collections",
    {
      name: `QA Contract Collection ${user.label} ${stamp}`,
      description: "Contract fixture.",
    }
  );

  return {
    paperId: paper.data._id,
    collectionId: collection.data._id,
  };
};

const A = await makeUser("a");
const B = await makeUser("b");

const a = await seed(A);
const b = await seed(B);

console.log(
  `A collection=${a.collectionId} paper=${a.paperId}`
);
console.log(
  `B collection=${b.collectionId} paper=${b.paperId}`
);
console.log("");

// ============================================================
// COLLECTION OWNERSHIP
// ============================================================

console.log("=== COLLECTION OWNERSHIP ===");

pass(
  "A reads own collection -> 200",
  (await call(A.token, "GET", `/collections/${a.collectionId}`))
    .status === 200
);

pass(
  "B reads A's collection -> 404",
  (await call(B.token, "GET", `/collections/${a.collectionId}`))
    .status === 404
);

pass(
  "A reads B's collection -> 404",
  (await call(A.token, "GET", `/collections/${b.collectionId}`))
    .status === 404
);

pass(
  "B patches A's collection -> 404",
  (
    await call(
      B.token,
      "PATCH",
      `/collections/${a.collectionId}`,
      { description: "hijacked" }
    )
  ).status === 404
);

pass(
  "B deletes A's collection -> 404",
  (
    await call(
      B.token,
      "DELETE",
      `/collections/${a.collectionId}`
    )
  ).status === 404
);

pass(
  "A's collection survived the delete attempt",
  (await call(A.token, "GET", `/collections/${a.collectionId}`))
    .status === 200
);

pass(
  "A cannot see B's collection in its list",
  !(await get(A.token, "/collections?archived=all")).some(
    (c) => c._id === b.collectionId
  )
);

pass(
  "B cannot see A's collection in its list",
  !(await get(B.token, "/collections?archived=all")).some(
    (c) => c._id === a.collectionId
  )
);

// Same collection name must remain legal across users.
const sharedName = `QA Shared ${stamp}`;

pass(
  "A creates shared name",
  (await call(A.token, "POST", "/collections", {
    name: sharedName,
  })).status === 201
);

pass(
  "A cannot create it twice -> 409",
  (await call(A.token, "POST", "/collections", {
    name: sharedName,
  })).status === 409
);

pass(
  "B may use the same name",
  (await call(B.token, "POST", "/collections", {
    name: sharedName,
  })).status === 201
);

// ============================================================
// RELATIONSHIP OWNERSHIP MATRIX
// ============================================================

console.log("");
console.log("=== RELATIONSHIP MATRIX ===");

const addPaper = (t, collectionId, paperId) =>
  call(t, "POST", `/collections/${collectionId}/papers`, {
    paperId,
  }).then((r) => r.status);

const delPaper = (t, collectionId, paperId) =>
  call(
    t,
    "DELETE",
    `/collections/${collectionId}/papers/${paperId}`
  ).then((r) => r.status);

pass("Collection A + Paper A -> 200", (await addPaper(A.token, a.collectionId, a.paperId)) === 200);
pass("Collection A + Paper B -> 404", (await addPaper(A.token, a.collectionId, b.paperId)) === 404);
pass("Collection B + Paper A -> 404", (await addPaper(B.token, b.collectionId, a.paperId)) === 404);
pass("Collection B + Paper B -> 200", (await addPaper(B.token, b.collectionId, b.paperId)) === 200);

pass("Duplicate Paper A -> 409", (await addPaper(A.token, a.collectionId, a.paperId)) === 409);
pass("Duplicate Paper B -> 409", (await addPaper(B.token, b.collectionId, b.paperId)) === 409);

pass("Remove unattached paper -> 404", (await delPaper(A.token, a.collectionId, b.paperId)) === 404);
pass("Remove attached paper -> 200", (await delPaper(A.token, a.collectionId, a.paperId)) === 200);
pass("Remove same paper twice -> 404", (await delPaper(A.token, a.collectionId, a.paperId)) === 404);

pass(
  "B's collection still holds only its own paper",
  (
    (
      await get(
        B.token,
        `/collections/${b.collectionId}`
      )
    ).paperIds?.length ?? -1
  ) === 1
);

pass(
  "Re-add after remove -> 200",
  (await addPaper(A.token, a.collectionId, a.paperId)) === 200
);

// A malformed id must never surface as a 500.
pass(
  "malformed collection id -> 404",
  (await call(A.token, "GET", "/collections/abc")).status ===
    404
);

pass(
  "malformed paper id on add -> 404",
  (
    await call(A.token, "POST", `/collections/${a.collectionId}/papers`, {
      paperId: "abc",
    })
  ).status === 404
);

// ============================================================
// CASCADE: DELETE PAPER
// ============================================================

console.log("");
console.log("=== CASCADE: DELETE PAPER ===");

const project = await call(A.token, "POST", "/projects", {
  title: `QA Contract Project ${stamp}`,
  description: "Cascade fixture.",
  researchQuestion: "Does the cascade hold?",
  status: "Active",
});

const note = await call(A.token, "POST", "/notes", {
  title: `QA Contract Note ${stamp}`,
  content: "Cascade fixture.",
});

const projectId = project.data._id;
const noteId = note.data._id;

await call(A.token, "POST", `/projects/${projectId}/papers`, {
  paperId: a.paperId,
});

await call(A.token, "PATCH", `/notes/${noteId}`, {
  paperId: a.paperId,
});

const seededProject = (
  await get(A.token, `/projects/${projectId}`)
).paperIds?.length;

const seededNote = (
  await get(A.token, `/notes/${noteId}`)
).paperId?._id;

pass("project holds the paper before delete", seededProject === 1, seededProject);
pass("note is bound to the paper before delete", seededNote === a.paperId, seededNote);

const delPaperStatus = (
  await call(A.token, "DELETE", `/papers/${a.paperId}`)
).status;

pass("delete paper -> 200", delPaperStatus === 200, delPaperStatus);
pass("paper is gone", (await call(A.token, "GET", `/papers/${a.paperId}`)).status === 404);

const afterCollection = await get(
  A.token,
  `/collections/${a.collectionId}`
);

pass(
  "Collection.paperIds pulled",
  afterCollection.paperIds?.length === 0,
  afterCollection.paperIds?.length
);

pass(
  "Collection.paperCount now 0",
  afterCollection.paperCount === 0,
  afterCollection.paperCount
);

const afterProject = await get(
  A.token,
  `/projects/${projectId}`
);

pass(
  "Project.paperIds pulled",
  afterProject.paperIds?.length === 0,
  afterProject.paperIds?.length
);

const afterNote = await get(A.token, `/notes/${noteId}`);

pass("note survives", Boolean(afterNote?._id));
pass(
  "Note.paperId cleared",
  afterNote.paperId === null,
  JSON.stringify(afterNote.paperId)
);

// ============================================================
// CASCADE: DELETE COLLECTION
// ============================================================

console.log("");
console.log("=== CASCADE: DELETE COLLECTION ===");

const survivorPaper = (
  await call(A.token, "POST", "/papers", {
    title: `QA Survivor ${stamp}`,
    authors: ["QA"],
    year: 2026,
    source: "QA",
  })
).data;

await call(
  A.token,
  "POST",
  `/collections/${a.collectionId}/papers`,
  { paperId: survivorPaper._id }
);

pass(
  "delete collection -> 200",
  (await call(A.token, "DELETE", `/collections/${a.collectionId}`))
    .status === 200
);

pass(
  "collection is gone",
  (await call(A.token, "GET", `/collections/${a.collectionId}`))
    .status === 404
);

pass(
  "contained paper survives",
  (await call(A.token, "GET", `/papers/${survivorPaper._id}`))
    .status === 200
);

pass(
  "contained paper still listed in library",
  (await get(A.token, "/papers")).some(
    (p) => p._id === survivorPaper._id
  )
);

pass(
  "project untouched",
  Boolean(
    (await get(A.token, `/projects/${projectId}`))?._id
  )
);

pass(
  "note untouched",
  Boolean((await get(A.token, `/notes/${noteId}`))?._id)
);

// ============================================================
// CASCADE: DELETE DOCUMENT
// ============================================================

console.log("");
console.log("=== CASCADE: DELETE DOCUMENT ===");

const form = new FormData();

form.append(
  "file",
  new Blob(["contract fixture"], { type: "text/plain" }),
  `qa-contract-${stamp}.txt`
);
form.append("title", `QA Contract Doc ${stamp}`);

const upload = await fetch(API + "/documents", {
  method: "POST",
  headers: { Authorization: "Bearer " + A.token },
  body: form,
});

const uploaded = (await upload.json())?.data;

if (!uploaded?._id) {
  pass("document uploaded", false, upload.status);
} else {
  pass("document uploaded", true, uploaded.title);

  const docCollection = (
    await call(A.token, "POST", "/collections", {
      name: `QA Doc Collection ${stamp}`,
    })
  ).data;

  pass(
    "add own document -> 200",
    (
      await call(
        A.token,
        "POST",
        `/collections/${docCollection._id}/documents`,
        { documentId: uploaded._id }
      )
    ).status === 200
  );

  pass(
    "duplicate document -> 409",
    (
      await call(
        A.token,
        "POST",
        `/collections/${docCollection._id}/documents`,
        { documentId: uploaded._id }
      )
    ).status === 409
  );

  pass(
    "add unknown document -> 404",
    (
      await call(
        A.token,
        "POST",
        `/collections/${docCollection._id}/documents`,
        { documentId: "000000000000000000000000" }
      )
    ).status === 404
  );

  const docNote = (
    await call(A.token, "POST", "/notes", {
      title: `QA Doc Note ${stamp}`,
      content: "Document cascade fixture.",
    })
  ).data;

  await call(A.token, "PATCH", `/notes/${docNote._id}`, {
    documentId: uploaded._id,
  });

  const seededDocCollection = await get(
    A.token,
    `/collections/${docCollection._id}`
  );

  pass(
    "Collection.documentIds populated",
    seededDocCollection.documentIds?.length === 1,
    seededDocCollection.documentIds?.length
  );

  pass(
    "delete document -> 200",
    (await call(A.token, "DELETE", `/documents/${uploaded._id}`))
      .status === 200
  );

  pass(
    "document gone -> 404",
    (await call(A.token, "GET", `/documents/${uploaded._id}`))
      .status === 404
  );

  const afterDocCollection = await get(
    A.token,
    `/collections/${docCollection._id}`
  );

  pass(
    "collection survives document delete",
    Boolean(afterDocCollection?._id)
  );

  pass(
    "Collection.documentIds pulled",
    afterDocCollection.documentIds?.length === 0,
    afterDocCollection.documentIds?.length
  );

  const afterDocNote = await get(
    A.token,
    `/notes/${docNote._id}`
  );

  pass("note survives", Boolean(afterDocNote?._id));
  pass(
    "Note.documentId cleared",
    afterDocNote.documentId === null,
    JSON.stringify(afterDocNote.documentId)
  );

  await call(A.token, "DELETE", `/notes/${docNote._id}`);
  await call(A.token, "DELETE", `/collections/${docCollection._id}`);
}

// ============================================================
// CLEANUP
// ============================================================

const cleanup = async (user, ids) => {
  for (const id of ids) {
    await call(user.token, "DELETE", `/papers/${id}`);
    await call(user.token, "DELETE", `/collections/${id}`);
    await call(user.token, "DELETE", `/notes/${id}`);
  }
};

await cleanup(A, [
  a.collectionId,
  a.paperId,
  projectId,
  noteId,
  survivorPaper._id,
]);

await cleanup(B, [b.collectionId, b.paperId]);

console.log("");
console.log(
  `RESULT: ${passed} passed, ${failed} failed`
);

process.exit(failed > 0 ? 1 : 0);
