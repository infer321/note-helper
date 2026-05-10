import { useState, useRef } from "react";

export default function App() {
  const [demo, setDemo] = useState("");
  const [hpi, setHpi] = useState("");
  const [objective, setObjective] = useState("");
  const [ap, setAp] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [listeningField, setListeningField] = useState(null);
  const recognitionRef = useRef(null);

  const [includeSensitiveExam, setIncludeSensitiveExam] = useState(false);

  const [exam, setExam] = useState({
    general_illAppearing: false,
    general_distress: false,
    general_disoriented: false,
    general_gaitDifficulty: false,

    skin_rash: false,
    skin_bruising: false,
    skin_poorTurgor: false,

    heent_headTrauma: false,
    heent_conjunctivalInjection: false,
    heent_scleralIcterus: false,
    heent_dryMucousMembranes: false,
    heent_pharyngealExudate: false,
    heent_cervicalLAD: false,

    cv_murmur: false,
    cv_irregularRhythm: false,
    cv_gallop: false,

    pulm_wheezes: false,
    pulm_crackles: false,
    pulm_rhonchi: false,
    pulm_increasedWorkBreathing: false,

    abd_tenderness: false,
    abd_distention: false,
    abd_mass: false,
    abd_guarding: false,

    back_cvaTenderness: false,
    back_spinalTenderness: false,

    ext_edema: false,
    ext_cyanosis: false,
    ext_deformity: false,

    msk_tenderness: false,
    msk_decreasedRom: false,
    msk_weakness: false,
    msk_swelling: false,

    neuro_focalDeficit: false,
    neuro_sensoryDeficit: false,
    neuro_weakness: false,
    neuro_abnormalGait: false,

    psych_flatAffect: false,
    psych_anxious: false,
    psych_depressedMood: false,
    psych_impairedJudgment: false,

    pelvic_lesion: false,
    pelvic_discharge: false,
    pelvic_adnexalTenderness: false,
    pelvic_mass: false,

    breast_mass: false,
    breast_tenderness: false,
    breast_axillaryAdenopathy: false,
    breast_nippleDischarge: false,

    gu_lesion: false,
    gu_discharge: false,
    gu_testicularMass: false,
    gu_scrotalTenderness: false,
  });

  const toggleExam = (key) => {
    setExam((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setFieldValue = (field, updater) => {
    const map = {
      demo: setDemo,
      hpi: setHpi,
      objective: setObjective,
      ap: setAp,
    };

    if (map[field]) {
      map[field](updater);
    }
  };

  const startDictation = (field) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        }
      }

      if (finalText) {
        setFieldValue(field, (prev) => prev + finalText);
      }
    };

    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListeningField(field);
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    recognitionRef.current = null;
    setListeningField(null);
  };

  const toggleDictation = (field) => {
    if (listeningField === field) {
      stopDictation();
    } else {
      startDictation(field);
    }
  };

  const buildExamSummary = () => {
    const lineFromPairs = (title, pairs) => {
      const findings = pairs.map(([positiveText, negativeText, checked]) =>
        checked ? positiveText : negativeText
      );
      return `${title}: ${findings.join(", ")}.`;
    };

    const lines = [];

    lines.push(
      lineFromPairs("General", [
        ["ill appearing", "well appearing", exam.general_illAppearing],
        ["in acute distress", "in no acute distress", exam.general_distress],
        ["disoriented", "oriented x3", exam.general_disoriented],
        ["ambulating with difficulty", "ambulating without difficulty", exam.general_gaitDifficulty],
      ])
    );

    lines.push(
      lineFromPairs("Skin", [
        ["rash present", "no rash", exam.skin_rash],
        ["unusual bruising present", "no unusual bruising", exam.skin_bruising],
        ["poor skin turgor", "good turgor", exam.skin_poorTurgor],
      ])
    );

    lines.push(
      lineFromPairs("HEENT", [
        ["head trauma/visible abnormality", "normocephalic, atraumatic", exam.heent_headTrauma],
        ["conjunctival injection", "conjunctiva clear", exam.heent_conjunctivalInjection],
        ["scleral icterus", "sclera non-icteric", exam.heent_scleralIcterus],
        ["dry mucous membranes", "mucous membranes moist", exam.heent_dryMucousMembranes],
        ["pharyngeal exudate", "no pharyngeal exudate", exam.heent_pharyngealExudate],
        ["cervical adenopathy", "no cervical adenopathy", exam.heent_cervicalLAD],
      ])
    );

    lines.push(
      lineFromPairs("Cardiovascular", [
        ["murmur present", "no murmur", exam.cv_murmur],
        ["irregular rhythm", "regular rate and rhythm", exam.cv_irregularRhythm],
        ["gallop present", "no gallop", exam.cv_gallop],
      ])
    );

    lines.push(
      lineFromPairs("Pulmonary", [
        ["wheezes", "no wheezes", exam.pulm_wheezes],
        ["crackles", "no crackles", exam.pulm_crackles],
        ["rhonchi", "no rhonchi", exam.pulm_rhonchi],
        ["increased work of breathing", "no increased work of breathing", exam.pulm_increasedWorkBreathing],
      ])
    );

    lines.push(
      lineFromPairs("Abdomen", [
        ["tenderness", "soft, non-tender", exam.abd_tenderness],
        ["distention", "non-distended", exam.abd_distention],
        ["mass", "no masses", exam.abd_mass],
        ["guarding", "no guarding", exam.abd_guarding],
      ])
    );

    lines.push(
      lineFromPairs("Back", [
        ["CVA tenderness", "no CVA tenderness", exam.back_cvaTenderness],
        ["spinal tenderness", "no spinal tenderness", exam.back_spinalTenderness],
      ])
    );

    lines.push(
      lineFromPairs("Extremities", [
        ["edema", "no edema", exam.ext_edema],
        ["cyanosis", "no cyanosis", exam.ext_cyanosis],
        ["deformity", "no deformity", exam.ext_deformity],
      ])
    );

    lines.push(
      lineFromPairs("Musculoskeletal", [
        ["tenderness", "no tenderness", exam.msk_tenderness],
        ["decreased range of motion", "normal range of motion", exam.msk_decreasedRom],
        ["weakness", "no weakness", exam.msk_weakness],
        ["swelling", "no swelling", exam.msk_swelling],
      ])
    );

    lines.push(
      lineFromPairs("Neurologic", [
        ["focal neurologic deficit", "no focal deficits", exam.neuro_focalDeficit],
        ["sensory deficit", "sensation intact", exam.neuro_sensoryDeficit],
        ["weakness", "strength intact", exam.neuro_weakness],
        ["abnormal gait", "gait normal", exam.neuro_abnormalGait],
      ])
    );

    lines.push(
      lineFromPairs("Psychiatric", [
        ["flat affect", "normal affect", exam.psych_flatAffect],
        ["anxious", "not anxious", exam.psych_anxious],
        ["depressed mood", "normal mood", exam.psych_depressedMood],
        ["impaired judgment/insight", "judgment and insight intact", exam.psych_impairedJudgment],
      ])
    );

    if (includeSensitiveExam) {
      lines.push(
        lineFromPairs("Pelvic", [
          ["lesion present", "no lesions", exam.pelvic_lesion],
          ["vaginal/cervical discharge", "no discharge", exam.pelvic_discharge],
          ["adnexal tenderness", "no adnexal tenderness", exam.pelvic_adnexalTenderness],
          ["pelvic mass", "no pelvic masses", exam.pelvic_mass],
        ])
      );

      lines.push(
        lineFromPairs("Breast", [
          ["breast mass", "no breast masses", exam.breast_mass],
          ["breast tenderness", "no breast tenderness", exam.breast_tenderness],
          ["axillary adenopathy", "no axillary adenopathy", exam.breast_axillaryAdenopathy],
          ["nipple discharge", "no nipple discharge", exam.breast_nippleDischarge],
        ])
      );

      lines.push(
        lineFromPairs("GU", [
          ["GU lesion", "no lesions", exam.gu_lesion],
          ["urethral discharge", "no discharge", exam.gu_discharge],
          ["testicular mass", "no testicular masses", exam.gu_testicularMass],
          ["scrotal tenderness", "no scrotal tenderness", exam.gu_scrotalTenderness],
        ])
      );
    }

    return lines.join("\n");
  };

  const generateNote = async () => {
    try {
      setLoading(true);

      const examSummary = buildExamSummary();

      const response = await fetch("http://127.0.0.1:8000/generate-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          demo,
          hpi,
          exam: examSummary,
          objective,
          ap,
        }),
      });

      const data = await response.json();
      setNote(data.note);
    } catch (error) {
      console.error("Error generating note:", error);
      setNote("Error generating note.");
    } finally {
      setLoading(false);
    }
  };

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(note);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#0b1020",
    color: "#f8fafc",
    padding: "20px 12px",
    fontFamily: "Arial, sans-serif",
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "0 auto",
  };

  const titleStyle = {
    fontSize: "40px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "6px",
  };

  const subtitleStyle = {
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: "22px",
    fontSize: "16px",
  };

  const cardStyle = {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "17px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#e5e7eb",
    textAlign: "center",
  };

  const fieldHeaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
    gap: "10px",
  };

  const fieldLabelStyle = {
    fontSize: "17px",
    fontWeight: "600",
    color: "#e5e7eb",
  };

  const micButtonStyle = {
    background: "#374151",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const micActiveButtonStyle = {
    ...micButtonStyle,
    background: "#dc2626",
  };

  const textareaStyle = {
    width: "100%",
    minHeight: "100px",
    borderRadius: "10px",
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    padding: "12px",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  };

  const outputStyle = {
    ...textareaStyle,
    minHeight: "240px",
  };

  const buttonWrapStyle = {
    position: "sticky",
    bottom: "16px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    margin: "18px 0",
    zIndex: 10,
  };

  const buttonStyle = {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
  };

  const secondaryButtonStyle = {
    background: "#374151",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  };

  const examSectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const examRowStyle = {
    border: "1px solid #374151",
    borderRadius: "10px",
    padding: "8px 10px",
    background: "#1f2937",
  };

  const examRowTitleStyle = {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "6px",
    color: "#cbd5e1",
    textAlign: "center",
  };

  const examOptionsWrapStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "6px 12px",
  };

  const examOptionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    color: "#e5e7eb",
    whiteSpace: "nowrap",
  };

  const examToggleStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "14px",
    color: "#e5e7eb",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Note Helper</h1>
        <p style={subtitleStyle}>Structured outpatient note drafting</p>

        <div style={cardStyle}>
          <div style={fieldHeaderStyle}>
            <label style={fieldLabelStyle}>Demographics / Visit</label>
            <button
              onClick={() => toggleDictation("demo")}
              style={listeningField === "demo" ? micActiveButtonStyle : micButtonStyle}
            >
              {listeningField === "demo" ? "Stop Mic" : "Mic"}
            </button>
          </div>
          <textarea
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
            placeholder="68M, DM follow-up, hx HTN/HLD..."
            style={textareaStyle}
          />
        </div>

        <div style={cardStyle}>
          <div style={fieldHeaderStyle}>
            <label style={fieldLabelStyle}>HPI</label>
            <button
              onClick={() => toggleDictation("hpi")}
              style={listeningField === "hpi" ? micActiveButtonStyle : micButtonStyle}
            >
              {listeningField === "hpi" ? "Stop Mic" : "Mic"}
            </button>
          </div>
          <textarea
            value={hpi}
            onChange={(e) => setHpi(e.target.value)}
            placeholder="Sugars 130–160, no hypoglycemia, needs med refill..."
            style={textareaStyle}
          />
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>Physical Exam</label>

          <div style={examToggleStyle}>
            <input
              type="checkbox"
              checked={includeSensitiveExam}
              onChange={() => setIncludeSensitiveExam((prev) => !prev)}
            />
            <span>Include Pelvic / Breast / G/U exam</span>
          </div>

          <div style={examSectionStyle}>
            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>General</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.general_illAppearing} onChange={() => toggleExam("general_illAppearing")} />Ill appearing</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.general_distress} onChange={() => toggleExam("general_distress")} />Acute distress</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.general_disoriented} onChange={() => toggleExam("general_disoriented")} />Disoriented</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.general_gaitDifficulty} onChange={() => toggleExam("general_gaitDifficulty")} />Difficulty ambulating</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Skin</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.skin_rash} onChange={() => toggleExam("skin_rash")} />Rash</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.skin_bruising} onChange={() => toggleExam("skin_bruising")} />Bruising</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.skin_poorTurgor} onChange={() => toggleExam("skin_poorTurgor")} />Poor turgor</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>HEENT</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.heent_headTrauma} onChange={() => toggleExam("heent_headTrauma")} />Head trauma/abnormality</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.heent_conjunctivalInjection} onChange={() => toggleExam("heent_conjunctivalInjection")} />Conjunctival injection</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.heent_scleralIcterus} onChange={() => toggleExam("heent_scleralIcterus")} />Scleral icterus</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.heent_dryMucousMembranes} onChange={() => toggleExam("heent_dryMucousMembranes")} />Dry mucous membranes</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.heent_pharyngealExudate} onChange={() => toggleExam("heent_pharyngealExudate")} />Pharyngeal exudate</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.heent_cervicalLAD} onChange={() => toggleExam("heent_cervicalLAD")} />Cervical LAD</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Cardiovascular</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.cv_murmur} onChange={() => toggleExam("cv_murmur")} />Murmur</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.cv_irregularRhythm} onChange={() => toggleExam("cv_irregularRhythm")} />Irregular rhythm</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.cv_gallop} onChange={() => toggleExam("cv_gallop")} />Gallop</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Pulmonary</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.pulm_wheezes} onChange={() => toggleExam("pulm_wheezes")} />Wheezes</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.pulm_crackles} onChange={() => toggleExam("pulm_crackles")} />Crackles</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.pulm_rhonchi} onChange={() => toggleExam("pulm_rhonchi")} />Rhonchi</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.pulm_increasedWorkBreathing} onChange={() => toggleExam("pulm_increasedWorkBreathing")} />Increased work of breathing</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Abdomen</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.abd_tenderness} onChange={() => toggleExam("abd_tenderness")} />Tenderness</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.abd_distention} onChange={() => toggleExam("abd_distention")} />Distention</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.abd_mass} onChange={() => toggleExam("abd_mass")} />Mass</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.abd_guarding} onChange={() => toggleExam("abd_guarding")} />Guarding</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Back</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.back_cvaTenderness} onChange={() => toggleExam("back_cvaTenderness")} />CVA tenderness</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.back_spinalTenderness} onChange={() => toggleExam("back_spinalTenderness")} />Spinal tenderness</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Extremities</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.ext_edema} onChange={() => toggleExam("ext_edema")} />Edema</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.ext_cyanosis} onChange={() => toggleExam("ext_cyanosis")} />Cyanosis</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.ext_deformity} onChange={() => toggleExam("ext_deformity")} />Deformity</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Musculoskeletal</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.msk_tenderness} onChange={() => toggleExam("msk_tenderness")} />Tenderness</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.msk_decreasedRom} onChange={() => toggleExam("msk_decreasedRom")} />Decreased ROM</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.msk_weakness} onChange={() => toggleExam("msk_weakness")} />Weakness</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.msk_swelling} onChange={() => toggleExam("msk_swelling")} />Swelling</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Neurologic</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.neuro_focalDeficit} onChange={() => toggleExam("neuro_focalDeficit")} />Focal deficit</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.neuro_sensoryDeficit} onChange={() => toggleExam("neuro_sensoryDeficit")} />Sensory deficit</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.neuro_weakness} onChange={() => toggleExam("neuro_weakness")} />Weakness</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.neuro_abnormalGait} onChange={() => toggleExam("neuro_abnormalGait")} />Abnormal gait</label>
              </div>
            </div>

            <div style={examRowStyle}>
              <div style={examRowTitleStyle}>Psychiatric</div>
              <div style={examOptionsWrapStyle}>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.psych_flatAffect} onChange={() => toggleExam("psych_flatAffect")} />Flat affect</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.psych_anxious} onChange={() => toggleExam("psych_anxious")} />Anxious</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.psych_depressedMood} onChange={() => toggleExam("psych_depressedMood")} />Depressed mood</label>
                <label style={examOptionStyle}><input type="checkbox" checked={exam.psych_impairedJudgment} onChange={() => toggleExam("psych_impairedJudgment")} />Impaired judgment</label>
              </div>
            </div>

            {includeSensitiveExam && (
              <>
                <div style={examRowStyle}>
                  <div style={examRowTitleStyle}>Pelvic</div>
                  <div style={examOptionsWrapStyle}>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.pelvic_lesion} onChange={() => toggleExam("pelvic_lesion")} />Lesion</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.pelvic_discharge} onChange={() => toggleExam("pelvic_discharge")} />Discharge</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.pelvic_adnexalTenderness} onChange={() => toggleExam("pelvic_adnexalTenderness")} />Adnexal tenderness</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.pelvic_mass} onChange={() => toggleExam("pelvic_mass")} />Mass</label>
                  </div>
                </div>

                <div style={examRowStyle}>
                  <div style={examRowTitleStyle}>Breast</div>
                  <div style={examOptionsWrapStyle}>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.breast_mass} onChange={() => toggleExam("breast_mass")} />Mass</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.breast_tenderness} onChange={() => toggleExam("breast_tenderness")} />Tenderness</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.breast_axillaryAdenopathy} onChange={() => toggleExam("breast_axillaryAdenopathy")} />Axillary adenopathy</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.breast_nippleDischarge} onChange={() => toggleExam("breast_nippleDischarge")} />Nipple discharge</label>
                  </div>
                </div>

                <div style={examRowStyle}>
                  <div style={examRowTitleStyle}>G/U</div>
                  <div style={examOptionsWrapStyle}>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.gu_lesion} onChange={() => toggleExam("gu_lesion")} />Lesion</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.gu_discharge} onChange={() => toggleExam("gu_discharge")} />Discharge</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.gu_testicularMass} onChange={() => toggleExam("gu_testicularMass")} />Testicular mass</label>
                    <label style={examOptionStyle}><input type="checkbox" checked={exam.gu_scrotalTenderness} onChange={() => toggleExam("gu_scrotalTenderness")} />Scrotal tenderness</label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={fieldHeaderStyle}>
            <label style={fieldLabelStyle}>Objective</label>
            <button
              onClick={() => toggleDictation("objective")}
              style={listeningField === "objective" ? micActiveButtonStyle : micButtonStyle}
            >
              {listeningField === "objective" ? "Stop Mic" : "Mic"}
            </button>
          </div>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="BP 138/82, A1c 7.4..."
            style={textareaStyle}
          />
        </div>

        <div style={cardStyle}>
          <div style={fieldHeaderStyle}>
            <label style={fieldLabelStyle}>Assessment / Plan</label>
            <button
              onClick={() => toggleDictation("ap")}
              style={listeningField === "ap" ? micActiveButtonStyle : micButtonStyle}
            >
              {listeningField === "ap" ? "Stop Mic" : "Mic"}
            </button>
          </div>
          <textarea
            value={ap}
            onChange={(e) => setAp(e.target.value)}
            placeholder="DM moderately controlled, refill meds, repeat A1c in 3 months..."
            style={textareaStyle}
          />
        </div>

        <div style={buttonWrapStyle}>
          <button onClick={generateNote} style={buttonStyle} disabled={loading}>
            {loading ? "Generating..." : "Generate Note"}
          </button>

          <button
            onClick={copyNote}
            style={secondaryButtonStyle}
            disabled={!note}
          >
            Copy Note
          </button>
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>Generated Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Your generated note will appear here..."
            style={outputStyle}
          />
        </div>
      </div>
    </div>
  );
}