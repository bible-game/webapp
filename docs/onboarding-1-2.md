# 1.2 Onboarding

Status: webapp account integration, opt-in user-service authentication and profile completion implemented locally, 10 November 2026. DEV cut-over is not activated. Webhook deployment/configuration, a real DEV migration rehearsal, manual DEV journeys and final bot-protection verification remain before release.

## Implementation progress

- The webapp uses the existing Bible Game Clerk development application, `app_3LsfpCVtwYDd0Li5GZTVAIaT9L0`, with `@clerk/nextjs` 7 and React/React DOM 19.0.3. Development keys remain in the ignored `.env` file.
- The webapp now uses Clerk throughout, including normal localhost:3000 account routes. The legacy forms/actions and preview gallery have been removed; there is no webapp `CLERK_ENABLED` switch. The user service retains its default-off `CLERK_ENABLED` cutover switch. Configure/migrate the backend before deploying this webapp; rollback uses the previous webapp release.
- Themed components live at `/account/log-in` and `/account/sign-up`, including their nested authentication steps. `/sign-in` and `/sign-up` redirect to those canonical destinations. Old password URLs route into Clerk's login/recovery flow. The old webapp auth actions and JWT-cookie fallback have been removed.
- Clerk sessions supply bearer tokens to the user service. Rank lookups still use the numeric application ID returned by `/info`, rather than Clerk's string subject. The landing uses verified Clerk session state for its Play redirect; timezone/device routing and `known_user` remain.
- `/account/continue` provisions the account, merges device progress, and continues to the original safe `next` path or Play. Failures retain the local copy, offer retry, and avoid redirect loops. Background retries run on navigation, reconnection, visibility changes and a bounded interval.
- Guest and account storage have separate namespaces. Browser-wide Web Locks prevent simultaneous guest claims; unsupported locks preserve the guest copy and show a notice. Clerk progress writes use a single debounced merge path, with backend row locks serializing snapshots across tabs/devices. Merge requests and guarded progress actions are bound to the expected Clerk identity. Late responses cannot acknowledge or write into a different account's scope.
- Old unscoped caches on devices known to have held an account are preserved in their original keys and are not automatically attributed to a new identity. Identifiable first-time guest caches are copied automatically. Imported users recover account history from the service; any unattributed local-only legacy progress needs review during migration.
- `/account/profile` requires missing first and last names after email verification; church collection is deferred beyond 1.2.0. `PUT /info/profile` requires nonblank effective names before setting `profile_completed_at`. The profile endpoint accepts names only and leaves existing church records unchanged; old skip requests cannot bypass missing names. Older skipped profiles with blank names are shown again. Completed profiles with valid names are not overwritten by retries. Missing names are also updated in Clerk through the server SDK.
- Account presentation now reuses Wayfinding's unboxed 384px form column, Plex type, glass fields, 8px controls and white primary action. Clerk elements are styled through supported appearance hooks; profile and verification use the existing HeroUI form styles. The approved designs are the normal account views; `/account/preview` and its fixtures have been removed. Session/backend state determines which step appears; see `docs/account-ui.md`.
- `/account/verify-email` supports email-code verification before imported users can access account data. Users without inbox access are directed to support; the formal recovery/ownership-check process remains a release decision.
- The user service pins Clerk's issuer/JWKS, accepts RS256 session JWTs, checks issuer/timestamps/session/origin, and maps verified identities to the existing numeric IDs. First-request provisioning uses Clerk's Backend API and explicit migration links, never email matching alone. In Clerk mode the legacy auth controllers/filter are disabled and `/auth/register` returns 404. `common` remains unchanged.
- Signed `POST /webhooks/clerk` handles linked-account profile updates and deletion, with raw-body Svix verification, instance pinning, ordering guards and a durable deletion marker. First sign-in still provisions synchronously; webhooks never claim accounts by email. Live delivery configuration/testing remains before activation; see `user/docs/clerk.md`.
- Additive SQL in `deployment/database/patch.sql` adds unique `clerk_user_id`, `clerk_email_verified_at`, `profile_completed_at` and the `clerk_webhook_state` guard table. Apply these changes before deploying the updated model, even when initially leaving Clerk mode disabled. No deployed database or environment was changed.
- The DEV configuration enables Google, email/password, email verification, and disposable-address/subaddress restrictions; Apple remains disabled. The existing email-code sign-in option remains available.
- Bot protection is still unconfirmed: the CLI accepted `captcha_enabled: true`, but its read-back returned false. Resolve through Clerk's current Protections settings. The custom dotted-Gmail rule has been removed from 1.2.0 scope; native Clerk protections remain.
- Validation: 12 webapp ownership/merge/redirect/profile tests and all 36 Clerk backend tests pass. TypeScript, lint (six existing warnings) and a Clerk-enabled production build pass. The last full backend run retained the same three pre-existing email/reset failures (74 tests, 3 failed, 11 skipped); the additional concurrent-snapshot test and the selected Clerk/session/progress suites pass after the final merge-lock change. Canonical Clerk auth screens were inspected in Chrome; no real Clerk users were created. The first live sign-in, mobile/desktop journeys, verification, logout and profile flows still require manual DEV testing with the configured backend. A missing backend connection is not solved by restoring the old forms.
- Migration tooling in `user/tools/clerk_migration.py` provides offline/read-only plans, GET-only Clerk preflight, and a separate resumable apply command bound to the reviewed source database and Clerk instance. It preserves bcrypt hashes/numeric IDs, imports email as reserved/unverified, excludes church, rejects ambiguous email matches and journals partial progress. All 27 synthetic/unit/PostgreSQL checks pass; no real data has been exported or imported. See `user/docs/clerk-migration.md`.
- Activation and environment instructions are in `user/docs/clerk.md`. The next release work is a real read-only DEV preflight and approved import rehearsal, webhook endpoint/secret configuration, and DEV activation/acceptance testing.

