# Security notes

## Reporting

Report a suspected vulnerability privately to `hello@noerong.com`. Do not include production API keys or customer evidence in the first message.

## Deployment rules

- Keep `DEEPSEEK_API_KEY` server-side and rotate it when exposure is suspected.
- Use a separate provider key for each client deployment.
- Keep same-origin checks and request-size validation enabled.
- Review application limits before increasing the number of accepted evidence items.
- Treat imported customer language as untrusted content.
- Do not place regulated, confidential, or highly sensitive data in the sample workspace.
