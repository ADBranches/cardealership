# Edwin Sprint 10 Development Timeline

## Sprint Responsibility

Edwin is responsible for project setup documentation, API testing, build verification, repository quality checks, and integration review after teammate changes are merged.

## Required Sprint Deliverables

- Clear frontend and backend setup instructions in `README.md`.
- Documentation for the five required API endpoints.
- Improved and repeatable manual API tests.
- Verification after teammate changes are merged.
- A recorded frontend production build result.
- A verified backend startup and syntax report.
- Inspection of duplicate, obsolete, mock, generated, and unused file candidates.
- Pull request review checks for imports, routing, and naming.
- A final Sprint 10 quality and build report.

## Required API Endpoints

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/cars`
4. `POST /api/test-drives`
5. `GET /api/admin/stats`

## Verified Starting Baseline

- Development branch base: `3918acea7f1f1d83e07f0db4ad9d40836f78b5ad`
- Source branch: `feature/edwin-sprint9-upstream-integration`
- Sprint 10 branch: `feature/edwin-sprint10-quality-assurance`
- The baseline is three commits ahead of `upstream/main` and zero commits behind.
- The repository worktree was clean before Sprint 10 branch creation.
- No application implementation began before this timeline was created.

## Development Rules

- Inspect every target file before modifying it.
- Do not delete duplicate or mock-file candidates based only on filenames.
- Do not expose real credentials, tokens, passwords, or database connection strings.
- Keep frontend and backend validation separate.
- A command failure must not be reported as a PASS.
- Save complete command output as descriptive evidence files.
- Commit the verified work at the end of every completed implementation phase.
- Pull or fetch teammate changes before final integration validation.
- Stop when a phase fails or when evidence is insufficient.
- Do not begin the next phase until the current phase has a verified commit.

# Phase 0: Baseline and Development Planning

## Objectives

- Verify the repository and Git baseline.
- Fetch `origin` and `upstream`.
- determine branch divergence.
- Create the dedicated Sprint 10 development branch.
- Create this evidence-based development timeline.

## Files to Create

- `docs/sprint10/EDWIN_SPRINT10_DEVELOPMENT_TIMELINE.md`

## Files to Modify

- None.

## Validation

- Confirm the active branch is `feature/edwin-sprint10-quality-assurance`.
- Confirm `HEAD` initially matches commit `3918acea7f1f1d83e07f0db4ad9d40836f78b5ad`.
- Confirm the worktree contains only the planned timeline file.
- Confirm the timeline contains all Sprint 10 phases and file scopes.

## Evidence

- `sprint10_current_state_inspection.txt`
- `sprint10_upstream_refresh_and_divergence.txt`
- `sprint10_branch_and_timeline_creation.txt`

## Completion Criteria

- Dedicated branch exists.
- The Markdown timeline exists.
- No application file has been modified.
- Timeline content verification passes.

## Commit Gate

- Commit message: `docs: add Edwin Sprint 10 development timeline`

# Phase 1: Setup and Runtime Contract Audit

## Objectives

- Inspect the real frontend and backend runtime requirements.
- Resolve documentation-affecting inconsistencies before rewriting setup instructions.
- Verify package manager, scripts, ports, environment variables, database requirements, and startup order.
- Determine whether the backend build script is valid or incorrectly invokes Vite.
- Inspect duplicate dependency declarations in the backend package manifest.

## Files to Inspect

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `.env.example`
- `.env.development`
- `.env.production`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/.env.example`
- `backend/server.js`
- `backend/config/database.js`
- `.gitignore`
- `backend/.gitignore`

## Files to Modify

- `package.json`, only if a verified quality or validation script is required.
- `backend/package.json`, only if duplicate dependencies or invalid scripts are confirmed.
- `backend/package-lock.json`, only when synchronized by a verified package-manifest correction.
- `.env.example`, only if required public frontend variables are undocumented.
- `backend/.env.example`, only if required backend variables are undocumented.

## Files to Create

- `docs/sprint10/SETUP_RUNTIME_AUDIT.md`

## Validation

- Parse both package manifests.
- Inspect the resolved scripts.
- Validate frontend dependency installation state.
- Validate backend dependency installation state.
- Run non-destructive syntax checks on affected configuration files.
- Confirm no secret value is added to tracked files.
- Confirm lockfiles remain synchronized with package manifests.

