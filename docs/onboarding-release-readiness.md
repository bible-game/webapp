# Onboarding 1.2.0 readiness

Reviewed 10 November 2026. The account flow is implemented locally and ready for configured DEV acceptance testing. This is not a claim that live Clerk/browser/webhook delivery or production migration has passed. No deployed database/environment or real Clerk users were changed during implementation.

## Implemented

- The normal login/sign-up/recovery/verification/profile views use Clerk and the Bible Game design system. Missing first/last names are required after verification. Church collection and the design-preview gallery are removed.
- A signed-in drawer entry opens Clerk's standard account management at `/account/manage`. The responsive settings layout is separate from the narrow login column. It remains available if the user service is temporarily unavailable. The drawer reflects name edits from Clerk immediately, while webhooks synchronize the service. Clerk handles reauthentication, email verification and deletion confirmation; sign-out returns to the landing page.
- Signed profile/deletion webhooks synchronize the linked local account. Tests verify HTTP account/leaderboard name updates, removal of all progress/reset-token records and rejection of a deleted account's old session, plus duplicate/late/concurrent delivery handling.
- Browser progress is isolated by guest/Clerk account, with guarded guest transfer and retryable merge behavior.
- Read-only migration planning and a separate resumable import preserve bcrypt passwords, numeric IDs and history, use reserved/unverified emails and exclude church data.
- Privacy/cookie copy now identifies Clerk, first/last-name collection, public leaderboard names, account management and the deletion/local-storage boundary. Actual provider settings, data locations and retention still need release review.

Validation: frontend production build and TypeScript checks pass; all 12 onboarding checks pass; the 54 selected backend checks pass, including 36 Clerk checks. The migration tooling previously passed 27 synthetic/PostgreSQL checks. Frontend lint has six existing warnings and no errors. Management-route guest protection was checked in Chrome. Signed-in settings editing/deletion still requires a live, approved DEV account and configured backend/webhook delivery.

## Agreed scope decisions

Confirmed 10 November 2026: keep Clerk with email/password and Google sign-in. Drop the custom dotted-Gmail rule, defer additional application-level public leaderboard throttling, and leave the existing CI test gates unchanged for now. These are no longer implementation blockers for this release. Native Clerk protections still require verification; CI status is not evidence that the full suite passed. The last full backend run retained three pre-existing legacy email/reset failures, while the selected Clerk/session/progress suites are green.

Remaining legacy backend auth/password removal waits until after migration and the rollback window.

## Configuration, manual acceptance and rollout

1. Configure the local/DEV user service: additive schema and webhook guard table, matching issuer/keys/origins, and its `CLERK_ENABLED` switch. The webapp is already Clerk-only. Do not deploy it ahead of the configured/migrated backend.
2. In the intended Clerk environment, verify email/password and Google, optional name fields during sign-up with app-owned completion afterwards, account self-deletion, session behavior and the actual bot/disposable/subaddress settings. Desired configuration is not proof that settings took effect; bot-protection read-back was previously inconsistent.
3. Configure the signed webhook endpoint/secret/instance. Exercise real name/email edits and account deletion with a disposable approved account, including delivery retries and removal from the leaderboard. Synthetic signed events do not prove network delivery or dashboard settings.
4. Complete manual bot cleanup, use a DEV database copy, review the read-only migration report and approve/rehearse import. Verify existing password sign-in, reserved-email verification, Google ownership/linking, stable numeric IDs and all history. Decide/document support's ownership-check process for people without their old inbox; do not bypass verification.
5. Run desktop/mobile acceptance for landing/tutorial and guest play, sign-up, name completion, recovery, guest transfer, sign-out/account switching and management. Check the management layout, keyboard navigation and destructive confirmation in Clerk's real UI.
6. Review Clerk plan/hosting/retention and the privacy/cookie text against the actual production settings. Historical church retention, browser caches on other devices and backups are separate from the webhook's primary-database deletion; do not promise immediate universal erasure.
7. After DEV acceptance and the outstanding decisions above, prepare production Clerk/domain/webhooks, backup/write freeze/import, coordinated deployment, verification and rollback/reconciliation. Use the migration runbook; do not experiment with production users.

References: [account UI](account-ui.md), [feature plan](onboarding-1-2.md), `user/docs/clerk.md`, `user/docs/clerk-migration.md`, [Clerk restriction patterns](https://clerk.com/docs/guides/secure/restricting-access).

Privacy/cookie implementation draft and the remaining factual/legal confirmations are tracked in [account-policy-review.md](account-policy-review.md). Clerk and Google remain enabled; no provider settings were changed during the policy review.

The ordered deployment/import/acceptance sequence is in [clerk-rollout-walkthrough.md](clerk-rollout-walkthrough.md). It is a runbook, not evidence that any target has been deployed or migrated.
