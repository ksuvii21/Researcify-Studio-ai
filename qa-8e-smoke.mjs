import fs from "node:fs";

/*
 * Quick non-browser smoke test for the Collections API.
 * Run directly:  node qa-8e-smoke.mjs
 *
 * Uses the token left behind by an earlier QA run, so it
 * verifies the live server and MongoDB without needing the
 * Playwright harness.
 */

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const API = "http://localhost:5000/api/v1";

const h = {
  Authorization: "Bearer " + TOKEN,
  "Content-Type": "application/json",
};

const call = async (method, path, body) => {
  const res = await fetch(API + path, {
    method,
    headers: h,
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

const pass = (label, ok, actual = "") =>
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}  (${actual})`
  );

const stamp = Date.now().toString().slice(-8);
const name = `Smoke ${stamp}`;

const created = await call("POST", "/collections", {
  name,
  description: "Smoke test.",
});

pass("create -> 201", created.status === 201, created.status);

const id = created.data?._id;

pass(
  "counts start at 0/0",
  created.data?.paperCount === 0 &&
    created.data?.documentCount === 0,
  `${created.data?.paperCount}/${created.data?.documentCount}`
);

pass(
  "duplicate same name -> 409",
  (await call("POST", "/collections", { name })).status ===
    409
);

pass(
  "duplicate other casing -> 409",
  (await call("POST", "/collections", {
    name: name.toUpperCase(),
  })).status === 409
);

pass(
  "missing name -> 400",
  (await call("POST", "/collections", {
    description: "x",
  })).status === 400
);

const list = await call(
  "GET",
  "/collections?archived=all"
);
pass(
  "list contains it",
  list.data?.some((c) => c._id === id)
);

const search = await call(
  "GET",
  `/collections?search=${encodeURIComponent(name)}`
);
pass(
  "search exact",
  search.data?.length === 1 &&
    search.data[0]._id === id,
  search.data?.length
);

pass(
  "malformed id -> 404",
  (await call("GET", "/collections/nope")).status === 404
);

// --- with a real paper ---
const paper = await call("POST", "/papers", {
  title: `Smoke Paper ${stamp}`,
  authors: ["QA"],
  year: 2026,
  source: "QA",
});

const paperId = paper.data?._id;

pass(
  "add own paper -> 200",
  (
    await call("POST", `/collections/${id}/papers`, {
      paperId,
    })
  ).status === 200
);

pass(
  "duplicate paper -> 409",
  (
    await call("POST", `/collections/${id}/papers`, {
      paperId,
    })
  ).status === 409
);

pass(
  "add unknown paper -> 404",
  (
    await call("POST", `/collections/${id}/papers`, {
      paperId: "000000000000000000000000",
    })
  ).status === 404
);

const detail = await call("GET", `/collections/${id}`);

pass(
  "detail populates the paper",
  Array.isArray(detail.data?.paperIds) &&
    detail.data.paperIds[0]?._id === paperId,
  detail.data?.paperIds?.[0]?.title
);

pass(
  "paperCount reflects relationship",
  detail.data?.paperCount === 1,
  detail.data?.paperCount
);

pass(
  "remove paper -> 200",
  (
    await call(
      "DELETE",
      `/collections/${id}/papers/${paperId}`
    )
  ).status === 200
);

pass(
  "remove again -> 404",
  (
    await call(
      "DELETE",
      `/collections/${id}/papers/${paperId}`
    )
  ).status === 404
);

// --- archive visibility ---
await call("PATCH", `/collections/${id}/archive`);

pass(
  "hidden by default",
  !(await call("GET", "/collections")).data?.some(
    (c) => c._id === id
  )
);

pass(
  "?archived=true shows it",
  (await call("GET", "/collections?archived=true"))
    .data?.some((c) => c._id === id)
);

pass(
  "?archived=all shows it",
  (await call("GET", "/collections?archived=all"))
    .data?.some((c) => c._id === id)
);

await call("PATCH", `/collections/${id}/archive`);

pass(
  "unarchive restores visibility",
  (await call("GET", "/collections")).data?.some(
    (c) => c._id === id
  )
);

// --- PATCH cannot smuggle relationships ---
const smuggled = await call(
  "PATCH",
  `/collections/${id}`,
  { paperIds: [paperId], userId: "000000000000000000000000" }
);

pass(
  "PATCH cannot write paperIds",
  !smuggled.data?.paperIds?.length,
  smuggled.data?.paperIds?.length
);

// --- delete leaves the paper alone ---
pass("delete -> 200", (await call("DELETE", `/collections/${id}`)).status === 200);

pass(
  "collection gone",
  (await call("GET", `/collections/${id}`)).status === 404
);

pass(
  "paper survives collection delete",
  (await call("GET", `/papers/${paperId}`)).status === 200
);

await call("DELETE", `/papers/${paperId}`);

console.log("\nSmoke run complete.");
