import { useState, useRef } from "react";

// ─── Exam configuration ───────────────────────────────────────────────────────
const EXAM_SECTIONS = [
  {
    key: "general", label: "General", always: true,
    findings: [
      { key: "illAppearing",   pos: "ill appearing",               neg: "well appearing" },
      { key: "distress",       pos: "in acute distress",           neg: "in no acute distress" },
      { key: "disoriented",    pos: "disoriented",                 neg: "oriented x3" },
      { key: "gaitDifficulty", pos: "ambulating with difficulty",  neg: "ambulating without difficulty" },
    ],
  },
  {
    key: "skin", label: "Skin", always: true,
    findings: [
      { key: "rash",       pos: "rash present",             neg: "no rash" },
      { key: "bruising",   pos: "unusual bruising present", neg: "no unusual bruising" },
      { key: "poorTurgor", pos: "poor skin turgor",         neg: "good turgor" },
    ],
  },
  {
    key: "heent", label: "HEENT", always: true,
    findings: [
      { key: "headTrauma",            pos: "head trauma/visible abnormality", neg: "normocephalic, atraumatic" },
      { key: "conjunctivalInjection", pos: "conjunctival injection",          neg: "conjunctiva clear" },
      { key: "scleralIcterus",        pos: "scleral icterus",                 neg: "sclera non-icteric" },
      { key: "dryMucousMembranes",    pos: "dry mucous membranes",            neg: "mucous membranes moist" },
      { key: "pharyngealExudate",     pos: "pharyngeal exudate",              neg: "no pharyngeal exudate" },
      { key: "cervicalLAD",           pos: "cervical adenopathy",             neg: "no cervical adenopathy" },
    ],
  },
  {
    key: "cv", label: "Cardiovascular", always: true,
    findings: [
      { key: "murmur",          pos: "murmur present",   neg: "no murmur" },
      { key: "irregularRhythm", pos: "irregular rhythm", neg: "regular rate and rhythm" },
      { key: "gallop",          pos: "gallop present",   neg: "no gallop" },
    ],
  },
  {
    key: "pulm", label: "Pulmonary", always: true,
    findings: [
      { key: "wheezes",                pos: "wheezes",                     neg: "no wheezes" },
      { key: "crackles",               pos: "crackles",                    neg: "no crackles" },
      { key: "rhonchi",                pos: "rhonchi",                     neg: "no rhonchi" },
      { key: "increasedWorkBreathing", pos: "increased work of breathing", neg: "no increased work of breathing" },
    ],
  },
  {
    key: "abd", label: "Abdomen", always: true,
    findings: [
      { key: "tenderness", pos: "tenderness",  neg: "soft, non-tender" },
      { key: "distention", pos: "distention",  neg: "non-distended" },
      { key: "mass",       pos: "mass",        neg: "no masses" },
      { key: "guarding",   pos: "guarding",    neg: "no guarding" },
    ],
  },
  {
    key: "back", label: "Back", always: true,
    findings: [
      { key: "cvaTenderness",    pos: "CVA tenderness",    neg: "no CVA tenderness" },
      { key: "spinalTenderness", pos: "spinal tenderness", neg: "no spinal tenderness" },
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
      { key: "tenderness",    pos: "tenderness",               neg: "no tenderness" },
      { key: "decreasedRom",  pos: "decreased range of motion", neg: "normal range of motion" },
      { key: "weakness",      pos: "weakness",                 neg: "no weakness" },
      { key: "swelling",      pos: "swelling",                 neg: "no swelling" },
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
      { key: "flatAffect",       pos: "flat affect",               neg: "normal affect" },
      { key: "anxious",          pos: "anxious",                   neg: "not anxious" },
      { key: "depressedMood",    pos: "depressed mood",            neg: "normal mood" },
      { key: "impairedJudgment", pos: "impaired judgment/insight", neg: "judgment and insight intact" },
    ],
  },
  {
    key: "pelvic", label: "Pelvic", always: false,
    findings: [
      { key: "lesion",            pos: "lesion present",            neg: "no lesions" },
      { key: "discharge",         pos: "vaginal/cervical discharge", neg: "no discharge" },
      { key: "adnexalTenderness", pos: "adnexal tenderness",        neg: "no adnexal tenderness" },
      { key: "mass",              pos: "pelvic mass",               neg: "no pelvic masses" },
    ],
  },
  {
    key: "breast", label: "Breast", always: false,
    findings: [
      { key: "mass",               pos: "breast mass",         neg: "no breast masses" },
      { key: "tenderness",         pos: "breast tenderness",   neg: "no breast tenderness" },
      { key: "axillaryAdenopathy", pos: "axillary adenopathy", neg: "no axillary adenopathy" },
      { key: "nippleDischarge",    pos: "nipple discharge",    neg: "no nipple discharge" },
    ],
  },
  {
    key: "gu", label: "G/U", always: false,
    findings: [
      { key: "lesion",            pos: "GU lesion",          neg: "no lesions" },
      { key: "discharge",         pos: "urethral discharge", neg: "no discharge" },
      { key: "testicularMass",    pos: "testicular mass",    neg: "no testicular masses" },
      { key: "scrotalTenderness", pos: "scrotal tenderness", neg: "no scrotal tenderness" },
    ],
  },
];

