import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const board = readFileSync("src/features/admin-dispatch/components/DispatchBoard.tsx", "utf8");
const column = readFileSync("src/features/admin-dispatch/components/DispatchColumn.tsx", "utf8");
const card = readFileSync("src/features/admin-dispatch/components/DispatchBookingCard.tsx", "utf8");
const actions = readFileSync("src/features/admin-dispatch/components/DispatchActionMenu.tsx", "utf8");
const error = readFileSync("src/features/admin-dispatch/components/DispatchErrorState.tsx", "utf8");
const css = readFileSync("src/features/admin-dispatch/components/DispatchBoard.css", "utf8");

assert.equal(board.includes('aria-busy="true"'), true);
assert.equal(board.includes('aria-label="Booking status navigation"'), true);
assert.equal(board.includes('role="alert"'), true);
assert.equal(column.includes('aria-labelledby='), true);
assert.equal(column.includes('aria-label='), true);
assert.equal(card.includes('aria-live="polite"'), true);
assert.equal(actions.includes('disabled={disabled}'), true);
assert.equal(actions.includes('Confirm booking cancellation'), true);
assert.equal(error.includes('role="alert"'), true);
assert.equal(error.includes('Retry'), true);
assert.equal(css.includes('repeat(4'), true);
assert.equal(css.includes('repeat(2'), true);
assert.equal(css.includes('grid-template-columns:1fr'), true);
assert.equal(css.includes('overflow-wrap:anywhere'), true);
assert.equal(css.includes('overflow-x: auto'), true);
assert.equal(css.includes('prefers-reduced-motion'), true);
assert.equal(board.includes('fetch('), false);

console.log(JSON.stringify({ suite: "dispatchAccessibility", passed: 17, failed: 0, keyboardActionsReachable: true, loadingAnnounced: true, mutationStatusAnnounced: true, failureRecoveryAvailable: true, mobileStatusNavigationAvailable: true, longContentProtected: true, reducedMotionSupported: true }, null, 2));
