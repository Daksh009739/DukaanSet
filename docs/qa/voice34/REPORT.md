# My Voice AI verification

Verified 13 October 2026. This record covers the implemented enrollment, profile and assistant-audio flows. It does not establish live voice-cloning quality or completed human desktop/Android acceptance.

## Checks completed

The final production build and TypeScript check passed. All 340 application tests passed, including My Voice AI server tests for account eligibility, sample quality, consent/challenge binding, independent ownership verification, profile privacy, cross-account access, language approval, optimistic preference revisions, deletion and uncertain provider creation.

The compiled application browser review passed with a fresh isolated SQLite database and fictional account. It used actual browser WebAudio, MediaRecorder WAV encoding and HTMLAudioElement playback. Recognition events, the ownership gateway and the cloning/TTS provider were explicit QA simulations. Audio was generated from an oscillator; no human microphone was accessed and no real provider profile was purchased or created.

The passing review covers:

- Explicit consent and a fresh script/phrase before capture; roughly 12 seconds of actual encoded audio; no profile generation before Generate My Voice.
- Account-scoped provider status, generated preview playback, preview-completion gating and explicit activation; cloud speech-recognition consent remains unchanged.
- Reloaded private profiles and separate English, Hindi and Hinglish preview approval.
- Hands-free duplicate-name follow-up, one confirmed new customer save, unchanged existing customer/invoices/products, automatic next-task listening and disclosed standard-voice fallback during a simulated provider outage.
- Shared settings suspend the conversation microphone and restore the same active session when closed. Switching to My Voice and stopping a preview preserve that resume lease. No microphone overlap was observed.
- Confirmed provider deletion removes the private profile reference and restores the standard-voice preference.
- Denied microphone permission recovery, automatic stopping at the 15-second ceiling, and Retake/Cancel releasing all capture tracks without another generation request.
- Twelve responsive checks: three languages at 320, 390, 768 and 1,440 px, with no document or card overflow. Three axe WCAG A/AA scans returned zero violations.
- Zero browser page errors in the final run.

The synthetic provider fixture matches the actual Hindi speech text used for Hinglish replies. Timer assertions check the encoded duration rather than assuming an exact 15.0-second display, and the fixture's track-stop wrapper is idempotent like a real MediaStreamTrack. These are test-harness corrections; they do not waive app behavior or ignore browser errors.

## Evidence and reproduction

The structured report is `.local/qa/voice34/production-report.json`; the active-profile screenshot is `.local/qa/voice34/my-voice-active.png`. The isolated checkout retains recording-ready and 390-px language screenshots. All evidence is deliberately fictional/synthetic.

After building an isolated checkout:

```powershell
node --import tsx --test tests/voice34.test.ts
node scripts/qa/voice34-production-review.mjs
```

The browser script owns port 3002 and creates a unique QA database. Its provider preload rejects execution without the explicit fictional database and fixture credentials. It is not a runtime fallback provider or a production verification service.

## Still required for live acceptance

Configure an eligible Resemble account and independently approved ownership-verification gateway as described in [My Voice AI](../../MY-VOICE-AI.md). Run with real server credentials, a consenting speaker, actual English/Hindi/Hinglish audio, and desktop plus Android hardware. Verify similarity, pronunciation, latency, browser permission recovery, interruption and remote deletion against the live account. These remain pending; synthetic tones and simulated attestations cannot satisfy them.
