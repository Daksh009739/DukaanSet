# VoiceOS 3.1 verification — 12 October 2026

## Result

Implemented automatic finalized-turn delivery, app-language defaults, stale-response isolation, verified customer saves and the premium assistant workspace. Local automated gates pass. **Live human microphone, cloud speech and actual mobile-device acceptance remain open.**

## Passed checks

| Check | Result |
| --- | --- |
| Full unit/backend suite | 316 passed |
| Focused audio/language/backend regressions | 18 passed after language refinements |
| Semantic regression corpus | 66 intent cases / 188 slots passed |
| Language/control corpus | 24 language cases / 9 controls passed |
| VoiceOS 3.1 browser suite | 9 passed |
| Existing VoiceOS 3 browser suite | 7 passed |
| V17 financial/recovery/visual scenarios | 5 distinct scenarios passed across targeted runs |
| Conversation recovery suite | 6 passed |
| Cross-module VoiceOS suite | 8 passed |
| Approved dashboard suite | 4 passed, including separate desktop/mobile module sweeps |
| Dashboard interaction polish | 3 passed |
| Distinct browser scenarios above | 42 passed |
| Production build | Passed |
| Compiled review | 30 responsive layouts / 18 accessibility scans; no runtime errors or CSP violations |
| Mobile composer geometry | Focused input/send button remain above the confirmation bar in all three languages; header remains outside the scroll area |
| Typecheck, source lint, locale gate, diff check | Passed; 2575 locale keys, full parity, zero hardcoded visible copy |
| Existing localhost:3000 preview | HTTP 200 health response |

Tests use isolated fictional shops and real authentication/domain transactions. Browser ASR callbacks and installed voice catalogues are simulated. Cloud provider responses are mocked. Encoded-audio tests use an actual MediaRecorder/Web Audio synthetic stream and actual WAV decoding; this is not recorded human speech.

## Reproductions and regressions

- Both Rahul customer phrases were already correctly parsed by the shared semantic engine. Final delivery depended on recording-state effects and a completed flag; it is now an explicit unique receipt. Interim text cannot dispatch. Duplicate result/end callbacks cannot replay a turn.
- Native recognition now auto-stops after the configured speech-end/stable-text pause and recovers from missing end callbacks. A long sentence with provider speech-activity events is not cut off merely because its interim text stays unchanged. Cancellation/errors invalidate late callbacks and release capture.
- The 60-second safety limit fails an unfinished recording rather than dispatching a partial sentence. A targeted regression verifies that a final prefix cannot be delivered through this limit.
- The native browser customer test starts with an English greeting, switches to Hinglish speech, prepares Rahul, performs no early write, then saves exactly one actual customer after spoken confirmation. The compiled test additionally reads its authenticated statement back before success.
- Automatic Talk Mode produces one ₹800 invoice, ₹500 UPI receipt, ₹300 customer balance and a 10 kg stock deduction, with no capture/playback overlap.
- The standalone stock screen consumes a final receipt automatically and changes inventory only after confirmation.
- Delayed old sales responses cannot replace a new customer draft. A new same-intent report shows no old-period result while awaiting its own response.
- App language supplies initial/unclear defaults. Clear speech and recovered short replies retain their established language. App changes preserve the active draft. A regression caught cancellation resetting the language; this is fixed.
- “Duniya mein kitne customers hain?” no longer becomes a sales report or write. It asks about shop scope and explains the external-information limitation.
- The earlier CI module sweep ended with a disabled language control. Desktop/mobile sweeps now use separate fictional sessions and both pass; production request limits are unchanged. Existing assertions were updated for four welcome examples and specific Customer/Bill confirmation labels.

## Evidence and configuration

See [browser layouts](browser-layouts.json), [encoded-audio endpoint](cloud-endpoint.json), [customer verification](customer.json) and [compiled review](production-report.json). Representative compiled screenshots are included beside this report.

Local configuration inspection found no OpenAI STT key/provider or Azure TTS key/region/provider configured. No live provider calls or costs were fabricated. Actual Android/iOS microphone capture, keyboard/safe-area behavior, noisy-shop speech, low-volume speech, pronunciation and live latency require isolated HTTPS staging and representative human recordings.

The full root-cause/configuration guide is [VOICEOS-3.1.md](../../VOICEOS-3.1.md). Production promotion is pending those live acceptance gates.

## Main changed files

- [speech-turn.ts](../../../src/lib/voice/speech-turn.ts), [speech.ts](../../../src/lib/voice/speech.ts), [cloud-speech.ts](../../../src/lib/voice/cloud-speech.ts): session ownership, endpointing and cleanup.
- [voice-os-provider.tsx](../../../src/components/voice/voice-os-provider.tsx), [conversation-input.tsx](../../../src/components/voice/conversation-input.tsx), [voice-stock.tsx](../../../src/components/voice/voice-stock.tsx): direct final delivery, turn-taking and shared capture.
- [global-voice.tsx](../../../src/components/voice/global-voice.tsx): scoped responses, actual customer read-back, status/history and confirmation flow.
- [conversation-language.ts](../../../src/lib/voice/conversation-language.ts), [session.ts](../../../src/lib/voice/session.ts), [replies.ts](../../../src/lib/voice/replies.ts), [diagnostics.ts](../../../src/lib/voice/diagnostics.ts): language precedence/recovery, duplicate/scope replies and safe metadata.
- Draft/styles/locales, environment example, CI workflow, production review script and meaningful browser/unit regressions complete the change.
