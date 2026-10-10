# V14 rendered audit

All captures use fictional isolated shops. “Before” is the previously verified V13 compiled application, not the seven missing original attachment images. The approved dashboard reference remains [available in V13](../v13/approved-reference.png). Values and dates vary with fixture creation; this comparison evaluates layout and supported actions.

| Audit screen | Before, desktop | V14 desktop | V14 mobile |
| --- | --- | --- | --- |
| Stock details | [Before](before-stock-1440.png) | [After](after-stock-1440.png) | [390px](after-stock-390.png) |
| DemandPulse | [Before](before-demand-1440.png) | [After](after-demand-1440.png) | [390px](after-demand-390.png) |
| Customer details | [Before](before-customer-1440.png) | [After](after-customer-1440.png) | [390px](after-customer-390.png) |
| Business Assistant | [Before](before-assistant-1440.png) | [After](after-assistant-1440.png) | [390px](after-assistant-390.png) |
| Settings | [Before](before-settings-1440.png) | [After](after-settings-1440.png) | [390px](after-settings-390.png) |
| VoiceOS idle | [Before](before-voice-idle-1440.png) | Shared microphone-first Assistant shown above | [Idle](after-voice-idle-390.png) |
| VoiceOS review | [Before](before-voice-review-1440.png) | [Exact-command clarification](after-intent-choice-desktop.png), [sale draft](after-sale-review-desktop.png) | [Clarification](after-intent-choice-390.png) |

Additional actual runtime states: [listening](after-voice-listening-desktop.png), [saving](after-voice-saving-desktop.png), [confirmed stock success](after-voice-success-desktop.png), [uncertain acknowledgement and retry](after-voice-error-recovery-desktop.png), [contextual product preparation](after-demand-prepare-desktop.png). Listening uses controlled recognition events; saving executes a real isolated backend request with a short test delay; recovery deliberately drops a real committed acknowledgement and then retries the same idempotent request.

English, Hindi and Hinglish captures use the `after-{screen}-{language}-390.png` filenames. Compiled production captures and the corresponding result reports are preserved separately after the build. The visual audit checks eight widths; axe checks the five principal redesigned screens at 390 and 1440px. Existing VoiceOS suites separately cover its dialogs and keyboard interactions.

| Final compiled screen | Desktop | Mobile |
| --- | --- | --- |
| Stock | [1440px](compiled-stock-1440.png) | [390px](compiled-stock-390.png) |
| Customer | [1440px](compiled-customer-1440.png) | [390px](compiled-customer-390.png) |
| DemandPulse | [1440px](compiled-demand-1440.png) | [390px](compiled-demand-390.png) |
| Assistant, with loaded financial answer | [1440px](compiled-assistant-1440.png) | [390px](compiled-assistant-390.png) |
| Settings | [1440px](compiled-settings-1440.png) | [390px](compiled-settings-390.png) |
