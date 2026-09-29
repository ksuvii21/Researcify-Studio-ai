import fs from "node:fs";

/*
 * Phase 8E.5 - 8E.6 Collections ownership matrix.
 *
 * Two real users are created, each with their own
 * collection, paper and document. Every cross-user
 * combination is then attempted. The rule under test is
 * uniform: a resource that is not the caller's is a 404,
 * never a 403, so the response never reveals whether an
 * id exists at all.
 */

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const API = "http://localhost:5000/api/v1";

export default async function run(page) {
  const log = [];
  const say = (m) => log.push(m);

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const failed = [];
  page.on("requestfailed", (r) =>
    failed.push(`${r.failure()?.errorText} ${r.url()}`)
  );

  await page.goto("http://localhost:5173/", {
    waitUntil: "load",
  });
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  // ============ SETUP: two users, each fully provisioned ============

  const setup = await page.evaluate(async (api) => {
    const stamp = Date.now().toString();

    const anon = () => ({
      "Content-Type": "application/json",
    });

    const auth = (t) => ({
      Authorization: "Bearer " + t,
      "Content-Type": "application/json",
    });

    const json = async (res) => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    };

    const makeUser = async (label) => {
      const email = `qa8e_${label}_${stamp}@example.com`;

      const registered = await json(
        await fetch(api + "/auth/register", {
          method: "POST",
          headers: anon(),
          body: JSON.stringify({
            name: `QA ${label} ${stamp}`,
            email,
            password: "QaPass123!",
            academicField: "Computer Science",
            researchInterests: [],
          }),
        })
      );

      let token = registered?.data?.token;

      if (!token) {
        const loggedIn = await json(
          await fetch(api + "/auth/login", {
            method: "POST",
            headers: anon(),
            body: JSON.stringify({
              email,
              password: "QaPass123!",
            }),
          })
        );

        token = loggedIn?.data?.token;
      }

      if (!token) {
        return { error: "could not authenticate" };
      }

      return { token, userId: registered?.data?.user?._id };
    };

    const userA = await makeUser("a");
    const userB = await makeUser("b");

    if (!userA.token || !userB.token) {
      return { error: "registration failed" };
    }

    const seed = async (token, label) => {
      const h = auth(token);

      const paper = await json(
        await fetch(api + "/papers", {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            title: `QA Paper ${label} ${stamp}`,
            authors: ["QA Author"],
            abstract: "Ownership fixture.",
            year: 2026,
            source: "QA",
          }),
        })
      );

      const collection = await json(
        await fetch(api + "/collections", {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            name: `QA Collection ${label} ${stamp}`,
            description: "Ownership fixture.",
          }),
        })
      );

      return {
        paperId: paper?.data?._id,
        collectionId: collection?.data?._id,
      };
    };

    const a = await seed(userA.token, "A");
    const b = await seed(userB.token, "B");

    return {
      A: { ...userA, ...a },
      B: { ...userB, ...b },
    };
  }, API);

  if (setup.error) {
    say(`SETUP FAILED: ${setup.error}`);

    return {
      steps: log,
      consoleErrors,
      failedRequests: failed,
    };
  }

  say(
    `A collection=${setup.A.collectionId} paper=${setup.A.paperId}`
  );
  say(
    `B collection=${setup.B.collectionId} paper=${setup.B.paperId}`
  );

  // ============ DOCUMENT FIXTURES ============
  /*
   * Uploading requires multipart and a real file, so the
   * document half of the matrix is covered separately by
   * qa-8e-cascade.mjs. Here the paper half and the
   * collection-level ownership rules are exercised.
   */

  // ============ OWNERSHIP MATRIX ============

  const matrix = await page.evaluate(
    async ([api, a, b]) => {
      const auth = (t) => ({
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      });

      const call = async (token, method, path, body) => {
        const res = await fetch(api + path, {
          method,
          headers: auth(token),
          body: body
            ? JSON.stringify(body)
            : undefined,
        });

        return res.status;
      };

      const out = {};

      // --- direct collection access ---
      out.aGetA = await call(
        a.token,
        "GET",
        `/collections/${a.collectionId}`
      );
      out.bGetA = await call(
        b.token,
        "GET",
        `/collections/${a.collectionId}`
      );
      out.bPatchA = await call(
        b.token,
        "PATCH",
        `/collections/${a.collectionId}`,
        { description: "hijacked" }
      );
      out.aGetB = await call(
        a.token,
        "GET",
        `/collections/${b.collectionId}`
      );

      out.bDeleteA = await call(
        b.token,
        "DELETE",
        `/collections/${a.collectionId}`
      );

      // B's collection must still exist afterwards.
      out.bStillExistsAfter =
        out.bDeleteA === 404 &&
        (await call(
          b.token,
          "GET",
          `/collections/${b.collectionId}`
        )) === 200;

      // --- paper relationship matrix ---
      out.A_A = await call(
        a.token,
        "POST",
        `/collections/${a.collectionId}/papers`,
        { paperId: a.paperId }
      );
      out.A_B = await call(
        a.token,
        "POST",
        `/collections/${a.collectionId}/papers`,
        { paperId: b.paperId }
      );
      out.B_A = await call(
        b.token,
        "POST",
        `/collections/${b.collectionId}/papers`,
        { paperId: a.paperId }
      );
      out.B_B = await call(
        b.token,
        "POST",
        `/collections/${b.collectionId}/papers`,
        { paperId: b.paperId }
      );

      // --- duplicates ---
      out.dupA = await call(
        a.token,
        "POST",
        `/collections/${a.collectionId}/papers`,
        { paperId: a.paperId }
      );
      out.dupB = await call(
        b.token,
        "POST",
        `/collections/${b.collectionId}/papers`,
        { paperId: b.paperId }
      );

      // --- remove semantics ---
      out.removeUnattached = await call(
        a.token,
        "DELETE",
        `/collections/${a.collectionId}/papers/${b.paperId}`
      );
      out.removeAttached = await call(
        a.token,
        "DELETE",
        `/collections/${a.collectionId}/papers/${a.paperId}`
      );
      out.removeTwice = await call(
        a.token,
        "DELETE",
        `/collections/${a.collectionId}/papers/${a.paperId}`
      );

      // --- B must not have gained A's paper via the failed calls ---
      const bCollections = await (
        await fetch(
          api + "/collections?archived=all",
          { headers: auth(b.token) }
        )
      ).json();

      out.bCollectionPapers =
        bCollections.data?.find(
          (c) => c._id === b.collectionId
        )?.paperIds?.length ?? -1;

      // --- list isolation ---
      out.aListLength = (
        await (
          await fetch(api + "/collections", {
            headers: auth(a.token),
          })
        ).json()
      ).data.length;

      out.aSeesB = (
        await (
          await fetch(api + "/collections?archived=all", {
            headers: auth(a.token),
          })
        )
      ).data.some(
        (c) => c._id === b.collectionId
      );

      out.bSeesA = (
        await (
          await fetch(api + "/collections?archived=all", {
            headers: auth(b.token),
          })
        )
      ).data.some(
        (c) => c._id === a.collectionId
      );

      // --- same collection name is legal for two users ---
      const shared = `QA Shared ${stamp}`;
      await call(a.token, "POST", "/collections", {
        name: shared,
      });
      out.sameNameBothUsers =
        (await call(
          a.token,
          "POST",
          "/collections",
          { name: shared }
        )) === 409 &&
        (await call(
          b.token,
          "POST",
          "/collections",
          { name: shared }
        )) === 201;

      // --- paper ownership still enforced after removal ---
      out.readdAfterRemove = await call(
        a.token,
        "POST",
        `/collections/${a.collectionId}/papers`,
        { paperId: a.paperId }
      );

      return out;
    },
    [API, setup.A, setup.B]
  );

  const expectations = [
    ["A reads own collection -> 200", matrix.aGetA === 200, matrix.aGetA],
    ["B reads A's collection -> 404", matrix.bGetA === 404, matrix.bGetA],
    ["B patches A's collection -> 404", matrix.bPatchA === 404, matrix.bPatchA],
    ["A reads B's collection -> 404", matrix.aGetB === 404, matrix.aGetB],
    ["B deletes A's collection -> 404", matrix.bDeleteA === 404, matrix.bDeleteA],
    ["B's collection survived the attempt", matrix.bStillExistsAfter, "-"],

    ["Collection A + Paper A -> 200", matrix.A_A === 200, matrix.A_A],
    ["Collection A + Paper B -> 404", matrix.A_B === 404, matrix.A_B],
    ["Collection B + Paper A -> 404", matrix.B_A === 404, matrix.B_A],
    ["Collection B + Paper B -> 200", matrix.B_B === 200, matrix.B_B],

    ["Duplicate Paper A -> 409", matrix.dupA === 409, matrix.dupA],
    ["Duplicate Paper B -> 409", matrix.dupB === 409, matrix.dupB],

    ["Remove unattached paper -> 404", matrix.removeUnattached === 404, matrix.removeUnattached],
    ["Remove attached paper -> 200", matrix.removeAttached === 200, matrix.removeAttached],
    ["Remove same paper twice -> 404", matrix.removeTwice === 404, matrix.removeTwice],

    ["B holds exactly its own paper", matrix.bCollectionPapers === 1, matrix.bCollectionPapers],
    ["A cannot see B's collection", matrix.aSeesB === false, matrix.aSeesB],
    ["B cannot see A's collection", matrix.bSeesA === false, matrix.bSeesA],
    ["Same name allowed across users", matrix.sameNameBothUsers, "-"],
    ["Re-add after remove -> 200", matrix.readdAfterRemove === 200, matrix.readdAfterRemove],
  ];

  say("");
  say("=== OWNERSHIP MATRIX ===");

  expectations.forEach(([name, ok, actual]) => {
    say(`${ok ? "PASS" : "FAIL"}  ${name}  (got ${actual})`);
  });

  // ============ CLEANUP ============

  await page.evaluate(
    async ([api, a, b]) => {
      const drop = async (token, ids) => {
        for (const id of ids) {
          await fetch(api + "/collections/" + id, {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
            },
          });

          await fetch(api + "/papers/" + id, {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
            },
          });
        }
      };

      await drop(a.token, [a.collectionId, a.paperId]);
      await drop(b.token, [b.collectionId, b.paperId]);
    },
    [API, setup.A, setup.B]
  );

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
  };
}
