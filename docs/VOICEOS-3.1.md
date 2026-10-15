# VoiceOS 3.1 — implementation and audio sign-off

This release repairs finalized speech delivery, response isolation and language defaults in the existing authenticated application. It improves the assistant workspace while preserving the approved dashboard/sidebar. Live speech quality and production rollout remain separate acceptance gates.

## Root causes found

- Both exact Rahul customer phrases already resolve correctly through `advancePageVoice`: customer intent, Rahul name, no product/payment questions. Reproduction did **not** justify replacing that parser.
- Composer and standalone stock dispatch depended on an effect watching only `capture.recording`. Playback/abort could clear the completed flag before consumption; no unique final receipt existed. Both now receive finalized text directly once, with session/turn IDs. Interim text only updates the composer.
- Native endpointing depended on fully final text, a hardcoded 1.1-second pause and a provider `onend` event. Changed text/provider speech-end now schedule a configurable silence window, enter finalization, and use a bounded missing-end recovery. Interim-only words never become an action.
- Greeting/reset language was hardcoded Hinglish. App language now supplies initial and uncertain defaults. Clear English/Hindi/Hinglish establishes speech language; short answers retain it. App changes preserve the draft and recovery retains the language source. Cancellation keeps the established reply language.
- Bare report/closing React state could be reused by a new command before an effect cleared it. Results now carry their command identity and user/shop scope; render and speech require both to match. Async errors/latest-document selection are also isolated from superseding requests.
- The worldwide-customer question reproduced as a sales report. It now asks about shop scope and states that worldwide counts cannot be verified, with no writable request or semantic-provider override.

## Session and transaction behavior

`SpeechTurn` separates permission, listening, speech detection, finalization, completion, error and cancellation from business conversation state. Terminal sessions cannot deliver another receipt. The provider invalidates generations, clears native callbacks/timers, aborts cloud requests and releases resources. Cloud tracks/contexts close before transcription. Starting capture interrupts playback; late automatic replies cannot interrupt capture. Talk Mode resumes after successful playback and pauses on failure/cancellation.

The existing typed action registry, role/tenant checks, strict semantic contracts, frozen idempotency requests, optimistic snapshots and atomic ledger writes remain authoritative. Customer success uses the actual backend name/ID and reads the authenticated customer statement back before announcing success. A failed read preserves the same protected retry. Existing-contact detection prevents accidental duplicate creation.

The workspace adds a localized subtitle, actual shop/status, settings/minimize/close controls, timestamped merchant/assistant bubbles, bounded keyboard-accessible history and specific New Customer/New Bill confirmation labels. The confirmation bar stays visible during review; the composer uses normal document flow, focus scrolling and safe-area spacing. Actual device keyboard behavior still needs acceptance testing.

## Endpoint configuration

`NEXT_PUBLIC_VOICE_END_SILENCE_MS`: default **1800 ms**, allowed **900–4000 ms**. Invalid values use the default. Rebuild the frontend after changes. Longer values tolerate slower speech pauses and add latency. `speechEndpointPolicy` also declares a 3-second native finalization deadline, 15-second permission/no-speech bounds and a 60-second recording safety cap. Reaching the safety cap fails the turn instead of dispatching a potentially incomplete sentence. Server transcription has a separate bounded timeout.

Cloud endpointing uses adaptive audio energy, consecutive voiced frames and trailing silence. It is an energy detector, **not a validated neural speech/noise classifier**. Continuous loud noise, very quiet speech and pauses exceeding the configured window need real-device tuning. Native recognition uses its browser service and the app-derived locale; genuine automatic multilingual recognition from the first audio turn requires cloud STT.

Provider configuration, actual catalogue/voice previews, consent, privacy, quotas and optional contracted cost rates remain in [VOICEOS-3.md](VOICEOS-3.md). OpenAI STT/Azure TTS keys stay server-side. Header and Main Settings use one persisted real voice preference. No separate input/reply language picker is introduced.

## Diagnostics

Development-only bounded speech events record conversation/turn/session IDs, phase, finalization/dispatch flags, language source, elapsed time and sanitized errors. Business diagnostics record request ID, intent, parser, clarification/draft/execution state and backend result. They omit raw transcripts, customer names, audio and financial values and remain separate from the authoritative domain audit.

## Required staging acceptance still open

Automated checks use simulated native recognition events and synthetic Web Audio with mocked external transcription, alongside actual authenticated database writes. They do **not** establish human microphone accuracy, Indian accents, pronunciation, noisy-shop quality, live latency or Android/iOS behavior.

Configure real STT/TTS credentials on isolated HTTPS staging and verify:

- English app greeting → both Rahul customer phrases → automatic end → editable draft → spoken confirmation → exactly one customer visible in Customers and verified before success.
- Rahul bill → 10 kg Daal at ₹80/kg → ₹500 UPI + ₹300 credit → confirmation → one ₹800 invoice, ₹500 receipt, ₹300 balance and 10 kg stock reduction.
- Sales followed immediately by a customer request; duplicate finals; long pauses; quiet/noisy speech; interruptions; permission/network/provider failures; shop/account changes.
- Actual Android Chrome/iOS Safari, keyboard and safe areas, Hindi/English/Hinglish previews/playback and measured endpoint/STT/TTS latency.

Do not describe these live gates as passed without evidence. Review uses the existing feature → dev PR workflow; this change does not promote production domains.
