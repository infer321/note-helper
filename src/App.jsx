import { useState, useRef, useEffect } from "react";

// ─── Exam configuration ──────────────────────────────────────────────────────
const EXAM_SECTIONS = [
  {
    key: "general", label: "General", always: true,
    findings: [
      { key: "illAppearing",    pos: "ill appearing",                neg: "well appearing" },
      { key: "distress",        pos: "in acute distress",            neg: "in no acute distress" },
      { key: "disoriented",     pos: "disoriented",                  neg: "oriented x3" },
      { key: "gaitDifficulty",  pos: "ambulating with difficulty",   neg: "ambulating without difficulty" },
    ],
  },
  {
    key: "skin", label: "Skin", always: true,
    findings: [
      { key: "rash",       pos: "rash present",              neg: "no rash" },
      { key: "bruising",   pos: "unusual bruising present",  neg: "no unusual bruising" },
      { key: "poorTurgor", pos: "poor skin turgor",          neg: "good turgor" },
    ],
  },
  {
    key: "heent", label: "HEENT", always: true,
    findings: [
      { key: "headTrauma",           pos: "head trauma/visible abnormality", neg: "normocephalic, atraumatic" },
      { key: "conjunctivalInjection",pos: "conjunctival injection",          neg: "conjunctiva clear" },
      { key: "scleralIcterus",       pos: "scleral icterus",                 neg: "sclera non-icteric" },
      { key: "dryMucousMembranes",   pos: "dry mucous membranes",            neg: "mucous membranes moist" },
      { key: "pharyngealExudate",    pos: "pharyngeal exudate",              neg: "no pharyngeal exudate" },
      { key: "cervicalLAD",          pos: "cervical adenopathy",             neg: "no cervical adenopathy" },
    ],
  },
  {
    key: "cv", label: "Cardiovascular", always: true,
    findings: [
      { key: "murmur",          pos: "murmur present",    neg: "no murmur" },
      { key: "irregularRhythm", pos: "irregular rhythm",  neg: "regular rate and rhythm" },
      { key: "gallop",          pos: "gallop present",    neg: "no gallop" },
    ],
  },
  {
    key: "pulm", label: "Pulmonary", always: true,
    findings: [
      { key: "wheezes",              pos: "wheezes",                        neg: "no wheezes" },
      { key: "crackles",             pos: "crackles",                       neg: "no crackles" },
      { key: "rhonchi",              pos: "rhonchi",                        neg: "no rhonchi" },
      { key: "increasedWorkBreathing",pos:"increased work of breathing",    neg: "no increased work of breathing" },
    ],
  },
  {
    key: "abd", label: "Abdomen", always: true,
    findings: [
      { key: "tenderness",  pos: "tenderness",   neg: "soft, non-tender" },
      { key: "distention",  pos: "distention",   neg: "non-distended" },
      { key: "mass",        pos: "mass",         neg: "no masses" },
      { key: "guarding",    pos: "guarding",     neg: "no guarding" },
    ],
  },
  {
    key: "back", label: "Back", always: true,
    findings: [
      { key: "cvaTenderness",    pos: "CVA tenderness",     neg: "no CVA tenderness" },
      { key: "spinalTenderness", pos: "spinal tenderness",  neg: "no spinal tenderness" },
    ],
  },
  {
    key: "ext", label: "Extremities", always: true,
    findings: [
      { key: "edema",     pos: "edema",     neg: "no edema" },
      { key: "cyanosis",  pos: "cyanosis",  neg: "no cyanosis" },
      { key: "deformity", pos: "deformity", neg: "no deformity" },
    ],
  },
  {
    key: "msk", label: "Musculoskeletal", always: true,
    findings: [
      { key: "tenderness",   pos: "tenderness",             neg: "no tenderness" },
      { key: "decreasedRom", pos: "decreased range of motion", neg: "normal range of motion" },
      { key: "weakness",     pos: "weakness",               neg: "no weakness" },
      { key: "swelling",     pos: "swelling",               neg: "no swelling" },
    ],
  },
  {
    key: "neuro", label: "Neurologic", always: true,
    findings: [
      { key: "focalDeficit",   pos: "focal neurologic deficit", neg: "no focal deficits" },
      { key: "sensoryDeficit", pos: "sensory deficit",          neg: "sensation intact" },
      { key: "weakness",       pos: "weakness",                 neg: "strength intact" },
      { key: "abnormalGait",   pos: "abnormal gait",            neg: "gait normal" },
    ],
  },
  {
    key: "psych", label: "Psychiatric", always: true,
    findings: [
      { key: "flatAffect",       pos: "flat affect",              neg: "normal affect" },
      { key: "anxious",          pos: "anxious",                  neg: "not anxious" },
      { key: "depressedMood",    pos: "depressed mood",           neg: "normal mood" },
      { key: "impairedJudgment", pos: "impaired judgment/insight",neg: "judgment and insight intact" },
    ],
  },
  {
    key: "pelvic", label: "Pelvic", always: false,
    findings: [
      { key: "lesion",            pos: "lesion present",        neg: "no lesions" },
      { key: "discharge",         pos: "vaginal/cervical discharge", neg: "no discharge" },
      { key: "adnexalTenderness", pos: "adnexal tenderness",    neg: "no adnexal tenderness" },
      { key: "mass",              pos: "pelvic mass",           neg: "no pelvic masses" },
    ],
  },
  {
    key: "breast", label: "Breast", always: false,
    findings: [
      { key: "mass",              pos: "breast mass",        neg: "no breast masses" },
      { key: "tenderness",        pos: "breast tenderness",  neg: "no breast tenderness" },
      { key: "axillaryAdenopathy",pos: "axillary adenopathy",neg: "no axillary adenopathy" },
      { key: "nippleDischarge",   pos: "nipple discharge",   neg: "no nipple discharge" },
    ],
  },
  {
    key: "gu", label: "G/U", always: false,
    findings: [
      { key: "lesion",           pos: "GU lesion",           neg: "no lesions" },
      { key: "discharge",        pos: "urethral discharge",  neg: "no discharge" },
      { key: "testicularMass",   pos: "testicular mass",     neg: "no testicular masses" },
      { key: "scrotalTenderness",pos: "scrotal tenderness",  neg: "no scrotal tenderness" },
    ],
  },
];

