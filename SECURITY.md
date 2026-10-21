# Security policy

## Supported versions

Security fixes are applied to the current `main` branch and the latest production deployment.

## Reporting

Use GitHub's **Security** tab to report a vulnerability privately. If private vulnerability reporting is unavailable, email `hello@noerong.com`.

Include the affected component, impact, reproduction steps, and any suggested mitigation. Do not open a public issue for an undisclosed vulnerability, and do not include production API keys or customer evidence in the first message.

We aim to acknowledge reports within three business days and will coordinate validation, remediation, and disclosure with the reporter.

## Deployment rules

- Keep `DEEPSEEK_API_KEY` server-side and rotate it when exposure is suspected.
- Use a separate provider key for each client deployment.
- Keep same-origin checks and request-size validation enabled.
- Review application limits before increasing the number of accepted evidence items.
- Treat imported customer language as untrusted content.
- Do not place regulated, confidential, or highly sensitive data in the sample workspace.