## Evidence

- `sprint10_phase1_setup_runtime_audit.txt`
- `sprint10_phase1_package_manifest_validation.txt`

## Completion Criteria

- Actual startup requirements are known.
- Invalid or duplicate package configuration is either corrected or documented as a blocker.
- Environment-variable requirements are verified.
- No production credential is exposed.

## Commit Gate

- Commit message: `chore: align Sprint 10 runtime and setup contracts`

# Phase 2: README Setup and API Documentation

## Objectives

- Rewrite the project setup section for both frontend and backend.
- Document prerequisites, installation, environment configuration, startup order, ports, and validation commands.
- Document all five required Sprint 10 API endpoints.
- Include authentication requirements, request examples, expected responses, and error behavior.
- Preserve useful documentation from earlier sprints without allowing outdated sections to obscure current setup instructions.

## Files to Inspect

- `README.md`
- `.env.example`
- `backend/.env.example`
- `backend/server.js`
- `backend/routes/authRoutes.js`
- `backend/routes/carsRoutes.js`
- `backend/routes/testDriveRoutes.js`
- `backend/routes/adminRoutes.js`
- `backend/controllers/authController.js`
- `backend/controllers/carsController.js`
- `backend/controllers/testDriveController.js`
- `backend/middleware/authMiddleware.js`

## Files to Modify

- `README.md`

## Files to Create

- None unless the README becomes too large and a linked API reference is justified by verified content size.

## Required README Sections

- Project overview.
- Prerequisites.
- Frontend installation and startup.
- Backend installation and startup.
- Frontend environment configuration.
- Backend environment configuration.
- Database requirements.
- API base URL.
- Required Sprint 10 endpoint reference.
- Authentication and admin authorization.
- Manual API testing instructions.
- Test commands.
- Production build command.
- Troubleshooting guidance.
- Security notes.

## Validation

- Verify every documented command exists.
- Verify every documented file path exists.
- Match endpoint methods and paths to active Express route mounts.
- Check Markdown structure and code-block closure.
- Search for outdated or contradictory setup instructions.
- Confirm no real secrets appear in README examples.

## Evidence

- `sprint10_phase2_readme_api_documentation_validation.txt`

## Completion Criteria

- A new contributor can start both applications using README instructions.
- All five required endpoints are accurately documented.
- Protected endpoints clearly state authentication and role requirements.
- Documentation contains no verified contradiction with active source files.

## Commit Gate

- Commit message: `docs: document Sprint 10 setup and API usage`

# Phase 3: Manual API Test Suite Improvement

## Objectives

- Consolidate and improve manual API tests for the five required endpoints.
- Use reusable variables for base URL, access token, and resource identifiers.
- Add valid requests and representative negative cases.
- Prevent committed test files from containing real credentials or tokens.
- Keep endpoint tests aligned with current request contracts.

## Files to Inspect

- `src/requests.http`
- `src/tests/cars.http`
- `src/tests/test-drives.http`
- `backend/routes/authRoutes.js`
- `backend/routes/carsRoutes.js`
- `backend/routes/testDriveRoutes.js`
- `backend/routes/adminRoutes.js`
- Relevant controllers, models, middleware, contracts, and validators.

## Files to Modify

- `src/requests.http`
- `src/tests/cars.http`
- `src/tests/test-drives.http`

## Files to Create

- `src/tests/sprint10-required-endpoints.http`
- `docs/sprint10/API_TESTING_GUIDE.md`

## Required Test Coverage

- Successful and rejected registration.
- Successful and rejected login.
- Public car-list retrieval.
- Car-list filtering behavior supported by the current backend.
- Successful and invalid test-drive requests.
- Missing-token admin-statistics request.
- Invalid-token admin-statistics request.
- Non-admin admin-statistics request.
- Authorized admin-statistics request using a placeholder token.

## Validation

- Confirm every HTTP request has a valid method and URL.
- Confirm JSON payloads parse.
- Confirm all five required endpoints appear in the consolidated test file.
- Search test files for accidental secrets.
- Compare request fields with controllers and validation middleware.
- Execute live requests only when the backend and database are safely available.

## Evidence

