# Clerk / Google policy review

10 November 2026. The decision is to retain Clerk and Google, alongside email/password sign-in. Existing privacy/cookie pages have been updated locally; this is a factual implementation draft, not a completed legal review or production cookie audit.

## Updated wording

- Privacy: required first/last names, saved game/reading/study progress, Clerk's authentication role, optional Google identity sharing, separation of Bible Game progress from Clerk authentication, public leaderboard names and management/deletion behavior.
- Google: identity details may include name, email, Google account ID and profile image as provided and authorized. The production OAuth application must request only the intended identity scopes. Do not promise that no Google data reaches Clerk.
- Cookies: Clerk session/client examples, the app's `known_user` and `tz` one-year cookies, persistent local storage and optional Google sign-in domains. Removed the blanket claim that everything is essential and no consent consideration is needed.
- Technical monitoring: Sentry and Vercel Speed Insights are disclosed rather than making a broad no-analytics claim while performance monitoring is installed.
- Transfers: removed the unsupported generic assurance of GDPR-equivalent safeguards and linked Clerk's processing/subprocessor documentation. The actual applicable arrangements must be checked before publication.
- A fixed last-updated date replaces a privacy date that automatically changed with the year.

## Owner confirmation before final publication

1. Identify the actual legal operator/controller and contact details. “Bible Game” plus the support email may not fully identify the responsible person/entity. Confirm the lawful bases already listed in the notice for the service's actual circumstances.
2. Set/document retention periods or sufficiently specific criteria for account records, inactive accounts, backups, logs, migration artifacts, historical church data and the minimal deleted-ID guard. The implemented deletion workflow does not erase every backup or browser cache remotely. Do not invent fixed periods that are not enforced.
3. Review Clerk's applicable terms/DPA, its role distinctions for different data categories, current subprocessors and the transfer arrangements that apply to the production account. The notice does not establish that these arrangements have been reviewed or accepted. Check AWS/Vercel/Sentry arrangements too.
4. Inspect production browser storage/network activity for guest, email/password, Google and account-management flows. Confirm names, domains, expiry, purposes and any security-provider cookies. Development Clerk uses different infrastructure/credentials, so its inventory alone is insufficient. Assess consent/exceptions for each actual storage use; adding Clerk/Google does not by itself settle whether a banner is required.
5. Configure Google production credentials/consent branding with the published privacy link and intended identity scopes. Check any additional Google publishing/verification requirements for that configuration. Google OAuth authorization is not blanket consent for unrelated uses of player data.
6. Publish the notices with the Clerk release and make them available where account data is collected. The app currently links policies from the menu; Clerk's sign-up legal-link configuration should also be verified for production.

The immediate updates belong in the existing Privacy and Cookie policies. This work does not create a separate Google policy or claim the existing legal basis/retention sections are complete.

Sources reviewed:

- [Clerk Google setup](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google)
- [Clerk authentication cookies](https://clerk.com/docs/guides/how-clerk-works/cookies)
- [Clerk processing agreement](https://clerk.com/legal/dpa) and [subprocessors](https://clerk.com/legal/subprocessors)
- [Google cookie information](https://policies.google.com/technologies/cookies)
- [ICO right to be informed](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/)
- [ICO storage/access exceptions](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
