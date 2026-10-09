# DUKAANSET V3 — COMPLETE VERCEL STAGING DEPLOYMENT & AUTOMATED CI/CD IMPLEMENTATION

## PROJECT INFORMATION

**Project Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Platform:** Mobile-First, AI-Powered, Multi-Business SaaS Application

**Source Control:** GitHub

**Deployment Platform:** Vercel

**Development Branch:** `dev`

**Production Branch:** `main`

**Primary Requirement:** Automatically deploy the latest successful build of the `dev` branch to a stable, shareable Vercel staging URL whenever new commits are pushed or merged into `dev`.

---

# 1. YOUR ROLE

Act as a Senior DevOps Engineer, Vercel Deployment Specialist, Full-Stack Engineer, CI/CD Architect, Cloud Security Engineer, and Quality Assurance Engineer.

You are responsible for configuring a reliable, professional deployment workflow for the existing DukaanSet repository.

The project already exists and contains ongoing development work.

Do not create an unrelated application.

Do not replace existing working functionality.

Your task is to inspect the repository, configure the required deployment environments, automate deployments, verify the application, and document the setup.

**Do not stop after explaining how Vercel works. Implement the configuration wherever repository and Vercel permissions are available.**

---

# 2. MAIN DEPLOYMENT OBJECTIVE

Implement the following deployment behaviour.

### Development / Staging

GitHub branch:

`dev`

Deployment environment:

Vercel Preview deployment assigned to the `dev` branch, or a dedicated custom Staging environment if supported by the connected Vercel plan and project configuration.

Expected behaviour:

1. Developer makes changes locally.
2. Developer commits the changes.
3. Developer pushes the changes to the `dev` branch.
4. GitHub receives the push.
5. Vercel automatically detects the new commit.
6. Vercel starts building the application.
7. Appropriate validation and deployment checks run.
8. If the build succeeds, the new deployment becomes available.
9. The stable staging URL points to the latest successful deployment.
10. The user can open the same staging URL and see the updated DukaanSet application.

**Do not require manual redeployment after normal pushes to `dev`.**

### Production

GitHub branch:

`main`

Environment:

Vercel Production

The production deployment must remain separate from staging.

Changes pushed only to `dev` must not automatically replace the production deployment.

Production deployments must follow the repository's approved merge and release process.

---

# 3. INSPECT THE EXISTING REPOSITORY FIRST

Before modifying deployment settings:

1. Inspect the current GitHub repository.
2. Identify the frontend framework.
3. Identify the backend architecture.
4. Identify package manager and lockfile.
5. Inspect build scripts.
6. Inspect environment variables.
7. Review deployment-related configuration.
8. Identify existing Vercel projects.
9. Check the current production branch.
10. Check that `dev` exists.
11. Review GitHub Actions.
12. Identify database dependencies.
13. Review authentication callbacks.
14. Review file storage dependencies.
15. Check whether Vercel supports the project's actual runtime architecture.

Do not assume that an existing Node.js backend can be deployed unchanged as a Vercel Function.

If the application uses a separate long-running Express server, background workers, persistent WebSockets, or another incompatible runtime pattern, retain or introduce an appropriate backend host and configure staging URLs for that service.

Preserve existing production integrations.

Document all architectural decisions.

---

# 4. RECOMMENDED BRANCH STRATEGY

Maintain the following Git branch model.

### `main`

- Production-ready code.
- Stable releases.
- Production deployment.
- Real customer-facing application.

### `dev`

- Active development integration branch.
- Automatic staging deployment.
- Internal testing.
- Merchant demonstrations.
- Partner previews.
- Feedback collection.

### `feature/*`

- Individual feature development.
- Optional pull-request preview deployments.
- Changes reviewed and merged into `dev`.

Suggested workflow:

`feature/voice-stock` → `dev` → `main`

Every successful deployment from `dev` should update the intended staging environment.

Do not accidentally configure `dev` as the project's Production Branch when `main` is supposed to remain production.

---

# 5. CONNECT GITHUB TO VERCEL

Inspect whether the existing repository is already connected to a Vercel project.

