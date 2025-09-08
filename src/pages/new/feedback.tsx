import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import CommonFooter from "../../components/common-footer/commonFooter";
import React, { useMemo, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

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

const initialForm: FeedbackFormData = {
  formTitle: "MediSearch Experience Feedback",
  sections: [
    {
      sectionTitle: "Usage Frequency",
      questions: [
        {
          questionId: "q1",
          questionText: "How often do you currently use MediSearch?",
          type: "SingleChoice",
          options: ["Daily", "A few times per week", "Rarely", "Never used it"],
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
        {
          questionId: "q2",
          questionText: "If you've used it before, what have you found helpful?",
          type: "Paragraph",
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
        {
          questionId: "q3",
          questionText: "If you haven't used it or stopped using it, what held you back?",
          type: "Paragraph",
          selectedAnswers: [],
          textAnswer: "",
          required: false,
        },
      ],
    },
    {
      sectionTitle: "Feature Value",
      questions: [
        {
          questionId: "q4",
          questionText: "What's one feature or capability that would make MediSearch significantly more useful to you?",
          type: "ShortAnswer",
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
        {
          questionId: "q5",
          questionText: "What type of information do you wish MediSearch surfaced better or faster?",
          type: "Paragraph",
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
        {
          questionId: "q6",
          questionText: "If you could wave a magic wand and improve one part of the experience, what would it be?",
          type: "Paragraph",
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
        {
          questionId: "q7",
          questionText: "How do you currently find coverage, alternatives, or pricing when not using MediSearch?",
          type: "Paragraph",
          selectedAnswers: [],
          textAnswer: "",
          required: true,
        },
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
        {
          questionId: "q9",
          questionText: "Would you be open to joining a short focus group or user test session?",
          type: "SingleChoice",
          options: ["Yes", "No"],
          selectedAnswers: [],
          textAnswer: "",
          required: false,
        },
        {
          questionId: "q10",
          questionText: "Is there anything else you'd like to share that would help us improve MediSearch or make it indispensable to your workflow?",
          type: "Paragraph",
          selectedAnswers: [],
          textAnswer: "",
          required: false,
        },
      ],
    },
  ],
};

const OPTIONAL_IDS = new Set(["q9", "q10"]);

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackFormData>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      .filter((q) => (q.type === "SingleChoice" || q.type === "MultipleChoice") ? q.selectedAnswers.length === 0 : q.textAnswer.trim() === "")
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
      await axiosInstance.post("/feedback/submit", formData);
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
    <div className="page-wrapper">
      <div className="content">
        <AutoBreadcrumb title="MediSearch Feedback" />

        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h5 className="card-title mb-0">{formData.formTitle}</h5>
                <div className="d-none d-sm-flex align-items-center gap-2">
                  <small className="text-muted">{progress.answered}/{progress.total} required</small>
                  <div className="progress" style={{ width: 120 }}>
                    <div className="progress-bar bg-primary" style={{ width: `${progress.pct}%` }} />
                  </div>
                </div>
              </div>

              <div className="card-body">
                {isSubmitted ? (
                  <div className="text-center py-5">
                    <span className="badge bg-success fs-6 mb-3">Submitted</span>
                    <h4>Thank you for your feedback!</h4>
                    <p className="text-muted">We appreciate your time and input.</p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>Submit another</button>
                      <button className="btn btn-outline-secondary" onClick={resetForm}>Reset</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {submitError && <div className="alert alert-danger">{submitError}</div>}
                    {validationErrors.length > 0 && (
                      <div className="alert alert-danger">
                        Please fix the required questions.
                      </div>
                    )}

                    {formData.sections.map((section, sIdx) => (
                      <div key={sIdx} className="mb-4">
                        <h6 className="fw-semibold border-bottom pb-2">{section.sectionTitle}</h6>
                        {section.questions.map((q, qIdx) => {
                          const invalid = validationErrors.includes(q.questionId);
                          return (
                            <div key={q.questionId} ref={(el) => (questionRefs.current[q.questionId] = el)} className="p-3 border rounded mb-3">
                              <label className="form-label">
                                {q.questionText} {!OPTIONAL_IDS.has(q.questionId) && <span className="text-danger">*</span>}
                              </label>
                              {["SingleChoice", "MultipleChoice"].includes(q.type) &&
                                q.options?.map((opt, i) => (
                                  <div className="form-check" key={i}>
                                    <input
                                      className="form-check-input"
                                      type={q.type === "SingleChoice" ? "radio" : "checkbox"}
                                      id={`${q.questionId}-${i}`}
                                      name={q.questionId}
                                      checked={q.selectedAnswers.includes(opt)}
                                      onChange={() => handleInputChange(sIdx, qIdx, opt)}
                                    />
                                    <label className="form-check-label" htmlFor={`${q.questionId}-${i}`}>
                                      {opt}
                                    </label>
                                  </div>
                                ))}
                              {q.type === "ShortAnswer" && (
                                <input className="form-control" value={q.textAnswer} onChange={(e) => handleInputChange(sIdx, qIdx, e.target.value)} />
                              )}
                              {q.type === "Paragraph" && (
                                <textarea className="form-control" rows={3} value={q.textAnswer} onChange={(e) => handleInputChange(sIdx, qIdx, e.target.value)} />
                              )}
                              {invalid && <div className="text-danger mt-1">Required</div>}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-outline-secondary" onClick={resetForm}>Reset</button>
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
      </div>
      <CommonFooter />
    </div>
  );
};

export default FeedbackForm;
