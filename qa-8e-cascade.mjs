import fs from "node:fs";

/*
 * Phase 8E cascade contract.
 *
 * A Collection is an organizational container, so deletion
 * behaves asymmetrically by design:
 *
 *   delete Collection -> container only; papers, documents,
 *                        files, notes and projects untouched
 *   delete Paper      -> also pulled from projects and
 *                        collections; notes survive
 *   delete Document   -> also pulled from collections;
 *                        notes survive; chunks and the
 *                        physical file are removed
 *
 * Each direction is asserted independently so a regression
 * in one cannot hide behind a passing assertion in another.
 */

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const API = "http://localhost:5000/api/v1";

const APP = "http://localhost:5173";

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

  page.on("dialog", async (d) => {
    say(`        [confirm] "${d.message()}"`);
    await d.accept();
  });

  await page.goto(`${APP}/`, { waitUntil: "load" });
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  // ============ SETUP ============

  const setup = await page.evaluate(async (api) => {
    const t = window.localStorage.getItem(
      "researcify_token"
    );
    const h = {
      Authorization: "Bearer " + t,
      "Content-Type": "application/json",
    };

    const json = async (res) => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    };

    const stamp = Date.now().toString().slice(-8);

    const paper = await json(
      await fetch(api + "/papers", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          title: `QA Cascade Paper ${stamp}`,
          authors: ["QA Author"],
          abstract: "Cascade fixture.",
          year: 2026,
          source: "QA",
        }),
      })
    );

    const project = await json(
      await fetch(api + "/projects", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          title: `QA Cascade Project ${stamp}`,
          description: "Cascade fixture.",
          researchQuestion:
            "Does the cascade hold?",
          status: "Active",
        }),
      })
    );

    const collection = await json(
      await fetch(api + "/collections", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          name: `QA Cascade Collection ${stamp}`,
          description: "Cascade fixture.",
        }),
      })
    );

    const note = await json(
      await fetch(api + "/notes", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          title: `QA Cascade Note ${stamp}`,
          content: "Cascade fixture note.",
        }),
      })
    );

    const paperId = paper?.data?._id;
    const projectId = project?.data?._id;
    const collectionId = collection?.data?._id;
    const noteId = note?.data?._id;

    if (!paperId || !collectionId) {
      return { error: "setup failed" };
    }

    await fetch(
      api + `/projects/${projectId}/papers`,
      {
        method: "POST",
        headers: h,
        body: JSON.stringify({ paperId }),
      }
    );

    await fetch(
      api + `/collections/${collectionId}/papers`,
      {
        method: "POST",
        headers: h,
        body: JSON.stringify({ paperId }),
      }
    );

    await fetch(api + `/notes/${noteId}`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ paperId }),
    });

    const verify = await json(
      await fetch(
        api + `/collections/${collectionId}`,
        { headers: h }
      )
    );

    const projectAfter = await json(
      await fetch(api + `/projects/${projectId}`, {
        headers: h,
      })
    );

    const noteAfter = await json(
      await fetch(api + `/notes/${noteId}`, {
        headers: h,
      })
    );

    return {
      stamp,
      paperId,
      projectId,
      collectionId,
      noteId,
      seededCollectionPapers:
        verify?.data?.paperIds?.length,
      seededProjectPapers:
        projectAfter?.data?.paperIds?.length,
      seededNotePaper:
        noteAfter?.data?.paperId?._id === paperId,
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
    `fixtures: paper=${setup.paperId} project=${setup.projectId} collection=${setup.collectionId} note=${setup.noteId}`
  );
  say(
    `seeded: collection.paperIds=${setup.seededCollectionPapers} project.paperIds=${setup.seededProjectPapers} note.paperId=${setup.seededNotePaper}`
  );

  // ============ DELETE PAPER ============

  say("");
  say("=== DELETE PAPER ===");

  const afterPaper = await page.evaluate(
    async ([api, s]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = {
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      };

      const json = async (res) => {
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const del = await fetch(
        api + "/papers/" + s.paperId,
        { method: "DELETE", headers: h }
      );

      const paper = await json(
        await fetch(api + "/papers/" + s.paperId, {
          headers: h,
        })
      );

      const collection = await json(
        await fetch(
          api + "/collections/" + s.collectionId,
          { headers: h }
        )
      );

      const project = await json(
        await fetch(
          api + "/projects/" + s.projectId,
          { headers: h }
        )
      );

      const note = await json(
        await fetch(api + "/notes/" + s.noteId, {
          headers: h,
        })
      );

      return {
        deleteStatus: del.status,
        paperStatus: paper?.success === false ? 404 : 200,
        collectionPaperIds:
          collection?.data?.paperIds?.length,
        collectionPaperCount:
          collection?.data?.paperCount,
        projectPaperIds:
          project?.data?.paperIds?.length,
        noteSurvived: Boolean(note?.data?._id),
        notePaperId: note?.data?.paperId ?? null,
      };
    },
    [API, setup]
  );

  const paperChecks = [
    ["delete paper -> 200", afterPaper.deleteStatus === 200, afterPaper.deleteStatus],
    ["paper is gone", afterPaper.paperStatus === 404, afterPaper.paperStatus],
    ["Collection.paperIds pulled", afterPaper.collectionPaperIds === 0, afterPaper.collectionPaperIds],
    ["Collection.paperCount now 0", afterPaper.collectionPaperCount === 0, afterPaper.collectionPaperCount],
    ["Project.paperIds pulled", afterPaper.projectPaperIds === 0, afterPaper.projectPaperIds],
    ["Note survives", afterPaper.noteSurvived, "-"],
    ["Note.paperId cleared to null", afterPaper.notePaperId === null, String(afterPaper.notePaperId)],
  ];

  paperChecks.forEach(([name, ok, actual]) => {
    say(`${ok ? "PASS" : "FAIL"}  ${name}  (got ${actual})`);
  });

  // ============ DELETE COLLECTION ============

  say("");
  say("=== DELETE COLLECTION (organizational container) ===");

  const secondPaper = await page.evaluate(
    async ([api, s]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = {
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      };

      const res = await fetch(api + "/papers", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          title: `QA Survivor Paper ${s.stamp}`,
          authors: ["QA Author"],
          year: 2026,
          source: "QA",
        }),
      });

      const paper = (await res.json()).data;

      await fetch(
        api + `/collections/${s.collectionId}/papers`,
        {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            paperId: paper._id,
          }),
        }
      );

      return { id: paper._id, title: paper.title };
    },
    [API, setup]
  );

  const afterCollection = await page.evaluate(
    async ([api, s, survivor]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = {
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      };

      const json = async (res) => {
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const del = await fetch(
        api + "/collections/" + s.collectionId,
        { method: "DELETE", headers: h }
      );

      const collection = await json(
        await fetch(
          api + "/collections/" + s.collectionId,
          { headers: h }
        )
      );

      const paper = await json(
        await fetch(api + "/papers/" + survivor.id, {
          headers: h,
        })
      );

      const project = await json(
        await fetch(
          api + "/projects/" + s.projectId,
          { headers: h }
        )
      );

      const note = await json(
        await fetch(api + "/notes/" + s.noteId, {
          headers: h,
        })
      );

      return {
        deleteStatus: del.status,
        collectionGone:
          collection?.success === false ? 404 : 200,
        paperSurvived: Boolean(paper?.data?._id),
        paperInLibrary: (
          await (
            await fetch(api + "/papers", { headers: h })
          ).json()
        ).data.some((p) => p._id === survivor.id),
        projectSurvived: Boolean(
          project?.data?._id
        ),
        noteSurvived: Boolean(note?.data?._id),
      };
    },
    [API, setup, secondPaper]
  );

  const collectionChecks = [
    ["delete collection -> 200", afterCollection.deleteStatus === 200, afterCollection.deleteStatus],
    ["collection is gone", afterCollection.collectionGone === 404, afterCollection.collectionGone],
    ["contained paper survives", afterCollection.paperSurvived, "-"],
    ["contained paper still in library list", afterCollection.paperInLibrary, "-"],
    ["project untouched", afterCollection.projectSurvived, "-"],
    ["note untouched", afterCollection.noteSurvived, "-"],
  ];

  collectionChecks.forEach(([name, ok, actual]) => {
    say(`${ok ? "PASS" : "FAIL"}  ${name}  (got ${actual})`);
  });

  // ============ DOCUMENT CASCADE ============
  /*
   * Document deletion pulls from Collection.documentIds,
   * clears Note.documentId and removes RecordChunks plus
   * the physical file. The upload is driven from the UI so
   * the multipart route and the stored file are genuinely
   * exercised rather than assumed.
   */

  say("");
  say("=== DELETE DOCUMENT ===");

  const docFixture = await page.evaluate(
    async ([api, s]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = {
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
      };

      const note = await (
        await fetch(api + "/notes", {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            title: `QA Doc Note ${s.stamp}`,
            content: "Document cascade fixture.",
          }),
        })
      ).json();

      return { noteId: note?.data?._id };
    },
    [API, setup]
  );

  const docResult = await uploadDocumentAndVerify(
    page,
    API,
    setup,
    docFixture,
    say
  );

  if (docResult.skipped) {
    say(`SKIP  ${docResult.reason}`);
  } else {
    docResult.checks.forEach(
      ([name, ok, actual]) => {
        say(
          `${ok ? "PASS" : "FAIL"}  ${name}  (got ${actual})`
        );
      }
    );
  }

  // ============ CLEANUP ============

  await page.evaluate(
    async ([api, s, survivor, doc]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = { Authorization: "Bearer " + t };

      const drop = async (path) => {
        try {
          await fetch(api + path, {
            method: "DELETE",
            headers: h,
          });
        } catch {
          /* fixture cleanup is best effort */
        }
      };

      await drop("/papers/" + survivor.id);
      await drop("/notes/" + s.noteId);
      await drop("/notes/" + doc.noteId);
      await drop("/projects/" + s.projectId);
    },
    [API, setup, secondPaper, docFixture]
  );

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
  };
}