If connected:

- Reuse the appropriate project.
- Verify repository permissions.
- Verify project root directory.
- Verify the production branch is `main`.
- Verify automatic Git deployments are enabled.

If not connected:

- Import the existing GitHub repository into Vercel.
- Select the correct framework.
- Configure the correct root directory.
- Configure the install command.
- Configure the build command.
- Configure the output directory if needed.
- Set `main` as the production branch.
- Enable Git-based Preview Deployments.

Do not create a duplicate Vercel project unnecessarily.

Use supported native Vercel Git integrations wherever possible.

Avoid duplicating the same deployment through both Vercel's automatic Git integration and a separate GitHub Actions deployment workflow.

---

# 6. CREATE A DEDICATED DEV STAGING DEPLOYMENT

Configure `dev` so that pushes trigger Preview Deployments.

The stable staging environment must represent the latest successful `dev` deployment.

Do not use a commit-specific URL as the primary shareable staging link.

Use the branch-specific Vercel URL or an explicitly assigned staging domain.

### Preferred Public URL

If the user owns and has configured an appropriate domain, support a branch-assigned subdomain such as:

`staging.dukaanset.in`

This is an illustrative hostname, not an assertion that the domain is owned or configured.

### Alternative

Use Vercel's generated stable branch URL.

Retrieve the actual assigned URL from Vercel rather than inventing one.

### Essential Behaviour

After push A:

Staging shows successful deployment A.

After push B:

If deployment B succeeds, the same staging URL shows B.

If deployment B fails, preserve the previous healthy staging deployment wherever supported.

Show the failed deployment status to the development team.

Never claim failed or unbuilt changes are already live.

---

# 7. VERCEL ENVIRONMENT CONFIGURATION

Use Vercel's actual supported environment model.

By default:

- Production environment for `main`
- Preview environment for non-production Git branches
- Branch-specific Preview variables for `dev` where needed

If the account supports dedicated custom environments, consider using a named `staging` environment bound to `dev`.

Do not assume custom environments are available on every Vercel plan.

Use the simplest correct configuration for the existing account.

---

# 8. SEPARATE STAGING AND PRODUCTION ENVIRONMENT VARIABLES

This requirement is critical.

Staging must never accidentally use production-only credentials or production databases.

Configure appropriately scoped environment variables.

Example variable categories:

- Application environment identifier
- Public application URL
- Backend API URL
- Database connection URL
- Authentication secrets
- Authentication callback URL
- File storage configuration
- Email provider configuration
- AI service configuration
- Speech recognition configuration
- Payment provider environment
- WhatsApp integration settings
- Feature flags
- Demo mode settings

Use actual variable names required by the repository.

Do not blindly add configuration fields that the application does not use.

### Staging Variables

Use development or staging resources.

Example intended configuration:

Application URL: actual staging URL

Database: dedicated staging database

Demo Mode: enabled where supported

Payment Provider: sandbox/test mode

External Communications: disabled, sandboxed, or explicitly approved

### Production Variables

Use authorised production resources.

Demo-only controls must not accidentally affect production merchant records.

### Secret Management

Store secrets in Vercel's environment-variable configuration or an appropriate secret manager.

Never commit secret values into Git.

Never expose private credentials through publicly accessible frontend environment variables.

Never copy production secrets into a public preview merely for convenience.

---

# 9. STAGING DATABASE — VERY IMPORTANT

DukaanSet contains sensitive, interconnected business data:

- Users
- Businesses
- Products
- Inventory
- Sales
- Customers
- Payments
- Udhaar
- DemandPulse requests
- Purchase history

Create or configure a staging database completely separate from the production database.

Use fictional demonstration records.

### Required Protections

- Staging cannot modify production inventory.
- Staging cannot modify real customer ledgers.
- Staging cannot create production payments.
- Staging cannot accidentally access production-only storage.
- Staging cannot send real notifications without appropriate configuration.
- Demo reset cannot delete production records.

### Database Migrations

Review schema changes carefully.

Implement a safe migration process using the project's existing ORM and migration tooling.

