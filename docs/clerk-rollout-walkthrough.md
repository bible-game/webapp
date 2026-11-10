# Clerk 1.2.0 deployment, migration and testing walkthrough

10 November 2026. These are instructions, not a record of actions performed. No deployments, real imports, environment changes or database migrations were run while writing this walkthrough.

The order is **DEV preparation → DEV import rehearsal → DEV acceptance → production preparation → maintenance/import/cutover → production acceptance**. Keep the existing production app running until the rehearsal passes. Clerk, email/password and Google are retained. The custom dotted-Gmail rule is dropped, extra application-level leaderboard throttling is deferred, and CI changes are deferred; use the explicit verification steps below.

## 1. Identify targets and control deployment triggers

Record the DEV and production webapp origins, user-service URLs, database targets, Clerk instance IDs, and exact service/webapp release commits or artifacts. Check which branch/push triggers each host. The checked-in release workflows create tags/GitHub releases; that is not evidence of which code a live host runs. An automatic frontend deployment must not publish this branch to production before backend preparation and migration.

The webapp no longer has a legacy-mode switch. The user service still defaults `CLERK_ENABLED` to false. A coordinated cutover is therefore necessary. Use the existing hosting process for deployments; the live host configuration has not been inspected here.

## 2. Prepare an isolated DEV source

Use a separate DEV database with legacy-format test accounts you control, or an explicitly approved copy/subset of legacy data. Do not point a DEV import at the production database. Start with controlled accounts whose existing passwords and progress you know, and record their numeric IDs, stars, games, reads and reviews as the baseline. An import into DEV creates actual Clerk DEV accounts, so use email addresses you control and approve that target first.

Apply **only the additive 1.2 sections** in `deployment/database/patch.sql`, not the entire historical file:

- `app_user.clerk_user_id` and its unique index;
- `app_user.clerk_email_verified_at`;
- `app_user.profile_completed_at`;
- `clerk_webhook_state`.

These changes must exist before deploying the updated user model, even if the service's Clerk mode initially remains disabled. Keep IDs, passwords and all history; do not drop legacy columns or historical church data during this migration.

## 3. Configure DEV Clerk and service settings

In the selected existing Clerk DEV instance, confirm email/password, Google, email verification, disposable-address restrictions, native bot protection and self-service account deletion. Names are completed by the app after verification; do not accidentally require them in Clerk's initial signup form if retaining that sequence. Check the actual Protections page, since earlier bot-protection configuration read-back was inconsistent.

DEV Google can use Clerk's shared credentials. Production will require separate configuration. Clerk development instances are capped at 100 users; keep the rehearsal small. DEV users, IDs and mapping journals must not be promoted to production. Production will import afresh from the real legacy source.

Set values securely in the intended environments; do not paste keys/passwords into chat or command arguments:

| Application | Setting | Purpose |
| --- | --- | --- |
| Webapp | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | DEV public key |
| Webapp | `CLERK_SECRET_KEY` | DEV backend key, server-only |
| Webapp | `NEXT_PUBLIC_SVC_USER` | DEV user-service URL; `next.config.js` exposes this as `SVC_USER` to the app code |
| User service | `CLERK_ISSUER` | Exact DEV Clerk Frontend API HTTPS origin, without trailing slash |
| User service | `CLERK_SECRET_KEY` | Same DEV instance's backend key |
| User service | `CLERK_AUTHORIZED_PARTIES` | Exact webapp origins, including localhost:3000 when needed; no wildcard |
| User service | `CLERK_INSTANCE_ID` | Exact DEV `ins_...` ID |
| User service | `CLERK_WEBHOOK_SIGNING_SECRET` | Secret belonging to this DEV webhook endpoint |
| User service | `CLERK_ENABLED` | `true` when switching this service to Clerk mode |

Set webapp public keys and service URL before building: Next.js public configuration and the `SVC_USER` mapping are build-time values. Build again for production rather than promoting an unchanged DEV build containing DEV keys/URLs. Retain all the normal database, configuration and other service variables as well. Use the host's secret manager/environment configuration. The migration tool independently uses libpq's `PG*` configuration or `PGSERVICE`, plus `CLERK_SECRET_KEY` in the host terminal. Check its source database and target before running it.

Create a DEV Clerk webhook pointing at the externally reachable **user-service** `POST /webhooks/clerk`, subscribed to `user.updated` and `user.deleted`. It is not a webapp route. Its ingress must preserve the original body and Svix signature headers, and this exact POST route must not require a player login token. Other private routes remain protected. If testing locally, expose only the needed webhook route through the test tunnel; prefer the stable DEV service URL when available. The endpoint only works after service Clerk mode is enabled.

## 4. Rehearse migration with a read-only plan first

