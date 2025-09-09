// src/pages/DrugDetailsPage.tsx
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import type { Drug, DrugMedi, Prescription } from "../types";
import { createPortal } from "react-dom";
import { useCart } from "../components/CartContext"; // <-- ensure correct path

type Props = {
  drugId: number | null;
  insuranceId?: number | null;
  ndcCode?: string | null;
  classInfoId: number | null;
  classInfoName?: string | null;
};

export default function DrugDetailsPage({
  drugId,
  insuranceId,
  ndcCode,
  classInfoId,
  classInfoName,
}: Props) {
  const [mainDrug, setMainDrug] = useState<Drug | null>(null);
  const [drugDetails, setDrugDetails] = useState<Prescription | null>(null);
  const [drugDetailsMedi, setDrugDetailsMedi] = useState<DrugMedi | null>(null);

  // Add-to-cart modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addQty, setAddQty] = useState(1);

  // Cart context
  const { addToCart } = useCart();

  // UI state for collapsible sections
  const [open, setOpen] = useState({
    pricing: true,
    identification: true,
    medical: true,
    insurance: true,
    cost: true,
  });

  const expandAll = () =>
    setOpen({
      pricing: true,
      identification: true,
      medical: true,
      insurance: true,
      cost: true,
    });

  const collapseAll = () =>
    setOpen({
      pricing: false,
      identification: false,
      medical: false,
      insurance: false,
      cost: false,
    });

  // Helpers
  const money = (v?: number | null) =>
    v == null
      ? "—"
      : v.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const isYes = (val?: string | boolean | null) => {
    if (typeof val === "boolean") return val;
    if (!val) return false;
    const s = String(val).trim().toLowerCase();
    return ["y", "yes", "true", "1", "required", "available"].includes(s);
  };

  async function fetchDrugDetails() {
    try {
      // Main drug by id
      const response = await axiosInstance.get(`/drug/GetDrugById?id=${drugId}`);
      setMainDrug(response.data as Drug);

      // Claim/prescription details (depends on insurance + ndc)
      if (insuranceId && ndcCode) {
        const resp2 = await axiosInstance.get(
          `/drug/GetDetails?ndc=${encodeURIComponent(ndcCode)}&insuranceId=${insuranceId}`
        );
        setDrugDetails(resp2.data as Prescription);
      } else {
        setDrugDetails(null);
      }

      // Medi policy details for class
      const mediResponse = await axiosInstance.get(
        `/drug/GetAllMediDrugs?classId=${classInfoId}`
      );
      const arr: DrugMedi[] = mediResponse.data ?? [];
      const match = ndcCode ? arr.find((item) => item.drugNDC === ndcCode) ?? null : null;
      setDrugDetailsMedi(match);
    } catch (error) {
      console.error("Error fetching drug details:", error);
    }
  }

  // Fetch on first render and whenever the inputs change
  useEffect(() => {
    fetchDrugDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugId, insuranceId, ndcCode, classInfoId]);

  // Derived, null-safe accessors
  const b = drugDetails; // prescription/claim details
  const d = drugDetailsMedi; // Medi coverage details
  const awp = mainDrug?.awp ?? 0;
  const acquisitionCost = b?.acquisitionCost ?? mainDrug?.acq ?? 0;

  // Current net = (ins + patient) - acquisition
  const currentNet =
    (b?.insurancePayment ?? 0) + (b?.patientPayment ?? 0) - (acquisitionCost ?? 0);

  // If backend provides b.net, prefer it as "best" (else, fall back to current)
  const bestNet = b?.net ?? currentNet;
  const potentialSavings = bestNet - currentNet;

  const displayDrugName = b?.drugName ?? mainDrug?.name ?? "—";
  const displayNdc = b?.ndcCode ?? ndcCode ?? mainDrug?.ndc ?? "";
  const displayStrength =
    (b?.strength ?? mainDrug?.strength ?? "—") +
    (b?.strengthUnit ? ` ${b.strengthUnit}` : mainDrug?.strengthUnit ? ` ${mainDrug.strengthUnit}` : "");
  const displayClass = b?.drugClass ?? mainDrug?.drugClass ?? classInfoName ?? "";
  const displayTE = b?.teCode ?? mainDrug?.teCode ?? "";
  const isGeneric =
    (b?.type ?? mainDrug?.type ?? "").toLowerCase() === "generic";

  // Computed “per item” numbers used for cart item payload
  const perItem = useMemo(() => {
    const qty = b?.quantity && b.quantity > 0 ? b.quantity : 1;
    // keep safe divisions
    const acqEach = (acquisitionCost ?? 0) / qty;
    const insEach = (b?.insurancePayment ?? 0) / qty;
    const patEach = (b?.patientPayment ?? 0) / qty;
    const netEach = (b?.net ?? (insEach + patEach - acqEach)) || 0;
    return {
      qtyBase: qty,
      acqEach,
      insEach,
      patEach,
      netEach,
    };
  }, [b?.quantity, b?.insurancePayment, b?.patientPayment, b?.net, acquisitionCost]);

  // Build cart item & persist order payload — same pattern you’ve used elsewhere
  const handleConfirmAddToCart = () => {
    if (!displayNdc) return;
    setAdding(true);

    try {
      // 1) Add to CartContext
      addToCart({
        id: displayNdc || String(drugId ?? Math.random()),
        name: displayDrugName || "Unnamed Drug",
        ndc: displayNdc,
        acq: perItem.acqEach,
        insurancePayment: perItem.insEach,
        patientPayment: perItem.patEach,
        price: perItem.netEach,
        quantity: addQty,
        insurance: b?.rxgroup || b?.insuranceName || "Unknown",
      });

      // 2) Append to localStorage orderRequestBody
      //    (mirrors your existing logic used across app)
      const newOrderItem = {
        drugNDC: displayNdc,
        netPrice: b?.net ?? perItem.netEach * perItem.qtyBase,
        patientPay: b?.patientPayment ?? perItem.patEach * perItem.qtyBase,
        insurancePay: b?.insurancePayment ?? perItem.insEach * perItem.qtyBase,
        acquisitionCost: acquisitionCost ?? 0,
        additionalCost: 0,
        insuranceRxId: b?.rxgroupId ?? insuranceId ?? 0,
        amount: addQty, // use chosen qty
      };

      // Optionally capture a simple "search log" (if your flow writes it earlier)
      const storedSearchLog = localStorage.getItem("searchLogDetails");
      const searchLog = storedSearchLog ? JSON.parse(storedSearchLog) : null;

      const currentOrder = JSON.parse(
        localStorage.getItem("orderRequestBody") || '{"orderItems":[],"searchLogs":[]}'
      );
      currentOrder.orderItems.push(newOrderItem);
      if (searchLog) currentOrder.searchLogs.push(searchLog);
      localStorage.setItem("orderRequestBody", JSON.stringify(currentOrder));
    } finally {
      setAdding(false);
      setShowAddModal(false);
      setAddQty(1);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 className="h4 mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-capsule" />
                {displayDrugName}
                {displayNdc && (
                  <span className="fs-6 text-muted ms-2">(NDC: {displayNdc})</span>
                )}
              </h2>
              <div className="text-muted">
                {displayStrength} • {displayClass}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {isGeneric && (
                <span
                  className="badge rounded-pill"
                  style={{
                    background: "#eaf2ff",
                    color: "#1f4fd1",
                    border: "1px solid #d7e5ff",
                  }}
                >
                  Generic
                </span>
              )}
              {!!displayTE && (
                <span
                  className="badge rounded-pill"
                  style={{
                    background: "#eaf2ff",
                    color: "#1f4fd1",
                    border: "1px solid #d7e5ff",
                  }}
                >
                  TE: {displayTE}
                </span>
              )}
              {currentNet >= 0 && (
                <span
                  className="badge rounded-pill"
                  style={{
                    background: "#eaf8f2",
                    color: "#137b4f",
                    border: "1px solid #cfeee2",
                  }}
                >
                  Cost Effective
                </span>
              )}

              {/* Add-to-cart trigger */}
              <button
                className="btn btn-primary btn-sm ms-2"
                onClick={() => setShowAddModal(true)}
                disabled={!displayNdc}
                title={!displayNdc ? "Missing NDC to add to cart" : "Add to Cart"}
              >
                <i className="bi bi-cart-plus me-1" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex justify-content-end mb-3 gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={collapseAll}>
          <i className="bi bi-chevron-up me-1" /> Collapse all
        </button>
        <button className="btn btn-primary btn-sm" onClick={expandAll}>
          <i className="bi bi-chevron-down me-1" /> Expand all
        </button>
      </div>

      <div className="row g-3">
        {/* Pricing Breakdown */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <button
                className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-2 text-decoration-none"
                onClick={() => setOpen((o) => ({ ...o, pricing: !o.pricing }))}
              >
                <i
                  className={`bi ${open.pricing ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}
                />
                <span className="fw-semibold">$ Pricing Breakdown</span>
              </button>

              {open.pricing && (
                <>
                  <div className="row text-center gy-3">
                    <div className="col-6 col-md-3">
                      <div className="text-muted">ACQ PRICE</div>
                      <div className="fs-5 fw-semibold">{money(acquisitionCost)}</div>
                    </div>
                    {/* <div className="col-6 col-md-3">
                      <div className="text-muted">AWP</div>
                      <div className="fs-5 fw-semibold">{money(awp)}</div>
                    </div> */}
                    <div className="col-6 col-md-3">
                      <div className="text-muted">INSURANCE PAYMENT</div>
                      <div className="fs-5 fw-semibold">{money(b?.insurancePayment)}</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-muted">PATIENT PAYMENT</div>
                      <div className="fs-5 fw-semibold">{money(b?.patientPayment)}</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-muted">CURRENT NET</div>
                      <div className="fs-5 fw-semibold">{money(currentNet)}</div>
                    </div>
                  </div>

                  {/* <hr className="my-4" style={{ opacity: 0.2 }} />

                  <div className="row text-center gy-3">
                    <div className="col-4">
                      <div className="text-muted">CURRENT NET</div>
                      <div className="fs-5 fw-semibold">
                        {money(currentNet)}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-muted">BEST AVAILABLE NET</div>
                      <div className="fs-5 fw-semibold">{money(bestNet)}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-muted">POTENTIAL SAVINGS</div>
                      <div className="fs-5 fw-semibold">
                        {money(potentialSavings)}
                      </div>
                    </div>
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Drug Identification */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <button
                className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-2 text-decoration-none"
                onClick={() =>
                  setOpen((o) => ({ ...o, identification: !o.identification }))
                }
              >
                <i
                  className={`bi ${
                    open.identification ? "bi-caret-down-fill" : "bi-caret-right-fill"
                  }`}
                />
                <span className="fw-semibold"># Drug Identification</span>
              </button>

              {open.identification && (
                <div className="small">
                  <div className="mb-2">
                    <div className="text-muted">RXCUI</div>
                    <div
                      className="form-control form-control-sm bg-light"
                      style={{ pointerEvents: "none" }}
                    >
                      {mainDrug?.rxcui ?? "—"}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-muted">QUANTITY</div>
                    <div className="fw-semibold">
                      {b?.quantity ?? "—"}
                      {b?.quantity ? " units" : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted">DRUG CLASS</div>
                    <span className="badge text-bg-light">
                      {b?.drugClass ?? mainDrug?.drugClass ?? displayClass ?? "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Authorization & Coverage */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <button
                className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-2 text-decoration-none"
                onClick={() => setOpen((o) => ({ ...o, medical: !o.medical }))}
              >
                <i
                  className={`bi ${
                    open.medical ? "bi-caret-down-fill" : "bi-caret-right-fill"
                  }`}
                />
                <span className="fw-semibold">
                  <i className="bi bi-shield-check me-1" /> Medical Authorization & Coverage
                </span>
              </button>

              {open.medical && (
                <>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <span
                        className={
                          isYes(d?.priorAuthorization ?? b?.priorAuthorizationStatus)
                            ? "text-success"
                            : "text-muted"
                        }
                      >
                        <i
                          className={`bi me-2 ${
                            isYes(d?.priorAuthorization ?? b?.priorAuthorizationStatus)
                              ? "bi-check-circle-fill"
                              : "bi-dash-circle"
                          }`}
                        />
                        Prior Authorization{" "}
                        {isYes(d?.priorAuthorization ?? b?.priorAuthorizationStatus)
                          ? "Required"
                          : "Not Required"}
                      </span>
                    </div>

                    <div className="col-md-6">
                      <span className={isYes(d?.extendedDuration) ? "text-success" : "text-muted"}>
                        <i
                          className={`bi me-2 ${
                            isYes(d?.extendedDuration)
                              ? "bi-check-circle-fill"
                              : "bi-dash-circle"
                          }`}
                        />
                        Extended Duration {isYes(d?.extendedDuration) ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="col-md-6">
                      <span
                        className={isYes(d?.nonCapitatedDrugIndicator) ? "text-success" : "text-muted"}
                      >
                        <i
                          className={`bi me-2 ${
                            isYes(d?.nonCapitatedDrugIndicator)
                              ? "bi-check-circle-fill"
                              : "bi-dash-circle"
                          }`}
                        />
                        Non-Capitated Drug
                      </span>
                    </div>

                    <div className="col-md-6">
                      <span className={isYes(d?.ccsPanelAuthority) ? "text-warning" : "text-muted"}>
                        <i
                          className={`bi me-2 ${
                            isYes(d?.ccsPanelAuthority)
                              ? "bi-exclamation-triangle-fill"
                              : "bi-dash-circle"
                          }`}
                        />
                        CCS Panel Authority: {isYes(d?.ccsPanelAuthority) ? "Required" : "Not Required"}
                      </span>
                    </div>
                  </div>

                  <hr className="my-3" style={{ opacity: 0.2 }} />

                  <div className="d-flex justify-content-end">
                    <span className="badge rounded-pill text-bg-light">
                      {d?.costCeilingTier ? `Tier ${d.costCeilingTier}` : "Tier —"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Insurance Details */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <button
                className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-2 text-decoration-none"
                onClick={() => setOpen((o) => ({ ...o, insurance: !o.insurance }))}
              >
                <i
                  className={`bi ${
                    open.insurance ? "bi-caret-down-fill" : "bi-caret-right-fill"
                  }`}
                />
                <span className="fw-semibold">
                  <i className="bi bi-card-list me-1" /> Insurance Details
                </span>
              </button>

              {open.insurance && (
                <div className="small">
                  <div className="mb-2">
                    <div className="text-muted">INSURANCE PROVIDER</div>
                    <div className="fw-semibold">
                      {b?.insuranceName || (b?.insurance as any)?.name || "—"}
                    </div>
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">BIN</span>
                    <span className="fw-semibold">
                      {[b?.bin, b?.binFullName].filter(Boolean).join(" — ") || "—"}
                    </span>
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">PCN</span>
                    <span className="fw-semibold">{b?.pcn || "—"}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">RX GROUP</span>
                    <span className="fw-semibold">{b?.rxgroup || "—"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Analysis (kept commented as requested) */}
        {/* <div className="col-lg-4 ms-auto">
          <div className="card">
            <div className="card-body">
              <button
                className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-2 text-decoration-none"
                onClick={() => setOpen((o) => ({ ...o, cost: !o.cost }))}
              >
                <i
                  className={`bi ${
                    open.cost ? "bi-caret-down-fill" : "bi-caret-right-fill"
                  }`}
                />
                <span className="fw-semibold">
                  <i className="bi bi-graph-up-arrow me-1" /> Cost Analysis
                </span>
              </button>

              {open.cost && (
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">CURRENT NET</span>
                    <span className="fw-semibold">{money(currentNet)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">BEST AVAILABLE</span>
                    <span className="fw-semibold">{money(bestNet)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>

      {/* Add-to-Cart Modal (Bootstrap) */}
      {showAddModal &&
        createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 1050, position: "fixed" }}
              onClick={() => setShowAddModal(false)}
            />
            <div
              className="modal fade show d-block"
              role="dialog"
              aria-modal="true"
              aria-labelledby="addToCartTitle"
              tabIndex={-1}
              style={{ zIndex: 1055, position: "fixed", inset: 0, overflowY: "auto" }}
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content border-0 shadow-lg rounded-4">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addToCartTitle">
                      <i className="bi bi-cart-plus me-2" />
                      Add Item to Cart
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setShowAddModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="mb-2">
                      <div className="fw-semibold">{displayDrugName}</div>
                      <div className="small text-muted">
                        {displayStrength} • NDC: {displayNdc || "—"}
                      </div>
                    </div>

                    <div className="row g-3 mt-2">
                      <div className="col-6">
                        <div className="text-muted small">Net / Item</div>
                        <div className="fw-semibold">{money(perItem.netEach)}</div>
                      </div>
                      <div className="col-6 text-end">
                        <div className="text-muted small">ACQ / Item</div>
                        <div className="fw-semibold">{money(perItem.acqEach)}</div>
                      </div>
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-6">
                        <div className="text-muted small">Insurance / Item</div>
                        <div className="fw-semibold">{money(perItem.insEach)}</div>
                      </div>
                      <div className="col-6 text-end">
                        <div className="text-muted small">Patient / Item</div>
                        <div className="fw-semibold">{money(perItem.patEach)}</div>
                      </div>
                    </div>

                    <hr />

                    <div className="d-flex align-items-center justify-content-between">
                      <label htmlFor="qtyInput" className="form-label mb-0">
                        Quantity
                      </label>
                      <div className="input-group" style={{ width: 140 }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                          disabled={adding || addQty <= 1}
                          title="Decrease"
                        >
                          <i className="bi bi-dash-lg" />
                        </button>
                        <input
                          id="qtyInput"
                          type="number"
                          min={1}
                          className="form-control text-center"
                          value={addQty}
                          onChange={(e) => {
                            const v = Math.max(1, parseInt(e.target.value || "1", 10));
                            setAddQty(v);
                          }}
                          disabled={adding}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setAddQty((q) => q + 1)}
                          disabled={adding}
                          title="Increase"
                        >
                          <i className="bi bi-plus-lg" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAddModal(false)}
                      disabled={adding}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmAddToCart}
                      disabled={adding || !displayNdc}
                      title={!displayNdc ? "Missing NDC to add to cart" : undefined}
                    >
                      {adding ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Adding…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-1" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