Do not automatically run destructive database resets on every deployment.

Use appropriate migration checks and rollback planning.

### Demo Data

Provide a safe way to seed realistic fictional business data.

Example demo businesses:

- Sharma Kirana Store
- Sharma Fashion Store
- Sharma Hardware Store
- Fresh Sabzi Store

Include realistic:

- Products
- Stock
- Customers
- Sales
- Payment records
- Pending balances
- DemandPulse requests

Demo data should persist between normal code deployments.

Provide a clearly authorised Reset Demo Data function that affects only the designated demo workspace.

---

# 10. COMPLETE AUTHENTICATION ON STAGING

All login and registration features must work correctly on the staging deployment.

Test:

- Registration
- Login
- Logout
- Password reset
- Account verification
- Session persistence
- Protected dashboards
- Business onboarding
- Business switching
- Authorisation

Configure correct staging callback URLs, redirect URLs, cookies, and permitted origins.

Do not reuse production callback URLs in a way that leaks sessions or redirects staging users into production unintentionally.

### Demo Accounts

Provide a safe demonstration approach.

Preferred options:

- Isolated demo workspaces
- A dedicated Try Demo experience
- Secure preconfigured demo identities if needed

Demo credentials must not grant access to real merchant data.

Avoid publicly posting shared privileged passwords.

Keep demonstration access easy for partners while maintaining proper protection.

---

# 11. SHAREABLE PARTNER DEMO LINK

The entire purpose of staging is to make DukaanSet easy to show.

I need to share a link with:

- Shopkeepers
- Business partners
- Mentors
- Potential customers
- Investors
- QA testers

The staging URL must load a usable product demonstration.

### Important Requirements

- Stable link
- HTTPS
- Responsive mobile experience
- Functional login or demo access
- No production customer data
- Proper loading states
- No broken application routes
- No unnecessary Vercel access errors

### Access Protection

Evaluate Vercel's available deployment protection and sharing options.

For private partner reviews, use an appropriate protected Preview sharing mechanism.

For public demonstration, configure a deliberate, safe access strategy that does not expose private staging records.

Do not silently disable deployment protection across the whole project.

If protection blocks external viewers, configure the appropriate supported shareable link or authorised access setting.

Check feature availability against the actual Vercel plan.

---

# 12. BUILD AUTOMATION

Whenever a new commit is pushed to `dev`, Vercel must automatically initiate the appropriate build.

Use the repository's real package manager.

Example build stages:

1. Checkout latest commit.
2. Install dependencies using the lockfile.
3. Check configuration.
4. Run appropriate code validation.
5. Build the application.
6. Deploy the successful build.
7. Update the staging branch URL.
8. Report deployment status.

Avoid unnecessary reinstall or deployment duplication.

Configure caching appropriately.

Use reproducible dependency installation.

---

# 13. AUTOMATED CI CHECKS

Set up practical quality gates.

Include appropriate checks such as:

- TypeScript type checking
- ESLint or existing lint command
- Unit tests
- Build verification
- Security-sensitive configuration checks
- Critical integration tests where infrastructure is available

Optional post-deployment tests:

- Home page loads
- Login page loads
- Dashboard route is protected
- Demo business opens
- Static assets load
- API health endpoint works
- Essential application routes respond

Use GitHub Actions only where it materially improves the process.

Vercel's native Git integration should remain the primary automatic deployment mechanism unless the project has a justified custom deployment requirement.

Do not create an overly complex CI/CD pipeline for a simple Vercel deployment.

---

# 14. FAILED DEPLOYMENT HANDLING

If a deployment fails:

- Do not claim it was published successfully.
- Preserve the previous working staging deployment where supported.
- Expose clear build logs.
- Identify the failing commit.
- Record the failure reason.
- Allow the team to fix and push another commit.

Do not automatically overwrite stable production code.

Do not run destructive database rollbacks without a carefully designed recovery procedure.

Make deployment status easy for developers to check.

---

# 15. STAGING ENVIRONMENT INDICATOR

