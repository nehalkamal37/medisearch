import React from "react";

/** Tiny CSS for the pro modal visuals & smooth transitions (Bootstrap-friendly) */
export const ProModalStyles = () => (
  <style>{`
    @keyframes floatShadow { 0% {transform: translateY(0);} 50% {transform: translateY(-2px);} 100% {transform: translateY(0);} }
    @keyframes cardEntry { from {opacity: 0; transform: translateY(8px);} to {opacity: 1; transform: translateY(0);} }
    .pro-modal-shadow { position: absolute; inset: -0.75rem; background: rgba(59,130,246,0.08); border-radius: 1rem; filter: blur(16px); opacity: .7; animation: floatShadow 3s ease-in-out infinite; pointer-events:none; }
    .pro-topbar { position:absolute; top:0; left:0; width:100%; height:4px; background: linear-gradient(90deg,#34d399,#60a5fa,#a78bfa); }
    .pro-card { background: rgba(255,255,255,.95); backdrop-filter: blur(10px); }
    .pro-soft { background: rgba(248,250,252,.7); border: 1px solid rgba(148,163,184,.35); }
    .pro-billboard { background: linear-gradient(90deg, rgba(59,130,246,.06), rgba(147,51,234,.06)); border: 1px solid rgba(148,163,184,.35); }
    [data-theme="dark"] .pro-card { background: rgba(31,41,55,.95); }
    .pro-modal { animation: cardEntry .25s ease-out both; }
    .pro-scroll { max-height: 60vh; overflow-y: auto; }
  `}</style>
);

type MinimalDrug = {
  drugId?: number | string;
  drugName?: string;
  ndcCode?: string | number;
  drugClass?: string;
  branchName?: string;
  rxgroup?: string | number | null;
  rxgroupId?: number | null;
  quantity?: number;
  net?: number | null;
  acquisitionCost?: number | null;
  insurancePayment?: number | null;
  patientPayment?: number | null;
};

type AltItem = {
  drugId?: number | string;
  drugName?: string;
  drugClass?: string;
  ndcCode?: string | number;
  rxgroupId?: number | null;
  quantity?: number;
  net?: number | null;
};

export type ProDetailsModalProps = {
  /** Current item shown in the modal */
  modalDrug: MinimalDrug;
  /** Alternatives for the “Recommended Alternatives” list */
  pageItems: AltItem[];
  /** Which alternative is currently selected (optional) */
  selectedDrug?: AltItem | null;
  /** “desc” (best first) or “asc” (worst first) to color rows */
  sortOrder?: "asc" | "desc";
  /** Basic cart state to render “Added” button state */
  cartItems: Array<{ id: string | number }>;
  /** Add to cart action (called with your payload) */
  addToCart: (payload: any) => void;
  /** Close modal handler */
  closeModal: () => void;
  /** Optional icon component for header (defaults to a check-circle) */
  HeaderIcon?: React.ComponentType<any>;
};

const padCode = (v: string | number | undefined) => (v ?? "").toString();
const pricePerUnit = (n?: number | null, q?: number | null) => {
  const qty = q && q > 0 ? q : 1;
  const val = (n ?? 0) / qty;
  return `$${val.toFixed(3)}`;
};