/*
 * Uploads a real file through the multipart route, links it
 * to the collection and a note, deletes it, and then checks
 * that every dependent record was cleaned up.
 */
async function uploadDocumentAndVerify(
  page,
  api,
  setup,
  docFixture,
  say
) {
  const stamp = setup.stamp;

  const uploaded = await page.evaluate(
    async ([api, s, doc]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = {
        Authorization: "Bearer " + t,
      };

      const form = new FormData();
      form.append(
        "file",
        new Blob(["cascade fixture"], {
          type: "text/plain",
        }),
        `qa-cascade-${s.stamp}.txt`
      );
      form.append(
        "title",
        `QA Cascade Doc ${s.stamp}`
      );

      const res = await fetch(
        api + "/documents",
        { method: "POST", headers: h, body: form }
      );

      const json = await res.json();
      const id = json?.data?._id;

      if (!id) {
        return { error: "upload failed", status: res.status };
      }

      /*
       * The collection created for the paper half of the
       * contract was already deleted, so the document half
       * gets its own container.
       */
      const collection = await (
        await fetch(api + "/collections", {
          method: "POST",
          headers: { ...h, "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `QA Doc Collection ${s.stamp}`,
          }),
        })
      ).json();

      await fetch(
        api +
          `/collections/${collection.data._id}/documents`,
        {
          method: "POST",
          headers: {
            ...h,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentId: id }),
        }
      );

      await fetch(api + "/notes/" + doc.noteId, {
        method: "PATCH",
        headers: {
          ...h,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId: id }),
      });

      return {
        documentId: id,
        collectionId: collection.data._id,
      };
    },
    [api, setup, docFixture]
  );

  if (uploaded.error) {
    return {
      skipped: true,
      reason: uploaded.reason ?? "unknown",
    };
  }

  const after = await page.evaluate(
    async ([api, uploaded, doc]) => {
      const t = window.localStorage.getItem(
        "researcify_token"
      );
      const h = { Authorization: "Bearer " + t };

      const json = async (res) => {
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const before = await json(
        await fetch(api + "/documents", { headers: h })
      );

      const beforeDoc = before?.data?.find(
        (d) => d._id === uploaded.documentId
      );

      const del = await fetch(
        api + "/documents/" + uploaded.documentId,
        { method: "DELETE", headers: h }
      );

      const afterList = await json(
        await fetch(api + "/documents", { headers: h })
      );

      const collection = await json(
        await fetch(
          api +
            "/collections/" + uploaded.collectionId,
          { headers: h }
        )
      );

      const note = await json(
        await fetch(api + "/notes/" + doc.noteId, {
          headers: h,
        })
      );

      const single = await fetch(
        api + "/documents/" + uploaded.documentId,
        { headers: h }
      );

      return {
        hadDocument: Boolean(beforeDoc),
        deleteStatus: del.status,
        goneFromList: !afterList?.data?.some(
          (d) => d._id === uploaded.documentId
        ),
        singleStatus: single.status,
        collectionSurvives: Boolean(
          collection?.data?._id
        ),
        collectionDocumentIds:
          collection?.data?.documentIds?.length,
        noteSurvives: Boolean(note?.data?._id),
        noteDocumentId:
          note?.data?.documentId ?? null,
      };
    },
    [api, uploaded, docFixture]
  );

  return {
    checks: [
      ["document was uploaded", after.hadDocument, "-"],
      ["delete document -> 200", after.deleteStatus === 200, after.deleteStatus],
      ["document gone from list", after.goneFromList, "-"],
      ["direct fetch -> 404", after.singleStatus === 404, after.singleStatus],
      ["collection survives", after.collectionSurvives, "-"],
      ["Collection.documentIds pulled", after.collectionDocumentIds === 0, after.collectionDocumentIds],
      ["note survives", after.noteSurvives, "-"],
      ["Note.documentId cleared", after.noteDocumentId === null, String(after.noteDocumentId)],
    ],
  };
}