Inside the DukaanSet application, display a small but clear staging indicator when the application runs in staging mode.

Example:

**Staging / Demo**

The indicator must not obstruct the mobile UI.

Use appropriate environment detection.

Do not accidentally show the staging indicator on the production application.

Provide:

- Demo business names
- Fictional sample data
- Safe reset controls
- Appropriate demonstration labels

Avoid confusing real shopkeepers into thinking sample data represents their actual businesses.

---

# 16. DEPLOYMENT VERSION TRACKING

Add a lightweight build information mechanism.

Where practical, display the following information in an internal developer or admin screen:

- Environment: Staging
- Git branch: dev
- Commit SHA
- Deployment timestamp
- Application version
- Build status or deployment reference

Use trustworthy build metadata provided by the deployment environment.

Do not generate fake version numbers.

This information will help confirm that the latest `dev` push actually reached staging.

Do not expose sensitive infrastructure details to unauthorised public visitors.

---

# 17. API AND BACKEND CONNECTIONS

Verify that the deployed frontend connects to the correct staging backend.

Test:

- Authentication APIs
- Business onboarding APIs
- Product APIs
- Inventory APIs
- Sales APIs
- Customer APIs
- Payment APIs
- DemandPulse APIs
- AI APIs where configured
- Voice integrations where configured
- File uploads

If the existing backend is not compatible with Vercel's runtime, deploy or maintain it using an appropriate hosting platform and configure a staging API endpoint.

Do not assume that successfully deploying the frontend means the backend is also deployed.

Configure CORS, allowed origins, authentication cookies, API URLs, and HTTPS correctly.

Do not hardcode localhost URLs in deployed code.

---

# 18. DEMO FEATURES THAT MUST BE ACCESSIBLE

The staging website must provide a coherent demonstration of implemented features.

Examples:

- Public marketing website
- Registration
- Login
- Business onboarding
- Personalised dashboard
- Business switching
- Inventory
- Voice Stock Entry
- New Sale
- Optional photo upload
- Automatic stock deduction
- Customer 360°
- Udhaar and payments
- DemandPulse
- Today's Work
- AI Assistant
- English, Hindi and Hinglish

Verify each feature's real implementation status.

If external credentials are missing, show a clearly labelled unavailable, test, or demo state.

Do not make an unavailable real integration look operational.

---

# 19. DOMAIN AND SEO SAFETY

The staging domain is intended for development, QA, and demonstrations.

Do not allow staging to compete with or duplicate the production public site's search indexing.

Configure appropriate staging indexing restrictions, such as `noindex` and suitable robots rules.

Do not rely on robots directives for protecting confidential information.

Use authentication and access controls for sensitive data.

Ensure public production canonical URLs remain correct.

Do not accidentally change the production domain when configuring staging.

---

# 20. PERFORMANCE AND MOBILE VERIFICATION

Test the staging website on representative mobile devices.

Check:

- 320px and 360px layouts
- 375px and 390px layouts
- Common Android browsers
- Mobile navigation
- Login forms
- Dashboard cards
- Sales workflow
- Inventory pages
- Camera permissions
- Microphone permissions
- Network errors
- Loading performance

Fix broken asset paths and deployment-specific routing problems.

Optimise images and JavaScript bundles where practical.

A shareable demo link must work outside the developer's local computer.

---

# 21. OPTIONAL PULL REQUEST PREVIEWS

Retain Vercel's normal pull-request preview workflow when useful.

Example:

`feature/photo-sales` → Pull Request → Preview Deployment

This allows individual features to be reviewed before merging into `dev`.

But keep the primary staging URL tied to `dev`.

The user should not need to share a different URL for every new staging commit.

---

# 22. RECOMMENDED RELEASE WORKFLOW

### Development

Developer creates or updates a feature branch.

### Integration

Feature branch is merged into `dev`.

### Staging

Vercel automatically deploys `dev`.

### QA

Team tests DukaanSet on the stable staging URL.

### Partner Review

Share the staging link with approved external reviewers.

### Feedback

Make necessary improvements on feature branches and integrate them into `dev`.

### Production Release

