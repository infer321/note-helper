import { useState, useRef } from "react";

// ─── Exam configuration ───────────────────────────────────────────────────────
const EXAM_SECTIONS = [
  {
    key: "general", label: "General", always: true,
    findings: [
      { key: "illAppearing",   pos: "ill appearing",              neg: "well appearing" },
      { key: "distress",       pos: "in acute distress",          neg: "in no acute distress" },
      { key: "disoriented",    pos: "disoriented",                neg: "oriented x3" },
      { key: "gaitDifficulty", pos: "ambulating with difficulty", neg: "ambulating without difficulty" },
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
      { key: "headTrauma",            pos: "head trauma",          neg: "normocephalic, atraumatic" },
      { key: "conjunctivalInjection", pos: "conjunctival injection", neg: "conjunctiva clear" },
      { key: "scleralIcterus",        pos: "scleral icterus",       neg: "sclera non-icteric" },
      { key: "dryMucousMembranes",    pos: "dry mucous membranes",  neg: "mucous membranes moist" },
      { key: "pharyngealExudate",     pos: "pharyngeal exudate",    neg: "no pharyngeal exudate" },
      { key: "cervicalLAD",           pos: "cervical LAD",          neg: "no cervical LAD" },
    ],
  },
  {
    key: "cv", label: "Cardiovascular", always: true,
    findings: [
      { key: "murmur",          pos: "murmur",            neg: "no murmur" },
      { key: "irregularRhythm", pos: "irregular rhythm",  neg: "regular rate and rhythm" },
      { key: "gallop",          pos: "gallop",            neg: "no gallop" },
    ],
  },
  {
    key: "pulm", label: "Pulmonary", always: true,
    findings: [
      { key: "wheezes",                pos: "wheezes",                     neg: "no wheezes" },
      { key: "crackles",               pos: "crackles",                    neg: "no crackles" },
      { key: "rhonchi",                pos: "rhonchi",                     neg: "no rhonchi" },
      { key: "increasedWorkBreathing", pos: "↑ work of breathing",         neg: "no ↑ work of breathing" },
    ],
  },
  {
    key: "abd", label: "Abdomen", always: true,
    findings: [
      { key: "tenderness", pos: "tenderness",   neg: "non-tender" },
      { key: "distention", pos: "distention",   neg: "non-distended" },
      { key: "mass",       pos: "mass",         neg: "no masses" },
      { key: "guarding",   pos: "guarding",     neg: "no guarding" },
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
    key: "msk", label: "MSK", always: true,
    findings: [
      { key: "tenderness",   pos: "tenderness",      neg: "no tenderness" },
      { key: "decreasedRom", pos: "↓ ROM",           neg: "normal ROM" },
      { key: "weakness",     pos: "weakness",        neg: "no weakness" },
      { key: "swelling",     pos: "swelling",        neg: "no swelling" },
    ],
  },
  {
    key: "neuro", label: "Neuro", always: true,
    findings: [
      { key: "focalDeficit",   pos: "focal deficit",   neg: "no focal deficits" },
      { key: "sensoryDeficit", pos: "sensory deficit", neg: "sensation intact" },
      { key: "weakness",       pos: "weakness",        neg: "strength intact" },
      { key: "abnormalGait",   pos: "abnormal gait",   neg: "gait normal" },
    ],
  },
  {
    key: "psych", label: "Psych", always: true,
    findings: [
      { key: "flatAffect",       pos: "flat affect",        neg: "normal affect" },
      { key: "anxious",          pos: "anxious",            neg: "not anxious" },
      { key: "depressedMood",    pos: "depressed mood",     neg: "normal mood" },
      { key: "impairedJudgment", pos: "impaired judgment",  neg: "judgment intact" },
    ],
  },
  {
    key: "pelvic", label: "Pelvic", always: false,
    findings: [
      { key: "lesion",            pos: "lesion",             neg: "no lesions" },
      { key: "discharge",         pos: "discharge",          neg: "no discharge" },
      { key: "adnexalTenderness", pos: "adnexal tenderness", neg: "no adnexal tenderness" },
      { key: "mass",              pos: "pelvic mass",        neg: "no pelvic masses" },
    ],
  },
  {
    key: "breast", label: "Breast", always: false,
    findings: [
      { key: "mass",               pos: "mass",               neg: "no masses" },
      { key: "tenderness",         pos: "tenderness",         neg: "no tenderness" },
      { key: "axillaryAdenopathy", pos: "axillary adenopathy",neg: "no axillary adenopathy" },
      { key: "nippleDischarge",    pos: "nipple discharge",   neg: "no nipple discharge" },
    ],
  },
  {
    key: "gu", label: "G/U", always: false,
    findings: [
      { key: "lesion",            pos: "lesion",            neg: "no lesions" },
      { key: "discharge",         pos: "discharge",         neg: "no discharge" },
      { key: "testicularMass",    pos: "testicular mass",   neg: "no testicular masses" },
      { key: "scrotalTenderness", pos: "scrotal tenderness",neg: "no scrotal tenderness" },
    ],
  },
];

const buildInitialExam = () => {
  const s = {};
  EXAM_SECTIONS.forEach(sec => sec.findings.forEach(f => { s[`${sec.key}_${f.key}`] = false; }));
  return s;
};

const buildInitialExamNotes = () => {
  const s = {};
  EXAM_SECTIONS.forEach(sec => { s[sec.key] = ""; });
  return s;
};

const buildExamSummary = (exam, examNotes, includeSensitive) =>
  EXAM_SECTIONS
    .filter(s => s.always || includeSensitive)
    .map(sec => {
      const findings = sec.findings.map(f => exam[`${sec.key}_${f.key}`] ? f.pos : f.neg).join(", ");
      const extra = examNotes[sec.key]?.trim();
      return `${sec.label}: ${findings}${extra ? `; ${extra}` : ""}.`;
    })
    .join("\n");

// ─── Components ───────────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  );
}

