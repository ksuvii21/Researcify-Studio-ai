require("dotenv").config();

const mongoose = require("mongoose");

const UploadedDocument = require("./models/UploadedDocument");

/*
 * One-off migration for the 8D.7 processing-status change.
 *
 * The old enum was ['Pending','Processing','Completed','Failed'].
 * The new one is ['Uploaded','Extracting','Chunking','Ready','Failed'].
 *
 * Old values no longer pass schema validation, so any record
 * still holding them would fail on the next save. Map them
 * across:
 *
 *   Pending    -> Uploaded   (file stored, never processed)
 *   Processing -> Extracting (was mid-pipeline)
 *   Completed  -> Ready      (was successfully processed)
 *   Failed     -> Failed     (unchanged)
 *
 * Run once:  node migrate-document-status.js
 */
const STATUS_MAP = [
  { from: "Pending", to: "Uploaded" },
  { from: "Processing", to: "Extracting" },
  { from: "Completed", to: "Ready" },
];

const VALID_STATUSES = [
  "Uploaded",
  "Extracting",
  "Chunking",
  "Ready",
  "Failed",
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let total = 0;

  for (const { from, to } of STATUS_MAP) {
    /*
     * updateMany bypasses schema validation by design, so
     * the old enum value can still be targeted directly.
     */
    const result = await UploadedDocument.updateMany(
      { processingStatus: from },
      { $set: { processingStatus: to } }
    );

    total += result.modifiedCount;

    console.log(
      "  " + from + " -> " + to + ": " + result.modifiedCount + " document(s)"
    );
  }

  /*
   * Backfill the fields added in 8D.7 so legacy records are
   * shaped identically to new ones.
   */
  const backfill = await UploadedDocument.updateMany(
    { processingVersion: { $exists: false } },
    {
      $set: {
        processingVersion: 1,
        processedAt: null,
        extractedTextAvailable: false,
        extractedCharacterCount: 0,
      },
    }
  );

  console.log(
    "  backfilled processing metadata: " + backfill.modifiedCount + " document(s)"
  );

  // Report anything that still holds a value outside the new enum.
  const remaining = await UploadedDocument.find({
    processingStatus: { $nin: VALID_STATUSES },
  })
    .select("processingStatus")
    .lean();

  if (remaining.length) {
    console.log("\n  STILL INCOMPATIBLE:");

    remaining.forEach((d) => {
      console.log("    " + d._id + ": " + d.processingStatus);
    });
  } else {
    console.log("\n  all documents use a valid status");
  }

  console.log("\n  " + total + " status value(s) migrated");

  await mongoose.disconnect();
})().catch((e) => {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
});
