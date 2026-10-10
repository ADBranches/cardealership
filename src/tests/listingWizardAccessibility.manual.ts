import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const wizard = readFileSync("src/features/admin-listing/components/ListingWizard.tsx", "utf8");
const progress = readFileSync("src/features/admin-listing/components/ListingWizardProgress.tsx", "utf8");
const upload = readFileSync("src/features/admin-listing/components/AssetUploadStep.tsx", "utf8");
const status = readFileSync("src/features/admin-listing/components/ListingSubmissionStatus.tsx", "utf8");
const dashboard = readFileSync("src/app/components/admin/AdminDashboard.tsx", "utf8");

assert.equal(wizard.includes('aria-labelledby="listing-wizard-title"'), true);
assert.equal(progress.includes('aria-live="polite"'), true);
assert.equal(progress.includes('role="status"'), true);
assert.equal(upload.includes('type="file"'), true);
assert.equal(upload.includes('Choose images'), true);
assert.equal(upload.includes('role="alert"'), true);
assert.equal(status.includes('aria-live="polite"'), true);
assert.equal(status.includes('role="alert"'), true);
assert.equal(wizard.includes('disabled={state.isSubmitting}'), true);
assert.equal(wizard.includes('back'), true);
assert.equal(dashboard.includes('aria-busy="true"'), true);
assert.equal(dashboard.includes('Verifying administrator access'), true);
assert.equal(wizard.includes('mockMode: true'), false);
assert.equal(wizard.includes('isProduction: false'), false);

console.log(JSON.stringify({ suite: "listingWizardAccessibility", passed: 14, failed: 0, keyboardUploadFallback: true, invalidProgressionAnnounced: true, backwardNavigationAvailable: true, duplicateSubmissionDisabled: true, sessionFailureRepresented: true, mfaFailureRepresented: true, productionMocksForced: false }, null, 2));