After review and required approvals, merge tested changes into `main`.

### Production Deployment

Vercel deploys the updated `main` branch to production.

Maintain an appropriate rollback procedure.

Do not automatically merge `dev` into `main`.

---

# 23. END-TO-END DEPLOYMENT ACCEPTANCE TEST

The setup is not complete until the following test succeeds.

### Test A — Initial Staging

1. Open the GitHub repository.
2. Confirm the `dev` branch exists.
3. Confirm Vercel is connected.
4. Confirm Production Branch is `main`.
5. Confirm a staging deployment exists.
6. Retrieve the actual stable staging URL.
7. Open the URL in a clean browser session.
8. Verify the DukaanSet site loads.

### Test B — Automatic Deployment

1. Make a small visible, safe change in `dev`.
2. Commit the change.
3. Push it to GitHub.
4. Confirm Vercel automatically starts a new deployment.
5. Verify the build completes successfully.
6. Open the same staging URL.
7. Verify the new change appears.
8. Verify the deployed commit matches the intended Git commit.

### Test C — Production Isolation

1. Confirm `main` was not modified by the staging test.
2. Confirm production still serves its previous approved version.
3. Confirm staging uses the staging database.
4. Confirm staging cannot change production customer records.

### Test D — External Demo

1. Open the staging URL in an incognito browser.
2. Open it on a smartphone.
3. Check whether deployment protection is correctly configured.
4. Verify authorised reviewers can access it.
5. Verify demo users cannot access real production data.
6. Verify essential app routes work.
7. Verify login or demo access works.
8. Verify example inventory and sales functionality.

Only mark the staging pipeline complete after these checks pass.

---

# 24. DOCUMENTATION REQUIREMENTS

Create an appropriate deployment guide.

Suggested filename:

`docs/VERCEL_STAGING_SETUP.md`

Include:

- Repository branch strategy
- Vercel project configuration
- Production Branch configuration
- Staging branch configuration
- Stable staging URL
- Environment variable names
- Database separation
- Backend hosting information
- Authentication callback configuration
- Access protection and sharing instructions
- Automatic deployment workflow
- CI checks
- Common deployment errors
- Rollback guidance
- How to verify the deployed commit
- How to share the staging demo safely

Never put real secret values into the documentation.

---

# 25. FINAL DELIVERABLES

Provide:

1. Existing GitHub repository connected to Vercel.
2. Verified `main` production branch configuration.
3. Verified `dev` staging deployment configuration.
4. Automatic Git push deployment.
5. Stable staging branch URL.
6. Optional custom staging domain.
7. Proper staging environment variables.
8. Dedicated staging database.
9. Correct staging API connectivity.
10. Functional login and registration on staging.
11. Secure partner demo access.
12. Demo data isolation.
13. Automated build checks.
14. Error and deployment status visibility.
15. Deployment version tracking.
16. Mobile browser verification.
17. End-to-end push/deployment test results.
18. Deployment setup documentation.

### IMPORTANT

If GitHub or Vercel credentials, domain ownership, or hosting permissions are missing, complete all possible repository-side preparation, identify the exact blocked configuration steps, and request the minimum necessary access.

Never fabricate a deployed URL.

Never claim the application is live until the actual deployment is verified.

---

# FINAL EXECUTION INSTRUCTION

Implement a professional automated staging deployment system for DukaanSet using the existing GitHub repository and Vercel.

The primary deployment relationship must be:

**GitHub `dev` → Automatic Vercel Staging Deployment → Stable Shareable URL**

The production relationship must remain:

**GitHub `main` → Vercel Production**

A successful push to `dev` must update the staging environment without requiring a manual deployment action.

Preserve production safety.

Use isolated staging data.

Ensure login, registration, dashboard and existing implemented features work correctly.

The staging website must be suitable for sharing with shopkeepers, business partners, QA testers, mentors and potential customers.

**FINAL GOAL: ONE DEV BRANCH. ONE STABLE STAGING LINK. AUTOMATIC UPDATES. SAFE DEMONSTRATIONS.**

BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY.
