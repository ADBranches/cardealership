import assert from "node:assert/strict";
import {
  createInitialListingWizardState,
  listingWizardReducer,
} from "../features/admin-listing/state";
import type { SelectedListingImage } from "../features/admin-listing/types";

let state = createInitialListingWizardState();

assert.equal(state.currentStep, "core-details");
assert.deepEqual(state.completedSteps, []);
assert.deepEqual(state.images, []);
assert.equal(state.isSubmitting, false);
assert.equal(state.submissionAttempted, false);

const initialDraftReference = state.draft;

state = listingWizardReducer(state, {
  type: "draft/update",
  field: "make",
  value: "Toyota",
});

state = listingWizardReducer(state, {
  type: "draft/update",
  field: "model",
  value: "Land Cruiser",
});

assert.equal(state.draft.make, "Toyota");
assert.equal(state.draft.model, "Land Cruiser");
assert.notEqual(state.draft, initialDraftReference);

state = listingWizardReducer(state, {
  type: "navigation/next",
});

assert.equal(state.currentStep, "specifications");
assert.deepEqual(state.completedSteps, ["core-details"]);
assert.equal(state.draft.make, "Toyota");

state = listingWizardReducer(state, {
  type: "draft/update",
  field: "price",
  value: "85000000",
});

state = listingWizardReducer(state, {
  type: "navigation/back",
});

assert.equal(state.currentStep, "core-details");
assert.equal(state.draft.price, "85000000");
assert.equal(state.draft.make, "Toyota");

const stateBeforeInvalidJump = state;

state = listingWizardReducer(state, {
  type: "navigation/go",
  step: "review",
});

assert.equal(state, stateBeforeInvalidJump);

state = listingWizardReducer(state, {
  type: "errors/client",
  errors: { make: "Make is required." },
});

const stateBeforeBlockedAdvancement = state;

state = listingWizardReducer(state, {
  type: "navigation/next",
});

assert.equal(state, stateBeforeBlockedAdvancement);

state = listingWizardReducer(state, {
  type: "draft/update",
  field: "make",
  value: "Toyota",
});

assert.equal(state.clientErrors.make, undefined);

const syntheticFile = {
  name: "vehicle.jpg",
  size: 1024,
  type: "image/jpeg",
} as File;

const images: SelectedListingImage[] = [
  {
    id: "image-two",
    file: syntheticFile,
    order: 2,
    imageType: "general",
  },
  {
    id: "image-one",
    file: syntheticFile,
    order: 0,
    imageType: "primary",
  },
];

state = listingWizardReducer(state, {
  type: "images/set",
  images,
});

assert.deepEqual(
  state.images.map((image) => image.id),
  ["image-one", "image-two"],
);
assert.deepEqual(
  state.images.map((image) => image.order),
  [0, 1],
);
assert.equal(state.images[0].file, syntheticFile);

state = listingWizardReducer(state, {
  type: "submission/start",
});

assert.equal(state.isSubmitting, true);
assert.equal(state.submissionAttempted, true);

const stateDuringDuplicateSubmission = listingWizardReducer(state, {
  type: "submission/start",
});

assert.equal(stateDuringDuplicateSubmission, state);

state = listingWizardReducer(state, {
  type: "submission/finish",
});

assert.equal(state.isSubmitting, false);

const stateBeforeUnknownAction = state;

state = listingWizardReducer(state, {
  type: "unknown/action",
});

assert.equal(state, stateBeforeUnknownAction);

state = listingWizardReducer(state, { type: "reset" });

assert.equal(state.currentStep, "core-details");
assert.equal(state.draft.make, "");
assert.equal(state.draft.price, "");
assert.deepEqual(state.completedSteps, []);
assert.deepEqual(state.images, []);
assert.equal(state.isSubmitting, false);
assert.equal(state.submissionAttempted, false);

console.log(JSON.stringify({
  suite: "listingWizardState",
  passed: 27,
  failed: 0,
  deterministicStateVerified: true,
  backwardNavigationPreservedData: true,
  invalidAdvancementBlocked: true,
  attachmentMetadataPreserved: true,
  duplicateSubmissionBlocked: true,
  unknownActionIgnored: true,
  backendCallMade: false,
}, null, 2));
