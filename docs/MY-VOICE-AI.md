# My Voice AI

My Voice AI is integrated into the shared Assistant Voice settings. A verified, non-demo account can record its own fresh 10–15 second consent script, review the sample, explicitly generate a private profile, listen to a generated preview and choose Use My Voice. Standard voices remain usable when enrollment is unavailable.

The adapter uses Resemble's documented [voice creation](https://docs.resemble.ai/voice-creation/voices/create), [voice resource capabilities](https://docs.resemble.ai/voice-creation/voices) and synchronous synthesis endpoints. API access and cloning entitlement must be confirmed for the selected account before live enablement. The application activates only a provider profile whose returned status and synthesis capabilities are ready. English, Hindi and Hinglish each require an approved preview in a supported language.

## Server configuration

Configure the following on the durable server. Do not put them in `NEXT_PUBLIC_*`, browser storage or a committed environment file.

| Variable | Meaning |
| --- | --- |
| `MY_VOICE_PROVIDER` | `resemble` |
| `RESEMBLE_API_KEY` | The private API key for the eligible voice-cloning account |
| `MY_VOICE_ENCRYPTION_KEY` | Base64 encoding of a cryptographically random 32-byte AES key; preserve it for existing profile references |
| `MY_VOICE_VERIFICATION_URL` | An approved HTTPS ownership-verification gateway implementing the protocol below |
| `MY_VOICE_VERIFICATION_KEY` | Private bearer credential for that gateway |

These are empty in `.env.example`. Enrollment remains unavailable until all requirements are configured. The independent gateway is a required integration, not a claim that this application can establish voice ownership from a waveform alone. The QA gateway is synthetic and must never be deployed as verification.

## Ownership gateway contract

The server posts multipart `audio` (mono 16 kHz PCM16 WAV) and JSON `metadata`, using the configured bearer credential and a 30-second timeout. Metadata identifies `protocol: dukaanset-own-voice-v1`, the authenticated subject, challenge ID, fresh phrase, consent script, language, sample SHA-256 and consent version. No provider upload occurs before a valid response.

The response must echo `protocol`, `subject`, `challengeId` and `sampleSha256`; declare `retention: none`; provide `referenceId`; and independently attest `verified`, `consent`, `phraseMatched`, `consentStatementMatched`, `consentingSpeaker`, `liveness`, `singleSpeaker`, `noiseAcceptable` and `clippingAcceptable`. It must provide `usableSpeechSeconds` of at least ten seconds, bounded by the sample duration, and timestamped transcript `segments` covering the complete sample without gaps or overlaps. Every segment is 1–12 seconds; three to eight segments are accepted, matching the provider's [individual-recording cloning workflow](https://docs.resemble.ai/voice-creation/voices/clone-overview). All required attestations must be `true`; failures reject enrollment before cloning.

The server validates the sample encoding, duration, levels, clipping, SHA binding, response scope and segment coverage. It sends verified transcript-aligned segments to the provider, stores only private encrypted provider references and audit metadata, and clears the in-memory audio after provider submission. It does not save the source recording in SQLite or the public filesystem. Provider handling and retention must be established in the live service agreement; local erasure does not imply provider erasure.

## Lifecycle and conversation behaviour

Generation, provider completion, preview and activation are separate steps. Merely finishing a recording or creating a profile does not select it. The client waits for preview playback completion before enabling Use My Voice. The server binds activation to a recent, account-scoped preview ticket and an optimistic preference revision. Each language must be approved separately. Activation does not grant cloud speech-recognition consent.

Delete My Voice requires an explicit confirmation, deactivates the selected preference immediately, and retains a deletion-pending state until the provider acknowledges removal. Uncertain creation is retained for later verified cleanup rather than pretending that a provider profile was not created. Per-account and global enrollment limits and speech rate/character ceilings are enforced.

Opening shared settings suspends the hands-free conversation microphone. Closing restores the prior active conversation through its scoped session lease. Recording and preview release tracks, audio objects and blob URLs on cancellation, navigation, backgrounding and cleanup. Provider speech failures fall back to an available standard device voice with a visible fallback message. Financial saves continue to require the existing confirmed, idempotent task path.

## Verification and live acceptance

The automated server tests are in `tests/voice34.test.ts`. `scripts/qa/voice34-production-review.mjs` uses a compiled app, fresh isolated database, actual browser WebAudio/MediaRecorder/playback and explicitly simulated recognition, ownership verification and provider responses. It does not test human speech quality, real cloning similarity or an Android microphone. See the [verification record](qa/voice34/REPORT.md) for the completed checks and evidence.

Live enablement still requires an eligible account, the independently approved verification gateway, real credential configuration, and a consenting desktop/Android pass covering recording, all three language previews, activation, hands-free follow-ups, interruption, deletion and fallback. The user has offered to perform desktop and Android testing. Existing synthetic evidence must not be presented as completed live acceptance.
