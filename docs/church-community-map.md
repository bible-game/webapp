# Church community map — proposal

Status: future feature, deferred beyond 1.2.0 by release decision on 10 November 2026. Church collection has been removed from the new onboarding flow; existing church records remain untouched pending privacy review. Church is excluded from the active account API and Clerk import/metadata; the legacy database column remains only for staged rollout compatibility and a separate retention cleanup. Neither the map nor heat map is implemented. No existing church entries have been published, geocoded or merged.

## Purpose

A Statistics subpage could show churches connected to Bible Game, with map markers indicating the number or band of participating accounts and a heat map summarising church participation across areas. Neither view should use player home or device locations. The invitation is to help people see a wider community and optionally share their church. The figures represent players who chose to participate, not church membership, endorsement or a verified attendance census.

## A directory before a map

Free-text church entries cannot reliably power a map. Introduce a canonical church record with a stable ID, display name, town/city, country and a verified public location. Keep aliases and a moderation process for duplicate suggestions. Churches with the same name or different campuses must remain distinguishable.

Users should be able to search for an existing church, choose “I can’t find my church”, or leave it blank. If reintroduced, church selection must be optional regardless of names being required.

The six reported Emmanuel Church Northwood entries are a useful backfill example: review whether they identify the same church/site, then associate those accounts with one church ID. Do not treat six text submissions as six churches or automatically infer that similar names identify the same place. Preserve originals while reviewing ambiguous matches.

## Privacy requirements before collection or publication changes

A church association can reveal religious beliefs, depending on the data and its use. Treat this as potentially special-category personal data. Review the purpose, Article 6 basis and any applicable Article 9 condition, privacy notice, retention, access and deletion before launch. An optional text field is not equivalent to consent to public mapping.

Proposed design safeguards, subject to that review:

- Separate saving church affiliation from contributing to the public map. Use a clear, unticked opt-in explaining that the contribution may reveal a religious association. Provide an equally easy withdrawal/change route. Do not automatically include historic entries.
- Pins identify public church premises, never player homes, device locations or IP-derived locations. Do not expose names, emails, account IDs or lists of players attached to a church.
- Derive counts from distinct eligible accounts that have opted in. Remove withdrawn/deleted contributions. Avoid using raw submission totals or treating a free-text entry as proof of church affiliation.
- Consider count bands, suppression of small groups, delayed updates and clustering at wider zoom levels. A threshold alone does not guarantee anonymity; assess small churches, count changes, and linkage to the public leaderboard.
- Review external map/geocoding providers and their terms/data processing. Resolve public church locations without sending player identifiers or individual affiliation records to a geocoding provider.
- Allow users to correct or remove their church. Handle safeguarding concerns and users in places where disclosing a church connection may create a particular risk.

Existing church collection also needs its basis and notice reviewed; the concern is not limited to adding a map.

## Suggested delivery order

1. Confirm the purpose and privacy approach, including whether names on the existing leaderboard should remain full names or use a less identifying public display.
2. Design local previews for church search/selection and explicit map participation. Add no public map promise to the current onboarding form until the design is agreed.
3. Build the canonical directory, moderation and consent/withdrawal records; review legacy matches without automatically enrolling them in public statistics.
4. Add a read-only `/stats/churches` subpage with aggregate markers, accessible list alternative and privacy-safe counts, after the data and disclosure review.

## Sources for the review

- [ICO: What is special category data?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/)
- [ICO: What are the rules on special category data?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/)

## Required names and inclusivity

For the current onboarding flow, first and last names are required to complete the account profile after email verification. Existing social names are retained. Church is not collected in this release. The leaderboard behavior remains unchanged; the onboarding leaderboard sentence has been removed. Validation permits Unicode, spaces, apostrophes and hyphens, without imposing a Western-name format beyond the two required fields.

A single-name exception or a required full/display-name field remains a product decision: not everyone has both a first and a last name. See [ONS name guidance](https://service-manual.ons.gov.uk/design-system/patterns/names).
