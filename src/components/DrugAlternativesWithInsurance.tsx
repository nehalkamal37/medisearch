import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../api/axiosInstance";
import type { Prescription } from "../types";
import { useCart } from "./CartContext";

/** ---------- tiny CSS for smooth pro-modal feel (Bootstrap-friendly) ---------- */
const ProModalStyles = () => (
  <style>{`
    @keyframes floatShadow { 0% {transform: translateY(0);} 50% {transform: translateY(-2px);} 100% {transform: translateY(0);} }
    @keyframes cardEntry { from {opacity: 0; transform: translateY(8px);} to {opacity: 1; transform: translateY(0);} }
    .pro-modal-shadow { position: absolute; inset: -0.75rem; background: rgba(59,130,246,0.08); border-radius: 1rem; filter: blur(16px); opacity: .7; animation: floatShadow 3s ease-in-out infinite; pointer-events:none; }
    .pro-topbar { position:absolute; top:0; left:0; width:100%; height:4px; background: linear-gradient(90deg,#34d399,#60a5fa,#a78bfa); }
    .pro-card { background: rgba(255,255,255,.95); backdrop-filter: blur(10px); }
    .pro-soft { background: rgba(248,250,252,.7); border: 1px solid rgba(148,163,184,.35); }
    .pro-billboard { background: linear-gradient(90deg, rgba(59,130,246,.06), rgba(147,51,234,.06)); border: 1px solid rgba(148,163,184,.35); }
    .pro-modal { animation: cardEntry .25s ease-out both; }
    .pro-scroll { max-height: 60vh; overflow-y: auto; }
  `}</style>
);

/** ---------- helpers ---------- */
const padCode = (v: string | number | undefined) => (v ?? "").toString();
const money = (v?: number | null) =>
  v == null
    ? "—"
    : v.toLocaleString(undefined, { style: "currency", currency: "USD" });
const pricePerUnit = (n?: number | null, q?: number | null) => {
  const qty = q && q > 0 ? q : 1;
  const val = (n ?? 0) / qty;
  return `$${val.toFixed(3)}`;
};

type PagedResult<T> = {
  items: T[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
};

type FilterOptions = { rxGroups: string[]; pcns: string[]; bins: string[] };

type TargetInfo = Partial<
  Pick<
    Prescription,
    "branchName" | "date" | "rxgroupId" | "pcnId" | "binId" | "status"
  >
>;

type ReportHistory = {
  id: number;
  status: string;
  statusDate?: string;
  userEmail?: string;
};

type Props = {
  classInfoId: number;
  sourceDrugNDC: string | null;
  /** pass the currently-viewed script (or key bits) to score against, includes rxgroupId for reporting */
  target?: TargetInfo;
  autoResetFiltersOnClassChange?: boolean;
};

/* ================== scoring (your logic) ================== */
function dateRecencyScore(
  dateStr: string | undefined,
  currentDate: Date
): number {
  if (!dateStr) return 0;
  const cand = new Date(dateStr);
  if (isNaN(cand.getTime())) return 0;
  const daysDiff = Math.floor(
    (currentDate.getTime() - cand.getTime()) / 86400000
  );
  const monthsDiff = Math.floor(daysDiff / 30);
  if (monthsDiff >= 12) return 0;
  const score = Math.max(0, 20 - monthsDiff * 1.66);
  return parseFloat(score.toFixed(2));
}

function scorePrescriptionPercent(
  candidate: Prescription,
  target: TargetInfo | undefined,
  currentDate: Date
): number {
  let locationScore = 0;
  let dateScore = 0;
  let hierarchyScore = 0;

  if (
    candidate.branchName &&
    target?.branchName &&
    candidate.branchName === target.branchName
  ) {
    locationScore = 10;
  }

  dateScore = dateRecencyScore(candidate.date, currentDate);

  if (target?.rxgroupId != null && candidate.rxgroupId === target.rxgroupId) {
    hierarchyScore = 70;
  } else if (target?.pcnId != null && candidate.pcnId === target.pcnId) {
    hierarchyScore = 50;
  } else if (
    target?.binId != null &&
    candidate.rxgroupId !== target.rxgroupId &&
    candidate.pcnId !== target.pcnId &&
    candidate.binId === target.binId
  ) {
    hierarchyScore = 28;
  } else {
    hierarchyScore = 0;
  }

  let totalScore = locationScore + dateScore + hierarchyScore;
  totalScore = Math.max(40, Math.min(90, totalScore));
  if (candidate.status === "Rejected" || candidate.status === "Prior Auth")
    totalScore = 10;

  return parseFloat(totalScore.toFixed(2));
}
/* ========================================================= */

type DisplayPrescription = Prescription & { score?: number };

export default function DrugAlternativesWithInsurance({
  classInfoId,
  sourceDrugNDC,
  target,
  autoResetFiltersOnClassChange = true,
}: Props) {
  // filters (cascading)
  const [rxgroup, setRxgroup] = useState("");
  const [pcn, setPcn] = useState("");
  const [bin, setBin] = useState("");

  // options for selects
  const [options, setOptions] = useState<FilterOptions>({
    rxGroups: [],
    pcns: [],
    bins: [],
  });

  // table / paging
  const [rows, setRows] = useState<DisplayPrescription[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // loading / error
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tabs
  const [activeTab, setActiveTab] = useState<
    "Drug Info" | "Pricing Info" | "Insurance Info"
  >("Drug Info");

  // ----------------- STATUS MODAL state -----------------
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusDrug, setStatusDrug] = useState<DisplayPrescription | null>(
    null
  );
  const [reportSelection, setReportSelection] = useState("");
  const [priorAuthChoice, setPriorAuthChoice] = useState<
    "Yes" | "No" | "Refile" | null
  >(null);
  const [customReportReason, setCustomReportReason] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<{
    sourceNDC?: string | null;
    targetNDC?: string | null;
    rxGroup?: string | number | null;
  } | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);

  // ----------------- DETAILS MODAL state -----------------
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsDrug, setDetailsDrug] = useState<DisplayPrescription | null>(
    null
  );