function DictationField({ label, value, onChange, placeholder, field, listeningField, onToggle, rows = 3 }) {
  const isListening = listeningField === field;
  return (
    <div className="section">
      <div className="section-header">
        <span className="section-label">{label}</span>
        <button
          className={`dictate-btn${isListening ? " dictate-active" : ""}`}
          onClick={() => onToggle(field)}
        >
          {isListening ? <><span className="pulse-dot" />Stop</> : <><MicIcon />Dictate</>}
        </button>
      </div>
      {isListening && <div className="dictate-status">🎙 Listening — speak now</div>}
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

function ExamSection({ exam, onToggle, examNotes, onExamNote, includeSensitive, onToggleSensitive }) {
  return (
    <div className="section">
      <div className="section-header">
        <span className="section-label">Physical Exam</span>
        <label className="sensitive-toggle">
          <input type="checkbox" checked={includeSensitive} onChange={onToggleSensitive} />
          <span>Pelvic / Breast / G/U</span>
        </label>
      </div>
      <div className="exam-rows">
        {EXAM_SECTIONS.filter(s => s.always || includeSensitive).map(sec => (
          <div key={sec.key} className="exam-row-item">
            <div className="exam-row-label">{sec.label}</div>
            <div className="exam-row-chips">
              {sec.findings.map(f => {
                const k = `${sec.key}_${f.key}`;
                const checked = exam[k];
                return (
                  <button
                    key={k}
                    className={`exam-chip${checked ? " exam-chip-on" : ""}`}
                    onClick={() => onToggle(k)}
                    type="button"
                  >
                    {checked ? f.pos : f.neg}
                  </button>
                );
              })}
              <input
                type="text"
                value={examNotes[sec.key] || ""}
                onChange={e => onExamNote(sec.key, e.target.value)}
                placeholder="+ add finding"
                className="exam-row-extra"
              />
            </div>
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

  const [autoFillText, setAutoFillText]   = useState("");
  const [autoFilling, setAutoFilling]     = useState(false);
  const [autoFillError, setAutoFillError] = useState("");

  const [demo, setDemo]           = useState("");
  const [hpi, setHpi]             = useState("");
  const [objective, setObjective] = useState("");
  const [ap, setAp]               = useState("");
  const [note, setNote]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const [exam, setExam]                         = useState(buildInitialExam);
  const [examNotes, setExamNotes]               = useState(buildInitialExamNotes);
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [listeningField, setListeningField]     = useState(null);

  const recognitionRef = useRef(null);
  const baseTextRef    = useRef("");

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    localStorage.setItem("nh_api_key", k);
    setApiKey(k);
    setShowKeyPanel(false);
    setKeyInput("");
  };

  const toggleExam  = k => setExam(p => ({ ...p, [k]: !p[k] }));
  const setExamNote = (sec, val) => setExamNotes(p => ({ ...p, [sec]: val }));

  // ── Auto-fill ──
  const runAutoFill = async () => {
    if (!autoFillText.trim()) return;
    if (!apiKey) { setAutoFillError("Add your API key first."); setShowKeyPanel(true); return; }
    setAutoFilling(true);
    setAutoFillError("");
    const prompt = `You are parsing a clinical note or free-text patient info into structured fields.
Extract the following four fields from the text below. If a field isn't present, return an empty string for it.
Respond ONLY with valid JSON, no commentary, no markdown fences.

{
  "demo": "patient demographics and visit reason",
  "hpi": "history of present illness",
  "objective": "vital signs and lab/test results",
  "ap": "assessment and plan"
}

Text to parse:
${autoFillText}`;
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
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.demo)      setDemo(parsed.demo.trim());
      if (parsed.hpi)       setHpi(parsed.hpi.trim());
      if (parsed.objective) setObjective(parsed.objective.trim());
      if (parsed.ap)        setAp(parsed.ap.trim());
      setAutoFillText("");
    } catch (e) {
      setAutoFillError("Couldn't parse the text. Try being more specific or check your API key.");
    } finally {
      setAutoFilling(false);
    }
  };

  // ── Dictation ──
  const setters = { demo: setDemo, hpi: setHpi, objective: setObjective, ap: setAp, autofill: setAutoFillText };
  const currentValues = { demo, hpi, objective, ap, autofill: autoFillText };

  const startDictation = (field) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition requires Chrome or Edge."); return; }
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    baseTextRef.current = currentValues[field] || "";
    rec.onresult = (e) => {
      let finalDelta = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalDelta += t + " ";
        else interim += t;
      }
      if (finalDelta) baseTextRef.current += finalDelta;
      const setter = setters[field];
      if (setter) setter(baseTextRef.current + interim);
    };
    rec.onend = () => {
      if (recognitionRef.current) {
        setTimeout(() => { try { recognitionRef.current?.start(); } catch (err) {} }, 150);
      } else {
        setListeningField(null);
      }
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech") return;
      setListeningField(null);
      recognitionRef.current = null;
    };
    rec.start();
    recognitionRef.current = rec;
    setListeningField(field);
  };

  const stopDictation = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    baseTextRef.current = "";
    setListeningField(null);
  };

  const toggleDictation = (field) => {
    listeningField === field ? stopDictation() : startDictation(field);
  };

  // ── Generate note ──
  const generateNote = async () => {
    if (!apiKey) { setError("Add your Anthropic API key to get started."); setShowKeyPanel(true); return; }
    setLoading(true); setError(""); setNote("");
    const examSummary = buildExamSummary(exam, examNotes, includeSensitive);
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
    setNote(""); setError(""); setAutoFillText(""); setAutoFillError("");
    setExam(buildInitialExam());
    setExamNotes(buildInitialExamNotes());
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

          {/* Auto-fill */}
          <div className="section autofill-section">
            <div className="section-header">
              <span className="section-label">Auto-fill</span>
              <button
                className={`dictate-btn${listeningField === "autofill" ? " dictate-active" : ""}`}
                onClick={() => toggleDictation("autofill")}
              >
                {listeningField === "autofill"
                  ? <><span className="pulse-dot" />Stop</>
                  : <><MicIcon />Dictate</>
                }
              </button>
            </div>
            {listeningField === "autofill" && (
              <div className="dictate-status">🎙 Listening — speak now</div>
            )}
            <textarea
              value={autoFillText}
              onChange={e => setAutoFillText(e.target.value)}
              placeholder="Paste a prior note, referral, or any free-text info — demographics, HPI, vitals, A&P — then hit Auto-fill…"
              rows={4}
              className="field-textarea"
            />
            {autoFillError && <p className="autofill-error">{autoFillError}</p>}
            <div className="autofill-action">
              <button className="btn-autofill" onClick={runAutoFill} disabled={autoFilling || !autoFillText.trim()}>
                {autoFilling
                  ? <><span className="spinner" />Filling…</>
                  : <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      Auto-fill fields
                    </>
                }
              </button>
            </div>
          </div>

          <DictationField label="Demographics / Visit" value={demo} onChange={setDemo}
            placeholder="68M presenting for DM follow-up. PMH: HTN, HLD."
            field="demo" listeningField={listeningField} onToggle={toggleDictation} />

          <DictationField label="HPI" value={hpi} onChange={setHpi}
            placeholder="Sugars running 130–160 at home, no hypoglycemic episodes. Here for med refill and A1c check."
            field="hpi" listeningField={listeningField} onToggle={toggleDictation} rows={4} />

          <ExamSection
            exam={exam} onToggle={toggleExam}
            examNotes={examNotes} onExamNote={setExamNote}
            includeSensitive={includeSensitive}
            onToggleSensitive={() => setIncludeSensitive(s => !s)}
          />

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
  --accent:     #d97706;
  --danger:     #dc2626;
  --danger-bg:  #fef2f2;
  --chip-on-bg: #1a1a18;
  --chip-on-text: #ffffff;
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

.topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(249,249,248,0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.topbar-inner {
  max-width: 780px; margin: 0 auto; padding: 0 20px;
  height: 50px; display: flex; align-items: center; justify-content: space-between;
}
.topbar-logo {
  display: flex; align-items: center; gap: 8px;
  font-weight: 600; font-size: 14px; color: var(--text);
}
.topbar-key-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--border-med); color: var(--text2);
  border-radius: var(--radius-sm); padding: 5px 11px;
  font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;
  transition: all 0.15s;
}
.topbar-key-btn:hover { border-color: var(--text2); color: var(--text); }

.main {
  max-width: 780px; margin: 0 auto;
  padding: 24px 20px 100px;
  display: flex; flex-direction: column; gap: 10px;
}

.key-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 15px 17px;
  box-shadow: var(--shadow); animation: fadeIn 0.18s ease;
}
.key-panel-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--text3); margin-bottom: 9px;
}
.key-row { display: flex; gap: 7px; }
.key-input {
  flex: 1; border: 1px solid var(--border-med); border-radius: var(--radius-sm);
  background: var(--bg); color: var(--text); padding: 7px 11px;
  font-size: 13px; font-family: 'DM Mono', monospace; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.key-input:focus { border-color: #999; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
.key-show-btn, .key-save-btn {
  border-radius: var(--radius-sm); padding: 7px 12px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.key-show-btn { background: none; border: 1px solid var(--border-med); color: var(--text2); }
.key-show-btn:hover { border-color: var(--text2); color: var(--text); }
.key-save-btn { background: var(--text); border: 1px solid var(--text); color: white; }
.key-save-btn:hover:not(:disabled) { background: #333; }
.key-save-btn:disabled { opacity: 0.3; cursor: default; }
.key-note { font-size: 11.5px; color: var(--text3); margin-top: 7px; }

.section {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 16px;
  box-shadow: var(--shadow);
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 9px; gap: 10px;
}
.section-label { font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }

.autofill-section { border-color: #e8e0d4; background: #fffdf9; }
.autofill-error { font-size: 12px; color: var(--danger); margin-top: 6px; }
.autofill-action { display: flex; justify-content: flex-end; margin-top: 9px; }
.btn-autofill {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); border: 1px solid var(--accent);
  color: white; border-radius: var(--radius-sm);
  padding: 7px 16px; font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer; transition: all 0.15s;
}
.btn-autofill:hover:not(:disabled) { background: #b45309; border-color: #b45309; }
.btn-autofill:disabled { opacity: 0.4; cursor: default; }

.dictate-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--border-med); color: var(--text2);
  border-radius: var(--radius-sm); padding: 4px 10px;
  font-size: 12px; font-weight: 500; font-family: inherit;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.dictate-btn:hover { border-color: var(--text2); color: var(--text); }
.dictate-active {
  border-color: var(--danger) !important;
  color: var(--danger) !important;
  background: var(--danger-bg) !important;
}
.dictate-status {
  font-size: 12px; color: var(--danger);
  margin-bottom: 7px; padding: 5px 8px;
  background: var(--danger-bg); border-radius: var(--radius-sm);
}
.pulse-dot {
  display: inline-block; width: 7px; height: 7px;
  background: var(--danger); border-radius: 50%; margin-right: 4px;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.6); }
}

.field-textarea {
  width: 100%; background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text);
  padding: 9px 11px; font-size: 14px; font-family: inherit;
  line-height: 1.6; resize: vertical; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-textarea:focus { border-color: var(--border-med); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
.field-textarea::placeholder { color: var(--text3); }
.note-mono { font-family: 'DM Mono', monospace; font-size: 13px; line-height: 1.75; }

/* ── Exam rows ── */
.sensitive-toggle {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text2); cursor: pointer;
  user-select: none; font-weight: 500;
}
.sensitive-toggle input { accent-color: var(--text); cursor: pointer; }

.exam-rows {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.exam-row-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
}
.exam-row-item:last-child { border-bottom: none; }

.exam-row-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text3);
  width: 82px;
  min-width: 82px;
  padding-top: 4px;
}

