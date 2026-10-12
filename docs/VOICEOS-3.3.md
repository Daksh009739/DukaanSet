# VoiceOS 3.3 implementation and acceptance

VoiceOS now opens into a default hands-free session. No Quick/Talk choice is required. Once a genuine spoken greeting completes, the microphone starts; final speech receipts dispatch once, and the next listening turn waits until the assistant finishes speaking. Confirmed customer, sale, payment, expense, product and stock results can continue to a new task. Financial writes still require confirmation of the current draft.

## Observed causes

The previous provider initialized `mode='quick'` and `talkActive=false`. Its input restarted only in Talk Mode after an explicit microphone start. Duplicate-customer replies had `continueTurn=false`; the UI disabled saving any matching name, and the request builder always rejected matching contacts. No contextual choice represented a separate same-name customer. These conditions prevented the requested Rahul conversation even though initial customer parsing and backend contact creation worked.

Report results already had command and account/shop identity guards. Those safeguards remain. A regression check found that blocking the text composer while a report fetched prevented an immediate new command; that lock was removed. Report fetching still does not open a microphone before its answer is ready.

## Audio ownership

`hands-free.ts` separates the session latch from business workflow, playback and capture. Opening creates a fresh audio session; pause is synchronous and stays latched until an explicit resume. Closing, backgrounding, page exit, shop/account changes and unmount release capture/playback. Stale session callbacks cannot reopen capture. The input starts after a completed reply with a cancellable 450 ms handoff. A provider-level guard rechecks the latch when that timer fires.

The existing `SpeechTurn` still owns unique recognition session/turn IDs and exactly one final receipt. Interim words never dispatch. Native speech activity and trailing silence end a bounded utterance; cloud capture uses actual MediaRecorder/WAV audio and adaptive RMS endpointing. The 1,800 ms default is configurable between 900 and 4,000 ms. A 60-second limit rejects an incomplete long turn rather than dispatching a prefix. Noise and natural pauses require live calibration: this energy detector is not a validated neural VAD.

Playback uses genuine device voices or configured Azure voices. Pausing/closing cancels the utterance/request/player. Audio failure preserves the text and pauses the automatic loop; Resume is an explicit recovery. Muted audio is a user preference, and the loop can proceed without pretending speech played. Device STT remains tied to browser language support; cloud STT receives both English and Hindi hints for code-switching.

The existing `gpt-transcribe` model and `languages[]` request fields were checked against [official OpenAI file transcription documentation](https://developers.openai.com/api/docs/guides/speech-to-text) on 2026-10-13. The wire-contract test uses a stub transport and does not establish live model performance. Provider secrets remain server-side. Azure voices are fetched from the configured provider catalogue; device voices come from the actual browser. The selected authenticated-user voice preference is shared with Main Settings.

## Conversation and confirmed execution

A matching customer name creates an outstanding duplicate question. The decision resolver runs before generic intent routing. Explicit separate-customer answers preserve the intended name and store a name-bound decision. Bare “yes” is insufficient at the duplicate question. Changing the name invalidates the decision. Opening an existing customer resolves its actual ID; ambiguous matches still require selection.

Separate customer requests retain `rejectDuplicate=true` and add `allowSameName=true`. The backend permits that option only for customers with identifier protection enabled. Existing records remain untouched; a matching phone is rejected. The transaction writes one new ID and an audit event, using the frozen idempotency key. Spoken success waits for authenticated customer-statement readback.

Uncertain confirmed requests first call `/voice-action-status` with the exact frozen path/body. The backend maps only registered actions, checks permissions/feature/shop membership, and matches the stored fingerprint. A committed receipt refreshes state without another POST. An absent receipt permits retry of the same idempotent request; a failed status check or changed account/shop never falls through into a write. This covers customers, sales, payments, expenses, catalogue imports and stock batches. Receipt absence is not a guarantee that a concurrent request is absent; idempotency still protects that race.

Other registered modules retain their existing authorized report services, document studios and reviewed workflow forms. Supplier, purchase, demand, document-sharing and closing review steps still use those existing confirmations. This change does not establish fully spoken completion of every external/form-based workflow.

## Interface

The approved dashboard, sidebar, hero and header layouts are preserved. The assistant has a compact shop header, one current reply, collapsed bounded history and embedded editable drafts. The composer and confirmation remain outside the scrolling conversation at phone widths. The mode selector, default example cards and minimize control were removed. Voice choice and optional interpretation consent are in Voice Settings. There is no assistant reply-language selector.

## Release state

Automated browser callbacks, encoded synthetic audio and real test-database actions are separate evidence from live speech. This implementation is **not signed off for production** until the desktop and Android human microphone checks pass, provider credentials/capabilities are verified in staging, and reviewer/CI gates pass. Use `node scripts/qa/voice33-release-gate.mjs` to validate the live acceptance record before promotion.

The local credential-presence audit found no OpenAI STT or Azure TTS configuration. The owner has confirmed that credentials are available and that they can test desktop and Android; their server-side configuration location or HTTPS staging URL is still pending. No live provider or human microphone results have been recorded. See `docs/qa/voice33/REPORT.md`, `docs/qa/voice33/LIVE-TEST.md` and `docs/qa/voice33/live-acceptance.json` for evidence and pending checks.
