// src/pages/Dashboard.tsx  (Dashboard 1 / FirstDashboard)
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DrugTransaction } from "../../types";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";
import { loadConfig } from "../../BaseUrlLoader";

await loadConfig();

/* ---------- tiny utils ---------- */
const toSafeDate = (d: any) => new Date(typeof d === "string" ? d.replace(" ", "T") : d);
const isValidDate = (d: any) => !isNaN(toSafeDate(d).getTime());
const monthKey = (d: any) => (isValidDate(d) ? toSafeDate(d).toISOString().slice(0, 7) : "");
const formatDate = (d: any, locale = "en-US") => {
  const dt = toSafeDate(d);
  return isValidDate(dt) ? dt.toLocaleDateString(locale) : "-";
};
const num = (n?: number) => (Number.isFinite(n as number) ? (n as number) : 0);
const fmt = (n?: number, digits = 3) => num(n).toFixed(digits);

const insurance_mapping: Record<string, string> = {
  AL:"Aetna (AL)", BW:"aetna (BW)", AD:"Aetna Medicare (AD)", AF:"Anthem BCBS (AF)",
  DS:"Blue Cross Blue Shield (DS)", CA:"blue shield medicare (CA)", FQ:"Capital Rx (FQ)",
  BF:"Caremark (BF)", ED:"CatalystRx (ED)", AM:"Cigna (AM)", BO:"Default Claim Format (BO)",
  AP:"Envision Rx Options (AP)", CG:"Express Scripts (CG)", BI:"Horizon (BI)",
  AJ:"Humana Medicare (AJ)", BP:"informedRx (BP)", AO:"MEDCO HEALTH (AO)",
  AC:"MEDCO MEDICARE PART D (AC)", AQ:"MEDGR (AQ)", CC:"MY HEALTH LA (CC)",
  AG:"Navitus Health Solutions (AG)", AH:"OptumRx (AH)", AS:"PACIFICARE LIFE AND H (AS)",
  FJ:"Paramount Rx (FJ)", "X ":"PF - DEFAULT (X )", EA:"Pharmacy Data Management (EA)",
  DW:"phcs (DW)", AX:"PINNACLE (AX)", BN:"Prescription Solutions (BN)",
  AA:"Tri-Care Express Scripts (AA)", AI:"United Healthcare (AI)",
};

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

/* ---------- animated KPI helpers (UI only) ---------- */
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
function useCountUp(target: number, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(p);
      const current = from + (target - from) * eased;
      setValue(+current.toFixed(decimals));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals]);
  return value;
}