## Goal

Make joining Bible Game smooth and trustworthy. A guest can play with no account, and when they choose to join it takes one tap with Google, or a short email sign-up, and their progress comes with them. Every auth behaviour (log-in, reset, verification, log-out) works predictably, and bots stop getting in. The release is done when every journey in [Test journeys](#test-journeys) passes by hand on the DEV environment.

## Scope

| In | Out |
| --- | --- |
| The webapp's sign-up, log-in and account flows | The mobile app (it can adopt Clerk later; nothing here should block that) |
| Clerk as the identity provider | Retiring the Spring user service |
| The user service's auth code removed, Clerk tokens accepted | Changes to game state, leaderboard or Study logic |
| Bot defence to prevent new bot accounts | Automated cleanup of existing bot accounts; James will clean these up manually |
| | Optional analytics or marketing consent; Sign in with Apple for 1.2.0 |
| Moving existing users to Clerk | |

## Decisions

| Question | Decision |
| --- | --- |
| Identity | Clerk, reaffirmed after reviewing managed versus existing authentication (10 November 2026). It handles sign-up, log-in, social sign-in, verification, password reset and sessions. |
| User service | Kept. Its auth code (about 540 lines: log-in, registration, reset tokens, `SessionFilter`) and the reset email go. State, leaderboard and info stay. `app_user` remains the record for app data and is linked to Clerk by `clerk_user_id`. |
| Platforms | Webapp only. |
| Sign-in screens | Clerk's prebuilt components themed to Wayfinding, initially (9 November 2026). |
| Sign-in methods | Email and password, and Google; both retained after the provider review (10 November 2026). Apple is deferred beyond 1.2.0. |
| Existing-user verification | Require email verification on the first Clerk sign-in after migration, retaining existing passwords and app history (9 November 2026). |
| Bot defence | Prevent account creation rather than only flagging accounts afterwards. James will manually remove existing bot accounts (9 November 2026). |
| Guests | Keep playing with no account. Nothing is gated behind sign-up that isn't today. |
| Church | Collection, directory, public map and heat map deferred beyond 1.2.0. No church field in the new onboarding flow. Existing records remain untouched pending privacy review. |
| Names | First and last names required to complete the profile after email verification; retain social names. Single-name exceptions remain to be decided. |
| Tokens | Only the user service (`TokenFilter`/`TokenManager` in `common`) and the webapp (`auth-util.ts`, jose) verify the current JWT. The passage service doesn't, so the change is contained to these two. |

## Workstreams

### 1. Clerk in the webapp

- Add `@clerk/nextjs`. Replace the `token` cookie checks in `auth-util.ts`, `middleware.ts` (the logged-in redirect from `/` to Play) and the server actions with Clerk's `auth()`.
- Sign-in methods: email and password, Google. Apple is deferred beyond 1.2.0.
- Use Clerk's prebuilt components themed through `appearance` to the Wayfinding look (`look-and-feel.md`): neutral screen, 8px radius, Plex Sans, white primary.
- Keep the routes under `/account` (`/account/sign-up`, `/account/log-in`) so existing links and the landing's account buttons still work. `/account/forgot-password` and `/account/reset-password` become part of Clerk's log-in flow and are removed.
- The `known_user` cookie (invite, not force, a log-in) stays, set when Clerk reports a signed-in session.
- Calls to the user service send the Clerk session token as the bearer token.

### 2. User service

- Verify Clerk's RS256 tokens against Clerk's JWKS in place of the HS256 `SIGNING_SECRET`. Implemented as a Spring Security decoder and identity filter in the user service, avoiding a shared-library release and retaining an explicit legacy mode during rollout.
- Add `clerk_user_id` (unique) to `app_user`. Look the user up by it from the token's `sub`.
- Implemented `POST /webhooks/clerk` (Clerk sends through Svix, raw-body signature and instance checked):
  - `user.updated`: update linked names and verified primary email; missing names reset profile completion. Unverified/banned/locked events clear the verification marker.
  - `user.deleted`: atomically delete the linked account, password-reset tokens and games/guesses, reads, reviews/answers/grades. A minimal Clerk-ID/version/deleted marker remains to reject late updates and provisioning.
  - `user.created` is deliberately not used. First verified sign-in provisions synchronously through the Backend API; events never match/link by email or create accounts.
  - Per-user database guards serialize updates/provisioning across instances. Older/equal updates are ignored; deletion always wins. Configure the endpoint, signing secret and instance ID and verify live DEV delivery before cutover.
- Reuse the existing `/state/sync` endpoint to carry guest progress into the account on sign-in (workstream 4), replacing the `games`/`reads`/`reviews` that registration accepts today. The Clerk backend HTTP test verifies this endpoint with a provisioned Clerk identity.
- Delete `/auth/**` (log-in, register, validate-token, update-password, forgot-password), `PasswordResetToken`, `SessionFilter`, `NotificationService`/`EmailClient` and their tests. Drop the `password` and `password_changed_at` columns once migration is done.
- Additional application-level public leaderboard throttling is deferred beyond 1.2.0; monitor usage and revisit if needed (10 November 2026).

### 3. Bot defence

About 30% of accounts are bots. Today the only defence is a honeypot field in the webapp's sign-up action, and the user service accepts `POST /auth/register` from the public internet, so bots skip the honeypot entirely.

Going forward:

- **Close the back door.** Deleting `/auth/register` (workstream 2) means accounts can only be made through Clerk.
- **Verify every email.** Email sign-ups must enter a code before the account exists. Google sign-ups arrive verified.
- **Clerk's bot protection** on sign-up (a Turnstile challenge, invisible for most people).
- **Block disposable email domains**, using Clerk's setting.
- **Custom dotted-Gmail rule dropped for 1.2.0.** Use Clerk’s built-in protections, verification and disposable-address blocking; punctuation alone is not a basis for rejecting an otherwise legitimate player (10 November 2026).

Existing accounts:

- James will manually identify and remove existing bot accounts. No cleanup report, classifier or deletion tooling is included in this feature.
- Complete the manual cleanup before migration, so those accounts aren't imported into Clerk. Their removal also clears them from the leaderboard.

### 4. The joining experience

- **Guest first.** Unchanged: guests play, read and study with progress saved on the device ("Your progress is saved on this device" in the drawer). The landing keeps its account buttons: Sign up and Play for guests, Log in and Play for known users.
- **Progress carries over.** On the first sign-in to a new account, the webapp sends the device's games, reads and reviews to the user service once. They're merged without overwriting anything already on the account. A returning user logging in on a new device keeps their account's progress, and the device's progress merges in too.
- **Complete your profile.** After verification and the first sign-in, one screen asks for:
  - first and last name, required; pre-filled from Google, asked only when missing
  
  Names are required to finish. Existing social names are retained and can be confirmed without re-entering them. Church is not collected. Completion is stored once the required names are present.
- **Where sign-up is offered:** the landing (`home-host.tsx`), the menu drawer (`app-header.tsx`), the end of a round (`play/[game]/action.tsx`) and Stats. Copy and placement stay as they are now; only the destination changes.

### 5. Auth behaviours

Each behaviour has an expected result that the test journeys check.

| Behaviour | Expected |
| --- | --- |
| Sign up with email | Code sent; account exists only after the code is entered; progress carried over; profile screen shown. |
| Sign up with Google | One step; name pre-filled; progress carried over; profile screen shown. |
| Same email, different method | Signing in with Google on an email-and-password account's address links to the same account, not a duplicate. |
| First sign-in after migration | Existing password and history retained; email ownership verified before access to account data or social account linking. |
| Log in | Back to where they were (the `next` path), or Play. |
| Wrong password | A clear message; repeated failures are throttled by Clerk. |
| Forgotten password | Code by email; new password set; every other session is signed out. |
| Change email | New address verified before it replaces the old one. |
| Log out | Session ended; the device returns to guest mode and keeps `known_user`. |
| Session expiry | Treated as logged out, with no error page. |
| Delete account | Clerk deletes the identity; signed webhook removes the local account and progress. Minimal anti-replay marker remains; browser caches/backups follow a separate retention policy. Verify live delivery before release. |

### 6. Moving existing users

- Implemented local migration planner/importer in `user/tools/clerk_migration.py`; follow `user/docs/clerk-migration.md`. Start with a read-only source/online preflight plan, resolve blockers, freeze writes and review the actual DEV target before a separately approved apply. The real DEV rehearsal remains unperformed.
- Import users into Clerk through its Backend API with their bcrypt hashes and explicitly reserved/unverified emails, so passwords keep working without assuming email ownership. Newly returned verified emails block automatic linking; never remove the reserved status to work around errors.
- Record the returned Clerk id in `clerk_user_id`.
- Exclude church from Clerk import payloads, metadata and exports prepared for Clerk. The active account/profile contract contains no church field. Preserve the numeric user ID and all game/read/review history.
- Keep the legacy `app_user.church` column during the staged rollout/rollback window; it is not exposed by `/info` or changed by profile completion. New Clerk accounts leave it empty. Review historical retention separately, then remove the column and legacy registration references through an explicit cleanup migration. This release does not delete existing church data.
- Require existing users to verify their email on their first Clerk sign-in after migration. Keep their existing passwords and app history. Confirm the supported Clerk import and verification flow before implementation; do not silently treat imported addresses as verified. Define a recovery route for users who cannot access their inbox before cut-over.
- **Order:**
  1. James completes the manual bot cleanup.
  2. Do a dry run against the DEV Clerk instance with a copy of production users.
  3. Do the production import.
  4. Deploy the webapp and user service.
- The old JWTs stop working at cut-over, so everyone signs in once more. Their password is unchanged.

### 7. Testing

- **DEV environment:** a Clerk development instance. Google uses Clerk's shared credentials there. Apple configuration and testing are deferred beyond 1.2.0.
- **Test emails:** addresses with `+clerk_test` (for example `jrsmth+clerk_test@example.com`) accept a fixed code, so verification and reset can be tested without real inboxes.
- **Manual run:** the journeys below, on a phone first (mobile-first), then desktop.
- **Automated checks:** unit and integration tests for the user service's token check, webhook and progress endpoint.

## Test journeys

| # | Journey | Passes when |
| --- | --- | --- |
| 1 | A new guest plays a round, then signs up with Google | Account made, round kept, profile screen shown once |
| 2 | A guest with games, reads and a review signs up with email | Code required; all progress on the account afterwards |
| 3 | Sign-in methods offered | Email/password and Google available; Apple not offered in 1.2.0 |
| 4 | Complete required names | Names retained, profile not shown again; missing/blank names cannot be skipped; no church field |
| 5 | Complete a profile with supplied social names or an existing church record | Names retained; church record unchanged; no church collection or skip control |
| 6 | An existing (imported) user logs in with their old password | Old password accepted; email verification required before account access; all history present afterwards; subsequent sign-ins do not repeat migration verification |
| 7 | An existing user logs in with Google on the same email | Email ownership verified before linking; same account, no duplicate; all history retained |
| 8 | Forgotten password, then log in on a second device | New password works; the first device is signed out |
| 9 | Log in on a new device that has guest progress | Both sets of progress present, nothing lost |
| 10 | Log out | Guest mode; landing shows Log in and Play |
| 11 | Sign up with a disposable email address | Refused with a clear message |
| 12 | Sign up with legitimate dotted email addresses | No custom punctuation-based rejection; Clerk’s normal verification and duplicate-address restrictions apply |
| 13 | `POST /auth/register` called directly on the user service | 404 |
| 14 | Delete account | Gone from Clerk, the database and the leaderboard |
| 15 | Leaderboard after James's manual cleanup | Removed accounts absent; remaining users retain their history and ranking |

## Church community proposal

Church collection, a directory, a Statistics subpage with church markers/counts and a heat map are deferred beyond 1.2.0. The future proposal is recorded in `docs/church-community-map.md`. The new onboarding flow collects names only and preserves existing church records. Canonical church records, legacy duplicate review, voluntary public participation, withdrawal and safe aggregate disclosure must be designed before publishing any existing church information.

## Open questions

1. **Existing-user verification implementation and recovery:** confirm Clerk's supported flow for first-sign-in email verification and decide the recovery route for users without inbox access. Requiring verification is decided.
2. **Passkeys:** in 1.2 or later? Recommendation: later; not yet decided.
3. **Dotted Gmail aliases:** custom rule removed from 1.2.0 scope; native Clerk protections remain.
4. **Clerk plan and data:** which plan? Confirm data hosting and update the Privacy and Cookies policies as needed.

## Remaining release steps

1. Configure the local/DEV user service with the additive schema and matching Clerk issuer/key/authorized origins, then enable its Clerk mode. The normal webapp account routes are already Clerk-only; no preview flag is needed.
2. Implemented the signed-in drawer’s Manage account entry and `/account/manage` Clerk settings page. It supports the provider’s profile/security/deletion controls, independently of backend availability. Verify the real signed-in page and webhook delivery in DEV; no custom management forms are needed.
3. Complete manual bot cleanup, run the read-only migration preflight against a DEV database copy, review blockers, and approve/rehearse the real import with existing passwords and unverified reserved emails.
4. Configure the DEV webhook endpoint/signing secret/instance and exercise live delivery, retries, updates and deletion. Verify the native bot-protection settings, and document recovery for people without inbox access.
5. Run the full desktop/mobile journeys, including guest play/tutorial, guest-to-account progress, email/Google sign-up, required names, imported sign-in, recovery, logout/account switching and deletion. Review privacy/cookie disclosures for the actual release behavior.
6. After DEV acceptance, prepare production keys/domain/webhooks and the backup/write-freeze/import/cutover plan. Deploy the backend and webapp in the agreed order, verify production, and retain the rollback/reconciliation plan before removing the remaining legacy backend code/columns.

The current implementation/readiness review, including the agreed removal/deferral of custom dotted-Gmail checks, additional public leaderboard throttling and CI changes, is in [onboarding-release-readiness.md](onboarding-release-readiness.md). Account management is implemented; live acceptance is still required.

Clerk and Google are retained. The privacy/cookie notices have been updated locally for the selected providers and actual account/storage behavior; production cookie inventory, retention decisions, operator identity and provider/transfer arrangements still need owner review.