Run from the `user` repository. The quoted instance placeholders below must be replaced with the actual intended IDs. Create a private working directory outside Git for reports/journals. Configure database credentials and the DEV Clerk key securely in your own terminal first.

```sh
python3 tools/clerk_migration.py plan \
  --source-db --check-clerk \
  --instance-id "<DEV_INSTANCE_ID>" \
  --environment development \
  --report /secure/migration/dev-plan.json
```

This reads the source database and makes GET-only Clerk checks. It does not create users or write account mappings. Review the actual source database identity and Clerk target in the report. Exit 0 means no row blockers, 2 means row blockers, and 1 means configuration/I/O failure. Resolve duplicate emails, unsupported hashes and existing Clerk conflicts before applying. An email already registered in Clerk without the proper migration mapping is not automatically claimed or overwritten.

Freeze the DEV source's legacy registration, password/profile changes and account administration while taking the final plan and applying it. The acknowledgment flags below do not implement the freeze or clean up bots. For DEV fixtures, establish that the source contains only the intended approved accounts. For real source users, complete manual bot cleanup first.

After reviewing the report and explicitly approving this DEV import:

```sh
python3 tools/clerk_migration.py apply \
  --plan /secure/migration/dev-plan.json \
  --journal /secure/migration/dev-journal.json \
  --confirm-instance "<DEV_INSTANCE_ID>" \
  --writes-frozen \
  --bot-cleanup-complete
```

The importer creates Clerk identities with the existing bcrypt hashes, numeric IDs as `external_id`, and reserved/unverified primary emails. It records the resulting Clerk IDs in the original local rows. Church and progress are not sent to Clerk; local IDs, passwords and history are not rewritten. Verification stays unset locally until a real verified Clerk identity is confirmed.

If interrupted, preserve the plan/journal and freeze, inspect the problem and rerun the same command after resolving it. Do not discard the journal, force email matching, mark emails verified, or manually recreate/delete remote accounts to get past a blocker. The source DB and Clerk cannot be rolled back as one transaction.

## 5. Deploy/activate DEV and run acceptance

Deploy the updated user service against the prepared DEV database, with matching DEV settings and `CLERK_ENABLED=true`; deploy the matching webapp using the DEV keys/service URL. For local UI testing, run `npm run dev` and visit localhost:3000. The backend's default local port is 8082; the actual URL must match your configuration. Import first and make the coordinated deployment before inviting ordinary users to test.

Verify service health, then the following journeys on desktop and mobile. Use disposable accounts you control for deletion. Preserve at least one existing browser's storage when testing migration; do not test exclusively with clean/incognito browsers.

| Journey | Pass condition |
| --- | --- |
| Guest landing/tutorial/play | Works without signup; progress survives reload |
| Email/password signup | Email ownership is verified; missing first/last names must be completed; no church field |
| Google signup | Correct consent/identity sharing; one local account; names retained or completed |
| Guest signs in | New guest progress appears in the account once; existing server progress remains |
| Imported email/password user | Old password works; unverified primary email cannot open app account data until verified; original numeric ID/history/rank retained |
| Imported user tries Google | Ownership/linking resolves to the correct imported identity, not a duplicate or another account |
| Existing browser/old session | A stale legacy session does not grant access; original local data is preserved. Ambiguous unscoped legacy local-only progress is not automatically attributed and may need review |
| Logout/account switching | Account B does not see account A's cached progress; guest state remains isolated |
| Recovery | Reset works; abandoned/invalid codes are handled; old sessions behave as configured |
| Manage account | Drawer entry opens the real settings UI; profile/security controls work on desktop/mobile and keyboard |
| Name/email change | Verification works; a real signed update succeeds in Clerk delivery logs; account API and leaderboard catch up |
| Delete disposable account | Clerk deletes identity; real signed deletion succeeds; local account/progress and leaderboard entry disappear; old session cannot recreate them |
| Failure/retry | Failed progress sync keeps the device copy; webhook errors can be diagnosed/replayed; users can continue guest play as designed |
| Native bot settings | Actual protections/settings are enabled and observable; test tokens that bypass challenges are not evidence of real bot protection |

Check actual webhook deliveries, not merely the dashboard's sample event returning success for an unknown user. The endpoint returns 204 for a successfully handled event, but you must verify the intended account actually changed. Review/resolve failed deliveries and replay when appropriate.

Run the implemented automated checks from their respective repositories. CI changes are deferred, so execute these explicitly:

```sh
# webapp
npm run test:onboarding
npx tsc --noEmit
npm run lint
npm run build
```

```sh
# user
./gradlew :service:test --tests '*clerk.*' --tests '*SessionFilterSpec' --tests '*StateServiceSpec'
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/tests -v
```

