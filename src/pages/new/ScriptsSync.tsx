import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, ExternalLink, Server } from "lucide-react";
import axiosInstancePython from "../../api/axiosInstancePython";

/** Ensure Bootstrap CSS is loaded globally:
 *   import 'bootstrap/dist/css/bootstrap.min.css'
 */

interface SyncResult {
  message: string;
  itemsPosted: number;
  actualSavedResponse: string;
  targetEndpoint: string;
}

const SyncData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  // ── Config ───────────────────────────────────────────────────────────────────
  const listName = "test scripts July v";
  const sharepointLink =
    "https://calidermatologyinstitute.sharepoint.com/sites/CDIOperations/Lists/test%20scripts%20July%20v/AllItems.aspx?as=json";
  const drugEndpoint = "https://store.medisearchtool.com/drug/AddScripts";
  const steps = [
    "Add New Scripts at this List",
    "Transforming records",
    "Sending to drug API",
  ];
  const MIN_SPINNER_MS = 60_000;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getCurrentStep = (pct: number) => {
    if (pct < 30) return steps[0];
    if (pct < 60) return steps[1];
    if (pct < 90) return steps[2];
    return "Finalizing...";
  };

  const startFakeProgress = () => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 5;
        return next >= 90 ? 90 : next;
      });
    }, 500);
  };

  const stopFakeProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus("idle");
    startTime.current = Date.now();
    startFakeProgress();

    try {
      const payload = {
        list_name: listName,
        drug_endpoint: drugEndpoint,
      };

      const response = await axiosInstancePython.post<SyncResult>(
        "/list/sync",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        }
      );

      // Guarantee min spinner time
      const elapsed = Date.now() - startTime.current;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((res) => setTimeout(res, MIN_SPINNER_MS - elapsed));
      }

      stopFakeProgress();
      setProgress(100);
      setResult(response.data);
      setStatus("success");
    } catch (err: any) {
      const elapsed = Date.now() - startTime.current;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((res) => setTimeout(res, MIN_SPINNER_MS - elapsed));
      }

      stopFakeProgress();
      setProgress(100);
      setError(err?.response?.data?.detail || err?.message || "Unexpected error.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && status === "idle") {
      setProgress(0);
    }
  }, [loading, status]);

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4 p-md-5">

                {/* Header */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Server size={24} className="text-primary" />
                  <h1 className="h3 mb-0 fw-bold">Sync Data</h1>
                </div>
                <p className="text-muted mb-4">
                  Send drug data to your SharePoint list and forward to the Drug API.
                </p>

                {/* Info callout */}
                <div className="alert alert-primary d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4">
                  <div>
                    <div className="fw-semibold">Target SharePoint list:</div>
                    <div className="small">
                      <span className="text-dark fw-medium">{listName}</span>
                    </div>
                  </div>
                  <div className="mt-2 mt-sm-0">
                    <a
                      href={sharepointLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                    >
                      View SharePoint List <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                {/* Action + Progress */}
                <div className="mb-4">
                  <button
                    onClick={handleSync}
                    disabled={loading}
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    aria-live="polite"
                    aria-busy={loading}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    )}
                    {loading ? "Syncing…" : "Start Sync"}
                  </button>

                  {(loading || status !== "idle") && (
                    <>
                      <div className="progress mt-3" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                        <div
                          className={`progress-bar progress-bar-striped ${loading ? "progress-bar-animated" : ""}`}
                          style={{ width: `${progress}%` }}
                        >
                          {Math.round(progress)}%
                        </div>
                      </div>
                      <div className="text-center mt-2 small text-muted" aria-live="polite">
                        {getCurrentStep(progress)}
                      </div>
                    </>
                  )}
                </div>

                {/* Success */}
                {status === "success" && result && (
                  <div className="alert alert-success d-flex align-items-start gap-3">
                    <CheckCircle className="flex-shrink-0" size={28} />
                    <div>
                      <div className="fw-semibold mb-1">Success</div>
                      <div className="mb-2">{result.message}</div>

                      <div className="list-group list-group-flush">
                        <div className="list-group-item px-0 d-flex justify-content-between">
                          <span className="text-muted">Total saved scripts</span>
                          <span className="badge bg-success-subtle text-success-emphasis">
                            {result.actualSavedResponse}
                          </span>
                        </div>
                        <div className="list-group-item px-0 d-flex justify-content-between">
                          <span className="text-muted">API endpoint</span>
                          <a href={result.targetEndpoint} className="text-decoration-none" target="_blank" rel="noreferrer">
                            {result.targetEndpoint}
                          </a>
                        </div>
                      </div>

                      {/* Collapsible raw details (optional) */}
                      <div className="mt-3">
                        <button
                          className="btn btn-outline-success btn-sm"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#syncRawDetails"
                          aria-expanded="false"
                          aria-controls="syncRawDetails"
                        >
                          Show raw response
                        </button>
                        <div className="collapse mt-2" id="syncRawDetails">
                          <pre className="bg-success-subtle p-3 rounded small mb-0">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {status === "error" && error && (
                  <div className="alert alert-danger d-flex align-items-start gap-3">
                    <XCircle className="flex-shrink-0" size={28} />
                    <div>
                      <div className="fw-semibold mb-1">Error</div>
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                {/* Footnote */}
                <p className="text-center text-muted small mb-0 mt-4">
                  <span className="fw-semibold">Note:</span> This process may take up to 1 minute.
                </p>
              </div>
            </div>

            {/* Optional tiny styles for nicer look on success list badges (Bootstrap 5.3+ supports *-subtle) */}
            <style>{`
              .bg-success-subtle { background-color: rgba(25,135,84,.1) !important; }
              .text-success-emphasis { color: #146c43 !important; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncData;
