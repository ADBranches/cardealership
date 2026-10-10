"use strict";

const express = require("express");
const { createAuthenticationMiddleware } = require("../middleware/authenticate");
const { authorizeAdministrator } = require("../middleware/authorizeAdministrator");
const { bulkImageUpload } = require("../middleware/bulkImageUpload");
const { createBulkCarImageController } = require("../controllers/bulkCarImageController");

const createCarRouter = (options) => {
  const router = express.Router();
  const controller = createBulkCarImageController(options.bulkUploadService);
  const authenticate = options.authenticate || createAuthenticationMiddleware();
  const authorize = options.authorize || authorizeAdministrator;
  const upload = options.upload || bulkImageUpload;

  router.post(
    "/:id/images/bulk",
    authenticate,
    authorize,
    upload,
    controller.uploadBulkImages
  );

  return router;
};

module.exports = Object.freeze({
  createCarRouter
});