- `sprint10_phase3_manual_api_test_structure.txt`
- `sprint10_phase3_live_api_test_results.txt`, when live dependencies are available.

## Completion Criteria

- Each required endpoint has at least one usable manual request.
- Protected endpoint examples include safe token placeholders.
- Negative cases are documented.
- Live dependency blockers, if any, are reported instead of hidden.

## Commit Gate

- Commit message: `test: improve Sprint 10 manual API coverage`

# Phase 4: Repository Quality and Duplicate-File Review

## Objectives

- Review duplicate, old, mock, generated, backup, and temporary file candidates.
- Distinguish valid parallel implementations from obsolete copies.
- Identify broken imports and case-sensitive path problems.
- Identify active and inactive routing implementations.
- Review naming consistency without performing unsafe bulk renames.
- Confirm generated outputs are handled correctly by `.gitignore`.

## Files to Inspect

- `new-file.tsx`
- `new-file-1.tsx`
- `Car Dealership Website.zip`
- `dist/`
- `project_layout.txt`
- `src/pages/Home.tsx`
- `src/pages/Home/HomePage.tsx`
- `src/app/App.tsx`
- `src/app/routes.tsx`, if present.
- Duplicate `Navbar.tsx` candidates.
- Duplicate `Footer.tsx` candidates.
- Duplicate `TestDriveScheduler.tsx` candidates.
- Duplicate UI component directories.
- `src/features/cars/data/mockVehicles.ts`
- `src/features/profile/services/passwordMockApi.ts`
- `src/features/profile/services/profileMockApi.ts`
- `src/features/test-drive/services/availabilityMockApi.ts`
- `backend/services/exchangeRates/mockExchangeRateProvider.js`
- `.gitignore`
- `backend/.gitignore`

## Files to Modify

- `.gitignore`, only for verified generated or local-only artifacts.
- Importing files with verified broken or inconsistent paths.
- Confirmed obsolete files only after reference and build checks prove safe removal.

## Files to Create

- `docs/sprint10/REPOSITORY_QUALITY_AUDIT.md`

## Validation

- Search every candidate filename and exported symbol before removal.
- Run import resolution through the frontend build.
- Run backend syntax checks.
- Compare duplicate files by content hash and role.
- Verify the active router and active page implementations.
- Confirm removal candidates are not referenced by source, scripts, or documentation.
- Confirm mock services are controlled by explicit configuration where applicable.

## Evidence

- `sprint10_phase4_duplicate_reference_analysis.txt`
- `sprint10_phase4_import_routing_naming_audit.txt`
- `sprint10_phase4_quality_corrections_validation.txt`

## Completion Criteria

- Every candidate is classified as active, intentional duplicate, generated artifact, mock dependency, obsolete, or unresolved.
- No file is deleted solely because of its name.
- Broken imports and confirmed routing conflicts are corrected.
- Unresolved ownership questions are documented.

## Commit Gate

- Commit message: `chore: complete Sprint 10 repository quality audit`

# Phase 5: Frontend, Backend, and Regression Validation

## Objectives

- Run the frontend production build.
- Run existing deterministic frontend test scripts.
- Run backend tests and syntax validation.
- Verify backend startup behavior without falsely reporting database-dependent success.
- Record warnings separately from failures.
- Produce exact command statuses.

## Files to Inspect

- `package.json`
- `backend/package.json`
- Existing files under `src/tests/`
- Existing files under `backend/tests/`
- Files changed during Phases 1 through 4.

## Files to Modify

- Source or test files only when a reproducible Sprint 10 validation failure proves a correction is required.
- Package scripts only when the verified test entry point is missing or invalid.

## Files to Create

- `docs/sprint10/BUILD_AND_TEST_REPORT.md`

## Validation

- Frontend production build.
- Existing frontend regression tests.
- Existing backend integration and manual tests.
- Backend JavaScript syntax checks.
- Backend startup smoke test when required services are available.
- Git diff and scope inspection.
- Secret scan across changed files.

## Evidence

- `sprint10_phase5_frontend_build.txt`
- `sprint10_phase5_frontend_regression.txt`
- `sprint10_phase5_backend_tests.txt`
- `sprint10_phase5_backend_syntax_and_startup.txt`
- `sprint10_phase5_changed_scope.txt`

