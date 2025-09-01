// src/pages/.../SecondDashBoard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { DrugTransaction } from "../../types";
import api from "../../api/publicApi"; // ← use the SAME client that works elsewhere

/* ─────────────────────────── configurable API bits ─────────────────────────── */
// Put your real endpoint here. Examples you might have:
//   "/reports/best-net-differences"
//   "/analytics/second-dashboard"
//   "/scriptitems/best-net"
const SECOND_DASHBOARD_ENDPOINT = "/analytics/second-dashboard";

// If your backend supports filters in query params (recommended), set to true.
// The component will then hit the API on every filter/sort/page change.
// If false, it loads once then filters client-side.
const USE_SERVER_FILTERS = false;

/* ─────────────────────────── utilities ─────────────────────────── */
const num = (v: any) => (v == null || v === "" ? 0 : Number(v));
const str = (v: any) => (v == null ? "" : String(v));
const toSafeDate = (d: any) => {
  if (!d) return new Date("Invalid");
  const s = typeof d === "string" ? d.replace(" ", "T") : d;
  return new Date(s);
};
const isValidDate = (d: any) => !isNaN(toSafeDate(d).getTime());
const monthKey = (d: any) => {
  const dt = toSafeDate(d);
  return isValidDate(dt) ? dt.toISOString().slice(0, 7) : "";
};
const formatDate = (d: any, locale = "en-US") => {
  const dt = toSafeDate(d);
  return isValidDate(dt) ? dt.toLocaleDateString(locale) : "-";
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n || 0);
const fmtInt = (n: number) => Math.round(n || 0).toLocaleString();

