import React, { useMemo, useRef, useState } from "react";
// import axiosInstance from "../../api/axiosInstance"; // use if posting for real

type QuestionType = "SingleChoice" | "MultipleChoice" | "ShortAnswer" | "Paragraph";

interface Question {
  questionId: string;
  questionText: string;
  type: QuestionType;
  options?: string[];
  selectedAnswers: string[];
  textAnswer: string;
  required?: boolean;
}

interface Section {
  sectionTitle: string;
  questions: Question[];
}

interface FeedbackFormData {
  formTitle: string;
  sections: Section[];
}

const OPTIONAL_IDS = new Set(["q9", "q10"]);

const initialForm: FeedbackFormData = {
  formTitle: "MediSearch Experience Feedback",
  sections: [
    {
      sectionTitle: "Usage Frequency",
      questions: [
        { questionId: "q1", questionText: "How often do you currently use MediSearch?", type: "SingleChoice", options: ["Daily", "A few times per week", "Rarely", "Never used it"], selectedAnswers: [], textAnswer: "", required: true },
        { questionId: "q2", questionText: "If you've used it before, what have you found helpful?", type: "Paragraph", selectedAnswers: [], textAnswer: "", required: true },
        { questionId: "q3", questionText: "If you haven't used it or stopped using it, what held you back?", type: "Paragraph", selectedAnswers: [], textAnswer: "", required: false },
      ],
    },
    {
      sectionTitle: "Feature Value",
      questions: [
        { questionId: "q4", questionText: "What's one feature or capability that would make MediSearch significantly more useful to you?", type: "ShortAnswer", selectedAnswers: [], textAnswer: "", required: true },
        { questionId: "q5", questionText: "What type of information do you wish MediSearch surfaced better or faster?", type: "Paragraph", selectedAnswers: [], textAnswer: "", required: true },
        { questionId: "q6", questionText: "If you could wave a magic wand and improve one part of the experience, what would it be?", type: "Paragraph", selectedAnswers: [], textAnswer: "", required: true },
        { questionId: "q7", questionText: "How do you currently find coverage, alternatives, or pricing when not using MediSearch?", type: "Paragraph", selectedAnswers: [], textAnswer: "", required: true },
      ],
    },
    {
      sectionTitle: "Improvement Opportunities",
      questions: [
        {
          questionId: "q8",
          questionText: "What would make you more likely to use MediSearch regularly?",
          type: "MultipleChoice",
          options: [
            "Better search filters",
            "Faster loading",
            "Easier UI",
            "Direct links to insurance formulary",
            "More training / onboarding",
            "Mobile or tablet compatibility",
            "Integration with EMR or Liberty",
            "Alerts for Needing Prior Auth, Transitional Fills, etc.",
            "Option to add feedback if Drug was an applicable alternative.",
          ],
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
        { questionId: "q9", questionText: "Would you be open to joining a short focus group or user test session?", type: "SingleChoice", options: ["Yes", "No"], selectedAnswers: [], textAnswer: "", required: false },
        { questionId: "q10", questionText: "Is there anything else you'd like to share that would help us improve MediSearch or make it indispensable to your workflow?", type: "Paragraph", selectedAnswers: [], textAnswer: "", required: false },
      ],
    },
  ],
};

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackFormData>(initialForm);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const progress = useMemo(() => {
    const requiredQs = formData.sections.flatMap((s) => s.questions).filter((q) => !OPTIONAL_IDS.has(q.questionId));
    const answered = requiredQs.filter((q) =>
      q.type === "SingleChoice" || q.type === "MultipleChoice"
        ? q.selectedAnswers.length > 0
        : q.textAnswer.trim().length > 0
    ).length;
    return { answered, total: requiredQs.length, pct: Math.round((answered / Math.max(requiredQs.length, 1)) * 100) };
  }, [formData]);

  const handleInputChange = (sIdx: number, qIdx: number, value: string) => {
    setFormData((prev) => {
      const next: FeedbackFormData = JSON.parse(JSON.stringify(prev));
      const q = next.sections[sIdx].questions[qIdx];
      if (q.type === "MultipleChoice") {
        q.selectedAnswers = q.selectedAnswers.includes(value)
          ? q.selectedAnswers.filter((v) => v !== value)
          : [...q.selectedAnswers, value];
      } else if (q.type === "SingleChoice") {
        q.selectedAnswers = [value];
      } else {
        q.textAnswer = value;
      }
      return next;
    });
    setValidationErrors((prev) => prev.filter((id) => id !== formData.sections[sIdx].questions[qIdx].questionId));
  };

  const validate = () => {
    const requiredQuestions = formData.sections.flatMap((s) => s.questions).filter((q) => !OPTIONAL_IDS.has(q.questionId));
    const invalidIds = requiredQuestions
      .filter((q) =>
        q.type === "SingleChoice" || q.type === "MultipleChoice"
          ? q.selectedAnswers.length === 0
          : q.textAnswer.trim() === ""
      )
      .map((q) => q.questionId);
    setValidationErrors(invalidIds);
    return invalidIds;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const invalid = validate();
    if (invalid.length) {
      questionRefs.current[invalid[0]]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      setLoading(true);
      // await axiosInstance.post("/feedback/submit", formData);
      await new Promise((res) => setTimeout(res, 500)); // demo
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setValidationErrors([]);
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <div className="feedback-root">
      <style>{`
        .feedback-root { min-height: 100vh; background: var(--bs-body-bg, #f8f9fa); }
        /* Header (title + breadcrumb) */
        .page-header {
          background:#fff; border-bottom:1px solid rgba(0,0,0,.08);
        }
        .page-header .inner {
          max-width: 920px; margin: 0 auto; padding: 18px 16px;
        }
        .page-header h3 { margin: 0 0 6px; font-weight: 600; }
        .breadcrumb { margin: 0; padding: 0; list-style: none; display:flex; gap:6px; color:#6c757d; font-size:.95rem; }
        .breadcrumb a { color:#0d6efd; text-decoration:none; }
        .breadcrumb li::after { content: "›"; margin: 0 6px; color:#adb5bd; }
        .breadcrumb li:last-child::after { content: ""; }
        .breadcrumb .current { color:#495057; font-weight:500; }

        /* Centered shell */
        .feedback-shell { width:100%; max-width:920px; margin:0 auto; padding: 18px 16px 28px; }
        .feedback-card { border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,.05); background:#fff; overflow:hidden; }

        /* Sticky card header with progress */
        .feedback-header { position: sticky; top: 60px; z-index:2; background:#fff; border-bottom:1px solid rgba(0,0,0,.08); padding:14px 18px; display:flex; gap:12px; align-items:center; justify-content:space-between; }
        .feedback-title { margin:0; font-size:1.125rem; font-weight:600; }
        .progress { height:8px; background:rgba(0,0,0,.08); border-radius:999px; width:160px; overflow:hidden; }
        .progress-bar { height:100%; background:#0d6efd; transition:width .25s ease; }

        .section-title { font-weight:600; padding-bottom:8px; border-bottom:1px solid rgba(0,0,0,.08); margin-bottom:12px; }
        .q { padding:12px 14px; border:1px solid rgba(0,0,0,.1); border-radius:10px; background:#fff; }
        .q + .q { margin-top:10px; }
        .q.invalid { border-color:#dc3545; background:rgba(220,53,69,.03); }
        .q .label { font-weight:500; margin-bottom:6px; display:block; }
        .q .required { color:#dc3545; margin-left:4px; }

        .form-actions { border-top:1px solid rgba(0,0,0,.08); padding-top:14px; margin-top:8px; display:flex; justify-content:flex-end; gap:8px; }
        .btn { display:inline-block; border:1px solid transparent; border-radius:8px; padding:8px 14px; font-weight:500; }
        .btn-primary { background:#0d6efd; color:#fff; }
        .btn-outline { background:#fff; color:#0d6efd; border-color:#0d6efd; }
        .btn:disabled { opacity:.7; cursor:not-allowed; }

        @media (max-width:575.98px){
          .feedback-header{ position: static; }
          .progress{ width:120px; }
        }
      `}</style>

      {/* TITLE + BREADCRUMB */}
      <header className="page-header">
        <div className="inner">
          <h3>MediSearch Feedback</h3>
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb">
              <li><a href="/">Home</a></li>
              <li className="current" aria-current="page">Feedback</li>
            </ol>
          </nav>
        </div>
      </header>

      {/* CENTERED CARD */}
      <div className="feedback-shell">
        <div className="feedback-card">
          <div className="feedback-header">
            <h5 className="feedback-title">{formData.formTitle}</h5>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <small style={{ color: "#6c757d" }}>{progress.answered}/{progress.total} required</small>
              <div className="progress" aria-hidden="true">
                <div className="progress-bar" style={{ width: `${progress.pct}%` }} />
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 18px 20px" }}>
            {isSubmitted ? (
              <div style={{ textAlign: "center", padding: "48px 8px" }}>
                <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#198754", color: "#fff", marginBottom: 12 }}>
                  Submitted
                </div>
                <h4 style={{ marginBottom: 6 }}>Thank you for your feedback!</h4>
                <p style={{ color: "#6c757d" }}>We appreciate your time and input.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>Submit another</button>
                  <button className="btn btn-outline" onClick={resetForm}>Reset</button>
                </div>
              </div>
            ) : (
              <>
                {submitError && (
                  <div style={{ padding: 12, borderRadius: 10, background: "rgba(220,53,69,.1)", color: "#842029", marginBottom: 10 }}>
                    {submitError}
                  </div>
                )}
                {validationErrors.length > 0 && (
                  <div style={{ padding: 12, borderRadius: 10, background: "rgba(220,53,69,.1)", color: "#842029", marginBottom: 10 }}>
                    Please fix the required questions.
                  </div>
                )}

                {formData.sections.map((section, sIdx) => (
                  <section key={sIdx} style={{ marginBottom: 18 }} aria-labelledby={`sec-${sIdx}`}>
                    <h6 id={`sec-${sIdx}`} className="section-title">{section.sectionTitle}</h6>

                    {section.questions.map((q, qIdx) => {
                      const invalid = validationErrors.includes(q.questionId);
                      return (
                        <div
                          key={q.questionId}
                          ref={(el) => (questionRefs.current[q.questionId] = el)}
                          className={`q ${invalid ? "invalid" : ""}`}
                          role="group"
                          aria-labelledby={`label-${q.questionId}`}
                          aria-invalid={invalid || undefined}
                        >
                          <label id={`label-${q.questionId}`} className="label">
                            {q.questionText}
                            {!OPTIONAL_IDS.has(q.questionId) && <span className="required">*</span>}
                          </label>

                          {(q.type === "SingleChoice" || q.type === "MultipleChoice") &&
                            q.options?.map((opt, i) => (
                              <div style={{ marginBottom: 6 }} key={i}>
                                <input
                                  type={q.type === "SingleChoice" ? "radio" : "checkbox"}
                                  id={`${q.questionId}-${i}`}
                                  name={q.questionId}
                                  checked={q.selectedAnswers.includes(opt)}
                                  onChange={() => handleInputChange(sIdx, qIdx, opt)}
                                  aria-required={!OPTIONAL_IDS.has(q.questionId) || undefined}
                                  style={{ marginRight: 8 }}
                                />
                                <label htmlFor={`${q.questionId}-${i}`}>{opt}</label>
                              </div>
                            ))}

                          {q.type === "ShortAnswer" && (
                            <input
                              value={q.textAnswer}
                              onChange={(e) => handleInputChange(sIdx, qIdx, e.target.value)}
                              aria-required={!OPTIONAL_IDS.has(q.questionId) || undefined}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,.2)" }}
                            />
                          )}

                          {q.type === "Paragraph" && (
                            <textarea
                              rows={3}
                              value={q.textAnswer}
                              onChange={(e) => handleInputChange(sIdx, qIdx, e.target.value)}
                              aria-required={!OPTIONAL_IDS.has(q.questionId) || undefined}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,.2)" }}
                            />
                          )}

                          {invalid && <div style={{ color: "#dc3545", marginTop: 6 }}>Required</div>}
                        </div>
                      );
                    })}
                  </section>
                ))}

                <div className="form-actions">
                  <button className="btn btn-outline" onClick={resetForm}>Reset</button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