## Completion Criteria

- Frontend build returns status zero.
- Required deterministic tests return status zero.
- Backend syntax validation returns status zero.
- Database-dependent tests are either executed successfully or explicitly marked blocked with evidence.
- No hidden command failure exists beneath a PASS marker.

## Commit Gate

- Commit message: `test: validate Sprint 10 build and regression status`

# Phase 6: Teammate Integration and Pull Request Quality Review

## Objectives

- Fetch the latest team branches and `upstream/main`.
- Identify work merged after the Sprint 10 baseline.
- Integrate the approved latest baseline without discarding Edwin Sprint 10 work.
- Review teammate changes for imports, routes, endpoint contracts, and naming consistency.
- Re-run required API and build validation after integration.

## Files to Inspect

- Files changed between the Sprint 10 baseline and latest `upstream/main`.
- Teammate files affecting Home, Cars, authentication, administration, and test-drive booking.
- All route and service files used by the five required endpoints.
- Files changed in Edwin Sprint 10 commits.

## Files to Modify

- Only files requiring verified integration corrections.
- Documentation affected by final endpoint or startup changes.
- Manual API tests affected by merged request-contract changes.

## Files to Create

- `docs/sprint10/INTEGRATION_REVIEW_REPORT.md`

## Validation

- Fetch both configured remotes.
- Record branch divergence before integration.
- Inspect incoming commit and file scopes.
- Integrate using an explicit Git operation.
- Resolve conflicts based on current architecture and source evidence.
- Run the Phase 5 validation suite again.
- Confirm all five endpoint definitions still exist.
- Confirm README commands remain accurate.

## Evidence

- `sprint10_phase6_preintegration_fetch_and_scope.txt`
- `sprint10_phase6_integration_result.txt`
- `sprint10_phase6_postintegration_validation.txt`
- `sprint10_phase6_pr_quality_review.txt`

## Completion Criteria

- Latest approved teammate work is integrated.
- No unresolved merge conflict remains.
- Frontend build passes after integration.
- API documentation and manual tests match merged contracts.
- Review findings are recorded with file-level evidence.

## Commit Gate

- Commit message: `chore: integrate and verify Sprint 10 team changes`

# Phase 7: Final Sprint 10 Release Evidence and Handoff

## Objectives

- Run the complete final validation from a clean worktree.
- Produce a concise build, API testing, and quality report.
- Confirm all Sprint 10 deliverables.
- Push the Sprint 10 branch.
- Prepare the pull request handoff without merging directly into `main`.

## Files to Inspect

- `README.md`
- `package.json`
- `backend/package.json`
- `src/requests.http`
- `src/tests/cars.http`
- `src/tests/test-drives.http`
- `src/tests/sprint10-required-endpoints.http`
- All Sprint 10 reports under `docs/sprint10/`
- Final Git diff against the selected upstream baseline.

## Files to Modify

- Documentation or tests only when final validation reveals a reproducible defect.

## Files to Create

- `docs/sprint10/FINAL_SPRINT10_REPORT.md`
- `docs/sprint10/PULL_REQUEST_CHECKLIST.md`

## Final Validation

- Confirm the active branch.
- Confirm no unresolved conflict markers.
- Confirm no tracked secret files or credentials.
- Run frontend tests.
- Run frontend production build.
- Run backend tests.
- Run backend syntax validation.
- Validate required API test definitions.
- Inspect final changed-file scope.
- Confirm a clean worktree after the final commit.
- Push the branch to `origin`.

## Evidence

- `sprint10_phase7_final_validation.txt`
- `sprint10_phase7_final_git_scope.txt`
- `sprint10_phase7_push_verification.txt`

## Completion Criteria

- All required commands succeed or have explicitly documented external blockers.
- All five required endpoints are documented and tested.
- Setup documentation covers frontend and backend.
- Build and quality reports exist.
- Every completed phase has a verified Git commit.
- The Sprint 10 branch is pushed.
- No direct merge into `main` is performed.

## Commit Gate

- Commit message: `docs: finalize Edwin Sprint 10 quality report`

## Pull Request Gate

The branch may be submitted for repository-administrator review only after the final commit and push are verified. The branch must not be merged directly into `main` from the local terminal.

