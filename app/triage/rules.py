from __future__ import annotations

from typing import Optional


def map_triage(text: str, age: Optional[int] = None, gender: Optional[str] = None) -> str:
    t = text.lower()

    # High-priority red flags
    red_flags = [
        "chest pain",
        "shortness of breath",
        "difficulty breathing",
        "severe bleeding",
        "unconscious",
        "stroke",
        "vision loss",
    ]
    if any(flag in t for flag in red_flags):
        return "Emergency"

    # Common guidance examples
    if ("fever" in t and "cough" in t) or ("sore throat" in t and "fever" in t):
        return "Consult a General Physician"
    if "chest tightness" in t or "chest discomfort" in t:
        return "Emergency"
    if "migraine" in t or ("headache" in t and "mild" in t):
        return "Self-care"
    if "loose motions" in t or "diarrhea" in t:
        return "Consult a General Physician"

    # Age-based nuance (simple example)
    if age is not None and age >= 65 and "fever" in t:
        return "Consult a General Physician"

    return "Consult a General Physician"
