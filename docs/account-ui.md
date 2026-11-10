# Account UI

Clerk components and the app-owned joining screens use the existing Wayfinding design system:

- `ui-theme.ts` supplies the neutral palette; there is no region colour on account screens.
- `form-styles.ts` supplies the HeroUI input classes and white primary action for profile and verification forms.
- `clerk-appearance.ts` maps Clerk's supported element hooks to those controls. `globals.sass` supplies scoped account rules: unboxed forms, a 384px column, 24px left-aligned headings, 16px field text, 8px controls and 48px primary actions.
- `account-presentation.tsx` provides common heading and error presentation. Profile fields, verification-code fields and connection states supply the live flows.
- Clerk's attribution and development badge remain visible. Authentication, validation and session behaviour remain Clerk's responsibility.
- Clerk's attribution/footer item sits at the bottom of the account page using a flex layout, while the sign-in/sign-up link stays with the form. It remains in document flow on short screens, with safe-area padding and space above it.

First and last names are required when missing. When Clerk already supplies them, the profile step confirms the name with “Continue as …”. The leaderboard sentence has been removed. Church collection and the map/heat map remain deferred beyond 1.2.0.

## Normal account views

The agreed screens now run directly in the app, including `npm run dev` on localhost:3000. The webapp uses Clerk authentication throughout; `CLERK_ENABLED` no longer selects a legacy webapp path. The old login/sign-up/recovery forms, their server actions, and the localhost preview gallery have been removed.

- `/account/log-in`: themed Clerk login, including its nested recovery flow.
- `/account/sign-up`: themed Clerk sign-up and email verification steps.
- `/account/continue`: connects the verified identity to the user service and merges progress.
- `/account/verify-email`: additional verification for an imported, unverified primary email.
- `/account/profile`: required missing names after verification; supplied names can be confirmed.
- `/account/manage/[[...user-profile]]`: Clerk’s standard account/security settings, opened from Manage account in the signed-in drawer. It requires a Clerk session, independently of backend availability. Settings use a wider responsive layout; the narrow login/footer rules do not apply.
- `/sign-in`, `/sign-up` and old password URLs redirect into the canonical account flow.

Visit `/account/log-in` or `/account/sign-up` through the existing landing/menu links. The later screens depend on the actual session and backend account state; they are not separately selectable fixtures. `/account/preview` is no longer a route. A signed-in player is redirected through account continuation instead of seeing another sign-in form.

The user service still has its own `CLERK_ENABLED` cutover switch. Full local account testing requires its additive schema, matching issuer/keys/origins and Clerk mode; the frontend does not enable or migrate that service automatically. Until the service is ready, Clerk controls can render and authenticate, but account continuation cannot complete. Guest play remains available.

Do not deploy the Clerk-only webapp ahead of backend configuration and the migration/acceptance rehearsal. A rollback uses the previous webapp release rather than a runtime legacy-view switch.

See [release readiness](onboarding-release-readiness.md) for implemented work, remaining development/scope decisions and the live acceptance checklist.
