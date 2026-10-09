# Smart WhatsApp document delivery

Send on WhatsApp opens a recipient sheet for the saved invoice, account statement or existing payment receipt. It retrieves the actual private PDF, shows the customer/number, permits an independent communication language and requires an explicit confirmation. Display language changes do not change the PDF or message preference. No sending path creates a sale, payment or inventory movement.

## Manual sharing

On devices supporting `navigator.canShare({files})`, confirmation invokes the native share sheet with the actual PDF file. Choose WhatsApp and verify the final recipient there; the web app cannot force the app/recipient or know whether the file was delivered. Successful native handoff records only **Manual sharing initiated**. Cancelling the share sheet does not record delivery.

Other browsers show Download PDF → Open WhatsApp chat → Attach the downloaded PDF. A `wa.me` link pre-fills text and opens a chat; it cannot attach a file. The fallback says this explicitly and its message says the PDF will be attached separately. Ten-digit Indian mobile numbers are normalised to country code 91; explicit international numbers are also supported. This validates syntax, not WhatsApp membership or number ownership. An edited recipient must be saved to that customer's communication preference before sharing. Opted-out customers are blocked. No actual customer chats were opened during automated tests.

## Official sender setup

Direct sending is optional and disabled without a configured official WhatsApp Business connection. An administrator must complete Meta onboarding and configure a trusted sender, WABA, token, application secret, verification token and approved document templates. Shopkeepers see Test connection, Enable configured sender and Disconnect direct sending in Settings → WhatsApp & Invoice Sharing. Testing verifies that the phone ID belongs to the WABA and retrieves approved templates. Disconnect disables DukaanSet sending; it does not remove the Meta account.

Store credentials in the **backend deployment secret manager**, not browser code, Git, SQLite, Vercel gateway variables or chat. `WHATSAPP_CONNECTIONS_JSON` maps the existing business UUID to environment variable references:

```json
{
  "<existing-business-uuid>": {
    "phoneNumberId": "<Meta phone-number ID>",
    "wabaId": "<Meta WhatsApp Business Account ID>",
    "sender": "<business sender label>",
    "version": "<verified supported Graph API version>",
    "tokenEnv": "SHOP_WA_TOKEN",
    "appSecretEnv": "SHOP_WA_APP_SECRET",
    "verifyTokenEnv": "SHOP_WA_VERIFY_TOKEN",
    "templates": {
      "en": { "name": "<approved template name>", "language": "en", "keys": ["name", "business", "reference", "amount"] },
      "hi": { "name": "<approved template name>", "language": "hi", "keys": ["name", "business", "reference", "amount"] },
      "hinglish": { "name": "<approved Roman Hinglish template name>", "language": "<Meta-approved language code>", "keys": ["name", "business", "reference", "amount"] }
    }
  }
}
```

The placeholders are documentation only and must be replaced with real IDs, version and approved template names. Pin an officially supported Graph version during onboarding; no production default is assumed. Unit transport fixtures use `v26.0` without claiming that version has been verified against live Meta. Reference names must match uppercase secret environment variables with real values. Changing phone/WABA/version/template mappings invalidates the earlier verification until tested again. Secret rotations remain in the deployment secret store.

Templates must be approved **UTILITY** templates with a **DOCUMENT** header and a BODY of at most 1,024 characters. The ordered `keys` map numeric `{{1}}`… parameters to saved name, shop, reference and amount. Named template parameters, button parameters, more than four body parameters and pagination beyond the first 100 sender/template results are not implemented. Configure three approved mappings or use manual sharing for an unavailable language. Roman Hinglish uses whatever language code Meta actually approves; `hinglish` is the application preference, not an invented Meta language code.

DukaanSet always uses the verified utility document template for direct sends, including within the service window. It does not trust a client-supplied 24-hour eligibility flag or fall back to free-form messages. It requires a saved recipient, transactional permission/source, no opt-out and template verification within the past 24 hours. Consent records are declarations by the merchant, not proof fabricated by the application. The current [WhatsApp Business policy](https://whatsappbusiness.com/policy/) requires appropriate opt-in, opt-out handling and approved templates for business-initiated/out-of-window conversations. Review Meta policy and approved template text during live onboarding.

## Media, confirmation and status

The server uploads the same PDF bytes as multipart `application/pdf` to the configured phone's official `/media` endpoint. It sends a document-header template referencing that media ID and its PDF filename to `/messages`. Requests use HTTPS Graph URLs, reject redirects, use a 15-second timeout and keep credentials server-side. The application caps attachments at 10 MiB. The API acknowledgement records **Submitted**, never Delivered.

Every confirmed request has a durable UUID, source-document key, fingerprint and unique request key. Repeating the same request returns its existing result. A concurrent new request for the same source/recipient is blocked while preparing/submitting/uncertain, including regenerated PDFs or a different format/language. Permission, current recipient, opt-out and connection state are checked again after upload and before message submission. Rate limits, rejected templates/credentials and upload failures remain visible. Confirmed failures can be reviewed and resent explicitly; there are no automatic retries or sends after sale save.

If a message POST may have reached Meta but its acknowledgement is lost, status becomes **Submission uncertain**. Unknown requests block blind resending until a trusted provider callback resolves them. A process interrupted in submitting becomes unknown after ten minutes when history is read; an interrupted pre-submission preparation becomes failed. This is durable state around synchronous requests, not a background queue or reconciliation worker. Unresolved unknowns need operational investigation; the product deliberately does not offer a force-resend that risks duplicate delivery.

## Webhooks and security

Register the backend's public HTTPS `/api/whatsapp/webhook` endpoint through the Vercel gateway. GET validates `hub.mode=subscribe`, the configured secret verification token and numeric challenge. POST requires Meta's `X-Hub-Signature-256`: HMAC-SHA256 over the **unaltered raw request bytes** with a configured app secret and a constant-time comparison. The specific signed webhook bypasses session/CSRF; other mutations do not. The gateway must proxy raw bytes/headers without JSON re-encoding. Webhook input is capped at 256 KiB.

A trusted event also needs the matching WABA/phone ID, recipient and provider message ID (or the opaque request UUID while the acknowledgement is missing). Duplicate events are idempotent. Provider timestamps order conflicting sent/failed events; delivered/read evidence cannot regress to sent or failure. Only signed provider events produce Sent, Delivered or Read. Raw provider errors/secrets are not returned to the UI. Delivery history masks recipient numbers and remains tenant/customer scoped. Inbound timestamps are retained for future service-window features but do not permit free-form sending today.

PDF blobs expire after seven days and are cleaned during generation; private document/delivery metadata remain in the database and protected backups. There is no scheduled retention job, customer document portal, public signed PDF link or Meta media deletion job in this release. Meta controls its uploaded-media lifecycle. Run a real authorised sandbox send, callback/status, opt-out, duplicate and failure test before calling direct delivery operational. See [Meta's official Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api) and [media collection](https://www.postman.com/meta/whatsapp-business-platform/folder/13382743-ecb27be5-4d27-4763-bbee-6a8002c04bf3).

Live Meta credentials/sender/template approval and hosted staging dependencies were not supplied for this implementation. Adapter tests inject a transport fixture; production uses real `fetch` and has no pretend-success delivery mode. The [verification report](v6-v7-test-report.md) separates local/mock evidence from outstanding live acceptance.
