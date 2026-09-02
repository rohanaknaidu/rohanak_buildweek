# Repository Agent Instructions

## Source Of Truth

* Read `PRODUCT_SPEC.md` before product reasoning or implementation.
* Treat `LOCKED` decisions as binding.
* Treat `CURRENT DIRECTION` as the preferred direction but still revisable.
* Treat `OPEN` items as unresolved; do not silently make product decisions for them.
* When an agreed product decision changes, update `PRODUCT_SPEC.md`.
* Do not rely on conversation memory when the decision belongs in the repository.

## Scope Discipline

* Work only on the active requested task or milestone.
* Do not implement speculative future features or abstractions.
* Record unrelated improvements for later rather than pulling them into the active task.
* Do not let future synchronous multiplayer requirements influence V1 architecture.

## Before Editing

* Inspect existing repository state and relevant files first.
* Do not overwrite or restructure working code without understanding it.
* Check `git status` before significant work.

## Verification

Do not call work complete merely because code exists.

Use the progression:

`implemented -> working locally -> live -> verified`

Run the appropriate checks for the active work.

Once the app exists, normal engineering verification should include where relevant:

* TypeScript/typecheck
* lint
* production build
* behavioral acceptance test

A milestone counts as complete only when its stated acceptance condition passes.

## Commit Cadence

Create a Git commit at meaningful stable checkpoints, including:

* an agreed product-spec milestone;
* a completed implementation milestone;
* a substantial verified bug fix;
* before a risky architectural/refactoring change when a clean rollback point is useful.

Do NOT create a commit for every trivial edit.

Prefer commits that represent one understandable unit of progress.

Use concise descriptive commit messages.

Examples:

* `docs: establish V1 product model`
* `feat: complete solo Drop flow`
* `feat: add invite challenge flow`
* `fix: resume in-progress attempts after refresh`

## Push Cadence

Push `main` when:

* a significant product/spec checkpoint has been committed;
* an implementation milestone has been verified;
* before ending a substantial work session;
* before beginning risky work where a remote recovery point is valuable.

Do not leave important completed work only on the local machine.

## Deployment Model

### Frontend

`git push origin main`

-> GitHub

-> Vercel automatically deploys the frontend.

Do not manually run Vercel deploys for normal checkpoints.

### Convex

Convex production is NOT auto-deployed by Vercel in this project.

Run Convex production deploy when:

* files under `convex/` change; OR
* files imported by Convex functions change.

This currently includes content such as:

* `content/registry.ts`;
* `content/topics.ts`;
* `content/areas.ts`;
* `content/drops/*`.

These content files are included because `convex/directFlow.ts` imports that content into the Convex bundle.

Current production command:

```powershell
npx.cmd convex deploy --yes
```

Do not re-investigate whether Convex auto-deploy is configured unless the deployment configuration itself later changes.

Do not automate Convex through Vercel as part of M3.0.

## Safety

Never commit:

* secrets;
* API keys;
* `.env` files containing real values;
* credentials;
* generated dependency/build directories.

Before pushing, inspect the staged/committed changes for accidental secrets or unrelated files.

## Reporting

At the end of a requested task, report:

* what changed;
* verification performed;
* current Git status;
* commit hash/message if a commit was created;
* whether it was pushed;
* blockers or unresolved decisions.

Do not automatically begin the next product milestone.