.exam-row-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  align-items: center;
}

.exam-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border-med);
  background: var(--bg);
  color: var(--text2);
  transition: all 0.12s;
  white-space: nowrap;
  line-height: 1.4;
}
.exam-chip:hover { border-color: var(--text2); color: var(--text); }
.exam-chip-on {
  background: var(--chip-on-bg);
  border-color: var(--chip-on-bg);
  color: var(--chip-on-text);
  font-weight: 500;
}
.exam-chip-on:hover { background: #333; border-color: #333; }

.exam-row-extra {
  border: none;
  border-bottom: 1px dashed var(--border-med);
  border-radius: 0;
  background: transparent;
  color: var(--text2);
  padding: 3px 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  width: 110px;
  transition: border-color 0.15s, width 0.2s;
}
.exam-row-extra:focus {
  border-color: var(--text2);
  width: 160px;
  color: var(--text);
}
.exam-row-extra::placeholder { color: var(--text3); font-style: italic; }

/* ── Actions ── */
.action-row { display: flex; gap: 8px; flex-wrap: wrap; padding: 4px 0 2px; }
.btn-generate {
  display: flex; align-items: center; gap: 7px;
  background: var(--text); border: 1px solid var(--text); color: white;
  border-radius: var(--radius); padding: 9px 22px;
  font-size: 14px; font-weight: 500; font-family: inherit;
  cursor: pointer; transition: background 0.15s; letter-spacing: -0.01em;
}
.btn-generate:hover:not(:disabled) { background: #2a2a28; }
.btn-generate:disabled { opacity: 0.4; cursor: default; }
.btn-secondary {
  background: white; border: 1px solid var(--border-med); color: var(--text);
  border-radius: var(--radius); padding: 9px 18px;
  font-size: 14px; font-weight: 500; font-family: inherit;
  cursor: pointer; transition: border-color 0.15s;
}
.btn-secondary:hover:not(:disabled) { border-color: var(--text2); }
.btn-secondary:disabled { opacity: 0.35; cursor: default; }
.btn-ghost {
  background: none; border: 1px solid transparent; color: var(--text3);
  border-radius: var(--radius); padding: 9px 14px;
  font-size: 14px; font-family: inherit; cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover { color: var(--text2); border-color: var(--border); }

.error-banner {
  background: var(--danger-bg); border: 1px solid #fecaca;
  border-radius: var(--radius); color: var(--danger);
  padding: 10px 14px; font-size: 13px;
}

.loading-lines { display: flex; flex-direction: column; gap: 10px; padding: 6px 0; }
.loading-lines span {
  display: block; height: 13px;
  background: linear-gradient(90deg, var(--border) 25%, #f0f0ee 50%, var(--border) 75%);
  background-size: 200% 100%; border-radius: 4px;
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

.spinner {
  display: inline-block; width: 13px; height: 13px;
  border: 1.5px solid rgba(255,255,255,0.35); border-top-color: white;
  border-radius: 50%; animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}
.note-section { animation: fadeIn 0.22s ease; }

@media (max-width: 560px) {
  .main { padding: 18px 14px 80px; }
  .topbar-inner { padding: 0 14px; }
  .exam-row-label { width: 60px; min-width: 60px; font-size: 10px; }
}
`;