const buildInitialExam = () => {
  const s = {};
  EXAM_SECTIONS.forEach(sec => sec.findings.forEach(f => { s[`${sec.key}_${f.key}`] = false; }));
  return s;
};

const buildExamSummary = (exam, includeSensitive) =>
  EXAM_SECTIONS
    .filter(s => s.always || includeSensitive)
    .map(sec => {
      const findings = sec.findings.map(f => exam[`${sec.key}_${f.key}`] ? f.pos : f.neg).join(", ");
      return `${sec.label}: ${findings}.`;
    })
    .join("\n");

// ─── Components ───────────────────────────────────────────────────────────────

function DictationField({ label, value, onChange, placeholder, field, listeningField, onToggle, rows = 3 }) {
  const isListening = listeningField === field;
  return (
    <div className="section">
      <div className="section-header">
        <span className="section-label">{label}</span>
        <button className={`dictate-btn${isListening ? " dictate-active" : ""}`} onClick={() => onToggle(field)}>
          {isListening
            ? <><span className="pulse-dot" />Stop</>
            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>Dictate</>
          }
        </button>
      </div>
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
    <div className="section">
      <div className="section-header">
        <span className="section-label">Physical Exam</span>
        <label className="sensitive-toggle">
          <input type="checkbox" checked={includeSensitive} onChange={onToggleSensitive} />
          <span>Pelvic / Breast / G/U</span>
        </label>
      </div>
      <div className="exam-grid">
        {EXAM_SECTIONS.filter(s => s.always || includeSensitive).map(sec => (
          <div key={sec.key} className="exam-card">
            <div className="exam-card-title">{sec.label}</div>
            {sec.findings.map(f => {
              const k = `${sec.key}_${f.key}`;
              const checked = exam[k];
              return (
                <label key={k} className={`exam-row${checked ? " exam-row-checked" : ""}`}>
                  <span className={`exam-box${checked ? " exam-box-checked" : ""}`}>
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => onToggle(k)} style={{display:"none"}} />
                  <span className="exam-row-text">{checked ? f.pos : f.neg}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey]             = useState(() => localStorage.getItem("nh_api_key") || "");
  const [keyInput, setKeyInput]         = useState("");
  const [showKeyPanel, setShowKeyPanel] = useState(!localStorage.getItem("nh_api_key"));
  const [showKeyText, setShowKeyText]   = useState(false);

  const [demo, setDemo]           = useState("");
  const [hpi, setHpi]             = useState("");
  const [objective, setObjective] = useState("");
  const [ap, setAp]               = useState("");
  const [note, setNote]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const [exam, setExam]                         = useState(buildInitialExam);
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [listeningField, setListeningField]     = useState(null);
  const recognitionRef = useRef(null);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    localStorage.setItem("nh_api_key", k);
    setApiKey(k);
    setShowKeyPanel(false);
    setKeyInput("");
  };

  const toggleExam = k => setExam(p => ({ ...p, [k]: !p[k] }));

  const startDictation = (field) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition requires Chrome or Edge."); return; }
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    const setters = { demo: setDemo, hpi: setHpi, objective: setObjective, ap: setAp };
    rec.onresult = e => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      if (final && setters[field]) setters[field](p => p + final);
    };
    rec.onend  = () => { setListeningField(null); recognitionRef.current = null; };
    rec.onerror = () => { setListeningField(null); recognitionRef.current = null; };
    rec.start();
    recognitionRef.current = rec;
    setListeningField(field);
  };

  const stopDictation  = () => { recognitionRef.current?.stop(); recognitionRef.current = null; setListeningField(null); };
  const toggleDictation = field => listeningField === field ? stopDictation() : startDictation(field);

  const generateNote = async () => {
    if (!apiKey) { setError("Add your Anthropic API key to get started."); setShowKeyPanel(true); return; }
    setLoading(true); setError(""); setNote("");
    const examSummary = buildExamSummary(exam, includeSensitive);
    const prompt = `You are drafting a concise outpatient clinical note. Use ONLY the information provided. Do NOT invent medications, doses, diagnoses, symptoms, exam findings, or lab values.

Output exactly these sections in this order, with no extra commentary:

CC:
HPI:
Physical Exam:
Objective:
Assessment & Plan:

For Physical Exam, use the findings exactly as provided.
Infer a brief CC from the demographics/HPI if not stated.
Keep it concise and clinically usable.

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
      if (!text) throw new Error("Empty response from model.");
      setNote(text);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyNote = () => note && navigator.clipboard.writeText(note).catch(() => {});
  const clearAll = () => {
    setDemo(""); setHpi(""); setObjective(""); setAp("");
    setNote(""); setError("");
    setExam(buildInitialExam());
    setIncludeSensitive(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-inner">
            <span className="topbar-logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Note Helper
            </span>
            <button className="topbar-key-btn" onClick={() => setShowKeyPanel(s => !s)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="15" r="4"/>
                <line x1="11" y1="12" x2="20" y2="3"/>
                <line x1="17" y1="6" x2="20" y2="9"/>
              </svg>
              API Key
            </button>
          </div>
        </div>

        <div className="main">

          {/* API Key panel */}
          {showKeyPanel && (
            <div className="key-panel">
              <div className="key-panel-label">Anthropic API Key</div>
              <div className="key-row">
                <input
                  type={showKeyText ? "text" : "password"}
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveKey()}
                  placeholder="sk-ant-..."
                  className="key-input"
                  spellCheck={false}
                  autoFocus
                />
                <button className="key-show-btn" onClick={() => setShowKeyText(s => !s)}>
                  {showKeyText ? "Hide" : "Show"}
                </button>
                <button className="key-save-btn" onClick={saveKey} disabled={!keyInput.trim()}>
                  Save
                </button>
              </div>
              <p className="key-note">Only your API key is stored locally — no patient data is ever saved.</p>
            </div>
          )}

          <DictationField label="Demographics / Visit" value={demo} onChange={setDemo}
            placeholder="68M presenting for DM follow-up. PMH: HTN, HLD."
            field="demo" listeningField={listeningField} onToggle={toggleDictation} />

          <DictationField label="HPI" value={hpi} onChange={setHpi}
            placeholder="Sugars running 130–160 at home, no hypoglycemic episodes. Here for med refill and A1c check."
            field="hpi" listeningField={listeningField} onToggle={toggleDictation} rows={4} />

          <ExamSection exam={exam} onToggle={toggleExam}
            includeSensitive={includeSensitive}
            onToggleSensitive={() => setIncludeSensitive(s => !s)} />

          <DictationField label="Objective" value={objective} onChange={setObjective}
            placeholder="BP 138/82, HR 74, Wt 91 kg. A1c 7.4. BMP wnl."
            field="objective" listeningField={listeningField} onToggle={toggleDictation} />

          <DictationField label="Assessment & Plan" value={ap} onChange={setAp}
            placeholder="DM2 moderately controlled. Refill metformin 1000mg BID. Repeat A1c in 3 months."
            field="ap" listeningField={listeningField} onToggle={toggleDictation} rows={4} />

          {error && <div className="error-banner">{error}</div>}

          <div className="action-row">
            <button className="btn-generate" onClick={generateNote} disabled={loading}>
              {loading ? <><span className="spinner" />Generating…</> : "Generate Note"}
            </button>
            <button className="btn-secondary" onClick={copyNote} disabled={!note}>Copy</button>
            <button className="btn-ghost" onClick={clearAll}>Clear</button>
          </div>

          {(note || loading) && (
            <div className="section note-section">
              <div className="section-header">
                <span className="section-label">Generated Note</span>
                {note && <button className="dictate-btn" onClick={copyNote}>Copy</button>}
              </div>
              {loading
                ? <div className="loading-lines"><span/><span/><span/><span/></div>
                : <textarea value={note} onChange={e => setNote(e.target.value)} rows={16} className="field-textarea note-mono" />
              }
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:         #f9f9f8;
  --surface:    #ffffff;
  --border:     #e5e5e3;
  --border-med: #d0d0cc;
  --text:       #1a1a18;
  --text2:      #6b6b63;
  --text3:      #a8a8a0;
  --danger:     #dc2626;
  --danger-bg:  #fef2f2;
  --radius:     10px;
  --radius-sm:  7px;
  --shadow:     0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.page { min-height: 100vh; }

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(249,249,248,0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.topbar-inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 20px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}
.topbar-key-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: 1px solid var(--border-med);
  color: var(--text2);
  border-radius: var(--radius-sm);
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.topbar-key-btn:hover { border-color: var(--text2); color: var(--text); }

/* Main */
.main {
  max-width: 780px;
  margin: 0 auto;
  padding: 24px 20px 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Key panel */
.key-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 15px 17px;
  box-shadow: var(--shadow);
  animation: fadeIn 0.18s ease;
}
.key-panel-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text3);
  margin-bottom: 9px;
}
.key-row { display: flex; gap: 7px; }
.key-input {
  flex: 1;
  border: 1px solid var(--border-med);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  padding: 7px 11px;
  font-size: 13px;
  font-family: 'DM Mono', monospace;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.key-input:focus { border-color: #999; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
.key-show-btn, .key-save-btn {
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.key-show-btn {
  background: none;
  border: 1px solid var(--border-med);
  color: var(--text2);
}
.key-show-btn:hover { border-color: var(--text2); color: var(--text); }
.key-save-btn {
  background: var(--text);
  border: 1px solid var(--text);
  color: white;
}
.key-save-btn:hover:not(:disabled) { background: #333; }
.key-save-btn:disabled { opacity: 0.3; cursor: default; }
.key-note { font-size: 11.5px; color: var(--text3); margin-top: 7px; }

/* Section cards */
.section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: var(--shadow);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
  gap: 10px;
}
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

/* Dictate */
.dictate-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: 1px solid var(--border-med);
  color: var(--text2);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.dictate-btn:hover { border-color: var(--text2); color: var(--text); }
.dictate-active {
  border-color: var(--danger) !important;
  color: var(--danger) !important;
  background: var(--danger-bg) !important;
}
.pulse-dot {
  display: inline-block;
  width: 7px; height: 7px;
  background: var(--danger);
  border-radius: 50%;
  margin-right: 1px;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.6); }
}

/* Textarea */
.field-textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 9px 11px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-textarea:focus { border-color: var(--border-med); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
.field-textarea::placeholder { color: var(--text3); }
.note-mono {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  line-height: 1.75;
}

/* Exam */
.sensitive-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
  user-select: none;
  font-weight: 500;
}
.sensitive-toggle input { accent-color: var(--text); cursor: pointer; }

.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 7px;
}
.exam-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  background: var(--bg);
}
.exam-card-title {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text3);
  margin-bottom: 8px;
}
.exam-row {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 2.5px 3px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.1s;
}
.exam-row:hover { background: rgba(0,0,0,0.03); }
.exam-box {
  width: 14px; height: 14px; min-width: 14px;
  border: 1.5px solid var(--border-med);
  border-radius: 3.5px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.12s;
}
.exam-box-checked { background: var(--text); border-color: var(--text); }
.exam-row-text { font-size: 12.5px; color: var(--text2); line-height: 1.45; }
.exam-row-checked .exam-row-text { color: var(--text); font-weight: 500; }

/* Actions */
.action-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 0 2px;
}
.btn-generate {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--text);
  border: 1px solid var(--text);
  color: white;
  border-radius: var(--radius);
  padding: 9px 22px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  letter-spacing: -0.01em;
}
.btn-generate:hover:not(:disabled) { background: #2a2a28; }
.btn-generate:disabled { opacity: 0.4; cursor: default; }

.btn-secondary {
  background: white;
  border: 1px solid var(--border-med);
  color: var(--text);
  border-radius: var(--radius);
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-secondary:hover:not(:disabled) { border-color: var(--text2); }
.btn-secondary:disabled { opacity: 0.35; cursor: default; }

.btn-ghost {
  background: none;
  border: 1px solid transparent;
  color: var(--text3);
  border-radius: var(--radius);
  padding: 9px 14px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover { color: var(--text2); border-color: var(--border); }

/* Error */
.error-banner {
  background: var(--danger-bg);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  color: var(--danger);
  padding: 10px 14px;
  font-size: 13px;
}

/* Loading skeleton */
.loading-lines { display: flex; flex-direction: column; gap: 10px; padding: 6px 0; }
.loading-lines span {
  display: block;
  height: 13px;
  background: linear-gradient(90deg, var(--border) 25%, #f0f0ee 50%, var(--border) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.4s ease-in-out infinite;
}
.loading-lines span:nth-child(1) { width: 40%; }
.loading-lines span:nth-child(2) { width: 78%; }
.loading-lines span:nth-child(3) { width: 62%; }
.loading-lines span:nth-child(4) { width: 70%; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 13px; height: 13px;
  border: 1.5px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}
.note-section { animation: fadeIn 0.22s ease; }

/* Mobile */
@media (max-width: 560px) {
  .main { padding: 18px 14px 80px; }
  .exam-grid { grid-template-columns: 1fr 1fr; }
  .topbar-inner { padding: 0 14px; }
}
`;
