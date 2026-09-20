import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def analyze_meeting(meeting_notes: str) -> dict:
    prompt = f"""
You are an assistant that analyzes meeting notes.

Return ONLY valid JSON using exactly this structure:

{{
  "summary": "short concise summary",
  "decisions": [
    "decision 1",
    "decision 2"
  ],
  "action_items": [
    {{
      "task": "specific task",
      "owner": "person responsible or null",
      "deadline": "deadline if mentioned or null",
      "follow_up": "follow-up action if mentioned or null"
    }}
  ]
}}

Rules:
- Do not invent information.
- If an owner is not mentioned, use null.
- If a deadline is not mentioned, use null.
- If a follow-up is not mentioned, use null.
- Keep the summary concise.
- Include only decisions that were actually made.
- Include only actionable tasks as action items.

Meeting notes:

{meeting_notes}
"""

    response = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )

    raw_output = response.output_text

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        raise ValueError("AI returned invalid JSON")