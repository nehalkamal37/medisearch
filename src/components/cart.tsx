// src/pages/CartPage.tsx
import React, { useMemo, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";
import type { CartItem } from "../types";

/** Tiny CSS to match the “pro” look + smooth entry + better summary spacing */
const ProCartPageStyles = () => (
  <style>{`
    @keyframes cardEntry { from {opacity: 0; transform: translateY(8px)} to {opacity: 1; transform: translateY(0)} }
    .pro-card { background: rgba(255,255,255,.95); backdrop-filter: blur(10px); border: 1px solid rgba(148,163,184,.35); }
    [data-theme="dark"] .pro-card { background: rgba(31,41,55,.95); border-color: rgba(51,65,85,.5); }
    .pro-topbar { position:absolute; top:0; left:0; right:0; height:4px; background: linear-gradient(90deg,#34d399,#60a5fa,#a78bfa); }
    .pro-anim { animation: cardEntry .25s ease-out both; }

    /* Order summary: increase line-height + spacing */
    .order-summary .order-line {
      line-height: 1.8;
      padding: .25rem 0;
    }
    .order-summary .order-line .label {
      color: var(--bs-body-color); /* black/dark */
      font-weight: 500;
    }
    .order-summary .order-line .value {
      color: var(--bs-secondary-color); /* gray */
      font-weight: 500;
    }
    .order-summary .order-line.total-net .label {
      font-weight: 600;
    }
    .order-summary .order-line.total-net .value {
      color: var(--bs-secondary-color);
      font-weight: 700;
    }
  `}</style>
);

type Props = {
  cartItems: CartItem[];
  onClearCart: () => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
};

const fmt = (n: number) => n.toFixed(2);

export default function CartPage({
  cartItems,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
}: Props) {
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string>("");

  // ---- Totals (Medi-Cal logic per quantity) ----
  const {
    subtotal,
    totalPatientPayment,
    totalInsurancePayment,
    totalRevenue,
    totalAcquisitionCost,
    totalNet,
    totalMediCalFees,
  } = useMemo(() => {
    let patient = 0, insurance = 0, acq = 0, sub = 0, mediCalFees = 0;

    for (const item of cartItems) {
      const qty = item.quantity || 1;
      const netEach = item.price ?? 0;
      const acqEach = item.acq ?? 0;
      const patientEach = item.patientPayment ?? 0;
      const insuranceEach = item.insurancePayment ?? 0;

      const isMediCal =
        item.insurance && item.insurance.toLowerCase().includes("medi-cal");
      const mediCalFee = isMediCal ? 10 * qty : 0;

      mediCalFees += mediCalFee;
      sub += netEach * qty + mediCalFee;
      patient += patientEach * qty;
      insurance += insuranceEach * qty;
      acq += acqEach * qty;
    }

    const revenue = patient + insurance;
    const net = revenue - acq;

    return {
      subtotal: sub,
      totalPatientPayment: patient,
      totalInsurancePayment: insurance,
      totalRevenue: revenue,
      totalAcquisitionCost: acq,
      totalNet: net,
      totalMediCalFees: mediCalFees,
    };
  }, [cartItems]);

  const total = subtotal;

  // ---- Print as PDF-like (styled HTML; user can "Save as PDF") ----
  const receiptRef = useRef<HTMLDivElement>(null);

  const buildReceiptHTML = (): string => {
    const rows = cartItems.map((item) => {
      const qty = item.quantity || 1;
      const each = item.price ?? 0;
      const acq = item.acq ?? 0;
      const insurance = item.insurancePayment ?? 0;
      const patient = item.patientPayment ?? 0;
      const isMediCal = item.insurance?.toLowerCase().includes("medi-cal");
      const mediCalFee = isMediCal ? 10 * qty : 0;
      const lineTotal = each * qty + mediCalFee;

      return `
        <tr>
          <td>
            <div class="fw-semibold">${item.name}</div>
            <div class="text-muted small">
              ${item.insurance ? `Insurance: ${item.insurance} · ` : ""}ACQ: $${fmt(acq)}
            </div>
          </td>
          <td class="text-end">${qty}</td>
          <td class="text-end">$${fmt(each)}</td>
          <td class="text-end">${isMediCal ? `<span class="text-primary small">+$${fmt(mediCalFee)}</span>` : "-"}</td>
          <td class="text-end">$${fmt(lineTotal)}</td>
        </tr>
      `;
    }).join("");

    return `
      <html>
        <head>
          <title>Receipt</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @page { size: A4; margin: 18mm; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #111827; }
            .brand { font-weight: 700; letter-spacing: .02em; }
            .topbar { height: 4px; background: linear-gradient(90deg,#34d399,#60a5fa,#a78bfa); margin: 12px 0 20px; border-radius: 999px; }
            .muted { color: #6b7280; }
            .table th, .table td { vertical-align: middle; }
            .summary .row-line { line-height: 1.8; padding: .25rem 0; }
            .summary .label { color: #111827; font-weight: 600; }
            .summary .value { color: #6b7280; font-weight: 600; }
            .badge-soft { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: .5rem; padding: .25rem .5rem; font-weight: 600; }
            .footer-note { font-size: .8rem; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="brand">MediSearch — Receipt</div>
              <div class="muted small">${new Date().toLocaleString()}</div>
            </div>
            <div class="text-end">
              <div class="badge-soft">Order Total: $${fmt(total)}</div>
            </div>
          </div>

          <div class="topbar"></div>

          <table class="table table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-end">Qty</th>
                <th class="text-end">Each</th>
                <th class="text-end">Medi-Cal</th>
                <th class="text-end">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="5" class="text-center text-muted">No items</td></tr>`}
            </tbody>
          </table>

          <div class="row g-3 mt-1">
            <div class="col-12 col-md-6">
              <div class="p-3 border rounded-3">
                <div class="fw-semibold mb-2">Notes</div>
                <div class="footer-note">
                  Prices reflect the latest scripts. Medi-Cal adds $10 per quantity to the line total.
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="p-3 border rounded-3 summary">
                <div class="row-line d-flex justify-content-between"><span class="label">Subtotal</span><span class="value">$${fmt(subtotal)}</span></div>
                <div class="row-line d-flex justify-content-between"><span class="label">Total Patient Payment</span><span class="value">$${fmt(totalPatientPayment)}</span></div>
                <div class="row-line d-flex justify-content-between"><span class="label">Total Insurance Payment</span><span class="value">$${fmt(totalInsurancePayment)}</span></div>
                <div class="row-line d-flex justify-content-between"><span class="label">Total Revenue</span><span class="value">$${fmt(totalRevenue)}</span></div>
                <div class="row-line d-flex justify-content-between"><span class="label">Total Acquisition Cost</span><span class="value">$${fmt(totalAcquisitionCost)}</span></div>
                <div class="row-line d-flex justify-content-between"><span class="label">Medi-Cal Fees</span><span class="value">$${fmt(totalMediCalFees)}</span></div>
                <hr/>
                <div class="row-line d-flex justify-content-between"><span class="label">Total NET</span><span class="value">$${fmt(totalNet)}</span></div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="footer-note">Thank you for your business!</div>
            <div class="footer-note">Generated by MediSearch</div>
          </div>

          <script>window.focus(); window.print();</script>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;
    const html = buildReceiptHTML();
    win.document.write(html);
    win.document.close();
  };

  // ---- Checkout ----
  const handleCheckout = async () => {
    const orderBody = localStorage.getItem("orderRequestBody");
    if (!orderBody) {
      setStatus("error");
      setMessage("No order data found.");
      return;
    }
    try {
      const parsed = JSON.parse(orderBody);
      await axiosInstance.post("/order/CreateOrder", parsed);
      setStatus("success");
      setMessage("Order submitted successfully!");
      onClearCart();
      localStorage.removeItem("orderRequestBody");
      localStorage.setItem("lastOrderSubmitted", JSON.stringify(parsed));
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("error");
      setMessage("Failed to submit order. Please try again.");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const isEmpty = cartItems.length === 0;

  return (
    <>
      <ProCartPageStyles />
      <div className="container py-4">
        {/* Breadcrumb / Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Cart</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2">
            {!isEmpty && (
              <button className="btn btn-outline-danger btn-sm" onClick={onClearCart}>
                <i className="ti ti-trash me-1" />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Status alerts */}
        {status === "success" && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="ti ti-checks me-2" />
            <div>{message}</div>
          </div>
        )}
        {status === "error" && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="ti ti-circle-x me-2" />
            <div>{message}</div>
          </div>
        )}

        {/* Card layout */}
        <div className="row g-3 pro-anim">
          {/* Items */}
          <div className="col-lg-8">
            <div className="card pro-card rounded-4 shadow-sm position-relative">
              <div className="pro-topbar" />
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <span
                    className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center me-2"
                    style={{ width: 32, height: 32 }}
                  >
                    <i className="ti ti-shopping-bag" />
                  </span>
                  <h5 className="mb-0">Your Cart</h5>
                  <span className="badge text-bg-secondary ms-2">{cartItems.length}</span>
                </div>

                {isEmpty ? (
                  <div className="text-center text-secondary py-5">
                    <i className="ti ti-shopping-bag-x fs-1 d-block mb-3" />
                    <div className="mb-1">Your cart is empty</div>
                    <small>Start adding items to continue</small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th className="text-center" style={{ width: 180 }}>Quantity</th>
                          <th className="text-end" style={{ width: 120 }}>Each</th>
                          <th className="text-end" style={{ width: 150 }}>Totals</th>
                          <th className="text-end" style={{ width: 64 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => {
                          const qty = item.quantity || 1;
                          const acq = item.acq ?? 0;
                          const insurance = item.insurancePayment ?? 0;
                          const patient = item.patientPayment ?? 0;
                          const each = item.price ?? 0;
                          const isMediCal =
                            item.insurance && item.insurance.toLowerCase().includes("medi-cal");
                          const mediCalFee = isMediCal ? 10 * qty : 0;
                          const lineTotal = each * qty + mediCalFee;

                          return (
                            <tr key={item.id}>
                              <td>
                                <div className="fw-semibold text-truncate">{item.name}</div>
                                <div className="small text-muted">
                                  {item.insurance ? (
                                    <>
                                      Insurance: {item.insurance}
                                      <span className="ms-2">· ACQ: ${fmt(acq)}</span>
                                    </>
                                  ) : (
                                    <>ACQ: ${fmt(acq)}</>
                                  )}
                                </div>
                                <div className="small text-muted">
                                  Ins Pay: ${fmt(insurance * qty)} · Pt Pay: {fmt(patient * qty)}
                                </div>
                              </td>

                              <td className="text-center">
                                <div className="btn-group" role="group" aria-label="Quantity">
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => onUpdateQuantity(item.id, Math.max(1, qty - 1))}
                                    disabled={qty <= 1}
                                    title="Decrease"
                                  >
                                    <i className="ti ti-minus" />
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    className="form-control form-control-sm text-center"
                                    style={{ width: 66 }}
                                    value={qty}
                                    onChange={(e) =>
                                      onUpdateQuantity(
                                        item.id,
                                        Math.max(1, parseInt(e.target.value || "1", 10))
                                      )
                                    }
                                  />
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => onUpdateQuantity(item.id, qty + 1)}
                                    title="Increase"
                                  >
                                    <i className="ti ti-plus" />
                                  </button>
                                </div>
                              </td>

                              <td className="text-end">
                                <span className="badge text-bg-light">${fmt(each)}</span>
                                {isMediCal && (
                                  <div className="small text-primary">+$10/qty Medi-Cal</div>
                                )}
                              </td>

                              <td className="text-end">
                                <div className="fw-semibold">${fmt(lineTotal)}</div>
                                {isMediCal && (
                                  <small className="text-primary">
                                    Includes ${fmt(mediCalFee)} Medi-Cal
                                  </small>
                                )}
                              </td>

                              <td className="text-end">
                                {/* Delete item button */}
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  title="Remove item"
                                  aria-label={`Remove ${item.name}`}
                                  onClick={() => onRemoveItem(item.id)}
                                >
                                  <i className="ti ti-trash" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="col-lg-4">
            <div className="card pro-card rounded-4 shadow-sm position-relative">
              <div className="pro-topbar" />
              <div className="card-body order-summary">
                <h6 className="mb-3">Order Summary</h6>

                <div className="order-line d-flex justify-content-between">
                  <span className="label">Subtotal</span>
                  <span className="value">${fmt(subtotal)}</span>
                </div>
                <div className="order-line d-flex justify-content-between">
                  <span className="label">Tax (est.)</span>
                  <span className="value">$0.00</span>
                </div>

                <hr className="my-2" />

                <div className="order-line d-flex justify-content-between">
                  <span className="label">Total Patient Payment</span>
                  <span className="value">${fmt(totalPatientPayment)}</span>
                </div>
                <div className="order-line d-flex justify-content-between">
                  <span className="label">Total Insurance Payment</span>
                  <span className="value">${fmt(totalInsurancePayment)}</span>
                </div>
                <div className="order-line d-flex justify-content-between">
                  <span className="label">Total Revenue</span>
                  <span className="value">${fmt(totalRevenue)}</span>
                </div>
                <div className="order-line d-flex justify-content-between">
                  <span className="label">Total Acquisition Cost</span>
                  <span className="value">${fmt(totalAcquisitionCost)}</span>
                </div>
                <div className="order-line d-flex justify-content-between">
                  <span className="label">Medi-Cal Fees</span>
                  <span className="value">${fmt(totalMediCalFees)}</span>
                </div>

                <hr className="my-2" />

                <div className="order-line total-net d-flex justify-content-between">
                  <span className="label">Total NET</span>
                  <span className="value">${fmt(totalNet)}</span>
                </div>

                <div className="mt-3 d-grid gap-2">
                  <button className="btn btn-primary" disabled={isEmpty} onClick={handleCheckout}>
                    <i className="ti ti-shopping-bag-check me-1" />
                    Make Order
                  </button>
                  <button className="btn btn-outline-secondary" disabled={isEmpty} onClick={handlePrint}>
                    <i className="ti ti-printer me-1" />
                    Print / PDF Receipt
                  </button>
                </div>

                {/* Hidden container for accessibility/fallback if needed */}
                <div ref={receiptRef} className="visually-hidden" aria-hidden="true" />
              </div>

              <div className="card-footer bg-body-tertiary d-flex align-items-center justify-content-between">
                <small className="text-secondary d-flex align-items-center gap-2">
                  <i className="ti ti-info-circle" />
                  Prices updated according to the last scripts
                </small>
                <div className="fw-bold">${fmt(total)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