// Build initial exam state from config
const buildInitialExam = () => {
  const state = {};
  EXAM_SECTIONS.forEach(section => {
    section.findings.forEach(f => {
      state[`${section.key}_${f.key}`] = false;
    });
  });
  return state;
};

// Build exam summary string
const buildExamSummary = (exam, includeSensitive) => {
  return EXAM_SECTIONS
    .filter(s => s.always || includeSensitive)
    .map(section => {
      const findings = section.findings
        .map(f => exam[`${section.key}_${f.key}`] ? f.pos : f.neg)
        .join(", ");
      return `${section.label}: ${findings}.`;
    })
    .join("\n");
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ApiKeyBanner({ apiKey, onSave }) {
  const [val, setVal] = useState(apiKey || "");
  const [show, setShow] = useState(false);

  return (
    <div className="api-banner">
      <span className="api-label">Anthropic API Key</span>
      <div className="api-input-row">
        <input
          type={show ? "text" : "password"}
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="sk-ant-..."
          className="api-input"
          spellCheck={false}
        />
        <button className="api-toggle" onClick={() => setShow(s => !s)}>
          {show ? "Hide" : "Show"}
        </button>
        <button
          className="api-save"
          onClick={() => onSave(val.trim())}
          disabled={!val.trim()}
        >
          Save
        </button>
      </div>
      <p className="api-note">
        Saved to localStorage (credential only — no patient data ever stored).
      </p>
    </div>
  );
}

function DictationField({ label, value, onChange, placeholder, field, listeningField, onToggle, rows = 3 }) {
  const isListening = listeningField === field;
  return (
    <div className="card">
      <div className="field-header">
        <label className="field-label">{label}</label>
        <button
          className={`mic-btn${isListening ? " mic-active" : ""}`}
          onClick={() => onToggle(field)}
          title={isListening ? "Stop dictation" : "Start dictation"}
        >
          <span className="mic-icon">{isListening ? "⏹" : "🎙"}</span>
          {isListening ? "Stop" : "Dictate"}
        </button>
      </div>
      {isListening && (
        <div className="listening-indicator">
          <span className="pulse-dot" />
          Listening…
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="field-textarea"
      />
    </div>
  );
}

function ExamSection({ exam, onToggle, includeSensitive, onToggleSensitive }) {
  return (
    <div className="card">
      <div className="card-title">Physical Exam</div>
      <label className="sensitive-toggle">
        <input
          type="checkbox"
          checked={includeSensitive}
          onChange={onToggleSensitive}
        />
        <span>Include Pelvic / Breast / G/U exam</span>
      </label>
      <div className="exam-grid">
        {EXAM_SECTIONS
          .filter(s => s.always || includeSensitive)
          .map(section => (
            <div key={section.key} className="exam-section">
              <div className="exam-section-title">{section.label}</div>
              <div className="exam-findings">
                {section.findings.map(f => {
                  const stateKey = `${section.key}_${f.key}`;
                  const checked = exam[stateKey];
                  return (
                    <label key={stateKey} className={`exam-chip${checked ? " exam-chip-active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(stateKey)}
                        className="exam-checkbox"
                      />
                      <span className="exam-chip-dot" />
                      {f.label || f.pos.replace(/^(no |normal |good )/, "") || f.pos}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("nh_api_key") || "");
  const [showApiKey, setShowApiKey] = useState(!localStorage.getItem("nh_api_key"));

  const [demo, setDemo] = useState("");
  const [hpi, setHpi] = useState("");
  const [objective, setObjective] = useState("");
  const [ap, setAp] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [exam, setExam] = useState(buildInitialExam);
  const [includeSensitive, setIncludeSensitive] = useState(false);

  const [listeningField, setListeningField] = useState(null);
  const recognitionRef = useRef(null);

  const saveApiKey = (key) => {
    localStorage.setItem("nh_api_key", key);
    setApiKey(key);
    setShowApiKey(false);
  };

  const toggleExam = (key) => {
    setExam(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Dictation ──
  const startDictation = (field) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition requires Chrome or Edge."); return; }

    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    const setters = { demo: setDemo, hpi: setHpi, objective: setObjective, ap: setAp };

    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      }
      if (final && setters[field]) setters[field](prev => prev + final);
    };

    rec.onend = () => { setListeningField(null); recognitionRef.current = null; };
    rec.onerror = () => { setListeningField(null); recognitionRef.current = null; };

    rec.start();
    recognitionRef.current = rec;
    setListeningField(field);
  };

  const stopDictation = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListeningField(null);
  };

  const toggleDictation = (field) => {
    listeningField === field ? stopDictation() : startDictation(field);
  };

  // ── Generate note ──
  const generateNote = async () => {
    if (!apiKey) { setError("Please enter your Anthropic API key above."); return; }

    setLoading(true);
    setError("");
    setNote("");

    const examSummary = buildExamSummary(exam, includeSensitive);

    const prompt = `You are drafting a concise outpatient clinical note. Use ONLY the information provided. Do NOT invent medications, doses, diagnoses, symptoms, exam findings, or lab values.

Output exactly these sections in this order, with no extra commentary:

CC:
HPI:
Physical Exam:
Objective:
Assessment & Plan:

For the Physical Exam section, use the exam findings exactly as provided below.
Infer a brief CC from the demographics/HPI if not explicitly stated.
Keep the note concise and clinically usable.

---
Demographics / Visit:
${demo}

HPI:
${hpi}

Physical Exam:
${examSummary}

Objective:
${objective}

Assessment / Plan:
${ap}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").trim();
      if (!text) throw new Error("Model returned an empty response.");
      setNote(text);
    } catch (e) {
      setError(e.message || "Unknown error generating note.");
    } finally {
      setLoading(false);
    }
  };

  const copyNote = () => {
    if (note) navigator.clipboard.writeText(note).catch(() => {});
  };

  const clearAll = () => {
    setDemo(""); setHpi(""); setObjective(""); setAp(""); setNote(""); setError("");
    setExam(buildInitialExam());
    setIncludeSensitive(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="container">

          {/* Header */}
          <header className="header">
            <h1 className="title">Note Helper</h1>
            <p className="subtitle">Outpatient clinical note drafting</p>
            <button className="api-key-toggle" onClick={() => setShowApiKey(s => !s)}>
              {showApiKey ? "Hide API Key" : "⚙ API Key"}
            </button>
          </header>

          {showApiKey && (
            <ApiKeyBanner apiKey={apiKey} onSave={saveApiKey} />
          )}

          {/* Input fields */}
          <DictationField
            label="Demographics / Visit"
            value={demo} onChange={setDemo}
            placeholder="68M presenting for DM follow-up. PMH: HTN, HLD."
            field="demo" listeningField={listeningField} onToggle={toggleDictation}
          />

          <DictationField
            label="HPI"
            value={hpi} onChange={setHpi}
            placeholder="Sugars running 130–160 at home, no hypoglycemic episodes. Here for med refill and A1c check."
            field="hpi" listeningField={listeningField} onToggle={toggleDictation}
            rows={4}
          />

          <ExamSection
            exam={exam} onToggle={toggleExam}
            includeSensitive={includeSensitive}
            onToggleSensitive={() => setIncludeSensitive(s => !s)}
          />

          <DictationField
            label="Objective"
            value={objective} onChange={setObjective}
            placeholder="BP 138/82, HR 74, Wt 91kg. A1c 7.4. BMP wnl."
            field="objective" listeningField={listeningField} onToggle={toggleDictation}
          />

          <DictationField
            label="Assessment / Plan"
            value={ap} onChange={setAp}
            placeholder="DM2 moderately controlled. Refill metformin 1000mg BID. Repeat A1c in 3 months."
            field="ap" listeningField={listeningField} onToggle={toggleDictation}
            rows={4}
          />

          {/* Actions */}
          <div className="actions">
            <button className="btn-primary" onClick={generateNote} disabled={loading}>
              {loading ? (
                <><span className="spinner" /> Generating…</>
              ) : "Generate Note"}
            </button>
            <button className="btn-secondary" onClick={copyNote} disabled={!note}>
              Copy Note
            </button>
            <button className="btn-ghost" onClick={clearAll}>
              Clear All
            </button>
          </div>

          {/* Error */}
          {error && <div className="error-box">{error}</div>}

          {/* Output */}
          <div className="card">
            <div className="field-header">
              <label className="field-label">Generated Note</label>
              {note && (
                <button className="mic-btn" onClick={copyNote}>Copy</button>
              )}
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Your generated note will appear here…"
              rows={14}
              className="field-textarea note-output"
              readOnly={loading}
            />
          </div>

        </div>
      </div>
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080d14;
    --surface:   #0d1520;
    --surface2:  #111d2e;
    --border:    #1e2f45;
    --border2:   #263d57;
    --text:      #d4e4f4;
    --text2:     #7a9bb8;
    --text3:     #4a6a82;
    --accent:    #0ea5e9;
    --accent2:   #0284c7;
    --danger:    #ef4444;
    --success:   #22c55e;
    --warn:      #f59e0b;
    --radius:    10px;
    --radius-sm: 6px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 15px;
    line-height: 1.6;
  }

  .page {
    min-height: 100vh;
    padding: 24px 16px 60px;
    background:
      radial-gradient(ellipse 80% 40% at 50% -10%, rgba(14,165,233,0.07) 0%, transparent 70%),
      var(--bg);
  }

  .container {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Header */
  .header {
    text-align: center;
    padding: 10px 0 6px;
    position: relative;
  }

  .title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2.2rem;
    font-weight: 600;
    color: #e8f4ff;
    letter-spacing: -0.03em;
  }

  .subtitle {
    color: var(--text2);
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .api-key-toggle {
    position: absolute;
    right: 0;
    top: 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text2);
    border-radius: var(--radius-sm);
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, color 0.15s;
  }
  .api-key-toggle:hover { border-color: var(--accent); color: var(--accent); }

  /* API Banner */
  .api-banner {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: var(--radius);
    padding: 14px 16px;
  }

  .api-label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text2);
    margin-bottom: 8px;
  }

  .api-input-row {
    display: flex;
    gap: 8px;
  }

  .api-input {
    flex: 1;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 8px 12px;
    font-size: 14px;
    font-family: 'IBM Plex Mono', monospace;
    outline: none;
    transition: border-color 0.15s;
  }
  .api-input:focus { border-color: var(--accent); }

  .api-toggle, .api-save {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text2);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .api-save {
    background: var(--accent2);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }
  .api-save:hover:not(:disabled) { background: var(--accent); }
  .api-save:disabled { opacity: 0.4; cursor: default; }
  .api-toggle:hover { border-color: var(--accent); color: var(--accent); }

  .api-note {
    font-size: 11px;
    color: var(--text3);
    margin-top: 6px;
  }

  /* Card */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #e8f4ff;
    margin-bottom: 12px;
    text-align: center;
  }

  /* Field */
  .field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
  }

  .field-label {
    font-size: 15px;
    font-weight: 600;
    color: #e8f4ff;
  }

  .field-textarea {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 10px 12px;
    font-size: 14px;
    font-family: 'IBM Plex Sans', sans-serif;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
    line-height: 1.6;
  }
  .field-textarea:focus { border-color: var(--border2); }
  .field-textarea::placeholder { color: var(--text3); }

  .note-output {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
  }

  /* Mic button */
  .mic-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text2);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .mic-btn:hover { border-color: var(--accent); color: var(--accent); }

  .mic-active {
    background: rgba(239,68,68,0.1);
    border-color: var(--danger);
    color: var(--danger);
  }
  .mic-active:hover { border-color: var(--danger); color: var(--danger); }

  .mic-icon { font-size: 14px; }

  /* Listening indicator */
  .listening-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--danger);
    margin-bottom: 8px;
    padding: 4px 0;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: var(--danger);
    border-radius: 50%;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  /* Sensitive toggle */
  .sensitive-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text2);
    cursor: pointer;
    margin-bottom: 14px;
    width: fit-content;
  }
  .sensitive-toggle input { accent-color: var(--accent); }

  /* Exam grid */
  .exam-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
  }

  .exam-section {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
  }

  .exam-section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text3);
    margin-bottom: 8px;
  }

  .exam-findings {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .exam-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: var(--text2);
    cursor: pointer;
    padding: 3px 0;
    transition: color 0.1s;
    user-select: none;
  }
  .exam-chip:hover { color: var(--text); }

  .exam-chip-active { color: var(--accent) !important; }

  .exam-checkbox { display: none; }

  .exam-chip-dot {
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--border2);
    border-radius: 3px;
    flex-shrink: 0;
    transition: all 0.1s;
    position: relative;
  }

  .exam-chip-active .exam-chip-dot {
    background: var(--accent);
    border-color: var(--accent);
  }

  .exam-chip-active .exam-chip-dot::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 1px;
    width: 5px;
    height: 8px;
    border: 2px solid #fff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
  }

  /* Actions */
  .actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    position: sticky;
    bottom: 16px;
    z-index: 10;
    padding: 4px 0;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--accent2);
    border: 1px solid var(--accent);
    color: #fff;
    border-radius: var(--radius);
    padding: 11px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(14,165,233,0.25);
    transition: all 0.15s;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--accent);
    box-shadow: 0 4px 28px rgba(14,165,233,0.4);
    transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.5; cursor: default; transform: none; }

  .btn-secondary {
    background: var(--surface2);
    border: 1px solid var(--border2);
    color: var(--text);
    border-radius: var(--radius);
    padding: 11px 20px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .btn-secondary:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .btn-secondary:disabled { opacity: 0.4; cursor: default; }

  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text3);
    border-radius: var(--radius);
    padding: 11px 20px;
    font-size: 15px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text2); }

  /* Spinner */
  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Error */
  .error-box {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: var(--radius);
    color: #fca5a5;
    padding: 12px 16px;
    font-size: 14px;
  }

  @media (max-width: 600px) {
    .title { font-size: 1.7rem; }
    .exam-grid { grid-template-columns: 1fr 1fr; }
    .actions { bottom: 8px; }
    .api-key-toggle { position: static; margin-top: 8px; display: block; }
  }
`;
