import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import CommonFooter from "../../components/common-footer/commonFooter";
import axiosInstance from "../../api/axiosInstance";
import type { Bin, PCNModel, RxGroupModel } from "../../types";

// Helper to display a value or "NA"
const displayValue = (value: any): string =>
  value === null || value === undefined || value === "" ? "NA" : String(value);

const InsuranceBINDetails: React.FC = () => {
  const { insuranceName } = useParams<{ insuranceName: string }>();

  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [pcns, setPCNS] = useState<PCNModel[]>([]);
  const [insurance, setInsurance] = useState<Bin | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLists, setShowLists] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const id = insuranceName ? decodeURIComponent(insuranceName) : "";
        if (!id) {
          setError("Missing BIN identifier.");
          setLoading(false);
          return;
        }

        const [rxRes, binRes, pcnRes] = await Promise.all([
          axiosInstance.get(`/Insurance/GetAllRxGroupsByBINId?id=${encodeURIComponent(id)}`, { signal: controller.signal }),
          axiosInstance.get(`/Insurance/GetInsuranceBINDetails?id=${encodeURIComponent(id)}`, { signal: controller.signal }),
          axiosInstance.get(`/Insurance/GetAllPCNsByBINId?id=${encodeURIComponent(id)}`, { signal: controller.signal }),
        ]);

        setRxGroups(rxRes.data ?? []);
        setInsurance(binRes.data ?? null);
        setPCNS(pcnRes.data ?? []);
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError("Failed to fetch insurance details");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAll();
    return () => controller.abort();
  }, [insuranceName]);

  return (
    <div className="page-wrapper">
      <div className="content">
        <AutoBreadcrumb title="Insurance BIN Details" />

        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">
                  {insurance?.name || "BIN Details"}
                </h5>
                <div className="d-flex gap-2">
                  <Link to="/insurances" className="btn btn-outline-secondary btn-sm">
                    Back
                  </Link>
                </div>
              </div>

              <div className="card-body">
                {/* Loading */}
                {loading && (
                  <div className="py-5 text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-3 mb-0">Loading insurance details…</p>
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    <div>{error}</div>
                    <button
                      className="btn btn-sm btn-light ms-auto"
                      onClick={() => {
                        // quick retry by toggling loading -> effect re-runs due to same params?
                        // we can force re-run by setting loading true and repeating logic inline
                        window.location.reload(); // simplest retry path
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && !insurance && (
                  <div className="text-center py-5 text-muted">
                    No insurance details available.
                  </div>
                )}

                {/* Details */}
                {!loading && !error && insurance && (
                  <>
                    <div className="table-responsive mb-4">
                      <table className="table table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th className="w-25">BIN</th>
                            <td>{displayValue(insurance.bin)}</td>
                          </tr>
                          <tr>
                            <th>Insurance Name</th>
                            <td>{displayValue(insurance.name)}</td>
                          </tr>
                          <tr>
                            <th>Help Desk Number</th>
                            <td>{displayValue(insurance.helpDeskNumber)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="d-grid mb-3">
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowLists((s) => !s)}
                        aria-expanded={showLists}
                        aria-controls="binLists"
                      >
                        {showLists ? "Hide Lists" : "Show Lists"}
                      </button>
                    </div>

                    {showLists && (
                      <div id="binLists" className="row g-3">
                        {/* Rx Groups */}
                        <div className="col-md-6">
                          <div className="card h-100">
                            <div className="card-header">
                              <h6 className="card-title mb-0">Rx Groups</h6>
                            </div>
                            <div className="card-body">
                              {rxGroups.length === 0 ? (
                                <p className="text-muted mb-0">No Rx Groups found.</p>
                              ) : (
                                <div className="list-group">
                                  {rxGroups.map((group) => (
                                    <Link
                                      key={group.id}
                                      to={`/InsuranceDetails/${encodeURIComponent(group.id)}`}
                                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                    >
                                      <span className="fw-semibold">{displayValue(group.rxGroup)}</span>
                                      <i className="bi bi-chevron-right" />
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* PCNs */}
                        <div className="col-md-6">
                          <div className="card h-100">
                            <div className="card-header">
                              <h6 className="card-title mb-0">PCNs</h6>
                            </div>
                            <div className="card-body">
                              {pcns.length === 0 ? (
                                <p className="text-muted mb-0">No PCNs found.</p>
                              ) : (
                                <div className="list-group">
                                  {pcns.map((pcn) => (
                                    <Link
                                      key={pcn.id}
                                      to={`/InsurancePCNDetails/${encodeURIComponent(pcn.id)}`}
                                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                    >
                                      <span className="fw-semibold">{displayValue(pcn.pcn)}</span>
                                      <i className="bi bi-chevron-right" />
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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

export default InsuranceBINDetails;
