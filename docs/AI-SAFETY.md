# Evidence AI safety notes

SignalRoom uses AI to interpret supplied customer evidence. It does not treat AI output as verified fact.

## Grounding

- Evidence items receive stable reference labels for each analysis request.
- Answers are instructed to cite supporting labels inline.
- The model must state when the evidence is insufficient.
- Observations and recommendations should remain distinct.

## Prompt injection resistance

Customer feedback can contain arbitrary or hostile text. The server marks it as untrusted quoted material and tells the model never to follow instructions inside it. Request validation limits the amount of content an attacker can submit. This reduces risk but does not prove perfect model compliance.

## Privacy

- The provider receives only the active research question and evidence included in that request.
- The application does not store questions, answers, raw customer evidence, or raw IP addresses in D1.
- Only expiring rate-limit counters are retained.
- Teams should remove confidential or regulated information before importing customer text.

## Human control

AI analysis supports research decisions. It does not publish reports, change a roadmap, contact customers, or approve opportunities automatically. People remain responsible for final interpretation and action.

## Release evaluations

Before changing models or prompts, rerun cases covering grounded prioritization, insufficient evidence, conflicting evidence, citation accuracy, malicious instructions inside quotes, unrelated questions, fabricated metrics, provider failure, and timeouts.
