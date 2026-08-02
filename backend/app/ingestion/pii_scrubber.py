import re

# RegEx patterns for common PII
SSN_PATTERN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
PHONE_PATTERN = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
CREDIT_CARD_PATTERN = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
SALARY_PATTERN = re.compile(r'\$?\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|dollars|per annum|p\.a\.|annual salary)\b', re.IGNORECASE)

def scrub_pii_for_llm(text: str) -> str:
    """
    Redacts sensitive PII specifically when building context windows for LLM prompts.
    Original text in MongoDB remains untouched.
    """
    if not text:
        return text

    scrubbed = text
    scrubbed = SSN_PATTERN.sub('[REDACTED_SSN]', scrubbed)
    scrubbed = CREDIT_CARD_PATTERN.sub('[REDACTED_CARD]', scrubbed)
    scrubbed = EMAIL_PATTERN.sub('[REDACTED_EMAIL]', scrubbed)
    scrubbed = PHONE_PATTERN.sub('[REDACTED_PHONE]', scrubbed)
    scrubbed = SALARY_PATTERN.sub('[REDACTED_COMPENSATION]', scrubbed)

    return scrubbed