export default function ProDetailsModal({
  modalDrug,
  pageItems,
  selectedDrug,
  sortOrder = "desc",
  cartItems,
  addToCart,
  closeModal,
  HeaderIcon,
}: ProDetailsModalProps) {
  const isInCart = cartItems.some((i) => i.id === modalDrug.ndcCode);

  const HeaderGlyph =
    HeaderIcon ||
    (() => <i className="bi bi-check2-circle fs-6 text-primary" aria-hidden="true" />);

  return (
    <>
      <ProModalStyles />

      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050, position: "fixed" }}
        onClick={closeModal}
      />

      {/* Modal shell (Bootstrap) */}
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proDetailsTitle"
        tabIndex={-1}
        style={{ zIndex: 1055, position: "fixed", inset: 0, overflowY: "auto" }}
        onClick={closeModal}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-xxl position-relative pro-modal pro-card rounded-4">
            {/* floating glow & gradient line */}
            <div className="pro-modal-shadow" aria-hidden="true" />
            <div className="pro-topbar" aria-hidden="true" />

            {/* Header */}
            <div className="modal-header bg-transparent border-0 pb-0">
              <div className="d-flex align-items-start gap-2">
                <div
                  className="rounded-3 p-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <HeaderGlyph />
                </div>
                <div className="min-w-0">
                  <h5 className="modal-title text-truncate" id="proDetailsTitle">
                    {modalDrug.drugName}
                  </h5>
                  <div className="d-flex align-items-center gap-2 mt-1 small">
                    <span className="badge text-bg-primary-subtle text-primary-emphasis">
                      {modalDrug.drugClass}
                    </span>
                    <a
                      href={`https://ndclist.com/ndc/${padCode(modalDrug.ndcCode)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-primary text-decoration-none"
                    >
                      {padCode(modalDrug.ndcCode)}
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle ms-auto"
                aria-label="Close"
                onClick={closeModal}
                title="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body pt-3">
              {/* price billboard */}
              <div className="pro-billboard rounded-3 p-3 mb-3 position-relative overflow-hidden">
                <div className="row g-3 align-items-center">
                  <div className="col">
                    <div className="text-muted text-uppercase small fw-semibold">
                      Net Price
                    </div>
                    <div className="fs-4 fw-bold">
                      {pricePerUnit(modalDrug?.net ?? 0, modalDrug?.quantity ?? 1)}
                    </div>
                  </div>
                  <div className="col text-end">
                    <div className="text-muted text-uppercase small fw-semibold">
                      Acquisition Cost
                    </div>
                    <div className="fs-5 fw-semibold text-primary">
                      {pricePerUnit(
                        modalDrug?.acquisitionCost ?? 0,
                        modalDrug?.quantity ?? 1
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* scrollable content */}
              <div className="pro-scroll pe-1">
                {/* Details grid */}
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="pro-soft rounded-3 p-3 h-100">
                      <div className="text-muted small">Branch</div>
                      <div className="fw-medium">
                        {modalDrug?.branchName ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="pro-soft rounded-3 p-3 h-100">
                      <div className="text-muted small">Drug Class</div>
                      <div className="fw-medium">
                        {modalDrug?.drugClass ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="pro-soft rounded-3 p-3 h-100">
                      <div className="text-muted small">Inventory</div>
                      <div className="fw-medium">In Stock</div>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 text-secondary d-flex align-items-center gap-2">
                      <i className="bi bi-journal-check" />
                      Recommended Alternatives
                    </h6>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {pageItems.map((alt, index) => {
                      // background hinting by rank & selection
                      let rowClass = "";
                      const isSelected = alt.ndcCode === selectedDrug?.ndcCode;
                      if (isSelected) rowClass = "bg-primary-subtle";
                      else if (sortOrder === "desc") {
                        if (index === 0) rowClass = "bg-success-subtle";
                        else if (index === 1) rowClass = "bg-warning-subtle";
                      } else {
                        if (index === 0) rowClass = "bg-danger-subtle";
                        else if (index === 1) rowClass = "bg-orange-subtle";
                      }

                      return (
                        <a
                          key={`${alt.ndcCode}-${index}`}
                          className={`text-reset text-decoration-none border rounded-3 p-3 ${rowClass}`}
                          href={`/drug/${alt.drugId}?ndc=${alt.ndcCode}&insuranceId=${alt.rxgroupId ?? ""}`}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            <div className="d-flex align-items-start gap-2">
                              <span
                                className="d-inline-block rounded-circle"
                                style={{
                                  width: 10,
                                  height: 10,
                                  marginTop: 4,
                                  background:
                                    index === 0
                                      ? "var(--bs-success)"
                                      : index === 1
                                      ? "var(--bs-primary)"
                                      : "var(--bs-purple)",
                                }}
                              />
                              <div>
                                <div className="fw-semibold">
                                  {alt.drugName}
                                </div>
                                <div className="small text-muted">
                                  {alt.drugClass}
                                </div>
                              </div>
                            </div>

                            <div className="text-end">
                              <div className="fw-semibold">
                                {padCode(alt.ndcCode)}
                              </div>
                            </div>

                            <div className="text-end">
                              <div className="fw-semibold text-success">
                                {pricePerUnit(alt.net ?? 0, alt.quantity ?? 1)}
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-body-tertiary border-0 d-flex justify-content-between">
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <i className="bi bi-info-circle" />
                <span>Prices updated according to the last scripts</span>
              </div>

              <div className="d-flex gap-2">
                <button
                  onClick={closeModal}
                  className="btn btn-outline-secondary"
                >
                  Close
                </button>

                {isInCart ? (
                  <button className="btn btn-success" disabled>
                    <i className="bi bi-check2 me-1" />
                    Added
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Keep your add-to-cart + localStorage logic intact
                      addToCart({
                        id:
                          modalDrug.ndcCode ||
                          `${modalDrug.drugId}-uniqueId`,
                        name: modalDrug.drugName || "Unnamed Drug",
                        ndc: padCode(modalDrug.ndcCode),
                        acq:
                          (modalDrug.acquisitionCost ?? 0) /
                          (modalDrug.quantity || 1),
                        insurancePayment:
                          (modalDrug.insurancePayment ?? 0) /
                          (modalDrug.quantity || 1),
                        patientPayment:
                          (modalDrug.patientPayment ?? 0) /
                          (modalDrug.quantity || 1),
                        price:
                          (modalDrug.net ?? 0) / (modalDrug.quantity || 1),
                        quantity: 1,
                        insurance: modalDrug.rxgroup || "Unknown",
                      });

                      // (Optional) keep your orderRequestBody stitching
                      const storedSearchLog =
                        localStorage.getItem("searchLogDetails");
                      if (storedSearchLog) {
                        const searchLog = JSON.parse(storedSearchLog);
                        const newOrderItem = {
                          drugNDC: modalDrug.ndcCode,
                          netPrice: modalDrug?.net ?? 0,
                          patientPay: modalDrug?.patientPayment ?? 0,
                          insurancePay: modalDrug?.insurancePayment ?? 0,
                          acquisitionCost: modalDrug.acquisitionCost ?? 0,
                          additionalCost: 0,
                          insuranceRxId: modalDrug?.rxgroupId ?? 0,
                          amount: 1,
                        };

                        const currentOrder = JSON.parse(
                          localStorage.getItem("orderRequestBody") ||
                            '{"orderItems":[],"searchLogs":[]}'
                        );
                        currentOrder.orderItems.push(newOrderItem);
                        currentOrder.searchLogs.push(searchLog);
                        localStorage.setItem(
                          "orderRequestBody",
                          JSON.stringify(currentOrder)
                        );
                      }
                    }}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-plus-lg me-1" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