const { addToCart, cartItems, openCart } = useCart();

  // modal focus ref
  const modalDialogRef = useRef<HTMLDivElement | null>(null);

  function buildParams(withPaging = true) {
    const params = new URLSearchParams({
      classInfoId: String(classInfoId),
      sourceDrugNDC: String(sourceDrugNDC),
    });
    if (rxgroup) params.append("rxgroup", rxgroup);
    if (pcn) params.append("pcn", pcn);
    if (bin) params.append("bin", bin);
    if (withPaging) {
      params.append("pageNumber", String(pageNumber));
      params.append("pageSize", String(pageSize));
    }
    return params;
  }

  async function fetchOptions() {
    try {
      setLoadingOptions(true);
      const params = buildParams(false);
      const { data } = await axiosInstance.get<FilterOptions>(
        `/drug/GetAlternativesWithInsuranceFilters?${params.toString()}`
      );
      setOptions({
        rxGroups: data?.rxGroups ?? [],
        pcns: data?.pcns ?? [],
        bins: data?.bins ?? [],
      });
    } finally {
      setLoadingOptions(false);
    }
  }

  async function fetchRows() {
    try {
      setLoadingRows(true);
      setError(null);
      const params = buildParams(true);
      const { data } = await axiosInstance.get<PagedResult<Prescription>>(
        `/drug/GetAlternativesWithInsurance?${params.toString()}`
      );

      const now = new Date();
      const scored = (data?.items ?? []).map((r) => ({
        ...r,
        score: scorePrescriptionPercent(r, target, now),
      }));

      setRows(scored);
      setTotalPages(data?.totalPages ?? 0);
      setTotalCount(data?.totalCount ?? 0);
    } catch (e: any) {
      console.error(e);
      setRows([]);
      setTotalPages(0);
      setTotalCount(0);
      setError("Failed to load alternatives.");
    } finally {
      setLoadingRows(false);
    }
  }

  // refresh on class change
  useEffect(() => {
    if (autoResetFiltersOnClassChange) {
      setRxgroup("");
      setPcn("");
      setBin("");
    }
    setPageNumber(1);
    fetchOptions().then(fetchRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classInfoId, sourceDrugNDC]);

  // cascading filters
  useEffect(() => {
    setPageNumber(1);
    fetchOptions().then(fetchRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rxgroup, pcn, bin]);

  // re-score if target changes
  useEffect(() => {
    if (!rows.length) return;
    const now = new Date();
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        score: scorePrescriptionPercent(r, target, now),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    target?.branchName,
    target?.date,
    target?.rxgroupId,
    target?.pcnId,
    target?.binId,
    target?.status,
  ]);

  // page change
  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  // lock body scroll + esc to close when a modal is shown
  useEffect(() => {
    const open = showStatusModal || showDetailsModal;
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDetailsModal) setShowDetailsModal(false);
        else if (showStatusModal) setShowStatusModal(false);
      }
    };
    window.addEventListener("keydown", onKey);

    setTimeout(() => {
      modalDialogRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = prevOverflow;
    };
  }, [showStatusModal, showDetailsModal]);

  const canPrev = pageNumber > 1;
  const canNext = pageNumber < totalPages;

  function resetFilters() {
    setRxgroup("");
    setPcn("");
    setBin("");
  }

  /* ---------------- insurance report helpers ---------------- */
  function statusBadgeClass(s?: string) {
    const k = (s || "").toLowerCase();
    if (k.includes("approve"))
      return "bg-success-subtle text-success-emphasis border-success-subtle";
    if (k.includes("reject") || k.includes("deny"))
      return "bg-danger-subtle text-danger-emphasis border-danger-subtle";
    if (k.includes("prior"))
      return "bg-warning-subtle text-warning-emphasis border-warning-subtle";
    return "bg-secondary-subtle text-secondary-emphasis border-secondary-subtle";
  }

  async function openReportModal(rec: Prescription) {
    const insuranceRxId = target?.rxgroupId ?? rec.rxgroupId ?? 0;
    try {
      const { data } = await axiosInstance.get<ReportHistory[]>(
        `/Insurance/GetReportsAsyncByKey?sourceDrugNDC=${sourceDrugNDC}&targetDrugNDC=${rec.ndcCode}&insuranceRxId=${insuranceRxId}`
      );
      setReportHistory(data || []);
    } catch {
      setReportHistory([]);
    }
    setStatusDrug(rec);
    setReportSelection("");
    setPriorAuthChoice(null);
    setCustomReportReason("");
    setSubmitMessage(null);
    setSubmittedSummary(null);
    setShowStatusModal(true);
  }

  async function submitReport() {
    if (!statusDrug) return;
    const insuranceRxId = target?.rxgroupId ?? statusDrug.rxgroupId ?? 0;
    if (!insuranceRxId) return;

    try {
      let statusValue: string;
      if (reportSelection === "Other" && customReportReason.trim()) {
        statusValue = customReportReason.trim();
      } else if (reportSelection === "Prior Auth") {
        if (!priorAuthChoice) return;
        statusValue =
          priorAuthChoice === "Yes"
            ? "PriorAuthorizationYes"
            : priorAuthChoice === "No"
            ? "PriorAuthorizationNo"
            : "PriorAuthorizationRefile";
      } else {
        statusValue = reportSelection; // "Approved" | "Rejected"
      }

      const payload = {
        sourceDrugNDC: sourceDrugNDC,
        targetDrugNDC: statusDrug.ndcCode,
        insuranceRxId,
        status: statusValue,
      };

      await axiosInstance.post("/Insurance/ReportStatus", payload);

      setSubmittedSummary({
        sourceNDC: sourceDrugNDC,
        targetNDC: statusDrug.ndcCode,
        rxGroup: insuranceRxId,
      });
      setSubmitMessage("Report submitted successfully.");
    } catch (err) {
      console.error("Error submitting report:", err);
      setSubmitMessage(null);
    }
  }
  /* ---------------------------------------------------------- */

  const moneyCell = (v?: number | null, dangerOnNegative = false) => {
    const val = v ?? 0;
    const isNeg = val < 0;
    return (
      <span
        className={`badge ${
          dangerOnNegative && isNeg ? "text-bg-danger" : "text-bg-light"
        }`}
      >
        {money(v)}
      </span>
    );
  };

  const dateOnly = (v?: string | Date | null) => {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  // derive simple "recommended alternatives" for the Details modal (top 3 other rows)
  const recommended = useMemo(() => {
    if (!detailsDrug) return [];
    return rows
      .filter((r) => r.ndcCode !== detailsDrug.ndcCode)
      .slice(0, 3)
      .map((r) => ({
        drugId: r.drugId,
        drugName: r.drugName,
        drugClass: r.drugClass,
        ndcCode: r.ndcCode,
        rxgroupId: r.rxgroupId,
        quantity: r.quantity,
        net: r.net,
      }));
  }, [detailsDrug, rows]);

  return (
    <div className="card mt-3">
      <div className="card-body">
        {/* Header + Filters */}
        <div className="d-flex flex-wrap align-items-end gap-2">
          <h5 className="mb-0 me-auto d-flex align-items-center gap-2">
            <i className="bi bi-arrow-left-right" /> Drug Alternatives (with
            Insurance)
          </h5>

          <div>
            <label className="form-label mb-1 small">Rx Group</label>
            <select
              className="form-select form-select-sm"
              value={rxgroup}
              onChange={(e) => setRxgroup(e.target.value)}
              disabled={loadingOptions}
              style={{ minWidth: 160 }}
            >
              <option value="">All</option>
              {options.rxGroups.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label mb-1 small">PCN</label>
            <select
              className="form-select form-select-sm"
              value={pcn}
              onChange={(e) => setPcn(e.target.value)}
              disabled={loadingOptions}
              style={{ minWidth: 140 }}
            >
              <option value="">All</option>
              {options.pcns.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label mb-1 small">BIN</label>
            <select
              className="form-select form-select-sm"
              value={bin}
              onChange={(e) => setBin(e.target.value)}
              disabled={loadingOptions}
              style={{ minWidth: 140 }}
            >
              <option value="">All</option>
              {options.bins.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={resetFilters}
            disabled={loadingOptions}
          >
            <i className="bi bi-arrow-counterclockwise me-1" /> Reset
          </button>
        </div>

        {/* Tabs (columns) */}
        <ul className="nav nav-tabs mt-3">
          {["Drug Info", "Pricing Info", "Insurance Info"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        <div className="pt-3">
          {loadingRows && (
            <div className="text-muted">Loading alternatives…</div>
          )}
          {error && <div className="text-danger">{error}</div>}

          {!loadingRows && !error && rows.length === 0 && (
            <div className="alert alert-warning">
              No alternatives found for this selection.
            </div>
          )}

          {!loadingRows && !error && rows.length > 0 && (
            <>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      {activeTab === "Drug Info" && (
                        <>
                          <th>Name</th>
                          <th>NDC</th>
                          <th>Class</th>
                          <th>Form</th>
                          <th>Strength</th>
                          <th>Ingredient</th>
                          <th>Route</th>
                          <th>TE Code</th>
                          <th>Market Status</th>
                        </>
                      )}
                      {activeTab === "Pricing Info" && (
                        <>
                          <th>Name</th>
                          <th>NDC</th>
                          <th>Quantity</th>
                          <th className="text-end">Net Price</th>
                          <th className="text-end">Coverage</th>
                          <th className="text-end">Patient Pay</th>
                          <th className="text-end">ACQ</th>
                          <th className="text-end">Net / Item</th>
                          <th className="text-end">Net × Qty</th>
                          <th>Script Code</th>
                        </>
                      )}
                      {activeTab === "Insurance Info" && (
                        <>
                          <th>Name</th>
                          <th>NDC</th>
                          <th>Branch Name</th>
                          <th>Rx Group</th>
                          <th>BIN</th>
                          <th>Insurance</th>
                          <th>PCN</th>
                          <th>Date</th>
                          <th className="text-center">Prior Auth</th>
                          <th className="text-center">Approved</th>
                          <th className="text-end">Confidence</th>
                          <th className="text-center">Status</th>
                          <th className="text-end">Details</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((r, idx) => {
                      // Confidence meter color
                      const score = (r as any).score ?? 0;
                      const barClass =
                        score >= 80
                          ? "bg-success"
                          : score >= 60
                          ? "bg-warning"
                          : score >= 40
                          ? "bg-info"
                          : "bg-danger";

                      const netPerItem = (r.net ?? 0) / (r.quantity || 1);

                      return (
                        <tr
                          key={`${r.ndcCode}-${r.rxgroupId}-${r.pcnId}-${r.binId}-${idx}`}
                        >
                          {activeTab === "Drug Info" && (
                            <>
                              <td>
                                <a
                                  href={`/drug/${r.drugId}?ndc=${r.ndcCode}&insuranceId=${r.rxgroupId}`}
                                  className="link-primary"
                                >
                                  {r.drugName}
                                </a>
                                <div className="small text-muted">
                                  {r.drugClass}
                                </div>
                              </td>
                              <td className="text-muted">
                                <a
                                  className="link-secondary"
                                  href={`https://ndclist.com/ndc/${r.ndcCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {r.ndcCode}
                                </a>
                              </td>
                              <td>{r.drugClass}</td>
                              <td>{r.form || "NA"}</td>
                              <td>
                                {r.strength
                                  ? `${r.strength} ${r.strengthUnit || ""}`
                                  : "NA"}
                              </td>
                              <td>{(r as any).ingrdient || "NA"}</td>
                              <td>{r.route || "NA"}</td>
                              <td>{(r as any).teCode || "NA"}</td>
                              <td>{(r as any).type || "NA"}</td>
                            </>
                          )}

                          {activeTab === "Pricing Info" && (
                            <>
                              <td>
                                <a
                                  href={`/drug/${r.drugId}?ndc=${r.ndcCode}&insuranceId=${r.rxgroupId}`}
                                  className="link-primary"
                                >
                                  {r.drugName}
                                </a>
                                <div className="small text-muted">
                                  {r.drugClass}
                                </div>
                              </td>
                              <td className="text-muted">
                                <a
                                  className="link-secondary"
                                  href={`https://ndclist.com/ndc/${r.ndcCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {r.ndcCode}
                                </a>
                              </td>
                              <td className="text-center">{r.quantity ?? 1}</td>
                              <td className="text-end">{money(r.net)}</td>
                              <td className="text-end">
                                {money(r.insurancePayment)}
                              </td>
                              <td className="text-end">
                                {money(r.patientPayment)}
                              </td>
                              <td className="text-end">
                                {money(r.acquisitionCost)}
                              </td>
                              <td className="text-end">{money(netPerItem)}</td>
                              <td className="text-end">{money(r.net)}</td>
                              <td>
                                {r.scriptCode ? (
                                  <a
                                    href={`/scriptitems/${r.scriptCode}`}
                                    className="link-primary"
                                    target="_blank"
                                  >
                                    {r.scriptCode}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </>
                          )}

                          {activeTab === "Insurance Info" && (
                            <>
                              <td>
                                <a
                                  href={`/drug/${r.drugId}?ndc=${r.ndcCode}&insuranceId=${r.rxgroupId}`}
                                  className="link-primary"
                                >
                                  {r.drugName}
                                </a>
                              </td>
                              <td className="text-muted">
                                <a
                                  className="link-secondary"
                                  href={`https://ndclist.com/ndc/${r.ndcCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {r.ndcCode}
                                </a>
                              </td>
                              <td>{r.branchName || "—"}</td>
                              <td>
                                <a
                                  className="link-primary"
                                  href={`/InsuranceDetails/${r.rxgroupId}`}
                                >
                                  {r.insuranceName || (r as any).rxgroup || "—"}
                                </a>
                              </td>
                              <td>
                                <a
                                  className="link-primary"
                                  href={`/InsuranceBINDetails/${
                                    (r as any).binId
                                  }`}
                                >
                                  {(r as any).bin || "—"}
                                </a>
                              </td>
                              <td>{(r as any).binFullName || "—"}</td>
                              <td>
                                <a
                                  className="link-primary"
                                  href={`/InsurancePCNDetails/${
                                    (r as any).pcnId
                                  }`}
                                >
                                  {(r as any).pcn || "—"}
                                </a>
                              </td>
                              <td className="text-muted">
                                {dateOnly(r.date as any)}
                              </td>
                              <td className="text-center">
                                <span className="badge text-bg-light">
                                  {(r as any).priorAuthorizationStatus || "—"}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge text-bg-light">
                                  {(r as any).approvedStatus || "—"}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="d-inline-flex align-items-center gap-2">
                                  <small
                                    className="text-muted"
                                    style={{ width: 28, textAlign: "right" }}
                                  >
                                    {(
                                      ((r as any).score ?? 0) as number
                                    ).toFixed(0)}
                                    %
                                  </small>
                                  <div
                                    className="progress"
                                    style={{ width: 90, height: 8 }}
                                  >
                                    <div
                                      className={`progress-bar ${barClass}`}
                                      role="progressbar"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(0, (r as any).score ?? 0)
                                        )}%`,
                                      }}
                                      aria-valuenow={(r as any).score ?? 0}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                <button
                                  className={`btn btn-sm ${
                                    !r.status || r.status === "Approved"
                                      ? "btn-success"
                                      : r.status === "Rejected"
                                      ? "btn-danger"
                                      : r.status === "Prior Auth"
                                      ? "btn-primary"
                                      : "btn-secondary"
                                  }`}
                                  onClick={() => openReportModal(r)}
                                >
                                  {r.status || "Approved"}
                                </button>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setDetailsDrug(r);
                                    setShowDetailsModal(true);
                                  }}
                                >
                                  Details
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paging */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="small text-muted">
                  Showing page <strong>{pageNumber}</strong> of{" "}
                  <strong>{totalPages}</strong> • total{" "}
                  <strong>{totalCount}</strong> alternatives
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={!canPrev}
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  >
                    <i className="bi bi-chevron-left me-1" />
                    Prev
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={!canNext}
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    Next <i className="bi bi-chevron-right ms-1" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== MODALS VIA PORTAL ==================== */}
      <ProModalStyles />

      {/* STATUS MODAL (Pro + Bootstrap) */}
      {showStatusModal &&
        statusDrug &&
        createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 1050, position: "fixed" }}
              onClick={() => setShowStatusModal(false)}
            />
            <div
              className="modal fade show d-block"
              role="dialog"
              aria-modal="true"
              aria-labelledby="insuranceModalTitle"
              tabIndex={-1}
              style={{
                zIndex: 1055,
                position: "fixed",
                inset: 0,
                overflowY: "auto",
              }}
              onClick={() => setShowStatusModal(false)}
            >
              <div
                className="modal-dialog modal-lg modal-dialog-centered"
                role="document"
                ref={modalDialogRef}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                <div className="modal-content border-0 shadow-lg position-relative pro-modal pro-card rounded-4">
                  <div className="pro-modal-shadow" aria-hidden="true" />
                  <div className="pro-topbar" aria-hidden="true" />

                  <div className="modal-header bg-transparent border-0 pb-0">
                    <div className="d-flex align-items-start gap-2">
                      <div
                        className="rounded-3 p-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}
                      >
                        <i className="bi bi-check2-circle" />
                      </div>
                      <div className="min-w-0">
                        <h5
                          className="modal-title text-truncate"
                          id="insuranceModalTitle"
                        >
                          {statusDrug.drugName}
                        </h5>
                        <div className="d-flex align-items-center gap-2 mt-1 small">
                          <span className="badge text-bg-primary-subtle text-primary-emphasis">
                            {statusDrug.drugClass}
                          </span>
                          <a
                            href={`https://ndclist.com/ndc/${padCode(
                              statusDrug.ndcCode
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-primary"
                          >
                            {padCode(statusDrug.ndcCode)}
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-light btn-sm rounded-circle ms-auto"
                      aria-label="Close"
                      onClick={() => setShowStatusModal(false)}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>

                  <div className="modal-body pt-3">
                    {/* price billboard */}
                    <div className="pro-billboard rounded-3 p-3 mb-3 position-relative overflow-hidden">
                      <div className="row g-3 align-items-center">
                        <div className="col">
                          <div className="text-muted text-uppercase small fw-semibold">
                            Net Price
                          </div>
                          <div className="fs-4 fw-bold">
                            {pricePerUnit(
                              statusDrug?.net,
                              statusDrug?.quantity
                            )}
                          </div>
                        </div>
                        <div className="col text-end">
                          <div className="text-muted text-uppercase small fw-semibold">
                            Acquisition Cost
                          </div>
                          <div className="fs-5 fw-semibold text-primary">
                            {pricePerUnit(
                              statusDrug?.acquisitionCost,
                              statusDrug?.quantity
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Before Submitting */}
                    <div className="pro-soft rounded-3 p-3 mb-3">
                      <div className="fw-semibold mb-2">
                        Review Before Submitting
                      </div>
                      <div className="row g-2 small">
                        <div className="col-sm-6">
                          <span className="fw-semibold">Source NDC:</span>{" "}
                          <code>{sourceDrugNDC}</code>
                        </div>
                        <div className="col-sm-6">
                          <span className="fw-semibold">Target NDC:</span>{" "}
                          <code>{statusDrug?.ndcCode || "-"}</code>
                        </div>
                        <div className="col-12">
                          <span className="fw-semibold">Insurance:</span>{" "}
                          {target?.rxgroupId ?? statusDrug?.rxgroupId ?? "-"}
                          {(statusDrug as any)?.bin && (
                            <>
                              {" "}
                              · <span className="fw-semibold">BIN:</span>{" "}
                              {(statusDrug as any).bin}
                            </>
                          )}
                          {(statusDrug as any)?.pcn && (
                            <>
                              {" "}
                              · <span className="fw-semibold">PCN:</span>{" "}
                              {(statusDrug as any).pcn}
                            </>
                          )}
                        </div>
                        <div className="col-12">
                          <span className="fw-semibold">Prior Auth:</span>{" "}
                          {reportSelection === "Prior Auth" && priorAuthChoice
                            ? priorAuthChoice
                            : (statusDrug as any).priorAuthorizationStatus ??
                              "-"}
                        </div>
                      </div>
                    </div>

                    {/* Choose status */}
                    <div className="mb-3">
                      <div
                        className="d-flex flex-wrap gap-2"
                        role="group"
                        aria-label="Report status options"
                      >
                        {["Approved", "Rejected", "Prior Auth", "Other"].map(
                          (opt) => {
                            const id =
                              "reportStatus-" + opt.replace(/\s+/g, "");
                            const active = reportSelection === opt;
                            return (
                              <span key={opt} className="me-1 mb-1">
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="reportStatus"
                                  id={id}
                                  autoComplete="off"
                                  checked={active}
                                  onChange={() => {
                                    setReportSelection(opt);
                                    if (opt !== "Prior Auth")
                                      setPriorAuthChoice(null);
                                  }}
                                />
                                <label
                                  htmlFor={id}
                                  className={`btn btn-sm ${
                                    active
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                                  }`}
                                  aria-pressed={active}
                                >
                                  {opt}
                                </label>
                              </span>
                            );
                          }
                        )}
                      </div>

                      {/* PA sub-choices */}
                      {reportSelection === "Prior Auth" && (
                        <div className="mt-3">
                          <div className="small fw-semibold mb-2">
                            Prior Authorization required?
                          </div>
                          <div
                            className="d-flex gap-2 flex-wrap"
                            role="group"
                            aria-label="Prior auth choices"
                          >
                            {(["Yes", "No", "Refile"] as const).map((ans) => {
                              const id = "paChoice-" + ans;
                              const active = priorAuthChoice === ans;
                              return (
                                <span key={ans} className="me-1 mb-1">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="priorAuthChoice"
                                    id={id}
                                    autoComplete="off"
                                    checked={active}
                                    onChange={() => setPriorAuthChoice(ans)}
                                  />
                                  <label
                                    htmlFor={id}
                                    className={`btn btn-sm ${
                                      active
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                    }`}
                                    aria-pressed={active}
                                  >
                                    {ans}
                                  </label>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Other text */}
                      {reportSelection === "Other" && (
                        <textarea
                          className="form-control form-control-sm mt-3"
                          rows={3}
                          placeholder="Enter custom reason"
                          value={customReportReason}
                          onChange={(e) =>
                            setCustomReportReason(e.target.value)
                          }
                        />
                      )}
                    </div>

                    {/* Report History */}
                    <div>
                      <div className="fw-semibold mb-2">Report History</div>
                      {reportHistory.length ? (
                        <ul className="list-group list-group-flush">
                          {reportHistory.map((h) => {
                            const isPA =
                              h.status === "PriorAuthorizationYes" ||
                              h.status === "PriorAuthorizationNo" ||
                              h.status === "PriorAuthorizationRefile";
                            const display =
                              h.status === "PriorAuthorizationYes"
                                ? "Prior Auth - Yes"
                                : h.status === "PriorAuthorizationNo"
                                ? "Prior Auth - No"
                                : h.status === "PriorAuthorizationRefile"
                                ? "Prior Auth - Refile"
                                : h.status;

                            return (
                              <li
                                key={h.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                <span
                                  className={`badge border ${statusBadgeClass(
                                    isPA ? "Prior Auth" : h.status
                                  )}`}
                                >
                                  {display}
                                </span>
                                <small className="text-muted">
                                  {h.userEmail || "—"} ·{" "}
                                  {h.statusDate
                                    ? new Date(
                                        h.statusDate
                                      ).toLocaleDateString()
                                    : "—"}
                                </small>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-muted small">No reports yet.</div>
                      )}
                    </div>

                    {/* Success alert */}
                    {submitMessage && (
                      <div
                        className="alert alert-success mt-3 mb-0 small"
                        aria-live="polite"
                      >
                        <div className="fw-semibold">{submitMessage}</div>
                        <div>
                          Source NDC: {submittedSummary?.sourceNDC || "-"} ·
                          Target NDC: {submittedSummary?.targetNDC || "-"} · Rx
                          Group: {submittedSummary?.rxGroup || "-"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer bg-body-tertiary border-0">
                    <div className="d-flex align-items-center gap-2 me-auto text-secondary small">
                      <i className="bi bi-info-circle" /> Prices updated
                      according to the last scripts
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowStatusModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={
                        !reportSelection ||
                        (reportSelection === "Prior Auth" &&
                          !priorAuthChoice) ||
                        (reportSelection === "Other" &&
                          !customReportReason.trim())
                      }
                      onClick={submitReport}
                      title={
                        reportSelection === "Prior Auth" && !priorAuthChoice
                          ? "Choose Yes, No, or Refile for Prior Auth"
                          : reportSelection === "Other" &&
                            !customReportReason.trim()
                          ? "Enter a custom reason"
                          : undefined
                      }
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* DETAILS MODAL (Pro + Bootstrap) */}
      {showDetailsModal &&
        detailsDrug &&
        createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 1050, position: "fixed" }}
              onClick={() => setShowDetailsModal(false)}
            />
            <div
              className="modal fade show d-block"
              role="dialog"
              aria-modal="true"
              aria-labelledby="proDetailsTitle"
              tabIndex={-1}
              style={{
                zIndex: 1055,
                position: "fixed",
                inset: 0,
                overflowY: "auto",
              }}
              onClick={() => setShowDetailsModal(false)}
            >
              <div
                className="modal-dialog modal-lg modal-dialog-centered"
                role="document"
                ref={modalDialogRef}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                <div className="modal-content border-0 shadow-lg position-relative pro-modal pro-card rounded-4">
                  <div className="pro-modal-shadow" aria-hidden="true" />
                  <div className="pro-topbar" aria-hidden="true" />

                  {/* Header */}
                  <div className="modal-header bg-transparent border-0 pb-0">
                    <div className="d-flex align-items-start gap-2">
                      <div
                        className="rounded-3 p-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}
                      >
                        <i className="bi bi-capsule-pill" />
                      </div>
                      <div className="min-w-0">
                        <h5
                          className="modal-title text-truncate"
                          id="proDetailsTitle"
                        >
                          {detailsDrug.drugName}
                        </h5>
                        <div className="d-flex align-items-center gap-2 mt-1 small">
                          <span className="badge text-bg-primary-subtle text-primary-emphasis">
                            {detailsDrug.drugClass}
                          </span>
                          <a
                            href={`https://ndclist.com/ndc/${padCode(
                              detailsDrug.ndcCode
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-primary text-decoration-none"
                          >
                            {padCode(detailsDrug.ndcCode)}
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-light btn-sm rounded-circle ms-auto"
                      aria-label="Close"
                      onClick={() => setShowDetailsModal(false)}
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
                            {pricePerUnit(
                              detailsDrug?.net ?? 0,
                              detailsDrug?.quantity ?? 1
                            )}
                          </div>
                        </div>
                        <div className="col text-end">
                          <div className="text-muted text-uppercase small fw-semibold">
                            Acquisition Cost
                          </div>
                          <div className="fs-5 fw-semibold text-primary">
                            {pricePerUnit(
                              detailsDrug?.acquisitionCost ?? 0,
                              detailsDrug?.quantity ?? 1
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pro-scroll pe-1">
                      {/* Details grid */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <div className="pro-soft rounded-3 p-3 h-100">
                            <div className="text-muted small">Branch</div>
                            <div className="fw-medium">
                              {detailsDrug?.branchName ?? "—"}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="pro-soft rounded-3 p-3 h-100">
                            <div className="text-muted small">Drug Class</div>
                            <div className="fw-medium">
                              {detailsDrug?.drugClass ?? "—"}
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

                      {/* Recommended Alternatives (kept as read-only hints) */}
                      <div className="mb-2">
                        <h6 className="mb-2 text-secondary d-flex align-items-center gap-2">
                          <i className="bi bi-journal-check" />
                          Recommended Alternatives
                        </h6>

                        <div className="d-flex flex-column gap-2">
                          {recommended.length === 0 && (
                            <div className="text-muted small">
                              No alternatives to show.
                            </div>
                          )}

                          {recommended.map((alt, index) => {
                            let rowClass = "";
                            if (index === 0) rowClass = "bg-success-subtle";
                            else if (index === 1)
                              rowClass = "bg-warning-subtle";

                            return (
                              <div
                                key={`${alt.ndcCode}-${index}`}
                                className={`text-reset text-decoration-none border rounded-3 p-3 ${rowClass}`}
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
                                      {pricePerUnit(
                                        alt.net ?? 0,
                                        alt.quantity ?? 1
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                        onClick={() => setShowDetailsModal(false)}
                        className="btn btn-outline-secondary"
                      >
                        Close
                      </button>

                      {(() => {
                        const isInCart = cartItems.some(
                          (i) =>
                            i.id ===
                            (detailsDrug.ndcCode ||
                              `${detailsDrug.drugId}-uniqueId`)
                        );

                        const handleAdd = () => {
                          const qty = detailsDrug?.quantity || 1;
                          const payload = {
                            id:
                              detailsDrug.ndcCode ||
                              `${detailsDrug.drugId}-uniqueId`,
                            name: detailsDrug.drugName || "Unnamed Drug",
                            ndc: padCode(detailsDrug.ndcCode),
                            acq: (detailsDrug.acquisitionCost ?? 0) / qty,
                            insurancePayment:
                              (detailsDrug.insurancePayment ?? 0) / qty,
                            patientPayment:
                              (detailsDrug.patientPayment ?? 0) / qty,
                            price: (detailsDrug.net ?? 0) / qty,
                            quantity: 1,
                            insurance:
                              (detailsDrug as any).rxgroup ||
                              (detailsDrug as any).insuranceName ||
                              "Unknown",
                          };

                          // Add via context
                          addToCart(payload);

                          // (Optional) keep stitching to orderRequestBody like before
                          const storedSearchLog =
                            localStorage.getItem("searchLogDetails");
                          if (storedSearchLog) {
                            const searchLog = JSON.parse(storedSearchLog);
                            const newOrderItem = {
                              drugNDC: detailsDrug.ndcCode,
                              netPrice: detailsDrug?.net ?? 0,
                              patientPay: detailsDrug?.patientPayment ?? 0,
                              insurancePay: detailsDrug?.insurancePayment ?? 0,
                              acquisitionCost:
                                detailsDrug?.acquisitionCost ?? 0,
                              additionalCost: 0,
                              insuranceRxId: detailsDrug?.rxgroupId ?? 0,
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

                          // Optional: open the cart panel/page immediately
                          try {
                            openCart();
                          } catch {}
                          setShowDetailsModal(false);
                        };

                        return isInCart ? (
                          <button className="btn btn-success" disabled>
                            <i className="bi bi-check2 me-1" />
                            Added
                          </button>
                        ) : (
                          <button
                            onClick={handleAdd}
                            className="btn btn-primary"
                          >
                            <i className="bi bi-plus-lg me-1" />
                            Add to Cart
                          </button>
                        );
                      })()}
                    </div>
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
