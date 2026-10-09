# V5 localization audit

Audit baseline: dev commit `d647a55a37e314e9f46d7c1de3d07bdf5dc9d0a4`. The V5 brief is saved in `docs/briefs/v5-multilingual-master.md`.

The baseline used six fragmented translation namespaces with 962 entries. An initial AST scan detected 122 literal JSX/attribute text occurrences; this was a lower bound, since dynamic copy was also present. 265 Hinglish entries duplicated their English values. Public pages, document labels, units, dates, error messages and communications needed centralized coverage.

The final dictionaries contain 1,543 entries per language across eight namespaces:

| Dictionary | Entries |
| --- | ---: |
| common | 409 |
| errors | 65 |
| retail | 63 |
| saas | 225 |
| sales | 141 |
| inventoryVoice | 115 |
| voiceos | 94 |
| marketing | 431 |

The release gate reports 100% key/interpolation parity, no JSON duplicates/empty text, no unapproved Hindi Latin prose, no unexpected Hinglish Devanagari, no unapproved copied English Hinglish prose and zero detected raw JSX interface text. Approved brands, short Roman retail terms, language names and CSV technical codes are explicit exceptions; original merchant data is not translated.

Public copy now covers the homepage and 18 published detail pages in each locale, including metadata and canonical/hreflang alternatives. Authentication, onboarding, workspace modules, VoiceOS, DemandPulse, offline copy, settings, known error codes, activity labels, document labels and communications share the resource registry.

Two behavior risks were fixed alongside the copy audit: language snapshots triggering business reload/form unmounts, and asynchronous AI/PDF work completing after a locale change. Tests verify that language changes preserve drafts and ledger values, while old responses cannot overwrite the current language.

Remaining acceptance work is environmental: live staged deployment needs the durable backend/volume and email sender described in the deployment report. Physical microphone behavior and a human review of the configured live provider's language quality cannot be established by mocked browser tests or a script validator.
