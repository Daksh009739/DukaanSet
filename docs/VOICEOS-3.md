# VoiceOS 3.0

VoiceOS 3.1 supersedes the initial language/default and endpoint behavior below. See [VOICEOS-3.1.md](VOICEOS-3.1.md) for root causes, finalized turns and outstanding live audio gates.

VoiceOS uses the existing authenticated application, semantic draft engine and business services. App display language remains separate from conversational language. There is no input or reply language picker. English, Hindi and Hinglish follow each full utterance; short answers retain the current conversation language. The language, draft and bounded conversation history recover in the existing user/shop session. Talk Mode starts only after the merchant starts the microphone, pauses recognition during a reply and resumes after successful playback. Quick Mode handles one turn at a time.

Writes use reviewed domain requests and one explicit screen or spoken confirmation. A spoken yes binds to the current complete draft and current shop. Financial and inventory results come from verified backend responses. Frozen retries retain their idempotency key; stale sale product/customer snapshots fail before creating records. Existing stock, unit, payment, permission, trading-day and audit validation still applies. Ambiguous generic product counts ask sale versus stock and require actual product names. High-risk reversals, refunds, closing and document delivery keep their existing review and authorization flows.

## Speech provider decision

OpenAI's current transcription API supports automatic language recognition using `gpt-transcribe` and returns language metadata. The adapter sends only a bounded microphone turn without a forced input locale. See [the official transcription reference](https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create) and [speech-to-text guide](https://developers.openai.com/api/docs/guides/speech-to-text).

Azure neural TTS exposes an actual voice catalogue with names, locales, secondary locales and gender. The application discovers supported English/Hindi voices from that catalogue rather than claiming every voice is bilingual. See [the REST TTS API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech) and [language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support). This also avoids adding a dependency on the OpenAI TTS model families covered by the [current deprecation notice](https://developers.openai.com/api/docs/deprecations).

These are integration choices, not measured pronunciation or latency winners. Real noisy-shop recognition, Hindi/Hinglish pronunciation, end-to-end latency and account-specific costs remain unverified until credentials and representative human audio are available. Device speech provides an existing fallback whose installed voices, recognition accuracy and provider privacy vary by browser/OS. Native recognition requires an internal recognition locale; this is automatically derived from the active conversation, not a user selector. Configured cloud STT is required for genuine automatic recognition across languages from the first audio turn.

## Backend configuration

Set secrets on the durable backend, never in `NEXT_PUBLIC_*`, the repository, browser code or the Vercel gateway:

```dotenv
VOICE_STT_PROVIDER=openai
VOICE_STT_MODEL=gpt-transcribe
OPENAI_API_KEY=<secret from the OpenAI account>
VOICE_TTS_PROVIDER=azure
AZURE_SPEECH_KEY=<Azure Speech resource secret>
AZURE_SPEECH_REGION=<resource region, e.g. centralindia>
VOICE_AUDIO_DAILY_MAX_REQUESTS=10000
```

Each authenticated user must enable **Allow cloud speech** before audio or reply text is sent. Select a real assistant voice in the VoiceOS header settings or Main Settings → VoiceOS; both use the same component and authenticated preference with optimistic revisions. Providers may expose hundreds of voices, so search and pagination keep the picker bounded. Previews use the actual chosen voice. A voice lacking the conversation locale falls back to a compatible installed device voice, or visible text with an explanation. Saved selection remains available for future compatible turns. Disabling spoken replies leaves the draft and text usable.

Optional `VOICE_STT_USD_PER_MINUTE` and `VOICE_TTS_USD_PER_MILLION_CHARACTERS` must be the deployment's actual rates. Without both values, estimated cost is unavailable. The estimate is based on reserved audio seconds/characters, including failed attempts, and is not an invoice. Usage counters are rolling 24-hour quotas. Each user has 30 requests per kind per minute, 1,200 requests/day, 300,000 reply characters/day and 3,600 recorded seconds/day. The backend also enforces a global 10,000-request/day ceiling, configurable from 1 to 100,000. Quota rejection occurs before the billed provider call. Catalogue discovery is cached for 15 minutes.

For optional semantic cloud interpretation, the existing separate opt-in uses `AI_PROVIDER=openai`, `OPENAI_MODEL` and the same server-only `OPENAI_API_KEY`. Choose a currently supported Responses model for that account. It receives bounded task context and references; the server validates allowed intents, entities, roles and slots, and it cannot write business records. Deterministic semantic parsing, corrections and review remain available without it. This is not an unrestricted agent or a guarantee that arbitrary speech commands will be understood.

## Audio and cleanup

Cloud capture uses MediaRecorder with echo cancellation, noise suppression and gain control where supported. A simple bounded silence detector ends turns after approximately 1.1 seconds of silence following speech. This needs acoustic calibration on target devices and noisy shops. Recording stops at 60 seconds, cancels after 15 seconds without detected speech and is bounded to 4 MiB. The client decodes/resamples to mono 16 kHz PCM WAV; the server independently checks header, payload length and duration before transcription. STT has a 25-second provider timeout; TTS has 20 seconds. Requests are aborted on dismissal, scope changes, cancellation, offline state and hidden/page-exit events. Microphone tracks, timers, audio contexts, queued playback, fetches and blob URLs are released.

This is bounded, turn-based speech. Cloud transcription arrives after each recorded turn; it is not streaming live captions. Native interim results display in the composer. TTS returns a buffered audio response; this is not full duplex audio or streaming synthesis. Talk Mode pauses if playback fails or is stopped and needs deliberate microphone restart. Cancellation clears an unsaved draft, never undoes a verified saved record. An uncertain write remains available for its frozen screen retry.

DukaanSet stores preferences and usage metadata, not raw recordings. Audio/reply text is sent to the selected external provider when consented; configure that provider's retention and regional policies separately. Scoped browser draft/history storage contains business details and should be cleared with normal account/device management. No entire ledger or recording archive is sent to speech services.

## Validation and live acceptance

See `docs/qa/voice3/REPORT.md` for measured local checks and limitations. Automated audio tests use simulated device APIs and synthetic encoded audio with mocked provider transcripts; backend transactions are real in isolated fictional shops. They are not human acoustic acceptance tests.

Before production audio sign-off, configure the credentials above on staging over HTTPS, select catalogue voices reported as supporting Hindi/English, verify audio playback/consent on each target browser, and run the Rahul flow with actual speech: 10 kg Daal at ₹80, ₹500 UPI, ₹300 credit, then “Haan save karo.” Verify exactly one ₹800 invoice, ₹500 UPI receipt, ₹300 customer balance and 10 kg stock deduction before hearing success. Repeat on English/Hindi/Hinglish voices, noisy audio, corrections, provider timeout, disconnection, duplicate confirmation, role-denied access and shop switching. Capture actual latency and pronunciation feedback; do not label live audio production-ready before these checks pass.