function useCountUp(value: number, duration = 1000) {
  const [display, setDisplay] = React.useState(0);
  const lastRef = React.useRef(0);

  React.useEffect(() => {
    const from = lastRef.current;
    const to = Number.isFinite(value) ? value : 0;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else lastRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

function KpiCard({
  title, value, iconClass, variant = "primary", isMoney = false, duration = 900,
}: {
  title: string;
  value: number;
  iconClass: string;
  variant?: "primary" | "danger" | "success" | "purple";
  isMoney?: boolean;
  duration?: number;
}) {
  const animated = useCountUp(value, duration);
  const bg =
    variant === "primary" ? "bg-primary" :
    variant === "danger"  ? "bg-danger"  :
    variant === "success" ? "bg-success" :
    "bg-purple";

  return (
    <div className="card pb-2 h-100">
      <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
        <div className="d-flex align-items-center overflow-hidden">
          <span className={`avatar ${bg} rounded-circle flex-shrink-0`}>
            <i className={`${iconClass} fs-20`} />
          </span>
          <div className="ms-2 overflow-hidden">
            <p className="mb-1 text-truncate">{title}</p>
            <h5 className="mb-0">{isMoney ? fmtCurrency(animated) : fmtInt(animated)}</h5>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── insurance labels map ─────────────────────────── */
const insurance_mapping: { [key: string]: string } = {
  AL: "Aetna (AL)", BW: "aetna (BW)", AD: "Aetna Medicare (AD)", AF: "Anthem BCBS (AF)",
  DS: "Blue Cross Blue Shield (DS)", CA: "blue shield medicare (CA)", FQ: "Capital Rx (FQ)",
  BF: "Caremark (BF)", ED: "CatalystRx (ED)", AM: "Cigna (AM)", BO: "Default Claim Format (BO)",
  AP: "Envision Rx Options (AP)", CG: "Express Scripts (CG)", BI: "Horizon (BI)",
  AJ: "Humana Medicare (AJ)", BP: "informedRx (BP)", AO: "MEDCO HEALTH (AO)",
  AC: "MEDCO MEDICARE PART D (AC)", AQ: "MEDGR (AQ)", CC: "MY HEALTH LA (CC)",
  AG: "Navitus Health Solutions (AG)", AH: "OptumRx (AH)", AS: "PACIFICARE LIFE AND H (AS)",
  FJ: "Paramount Rx (FJ)", "X ": "PF - DEFAULT (X )", EA: "Pharmacy Data Management (EA)",
  DW: "phcs (DW)", AX: "PINNACLE (AX)", BN: "Prescription Solutions (BN)",
  AA: "Tri-Care Express Scripts (AA)", AI: "United Healthcare (AI)",
};

/* ─────────────────────────── field normalization ─────────────────────────── */
function normalizeRow(r: any) {
  return {
    ...r,
    // tolerate server naming variants
    highestDrugNDC: r.highestDrugNDC ?? r.HighestDrugNDC ?? r.highstDrugNDC ?? r.HighestDrugNdc,
    highestDrugName: r.highestDrugName ?? r.HighestDrugName ?? r.highstDrugName,
    highestDrugId:   r.highestDrugId   ?? r.HighestDrugId   ?? r.highstDrugId,

    highestNet:              num(r.highestNet ?? r.HighestNet ?? r.highstNet),
    highestNetProfitPerItem: num(r.highestNetProfitPerItem ?? r.HighestNetPerItem ?? r.highstNetPerItem),

    highestBINCode:  r.highestBINCode  ?? r.HighestBINCode,
    highestBINName:  r.highestBINName  ?? r.HighestBINName,
    highestBinId:    r.highestBinId    ?? r.HighestBinId,
    highestPcnId:    r.highestPcnId    ?? r.HighestPcnId,
    highestPCNName:  r.highestPCNName  ?? r.HighestPCNName,
    highestRxGroupId:r.highestRxGroupId?? r.HighestRxGroupId,
    highestInsuranceRx: r.highestInsuranceRx ?? r.HighestInsuranceRx,

    // normalize numeric fields
    netProfit:        num(r.netProfit),
    netProfitPerItem: num(r.netProfitPerItem),
    acquisitionCost:  num(r.acquisitionCost),
    insurancePayment: num(r.insurancePayment),
    patientPayment:   num(r.patientPayment),

    insuranceRx: r.insuranceRx ?? r.insurance, // sometimes sent as insurance
  } as DrugTransaction & Record<string, any>;
}

/* ─────────────────────────── UI helpers ─────────────────────────── */
function FilterTile({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="col-xxl-4 col-xl-4 col-sm-6">
      <div className="d-flex justify-content-between align-items-center border rounded bg-light p-3">
        <h6 className="fw-semibold mb-0 fs-14">{label}</h6>
        <div className="ms-3" style={{ minWidth: 190 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────── component ─────────────────────────── */
const SecondDashBoard: React.FC = () => {
  const [rows, setRows] = useState<DrugTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [selectedPrescriber, setSelectedPrescriber] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // table/sort/pagination
  const [sortConfig, setSortConfig] = useState<{ key: keyof DrugTransaction; direction: "ascending" | "descending" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // KPI
  const [belowNetPriceCount, setBelowNetPriceCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNet, setTotalNet] = useState<number>(0);

  // NDC-match toggle (kept true to follow your requirement — can switch off in UI if needed)
  const [enforceNdcMatch, setEnforceNdcMatch] = useState(true);

  // Fetch function (client- or server-filtering)
  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      if (USE_SERVER_FILTERS) {
        const params: Record<string, string | number | undefined> = {
          month: selectedMonth || undefined,
          drugClass: selectedClass || undefined,
          insurance: selectedInsurance || undefined,
          prescriber: selectedPrescriber || undefined,
          user: selectedUser || undefined,
          branch: selectedBranch || undefined,
          sortKey: sortConfig?.key ? String(sortConfig.key) : undefined,
          sortDir: sortConfig?.direction,
          page: currentPage,
          pageSize: rowsPerPage,
          ndcMatch: enforceNdcMatch ? 1 : 0,
        };
        const { data } = await api.get<DrugTransaction[]>(SECOND_DASHBOARD_ENDPOINT, { params });
        setRows(Array.isArray(data) ? data.map(normalizeRow) : []);
      } else {
        // client-side filtering: load the (recent) dataset once
        const { data } = await api.get<DrugTransaction[]>(SECOND_DASHBOARD_ENDPOINT);
        setRows(Array.isArray(data) ? data.map(normalizeRow) : []);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setApiError("Unauthorized to fetch dashboard data (401/403). Make sure you’re logged in and using the authenticated axios client.");
      } else {
        setApiError("Failed to load dashboard data.");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch (and refetch when server-side filtering is enabled)
  useEffect(() => {
    if (USE_SERVER_FILTERS) {
      fetchData();
    } else {
      // fetch once, then filter client-side
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [
    // when using server filters, refetch on every control change:
    USE_SERVER_FILTERS ? selectedMonth : undefined,
    USE_SERVER_FILTERS ? selectedClass : undefined,
    USE_SERVER_FILTERS ? selectedInsurance : undefined,
    USE_SERVER_FILTERS ? selectedPrescriber : undefined,
    USE_SERVER_FILTERS ? selectedUser : undefined,
    USE_SERVER_FILTERS ? selectedBranch : undefined,
    USE_SERVER_FILTERS ? sortConfig : undefined,
    USE_SERVER_FILTERS ? currentPage : undefined,
    USE_SERVER_FILTERS ? enforceNdcMatch : undefined,
  ]);

  // normalize + (optionally) enforce ndcCode === highestDrugNDC
  const baseRows = useMemo(() => {
    const normalized = rows.map(normalizeRow);
    if (!enforceNdcMatch) return normalized;

    const matches = normalized.filter(
      (item: any) =>
        str(item.ndcCode).trim() !== "" &&
        str(item.highestDrugNDC).trim() !== "" &&
        str(item.ndcCode).trim() === str(item.highestDrugNDC).trim()
    );

    // In case API returns alt field names or sparse data, fall back to full set if no matches
    return matches.length > 0 ? matches : normalized;
  }, [rows, enforceNdcMatch]);

  // client-side sort + filters + KPIs
  const filteredData = useMemo(() => {
    let data = [...baseRows];

    // sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      data.sort((a, b) => {
        const va = (a as any)[key], vb = (b as any)[key];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return direction === "ascending" ? -1 : 1;
        if (va > vb) return direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    // filters
    data = data.filter((item: any) => {
      const itemMonth = monthKey(item.date);
      return (
        (!selectedClass || item.drugClass === selectedClass) &&
        (!selectedInsurance || item.insuranceRx === selectedInsurance) &&
        (!selectedPrescriber || item.prescriber === selectedPrescriber) &&
        (!selectedUser || item.user === selectedUser) &&
        (!selectedBranch || item.branchCode === selectedBranch) &&
        (!selectedMonth || itemMonth === selectedMonth)
      );
    });

    // KPIs
    const below = data.filter((it: any) => num(it.netProfit) < num(it.highestNet)).length;
    const totalRev = data.reduce((s: number, it: any) => s + num(it.netProfit), 0);
    const totalDev = data.reduce((s: number, it: any) => s + (num(it.highestNet) - num(it.netProfit)), 0);

    setBelowNetPriceCount(below);
    setTotalRevenue(+totalRev.toFixed(2));
    setTotalNet(+totalDev.toFixed(2));

    return data;
  }, [
    baseRows,
    sortConfig,
    selectedClass,
    selectedInsurance,
    selectedPrescriber,
    selectedUser,
    selectedBranch,
    selectedMonth,
  ]);

  // pagination (client-side)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const currentRecords = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  useEffect(() => setCurrentPage(1), [selectedClass, selectedInsurance, selectedPrescriber, selectedUser, selectedBranch, selectedMonth, enforceNdcMatch]);

  const requestSort = (key: keyof DrugTransaction) =>
    setSortConfig((prev) =>
      !prev || prev.key !== key
        ? { key, direction: "ascending" }
        : { key, direction: prev.direction === "ascending" ? "descending" : "ascending" }
    );

  // options for filter selects
  const months = useMemo(
    () => Array.from(new Set(baseRows.map((i: any) => monthKey(i.date)))).sort().map(m => ({ value: m, label: m || "—" })),
    [baseRows]
  );
  const classesOpts    = useMemo(() => [...new Set(baseRows.map((i: any) => i.drugClass))].sort().map(x => ({ value: String(x), label: String(x) })), [baseRows]);
  const insurancesOpts = useMemo(() => [...new Set(baseRows.map((i: any) => i.insuranceRx))].sort().map(ins => ({
    value: String(ins), label: String(ins) === "  " ? "MARCOG" : (insurance_mapping[String(ins)] || String(ins)),
  })), [baseRows]);
  const prescribersOpts= useMemo(() => [...new Set(baseRows.map((i: any) => i.prescriber))].sort().map(x => ({ value: String(x), label: String(x) })), [baseRows]);
  const usersOpts      = useMemo(() => [...new Set(baseRows.map((i: any) => i.user))].sort().map(x => ({ value: String(x), label: String(x) })), [baseRows]);
  const branchesOpts   = useMemo(() => [...new Set(baseRows.map((i: any) => i.branchCode))].sort().map(x => ({ value: String(x), label: String(x) })), [baseRows]);

  const resetFilters = () => {
    setSelectedMonth(""); setSelectedClass(""); setSelectedInsurance("");
    setSelectedPrescriber(""); setSelectedUser(""); setSelectedBranch("");
  };

  const downloadCSV = () => {
    const headers = [
      "Date","Script","Insurance","Drug Class","Drug Name","NDC Code","Patient Payment","ACQ",
      "Insurance Payment","Prescriber","Net Profit","Highest Net","Difference","Highest NDC","Highest Drug",
    ];
    const rowsCsv = filteredData.map((item: any) => [
      new Date(item.date).toLocaleDateString("en-US"),
      item.scriptCode, item.insuranceRx, item.drugClass, item.drugName, item.ndcCode,
      item.patientPayment, item.acquisitionCost, item.insurancePayment,
      String(item.prescriber || "").replace(/[.,]/g, "").replace(/\s+/g, " ").trim(),
      num(item.netProfit).toFixed(2),
      num(item.highestNet),
      (num(item.highestNet) - num(item.netProfit)).toFixed(2),
      item.highestDrugNDC,
      item.highestDrugName,
    ]);
    const csv = [headers.join(","), ...rowsCsv.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <motion.div>
      <div className="page-wrapper" id="main-content">
        <div className="content">
          <h3 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-4 text-center">
            Estimated Best Net Differences
          </h3>

          {/* KPI row */}
          <div className="row g-3 mb-4">
            <div className="col-xl-3 col-md-6 d-flex"><KpiCard title="Total Scripts" value={filteredData.length} iconClass="ti ti-pill" variant="primary" /></div>
            <div className="col-xl-3 col-md-6 d-flex"><KpiCard title="Total Prescriptions with Deviation" value={belowNetPriceCount} iconClass="ti ti-alert-triangle" variant="danger" duration={1100} /></div>
            <div className="col-xl-3 col-md-6 d-flex"><KpiCard title="Total Deviation" value={totalNet} iconClass="ti ti-chart-line" variant="success" isMoney duration={1200} /></div>
            <div className="col-xl-3 col-md-6 d-flex"><KpiCard title="Total Revenue from Matching Scripts" value={totalRevenue} iconClass="ti ti-chart-bar" variant="purple" isMoney duration={1200} /></div>
          </div>

          {/* Filters */}
          <div className="card mb-3">
            <div className="card-header border-0 pb-1">
              <h5 className="mb-0 pt-2">Filters</h5>
            </div>
            <div className="card-body">
              {apiError && (
                <div className="alert alert-warning mb-3">
                  <i className="ti ti-alert-triangle me-2" />
                  {apiError}
                </div>
              )}

              <div className="row row-gap-4">
                <FilterTile label="Month">
                  <select className="form-select form-select-sm" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="">All</option>
                    {months.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterTile>

                <FilterTile label="Drug Class">
                  <select className="form-select form-select-sm" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="">All</option>
                    {classesOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterTile>

                <FilterTile label="Insurance / Rx Group">
                  <select className="form-select form-select-sm" value={selectedInsurance} onChange={(e) => setSelectedInsurance(e.target.value)}>
                    <option value="">All</option>
                    {insurancesOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterTile>

                <FilterTile label="Prescriber">
                  <select className="form-select form-select-sm" value={selectedPrescriber} onChange={(e) => setSelectedPrescriber(e.target.value)}>
                    <option value="">All</option>
                    {prescribersOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterTile>

                <FilterTile label="User">
                  <select className="form-select form-select-sm" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">All</option>
                    {usersOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterTile>

                <FilterTile label="Branch">
                  <select className="form-select form-select-sm" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                    <option value="">All</option>
                    {branchesOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterTile>

                <FilterTile label="Match NDC = Highest NDC">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={enforceNdcMatch} onChange={(e) => setEnforceNdcMatch(e.target.checked)} />
                  </div>
                </FilterTile>
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 border-top mt-4 pt-3">
                <button type="button" className="btn btn-outline-light me-2" onClick={() => {
                  setSelectedMonth(""); setSelectedClass(""); setSelectedInsurance("");
                  setSelectedPrescriber(""); setSelectedUser(""); setSelectedBranch("");
                }}>
                  Reset
                </button>
                <button type="button" className="btn btn-primary" onClick={downloadCSV}>
                  <i className="ti ti-cloud-download me-1" /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card mb-0">
            <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <h5 className="d-inline-flex align-items-center mb-0">
                Matching Scripts <span className="badge bg-danger ms-2">{filteredData.length}</span>
              </h5>

              <div className="d-flex align-items-center gap-2">
                <button type="button" className="btn btn-icon btn-white" title="Refresh" onClick={fetchData} disabled={loading}>
                  <i className={`ti ${loading ? "ti-loader" : "ti-refresh"}`} />
                </button>
                <button type="button" className="btn btn-icon btn-white" title="Print" onClick={() => window.print()}>
                  <i className="ti ti-printer" />
                </button>
                <button type="button" className="btn btn-icon btn-white" title="Download" onClick={downloadCSV}>
                  <i className="ti ti-cloud-download" />
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive table-nowrap">
                <table className="table mb-0 border align-middle">
                  <thead className="table-light">
                    <tr>
                      {[
                        { label: "Date", key: "date" as keyof DrugTransaction },
                        { label: "Script Code", key: "scriptCode" as keyof DrugTransaction },
                        { label: "Branch Name", key: "branchCode" as keyof DrugTransaction },
                        { label: "Rx Group", key: "insuranceRx" as keyof DrugTransaction },
                        { label: "BIN", key: "binCode" as keyof DrugTransaction },
                        { label: "PCN", key: "pcnName" as keyof DrugTransaction },
                        { label: "Drug Class", key: "drugClass" as keyof DrugTransaction },
                        { label: "Drug Name", key: "drugName" as keyof DrugTransaction },
                        { label: "NDC Code", key: "ndcCode" as keyof DrugTransaction },
                        { label: "User", key: "user" as keyof DrugTransaction },
                        { label: "Patient Payment", key: "patientPayment" as keyof DrugTransaction, align: "end" },
                        { label: "ACQ", key: "acquisitionCost" as keyof DrugTransaction, align: "end" },
                        { label: "Insurance Payment", key: "insurancePayment" as keyof DrugTransaction, align: "end" },
                        { label: "Prescriber", key: "prescriber" as keyof DrugTransaction },
                        { label: "Quantity", key: "quantity" as keyof DrugTransaction, align: "end" },
                        { label: "Net Profit / Item", key: "netProfitPerItem" as keyof DrugTransaction, align: "end" },
                        { label: "Total Net Profit", key: "netProfit" as keyof DrugTransaction, align: "end" },
                        { label: "Highest Net / Item", key: "highestNetProfitPerItem" as keyof DrugTransaction, align: "end" },
                        { label: "Total Highest Net", key: "highestNet" as keyof DrugTransaction, align: "end" },
                        { label: "Diff", key: "difference" as keyof DrugTransaction, align: "end" },
                        { label: "Diff / Item", key: "DifferencePerItem" as keyof DrugTransaction, align: "end" },
                        { label: "Highest Drug NDC", key: "highestDrugNDC" as keyof DrugTransaction },
                        { label: "Highest Drug Name", key: "highestDrugName" as keyof DrugTransaction },
                        { label: "Highest Script Code", key: "highestScriptCode" as keyof DrugTransaction },
                        { label: "Highest Qty", key: "highestQuantity" as keyof DrugTransaction, align: "end" },
                        { label: "Highest Rx Group", key: "highestInsuranceRx" as keyof DrugTransaction },
                        { label: "Highest BIN", key: "highestBINCode" as keyof DrugTransaction },
                        { label: "Highest PCN", key: "highestPCNName" as keyof DrugTransaction },
                        { label: "Highest Script Date", key: "highestScriptDate" as keyof DrugTransaction },
                      ].map(({ label, key, align }) => (
                        <th
                          key={String(key)}
                          className={`text-nowrap ${align === "end" ? "text-end" : ""}`}
                          onClick={() => requestSort(key)}
                          role="button"
                          title="Sort"
                        >
                          <span className="d-inline-flex align-items-center gap-1">
                            {label} <i className="ti ti-arrows-sort text-muted" />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {currentRecords.map((item: any, index) => {
                      const diff = num(item.highestNet) - num(item.netProfit);
                      const diffPer = num(item.highestNetProfitPerItem) - num(item.netProfitPerItem);

                      return (
                        <tr key={index}>
                          <td className="text-nowrap">{formatDate(item.date)}</td>
                          <td>
                            <a href={`/scriptitems/${item.scriptCode}`} className="link-primary fw-semibold">
                              {item.scriptCode}
                            </a>
                          </td>
                          <td>{item.branchCode}</td>

                          <td className="text-nowrap">
                            <a href={`/InsuranceDetails/${item.rxGroupId}`} target="_blank" rel="noreferrer" className="link-primary">
                              {item.insuranceRx || "NA"}
                            </a>
                          </td>

                          <td className="text-nowrap">
                            <a href={`/InsuranceBINDetails/${item.binId}`} target="_blank" rel="noreferrer" className="link-primary">
                              {(item.binName ? `${item.binName} - ` : "") + (item.binCode || "NA")}
                            </a>
                          </td>

                          <td className="text-nowrap">
                            <a href={`/InsurancePCNDetails/${item.pcnId}`} target="_blank" rel="noreferrer" className="link-primary">
                              {item.pcnName || "NA"}
                            </a>
                          </td>

                          <td>{item.drugClass}</td>

                          <td className="text-nowrap">
                            <a
                              href={`/drug/${item.drugId}?ndc=${item.ndcCode}&insuranceId=${item.insuranceId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="link-primary"
                            >
                              {item.drugName}
                            </a>
                          </td>

                          <td className="text-nowrap">
                            <a href={`https://ndclist.com/ndc/${item.ndcCode}`} target="_blank" rel="noreferrer" className="link-primary">
                              {item.ndcCode}
                            </a>
                          </td>

                          <td>{item.user}</td>

                          <td className="text-end">{item.patientPayment}</td>
                          <td className="text-end">{item.acquisitionCost}</td>
                          <td className="text-end">{item.insurancePayment}</td>
                          <td>{String(item.prescriber || "").replace(/[.,]/g, "").replace(/\s+/g, " ").trim()}</td>
                          <td className="text-end">{item.quantity}</td>

                          <td className="text-end">{num(item.netProfitPerItem).toFixed(3)}</td>
                          <td className="text-end">{num(item.netProfit).toFixed(3)}</td>
                          <td className="text-end">{num(item.highestNetProfitPerItem).toFixed(3)}</td>
                          <td className="text-end">{num(item.highestNet).toFixed(3)}</td>

                          <td className={`text-end ${diff > 0 ? "text-danger" : "text-muted"}`}>{diff.toFixed(3)}</td>
                          <td className={`text-end ${diffPer > 0 ? "text-danger" : "text-muted"}`}>{diffPer.toFixed(3)}</td>

                          <td className="text-nowrap">
                            <a href={`https://ndclist.com/ndc/${item.highestDrugNDC}`} target="_blank" rel="noreferrer" className="link-primary fw-semibold">
                              {item.highestDrugNDC}
                            </a>
                          </td>

                          <td className="text-nowrap">
                            <a
                              href={`/drug/${item.highestDrugId}?ndc=${item.highestDrugNDC}&insuranceId=${item.insuranceId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="link-primary fw-semibold"
                            >
                              {item.highestDrugName}
                            </a>
                          </td>

                          <td className="text-nowrap">
                            <a href={`/scriptitems/${item.highestScriptCode}`} target="_blank" rel="noreferrer" className="link-primary">
                              {item.highestScriptCode || "NA"}
                            </a>
                          </td>

                          <td className="text-end">{item.highestQuantity ?? "NA"}</td>

                          <td className="text-nowrap">
                            {item.highestRxGroupId ? (
                              <a href={`/InsuranceDetails/${item.highestRxGroupId}`} target="_blank" rel="noreferrer" className="link-primary">
                                {item.highestInsuranceRx}
                              </a>
                            ) : (
                              item.highestInsuranceRx || "NA"
                            )}
                          </td>

                          <td className="text-nowrap">
                            {item.highestBinId ? (
                              <a href={`/InsuranceBINDetails/${item.highestBinId}`} target="_blank" rel="noreferrer" className="link-primary">
                                {(item.highestBINName ? `${item.highestBINName} - ` : "") + (item.highestBINCode || "NA")}
                              </a>
                            ) : (
                              item.highestBINCode || "NA"
                            )}
                          </td>

                          <td className="text-nowrap">
                            {item.highestPcnId ? (
                              <a href={`/InsurancePCNDetails/${item.highestPcnId}`} target="_blank" rel="noreferrer" className="link-primary">
                                {item.highestPCNName}
                              </a>
                            ) : (
                              item.highestPCNName || "NA"
                            )}
                          </td>

                          <td className="text-nowrap">{formatDate(item.highestScriptDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex align-items-center justify-content-between mt-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline-light d-inline-flex align-items-center"
                >
                  <ChevronLeft className="me-1" size={16} /> Previous
                </button>
                <span className="text-muted">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline-light d-inline-flex align-items-center"
                >
                  Next <ChevronRight className="ms-1" size={16} />
                </button>
              </div>

              {loading && (
                <div className="text-center text-muted mt-3">
                  <i className="ti ti-loader me-1" /> Loading…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecondDashBoard;
