import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import CommonFooter from "../../components/common-footer/commonFooter";
import axiosInstance from "../../api/axiosInstance";
import type { Insurance } from "../../types";

// Utils
const displayValue = (v: any) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "")
    ? "NA"
    : String(v);

const InsuranceDetails: React.FC = () => {
  const { insuranceName } = useParams<{ insuranceName: string }>();
  const location = useLocation() as { state?: { insurance?: Insurance } };

  // Prefer preloaded object from DrugDetails (if provided via navigate state)
  const preloaded = location.state?.insurance;

  const [insurance, setInsurance] = useState<Insurance | null>(preloaded ?? null);
  const [loading, setLoading] = useState<boolean>(!preloaded); // skip loading if we already have data
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If we already have data from router state, no need to fetch
    if (preloaded) return;

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const id = insuranceName ? decodeURIComponent(insuranceName) : "";
        if (!id) {
          setError("Missing insurance identifier in URL.");
          setLoading(false);
          return;
        }

        // Adjust the query param if your API expects another key (e.g., rxGroup or name)
        const endpointUrl = `/Insurance/GetInsuranceDetails?id=${encodeURIComponent(id)}`;

        const { data } = await axiosInstance.get(endpointUrl, {
          signal: controller.signal,
        });

        setInsurance(data ?? null);
      } catch (err: any) {
        if (controller.signal.aborted) return;
        setError("Failed to fetch insurance details");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [insuranceName, preloaded]);

  // Optional: simple debug block toggleable via hash (#debug) for quick checks
  const debug = typeof window !== "undefined" && window.location.hash.includes("debug");

  return (
    <div className="page-wrapper">
      <div className="content">
        <AutoBreadcrumb title="Insurance Details" />

        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">
                  {insurance?.insuranceFullName || "Insurance"}
                </h5>
                {/* <div className="d-flex align-items-center gap-2">
                  <Link to="/insurances" className="btn btn-outline-secondary btn-sm">
                    Back
                  </Link>
                </div> */}
              </div>

              <div className="card-body">
                {loading && (
                  <div className="py-5 text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-3 mb-0">Loading insurance details…</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    <div>{error}</div>
                  </div>
                )}

                {!loading && !error && !insurance && (
                  <div className="text-center py-5 text-muted">
                    No insurance details available.
                  </div>
                )}

                {!loading && !error && insurance && (
                  <>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-2">RxGroup</h6>
                            <span className="fw-semibold">{displayValue(insurance.rxGroup)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-2">BIN</h6>
                            <span className="fw-semibold">{displayValue(insurance.insuranceBin)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-2">Insurance Name</h6>
                            <span className="fw-semibold">
                              {displayValue(insurance.insuranceFullName)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-2">PCN</h6>
                            <span className="fw-semibold">{displayValue(insurance.insurancePCN)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-2">Help Desk Number</h6>
                            <span className="fw-semibold">
                              {displayValue(insurance.helpDeskNumber)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optional table view */}
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th className="w-25">RxGroup</th>
                            <td>{displayValue(insurance.rxGroup)}</td>
                          </tr>
                          <tr>
                            <th>BIN</th>
                            <td>{displayValue(insurance.insuranceBin)}</td>
                          </tr>
                          <tr>
                            <th>Insurance Name</th>
                            <td>{displayValue(insurance.insuranceFullName)}</td>
                          </tr>
                          <tr>
                            <th>PCN</th>
                            <td>{displayValue(insurance.insurancePCN)}</td>
                          </tr>
                          <tr>
                            <th>Help Desk Number</th>
                            <td>{displayValue(insurance.helpDeskNumber)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {debug && (
                      <pre className="mt-3 bg-light p-3 rounded small">
                        {JSON.stringify(insurance, null, 2)}
                      </pre>
                    )}
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

export default InsuranceDetails;