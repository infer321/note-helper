from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NoteRequest(BaseModel):
    demo: str
    hpi: str
    exam: str
    objective: str
    ap: str


@app.post("/generate-note")
def generate_note(data: NoteRequest):
    exam_text = (data.exam or "").strip()

    if not exam_text:
        exam_text = """General: Well appearing, in no acute distress.
Skin: Good turgor, no rash or unusual bruising.
HEENT: Normocephalic, atraumatic. Conjunctiva clear, sclera non-icteric, mucous membranes moist, no pharyngeal exudate or cervical adenopathy.
Cardiovascular: Regular rate and rhythm, no murmur or gallop.
Pulmonary: Clear to auscultation bilaterally. No wheezes, crackles, or rhonchi. No increased work of breathing.
Abdomen: Soft, non-tender, non-distended. No masses or guarding.
Back: No CVA tenderness or spinal tenderness.
Extremities: No edema, cyanosis, or deformity.
Musculoskeletal: Normal gait and range of motion. No tenderness, swelling, or weakness.
Neurologic: Alert and oriented. No focal deficits. Strength and sensation intact. Gait normal.
Psychiatric: Normal mood and affect. Judgment and insight intact."""

    prompt = f"""
You are drafting a concise outpatient internal medicine follow-up note.

Use only the information provided below.

Rules:
- Do NOT invent medications, doses, symptoms, diagnoses, exam findings, or lab values
- Keep the note concise and clinically usable
- Output exactly these sections and in this order:

CC:
HPI:
Objective:
Assessment & Plan:

- Do NOT include a Physical Exam section in your output
- Infer a brief CC from the demographics/HPI/objective if needed
- Use the assessment/plan information provided and keep it concise
- Output only the note body for those four sections

Demographics / Visit:
{data.demo}

HPI:
{data.hpi}

Objective:
{data.objective}

Assessment / Plan:
{data.ap}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.1:8b",
                "prompt": prompt,
                "stream": False
            },
            timeout=120,
        )
        response.raise_for_status()

        result = response.json()
        ai_text = result.get("response", "").strip()

        if not ai_text:
            raise HTTPException(status_code=500, detail="Model returned empty response.")

        lines = ai_text.splitlines()
        final_lines = []
        inserted_exam = False

        ap_headers = {
            "Assessment & Plan:",
            "Assessment and Plan:",
            "A/P:",
        }

        for line in lines:
            stripped = line.strip()

            if stripped in ap_headers and not inserted_exam:
                final_lines.append("Physical Exam:")
                final_lines.append(exam_text)
                final_lines.append("")
                inserted_exam = True

            final_lines.append(line)

        if not inserted_exam:
            final_lines.append("")
            final_lines.append("Physical Exam:")
            final_lines.append(exam_text)

        final_note = "\n".join(final_lines).strip()

        return {"note": final_note}

    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with local model server: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected server error: {str(e)}",
        )