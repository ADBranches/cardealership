import assert from "node:assert/strict";
import express from "express";

const app = express();
let controllerReached = false;
let errorMiddlewareReached = false;

const forcedControllerFailure = (req, res, next) => {
  controllerReached = true;
  const error = new Error("forced controller failure");
  error.status = 503;
  error.code = "FORCED_CONTROLLER_FAILURE";
  next(error);
};

app.get("/forced-controller-error", forcedControllerFailure);
app.use((err, req, res, next) => {
  errorMiddlewareReached = true;
  const status = err.status || 500;
  const code = err.code || (status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED");
  res.status(status).json({ success: false, error: { code, message: status >= 500 ? "Internal server error" : err.message } });
});

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const address = server.address();
const response = await fetch(`http://127.0.0.1:${address.port}/forced-controller-error`);
const body = await response.json();
server.close();

assert.equal(controllerReached, true);
assert.equal(errorMiddlewareReached, true);
assert.equal(response.status, 503);
assert.equal(body.success, false);
assert.equal(body.error.code, "FORCED_CONTROLLER_FAILURE");
assert.equal(body.error.message, "Internal server error");
console.log("FORCED_CONTROLLER_ERROR_PROPAGATION=PASS");