The optional PostgreSQL migration-test mode is documented in `user/docs/clerk-migration.md`. The selected suites passed during implementation; the last full backend run had three pre-existing legacy email/reset failures. This is not a claim that every full-suite test passes.

**Checkpoint:** proceed to production preparation only when the real DEV journeys pass and the identity/history comparisons are correct.

## 6. Prepare production without cutting over yet

- Complete the privacy/operator/retention/provider confirmations in `account-policy-review.md` and the support process for people without inbox access.
- Set up the production instance in the same intended Clerk application, production domain/DNS and production keys. Test the production instance on an appropriate production-domain deployment, not localhost with live keys.
- Configure your own production Google OAuth credentials, consent branding, privacy URL and intended identity scopes. Complete the applicable Google publishing/verification process. DEV shared credentials are not the production setup.
- Reconfirm email/password, verification, native protections, self-deletion, session lifetime and plan choices in production. Do not assume DEV settings or keys carry over correctly.
- Configure a separate production user-service webhook endpoint and signing secret for the production instance.
- Back up the production DB, verify a recovery path, and record previous application/service artifacts. Prepare how deletion records will be respected if restoring a backup.
- Apply only the additive 1.2 SQL to production before the new model runs. If staging the updated backend ahead of cutover, keep Clerk mode disabled and the existing webapp deployed. Verify that the legacy production flow still works in that staged state.
- Confirm the hosting controls for the maintenance/write freeze. There is no app-level maintenance flag in this implementation. If hosts cannot provide the required maintenance/routing control, arrange that mechanism before import.

## 7. Production migration and cutover

During the agreed maintenance window:

1. Prevent the old application/API from changing accounts or progress, including old browser sessions. Freeze account administration as well. Use the agreed hosting/routing controls; the migration flags alone do not enforce this.
2. Complete/verify manual bot cleanup and take a fresh post-cleanup backup. Record the included users and baseline IDs/history/counts.
3. With production DB credentials and production Clerk key securely loaded in the host terminal, run a fresh online plan against the original production legacy source:

```sh
python3 tools/clerk_migration.py plan \
  --source-db --check-clerk \
  --instance-id "<PRODUCTION_INSTANCE_ID>" \
  --environment production \
  --report /secure/migration/production-plan.json
```

4. Review the actual source and target and resolve every blocker. Obtain explicit approval for this production import. Do not use the DEV report, journal or Clerk IDs.

```sh
python3 tools/clerk_migration.py apply \
  --plan /secure/migration/production-plan.json \
  --journal /secure/migration/production-journal.json \
  --confirm-instance "<PRODUCTION_INSTANCE_ID>" \
  --writes-frozen \
  --bot-cleanup-complete \
  --allow-production
```

5. Confirm intended users have the expected mappings, numeric IDs and unchanged progress, with email-verification markers initially unset. Stop/reconcile rather than guessing if the run is partial.
6. Activate the updated production user service with the production Clerk configuration and `CLERK_ENABLED=true`. Ensure the production webhook endpoint is reachable and correctly signed.
7. Build/deploy the matching Clerk-only webapp with production keys and `NEXT_PUBLIC_SVC_USER` pointing to that service; do not promote an unchanged DEV build. Keep maintenance in place until smoke checks pass.
8. Test an approved imported account's old-password/verification/progress journey and fresh email/Google signup. Check management and real webhook delivery using an approved disposable account, not an ordinary player's record. Use real verification through owned email accounts; development bypass codes are not production acceptance evidence.
9. Remove maintenance, communicate the one-time sign-in/verification requirement, and monitor signup/auth errors, migration conflicts, failed progress merges and webhook delivery failures.

## 8. Recovery, monitoring and cleanup

Before users resume live writes, the previous deployments and additive schema provide a simpler recovery position. After real users change passwords or save progress in Clerk mode, rollback requires reconciliation: the legacy password store is stale and restoring a database can lose new progress or revive deleted records. Do not blindly switch the backend flag off or restore a pre-cutover DB. Choose a reviewed recovery/forward-fix plan and preserve the import journal.

Keep legacy backend code/password columns and rollback artifacts during the agreed window. Afterwards, remove them through an explicit cleanup migration, complete the historical church-data retention cleanup, and securely remove migration working files when no longer needed. Review delivery failures and record the final acceptance results; a successful deployment alone is not a successful migration.

References: [feature readiness](onboarding-release-readiness.md), [policy review](account-policy-review.md), `user/docs/clerk.md`, `user/docs/clerk-migration.md`, [Clerk environments](https://clerk.com/docs/guides/development/managing-environments), [Google setup](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google), [webhook delivery](https://clerk.com/docs/guides/development/webhooks/overview).