function formatNumber(n: number, decimals = 0) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
type StatProps = {
  title: string;
  value: number;
  prefix?: string;
  decimals?: number;
  icon: string;     // Tabler icon class e.g. "ti-cash"
  accent: "primary" | "danger" | "success" | "warning";
  colClass?: string; // responsive column class
};
const StatCard: React.FC<StatProps> = ({ title, value, prefix = "", decimals = 0, icon, accent, colClass }) => {
  const val = useCountUp(value, 900, decimals);
  return (
    <motion.div
      className={`${colClass || "col-xxl-3 col-lg-3 col-md-6"} d-flex`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
    >
      <div className="card stat-card border-0 shadow-sm w-100">
        <div className={`stat-accent bg-${accent}`} />
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="pe-3">
              <p className="text-muted text-uppercase fw-semibold mb-2 small">{title}</p>
              <h3 className="fw-bold mb-0">
                {prefix}{formatNumber(val, decimals)}
              </h3>
            </div>
            <div className={`stat-icon text-${accent}`}>
              <i className={`ti ${icon}`} />
            </div>
          </div>
          <div className="stat-divider my-3" />
          <div className="small text-muted">Updated by current filters</div>
        </div>
      </div>
    </motion.div>
  );
};

interface Props { data?: DrugTransaction[]; }

const FirstDashboard: React.FC<Props> = ({ data }) => {
  // ===== fetch (only if data not provided) =====
  const [serverData, setServerData] = useState<DrugTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);
  const [matchOn, setMatchOn] = useState<"BIN" | "PCN" | "RX">("BIN");
  const classVersion = (localStorage.getItem("classType") || "ClassVersion1");

  useEffect(() => {
    if (data && data.length) { setLoading(false); setError(null); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setError(null);
        localStorage.removeItem("selectedRx");
        localStorage.removeItem("selectedPcn");
        localStorage.removeItem("selectedBin");
        const pageSize = 600;
        let page = 1;
        let all: DrugTransaction[] = [];
        while (!cancelled) {
          const res = await axiosInstance.get<DrugTransaction[]>(
            "/drug/GetAllLatestScriptsPaginated",
            { params: { pageNumber: page, pageSize, classVersion, matchOn } }
          );
          const pageData = Array.isArray(res.data) ? res.data : [];
          all = all.concat(pageData);
          setServerData([...all]);
          if (pageData.length < pageSize) break;
          page += 1;
        }
        if (!cancelled) setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.message || "Failed to load data.");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [matchOn, classVersion, data]);

  // pick the live array
  const rows = useMemo<DrugTransaction[]>(
    () => (data && data.length ? data : serverData),
    [data, serverData]
  );

  // ===== state for filters / table =====
  const [latestScripts, setLatestScripts] = useState<DrugTransaction[]>(rows);
  const [filteredData, setFilteredData] = useState<DrugTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DrugTransaction; direction: "ascending" | "descending" } | null>(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [selectedPrescriber, setSelectedPrescriber] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [belowNetPriceCount, setBelowNetPriceCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNet, setTotalNet] = useState<number>(0);
  const [kpiLayout, setKpiLayout] = useState<"row" | "grid">(
    (localStorage.getItem("kpiLayout") as "row" | "grid") || "row"
  );
  const rowsPerPage = 10;

  useEffect(() => { setLatestScripts(rows); }, [rows]);

  // options
  const months = useMemo(
    () => Array.from(new Set(latestScripts.map((i) => monthKey((i as any).date))))
            .filter(Boolean).sort().map((m) => ({ value: m, label: m })),
    [latestScripts]
  );
  const classesOpts    = useMemo(() => [...new Set(latestScripts.map(i => i.drugClass))].filter(Boolean).sort().map(x => ({ value: String(x), label: String(x) })), [latestScripts]);
  const insurancesOpts = useMemo(() => [...new Set(latestScripts.map(i => i.insuranceRx))].filter(Boolean).sort().map(ins => ({ value: String(ins), label: insurance_mapping[String(ins)] || String(ins) })), [latestScripts]);
  const prescribersOpts= useMemo(() => [...new Set(latestScripts.map(i => i.prescriber))].filter(Boolean).sort().map(x => ({ value: String(x), label: String(x) })), [latestScripts]);
  const usersOpts      = useMemo(() => [...new Set(latestScripts.map(i => i.user))].filter(Boolean).sort().map(x => ({ value: String(x), label: String(x) })), [latestScripts]);
  const branchesOpts   = useMemo(() => [...new Set(latestScripts.map(i => i.branchCode))].filter(Boolean).sort().map(x => ({ value: String(x), label: String(x) })), [latestScripts]);

  // filter + sort + KPIs
  useEffect(() => {
    let sorted = [...latestScripts];
    if (sortConfig) {
      const { key, direction } = sortConfig;
      sorted.sort((a, b) => {
        const va = (a as any)[key]; const vb = (b as any)[key];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return direction === "ascending" ? -1 : 1;
        if (va > vb) return direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    const filtered = sorted.filter((i) => {
      const m = monthKey((i as any).date);
      return (
        (!selectedClass || i.drugClass === selectedClass) &&
        (!selectedInsurance || i.insuranceRx === selectedInsurance) &&
        (!selectedPrescriber || i.prescriber === selectedPrescriber) &&
        (!selectedUser || i.user === selectedUser) &&
        (!selectedBranch || i.branchCode === selectedBranch) &&
        (!selectedMonth || m === selectedMonth)
      );
    });

    setFilteredData(filtered);

    const below = filtered.filter(i => num(i.netProfit) < num(i.highestNet)).length;
    const totalRev  = filtered.reduce((s, i) => s + num(i.netProfit), 0);
    const totalBest = filtered.reduce((s, i) => s + num(i.highestNet), 0);
    const sameDrugPenalty = filtered.reduce(
      (s, i) => s + (i.highestDrugNDC === i.ndcCode ? (num(i.highestNet) - num(i.netProfit)) : 0),
      0
    );
    setBelowNetPriceCount(below);
    setTotalRevenue(+totalRev.toFixed(2));
    setTotalNet(+(totalBest - sameDrugPenalty).toFixed(2));
    setCurrentPage(1);
  }, [
    latestScripts, sortConfig,
    selectedClass, selectedInsurance, selectedPrescriber, selectedUser, selectedBranch, selectedMonth,
  ]);

  const requestSort = (key: keyof DrugTransaction) =>
    setSortConfig((prev) =>
      !prev || prev.key !== key
        ? { key, direction: "ascending" }
        : { key, direction: prev.direction === "ascending" ? "descending" : "ascending" }
    );

  const normalizeName = (name: string) =>
    (name || "")
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
      .replace(/[.,]/g, "");

  const downloadCSV = () => {
    const headers = ["Date","Script","Insurance","Drug Class","Drug Name","NDC Code","Patient Payment","ACQ","Insurance Payment","Prescriber","Net Profit","Highest Net","Difference","Highest NDC","Highest Drug"];
    const rows = filteredData.map((i) => [
      formatDate((i as any).date), i.scriptCode, i.insuranceRx, i.drugClass, i.drugName, i.ndcCode,
      num(i.patientPayment), num(i.acquisitionCost), num(i.insurancePayment),
      normalizeName(String(i.prescriber || "")),
      num(i.netProfit).toFixed(2), num(i.highestNet).toFixed(2),
      (num(i.highestNet) - num(i.netProfit)).toFixed(2),
      i.highestDrugNDC, i.highestDrugName,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSelectedMonth(""); setSelectedClass(""); setSelectedInsurance("");
    setSelectedPrescriber(""); setSelectedUser(""); setSelectedBranch("");
  };

  const sortIcon = (k: keyof DrugTransaction) => {
    if (!sortConfig || sortConfig.key !== k) return "ti ti-arrows-sort text-muted";
    return sortConfig.direction === "ascending" ? "ti ti-arrow-up" : "ti ti-arrow-down";
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / 10));
  const currentRecords = filteredData.slice((currentPage - 1) * 10, currentPage * 10);

  // responsive class for KPI columns (preserve your toggle behavior)
  const kpiCol = kpiLayout === "grid" ? "col-xl-6 col-md-6" : "col-xl-3 col-md-6";

  return (
    <motion.div>
      {/* lightweight CSS for the KPI cards */}
      <style>
        {`
          .stat-card {
            position: relative;
            border-radius: 1rem;
            overflow: hidden;
            background:
              radial-gradient(1200px 1200px at -10% -20%, rgba(0,0,0,0.03), transparent 40%),
              var(--bs-card-bg, #fff);
          }
          .stat-accent {
            position: absolute;
            inset: 0 0 auto 0;
            height: 4px;
            opacity: 0.9;
          }
          .stat-icon {
            width: 44px;
            height: 44px;
            display: grid;
            place-items: center;
            border-radius: 12px;
            font-size: 22px;
            background: rgba(0, 0, 0, 0.04);
          }
          @media (prefers-color-scheme: dark) {
            .stat-icon { background: rgba(255,255,255,0.06); }
          }
          .stat-divider {
            border-bottom: 1px dashed rgba(0,0,0,0.18);
          }
            .filter{
            margin-left:555px;
            }

            /* === keep dashboard flush-left regardless of sidebar state === */
#main-content {
  margin-left: 0 !important;          /* kill any template margin */
  width: 100% !important;
  max-width: 100% !important;
}

/* Some templates add the margin to .page-wrapper specifically — neutralize it */
.page-wrapper {
  margin-left: 0 !important;
}

/* If your sidebar is a drawer, make it overlay instead of pushing content */
.app-sidebar, .sidebar, .nav-left {
  position: fixed;        /* sits over content */
  inset: 0 auto 0 0;      /* top:0; left:0; bottom:0 */
  width: 260px;           /* your sidebar width */
  transform: translateX(-100%);   /* hidden by default */
  transition: transform .25s ease;
  z-index: 1040;
}
/* When you open the sidebar, toggle a class on <body> like body.sidebar-open */
body.sidebar-open .app-sidebar,
body.sidebar-open .sidebar,
body.sidebar-open .nav-left {
  transform: translateX(0);
}

/* Optional backdrop for overlay UX */
.sidebar-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.2);
  opacity: 0; pointer-events: none;
  transition: opacity .2s ease;
  z-index: 1035;
}
body.sidebar-open .sidebar-backdrop {
  opacity: 1; pointer-events: auto;
}

/* Make sure content isn’t accidentally shifted by container constraints */
#main-content .content { max-width: 100%; }

        `}
      </style>

<div id="main-content" className="container-fluid px-3">
        <div className="content">
          {/* ===== matchOn like MainDashboard ===== */}
         
 {/* ===== matchOn like MainDashboard ===== */}
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
  <label className="fw-semibold text-primary mb-0" htmlFor="matchOn">Match On:</label>
  <select
    id="matchOn"
    value={matchOn}
    onChange={(e) => setMatchOn(e.target.value as "BIN" | "PCN" | "RX")}
    className="form-select form-select-sm w-auto border-primary"
  >
    <option value="BIN">BIN</option>
    <option value="PCN">PCN</option>
    <option value="RX">RxGroup</option>
  </select>
</div>
          <h3 className="text-4xl fw-bolder text-primary mb-4 text-center">All Scripts Audits Dashboard</h3>
 

          {/* Loading / Error */}
          {loading && <p className="text-center text-muted">Loading data…</p>}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* KPIs */}
          {!loading && !error && (
            <>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small">Overview</span>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-light ${kpiLayout === "row" ? "active" : ""}`}
                    onClick={() => { setKpiLayout("row"); localStorage.setItem("kpiLayout","row"); }}
                    title="Row layout"
                  >
                    <i className="ti ti-layout-navbar" />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-light ${kpiLayout === "grid" ? "active" : ""}`}
                    onClick={() => { setKpiLayout("grid"); localStorage.setItem("kpiLayout","grid"); }}
                    title="Grid layout"
                  >
                    <i className="ti ti-layout-grid" />
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <StatCard
                  title="Total Prescriptions"
                  value={filteredData.length}
                  icon="ti-pill"
                  accent="primary"
                  colClass={kpiCol}
                />
                <StatCard
                  title="Below Optimal Net Profit"
                  value={belowNetPriceCount}
                  icon="ti-trending-down"
                  accent="danger"
                  colClass={kpiCol}
                />
                <StatCard
                  title="Estimated Max. Net Profit"
                  value={totalNet}
                  decimals={2}
                  prefix="$"
                  icon="ti-cash"
                  accent="success"
                  colClass={kpiCol}
                />
                <StatCard
                  title="Current Total Net Profit"
                  value={totalRevenue}
                  decimals={2}
                  prefix="$"
                  icon="ti-chart-bar"
                  accent="warning"
                  colClass={kpiCol}
                />
              </div>

              {/* Filters */}
              <div className="card mb-3">
                <div className="card-header border-0 pb-1"><h5 className="mb-0 pt-2">Filters</h5></div>
                <div className="card-body">
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
                  </div>

                  <div className="d-flex align-items-center justify-content-end gap-2 border-top mt-4 pt-3">
                    <button type="button" className="btn btn-outline-light me-2" onClick={resetFilters}>Reset</button>
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
                    All Scripts <span className="badge bg-danger ms-2">{filteredData.length}</span>
                  </h5>
                </div>

                <div className="card-body">
                  <div className="table-responsive table-nowrap">
                    <table className="table mb-0 border align-middle">
                      <thead className="table-light">
                        <tr>
                          {[
                            { label: "Date", key: "date" as keyof DrugTransaction },
                            { label: "Script Code", key: "scriptCode" },
                            { label: "Branch Name", key: "branchCode" },
                            { label: "Rx Group", key: "insuranceRx" },
                            { label: "BIN", key: "binCode" },
                            { label: "PCN", key: "pcnName" },
                            { label: "Drug Class", key: "drugClass" },
                            { label: "Drug Name", key: "drugName" },
                            { label: "NDC Code", key: "ndcCode" },
                            { label: "User", key: "user" },
                            { label: "Patient Payment", key: "patientPayment", align: "end" },
                            { label: "ACQ", key: "acquisitionCost", align: "end" },
                            { label: "Insurance Payment", key: "insurancePayment", align: "end" },
                            { label: "Prescriber", key: "prescriber" },
                            { label: "Quantity", key: "quantity", align: "end" },
                            { label: "Net Profit / Item", key: "netProfitPerItem", align: "end" },
                            { label: "Total Net Profit", key: "netProfit", align: "end" },
                            { label: "Highest Net / Item", key: "highestNetProfitPerItem", align: "end" },
                            { label: "Total Highest Net", key: "highestNet", align: "end" },
                            { label: "Diff", key: "difference", align: "end" },
                            { label: "Diff / Item", key: "DifferencePerItem", align: "end" },
                            { label: "Highest Drug NDC", key: "highestDrugNDC" },
                            { label: "Highest Drug Name", key: "highestDrugName" },
                            { label: "Highest Script Code", key: "highestScriptCode" },
                            { label: "Highest Qty", key: "highestQuantity", align: "end" },
                            { label: "Highest Rx Group", key: "highestInsuranceRx" },
                            { label: "Highest BIN", key: "highestBINCode" },
                            { label: "Highest PCN", key: "highestPCNName" },
                            { label: "Highest Script Date", key: "highestScriptDate" },
                          ].map(({ label, key, align }) => (
                            <th
                              key={key }
                              className={`text-nowrap ${align === "end" ? "text-end" : ""}`}
                              onClick={() => requestSort(key)}
                              role="button"
                              title="Sort"
                            >
                              <span className="d-inline-flex align-items-center gap-1">
                                {label} <i className={sortIcon(key)} />
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {currentRecords.map((item, index) => {
                          const diff = num(item.highestNet) - num(item.netProfit);
                          const diffPer = num(item.highestNetProfitPerItem) - num(item.netProfitPerItem);
                          return (
                            <tr key={index}>
                              <td className="text-nowrap">{formatDate((item as any).date)}</td>
                              <td><a href={`/scriptitems/${item.scriptCode}`} className="link-primary fw-semibold">{item.scriptCode}</a></td>
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
                                <a href={`/drug/${item.drugId}?ndc=${item.ndcCode}&insuranceId=${item.insuranceId}`} target="_blank" rel="noreferrer" className="link-primary">
                                  {item.drugName}
                                </a>
                              </td>
                              <td className="text-nowrap">
                                <a href={`https://ndclist.com/ndc/${item.ndcCode}`} target="_blank" rel="noreferrer" className="link-primary">
                                  {item.ndcCode}
                                </a>
                              </td>
                              <td>{item.user}</td>
                              <td className="text-end">{num(item.patientPayment)}</td>
                              <td className="text-end">{num(item.acquisitionCost)}</td>
                              <td className="text-end">{num(item.insurancePayment)}</td>
                              <td>{normalizeName(String(item.prescriber || ""))}</td>
                              <td className="text-end">{num(item.quantity)}</td>
                              <td className="text-end">{fmt(item.netProfitPerItem)}</td>
                              <td className="text-end">{fmt(item.netProfit)}</td>
                              <td className="text-end">{fmt(item.highestNetProfitPerItem)}</td>
                              <td className="text-end">{fmt(item.highestNet)}</td>
                              <td className={`text-end ${diff > 0 ? "text-danger" : "text-muted"}`}>{fmt(diff)}</td>
                              <td className={`text-end ${diffPer > 0 ? "text-danger" : "text-muted"}`}>{fmt(diffPer)}</td>
                              <td className="text-nowrap">
                                <a href={`https://ndclist.com/ndc/${item.highestDrugNDC}`} target="_blank" rel="noreferrer" className="link-primary fw-semibold">
                                  {item.highestDrugNDC}
                                </a>
                              </td>
                              <td className="text-nowrap">
                                <a href={`/drug/${item.highestDrugId}?ndc=${item.highestDrugNDC}&insuranceId=${item.insuranceId}`} target="_blank" rel="noreferrer" className="link-primary fw-semibold">
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
                                {item.highestRxGroupId
                                  ? <a href={`/InsuranceDetails/${item.highestRxGroupId}`} target="_blank" rel="noreferrer" className="link-primary">{item.highestInsuranceRx}</a>
                                  : (item.highestInsuranceRx || "NA")}
                              </td>
                              <td className="text-nowrap">
                                {item.highestBinId
                                  ? <a href={`/InsuranceBINDetails/${item.highestBinId}`} target="_blank" rel="noreferrer" className="link-primary">
                                      {(item.highestBINName ? `${item.highestBINName} - ` : "") + (item.highestBINCode || "NA")}
                                    </a>
                                  : (item.highestBINCode || "NA")}
                              </td>
                              <td className="text-nowrap">
                                {item.highestPcnId
                                  ? <a href={`/InsurancePCNDetails/${item.highestPcnId}`} target="_blank" rel="noreferrer" className="link-primary">{item.highestPCNName}</a>
                                  : (item.highestPCNName || "NA")}
                              </td>
                              <td className="text-nowrap">{formatDate((item as any).highestScriptDate)}</td>
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FirstDashboard;