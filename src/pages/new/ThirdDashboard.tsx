import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DrugTransaction } from "../../types";
import { motion } from "framer-motion";

/* ===================== CountUp + KPI Card ===================== */
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
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n || 0);
const fmtInt = (n: number) => Math.round(n || 0).toLocaleString();

function KpiCard({
  title, value, iconClass, variant = "primary", isMoney = false, duration = 900,
}: {
  title: string; value: number; iconClass: string;
  variant?: "primary" | "danger" | "success" | "purple"; isMoney?: boolean; duration?: number;
}) {
  const animated = useCountUp(value, duration);
  const bg =
    variant === "primary" ? "bg-primary" :
    variant === "danger"  ? "bg-danger"  :
    variant === "success" ? "bg-success" : "bg-purple";
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
/* ============================================================= */

/* ----------------------------- helpers ----------------------------- */
const toSafeDate = (d: any) => {
  if (!d) return new Date("Invalid");
  const s = typeof d === "string" ? d.replace(" ", "T") : d;
  return new Date(s);
};
const isValidDate = (d: any) => !isNaN(toSafeDate(d).getTime());
const monthKey = (d: any) => (isValidDate(d) ? toSafeDate(d).toISOString().slice(0, 7) : "");
const formatDate = (d: any, locale = "en-US") => {
  const dt = toSafeDate(d);
  return isValidDate(dt) ? dt.toLocaleDateString(locale) : "-";
};
const money = (n?: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
const titleCase = (s: string) =>
  (s || "").split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ").replace(/[.,]/g, "");
const monthLabel = (ym: string) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
};

/* ------------------------------ mocks ------------------------------ */
const MOCK_THIRD_DASHBOARD: DrugTransaction[] = [
  {
    date: new Date().toISOString(),
    scriptCode: "SC1001",
    rxNumber: "RX-77881",
    user: "sara",
    drugName: "Atorvastatin 20mg",
    insurance: "Aetna",
    pf: "X",
    prescriber: "JOHN DOE, MD",
    quantity: 30,
    acquisitionCost: 7.25,
    discount: 0,
    insurancePayment: 35.75,
    patientPayment: 15.0,
    ndcCode: "00093-7424-56",
    netProfit: 36.0,
    drugClass: "Statins",
    branchCode: "BR-1",
    insuranceRx: "AL",
    rxGroupId: 1,
    binId: 10,
    binName: "Aetna BIN",
    binCode: "123456",
    pcnId: 20,
    pcnName: "AET",
    drugId: 101,
    insuranceId: 999,
    netProfitPerItem: 1.2,
    highestNetProfitPerItem: 2.1,
    totalNetProfit: 36.0,
    totalHighestNet: 56.0,
    difference: 20.0,
    DifferencePerItem: 0.9,
    highestNet: 56.0,
    highestDrugNDC: "00093-7424-58",
    highestDrugName: "Atorvastatin 20mg (Alt)",
    highestDrugId: 102,
    highestScriptCode: "SC9001",
    highestQuantity: 30,
    highestRxGroupId: 2,
    highestInsuranceRx: "BF",
    highestBinId: 11,
    highestBINName: "Caremark BIN",
    highestBINCode: "654321",
    highestPcnId: 21,
    highestPCNName: "CRK",
    highestScriptDate: new Date().toISOString(),
  },
  {
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    scriptCode: "SC1002",
    rxNumber: "RX-77882",
    user: "khaled",
    drugName: "Metformin 500mg",
    insurance: "Caremark",
    pf: "X",
    prescriber: "JANE SMITH, DO",
    quantity: 60,
    acquisitionCost: 4.8,
    discount: 0,
    insurancePayment: 22.2,
    patientPayment: 8.0,
    ndcCode: "54868-1234-00",
    netProfit: 18.4,
    drugClass: "Antidiabetic",
    branchCode: "BR-2",
    insuranceRx: "BF",
    rxGroupId: 3,
    binId: 12,
    binName: "Caremark BIN",
    binCode: "777777",
    pcnId: 22,
    pcnName: "CVS",
    drugId: 201,
    insuranceId: 888,
    netProfitPerItem: 0.31,
    highestNetProfitPerItem: 0.65,
    totalNetProfit: 18.4,
    totalHighestNet: 39.0,
    difference: 20.6,
    DifferencePerItem: 0.34,
    highestNet: 39.0,
    highestDrugNDC: "54868-9999-00",
    highestDrugName: "Metformin 500mg (Alt)",
    highestDrugId: 202,
    highestScriptCode: "SC9002",
    highestQuantity: 60,
    highestRxGroupId: 4,
    highestInsuranceRx: "AL",
    highestBinId: 13,
    highestBINName: "Aetna BIN",
    highestBINCode: "246810",
    highestPcnId: 23,
    highestPCNName: "AET",
    highestScriptDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    date: new Date(Date.now() - 86400000 * 9).toISOString(),
    scriptCode: "SC1003",
    rxNumber: "RX-77883",
    user: "lina",
    drugName: "Lisinopril 10mg",
    insurance: "OptumRx",
    pf: "X",
    prescriber: "SAM WILSON, MD",
    quantity: 90,
    acquisitionCost: 6.1,
    discount: 0,
    insurancePayment: 40.2,
    patientPayment: 9.5,
    ndcCode: "16729-0010-17",
    netProfit: 30.5,
    drugClass: "ACE inhibitors",
    branchCode: "BR-1",
    insuranceRx: "AH",
    rxGroupId: 5,
    binId: 14,
    binName: "Optum BIN",
    binCode: "999999",
    pcnId: 24,
    pcnName: "OPT",
    drugId: 301,
    insuranceId: 777,
    netProfitPerItem: 0.34,
    highestNetProfitPerItem: 0.58,
    totalNetProfit: 30.5,
    totalHighestNet: 52.2,
    difference: 21.7,
    DifferencePerItem: 0.24,
    highestNet: 52.2,
    highestDrugNDC: "16729-0010-99",
    highestDrugName: "Lisinopril 10mg (Alt)",
    highestDrugId: 302,
    highestScriptCode: "SC9003",
    highestQuantity: 90,
    highestRxGroupId: 6,
    highestInsuranceRx: "AI",
    highestBinId: 15,
    highestBINName: "UHC BIN",
    highestBINCode: "135791",
    highestPcnId: 25,
    highestPCNName: "UHC",
    highestScriptDate: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
];

/* ----------------------------- component --------------------------- */
const insurance_mapping: Record<string, string> = {
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

/* ===== Preferences-style tile for each filter ===== */
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

const ThirdDashBoard: React.FC<{ data?: DrugTransaction[] }> = ({ data }) => {
  // KPI layout toggle (row/grid)
  const [kpiLayout, setKpiLayout] = useState<"row" | "grid">("row");
  useEffect(() => {
    const saved = localStorage.getItem("third_kpiLayout");
    if (saved === "row" || saved === "grid") setKpiLayout(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("third_kpiLayout", kpiLayout);
  }, [kpiLayout]);

  // Source (use mocks if empty)
  const sourceData = useMemo<DrugTransaction[]>(
    () => (data && data.length ? data : MOCK_THIRD_DASHBOARD),
    [data]
  );

  // State
  const [latestScripts, setLatestScripts] = useState<DrugTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<DrugTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DrugTransaction; direction: "ascending" | "descending" } | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [selectedPrescriber, setSelectedPrescriber] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // KPIs
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNet, setTotalNet] = useState(0);
  const [belowNetPriceCount, setBelowNetPriceCount] = useState(0);

  const rowsPerPage = 10;

  // Keep only mismatching NDC
  useEffect(() => {
    setLatestScripts(sourceData.filter((r) => r.ndcCode !== r.highestDrugNDC));
  }, [sourceData]);

  // Filter + sort + aggregate
  useEffect(() => {
    let rows = [...latestScripts];

    if (sortConfig) {
      const { key, direction } = sortConfig;
      rows.sort((a, b) => {
        const va = (a as any)[key], vb = (b as any)[key];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return direction === "ascending" ? -1 : 1;
        if (va > vb) return direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    rows = rows.filter((item) => {
      const m = monthKey(item.date as any);
      return (
        (!selectedClass || item.drugClass === selectedClass) &&
        (!selectedInsurance || item.insuranceRx === selectedInsurance) &&
        (!selectedPrescriber || item.prescriber === selectedPrescriber) &&
        (!selectedUser || item.user === selectedUser) &&
        (!selectedBranch || item.branchCode === selectedBranch) &&
        (!selectedMonth || m === selectedMonth)
      );
    });

    setFilteredData(rows);

    const below = rows.filter((r) => (r.netProfit ?? 0) < (r.highestNet ?? 0)).length;
    const rev = rows.reduce((s, r) => s + (r.netProfit ?? 0), 0);
    const best = rows.reduce((s, r) => s + (r.highestNet ?? 0), 0);
    setBelowNetPriceCount(below);
    setTotalRevenue(+rev.toFixed(2));
    setTotalNet(+best.toFixed(2));
    setCurrentPage(1);
  }, [
    latestScripts,
    sortConfig,
    selectedClass,
    selectedInsurance,
    selectedPrescriber,
    selectedUser,
    selectedBranch,
    selectedMonth,
  ]);

  const requestSort = (key: keyof DrugTransaction) =>
    setSortConfig((prev) =>
      !prev || prev.key !== key
        ? { key, direction: "ascending" }
        : { key, direction: prev.direction === "ascending" ? "descending" : "ascending" }
    );

  // Paging
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const currentRecords = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  /* -------- options for filter tiles -------- */
  const months = useMemo(
    () => Array.from(new Set(latestScripts.map(i => monthKey((i as any).date))))
            .sort()
            .map(m => ({ value: m, label: monthLabel(m) || m })),
    [latestScripts]
  );
  const classesOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.drugClass))].sort().map(x => ({ value: String(x), label: String(x) })),
    [latestScripts]
  );
  const insurancesOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.insuranceRx))]
          .sort()
          .map(ins => ({ value: String(ins), label: ins === "  " ? "MARCOG" : (insurance_mapping[String(ins)] || String(ins)) })),
    [latestScripts]
  );
  const prescribersOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.prescriber))].sort().map(x => ({ value: String(x), label: String(x) })),
    [latestScripts]
  );
  const usersOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.user))].sort().map(x => ({ value: String(x), label: String(x) })),
    [latestScripts]
  );
  const branchesOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.branchCode))].sort().map(x => ({ value: String(x), label: String(x) })),
    [latestScripts]
  );

  // CSV
  const downloadCSV = () => {
    const headers = [
      "Date","Script","Rx Group","Drug Class","Drug Name","NDC Code","Prescriber",
      "Net Profit","Highest Net","Difference","Highest NDC","Highest Drug",
    ];
    const rows = filteredData.map((item) => [
      toSafeDate(item.date as any).toLocaleDateString("en-US"),
      item.scriptCode,
      item.insuranceRx,
      item.drugClass,
      item.drugName,
      item.ndcCode,
      titleCase(item.prescriber as any),
      (item.netProfit ?? 0).toFixed(2),
      item.highestNet ?? 0,
      ((item.highestNet ?? 0) - (item.netProfit ?? 0)).toFixed(2),
      item.highestDrugNDC,
      item.highestDrugName,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mismatching_prescriptions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortIcon = (k: keyof DrugTransaction) => {
    if (!sortConfig || sortConfig.key !== k) return "ti ti-arrows-sort text-muted";
    return sortConfig.direction === "ascending" ? "ti ti-arrow-up" : "ti ti-arrow-down";
  };

  const resetFilters = () => {
    setSelectedMonth(""); setSelectedClass(""); setSelectedInsurance("");
    setSelectedPrescriber(""); setSelectedUser(""); setSelectedBranch("");
  };

  const normalizeName = (name: string) => titleCase(name || "");

  return (
    <motion.div>
      <div className="page-wrapper" id="main-content">
        <div className="content">
          <h3 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-4 text-center">
            MisMatching Prescriptions (NDC ≠ Best NDC)
          </h3>

          {/* ===== KPIs + layout toggle ===== */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small">Overview</span>
            <div className="btn-group">
              <button
                type="button"
                className={`btn btn-sm btn-outline-light ${kpiLayout === "row" ? "active" : ""}`}
                title="1 × 3"
                onClick={() => setKpiLayout("row")}
              >
                <i className="ti ti-layout-navbar" />
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-outline-light ${kpiLayout === "grid" ? "active" : ""}`}
                title="2 × 2"
                onClick={() => setKpiLayout("grid")}
              >
                <i className="ti ti-layout-grid" />
              </button>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-4 col-md-6 d-flex"}>
              <KpiCard title="Total MisMatches" value={filteredData.length} iconClass="ti ti-pill" variant="primary" />
            </div>
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-4 col-md-6 d-flex"}>
              <KpiCard title="Best Total Estimated Revenue" value={totalNet} iconClass="ti ti-chart-line" variant="success" isMoney duration={1100} />
            </div>
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-4 col-md-6 d-flex"}>
              <KpiCard title="Current Total Revenue" value={totalRevenue} iconClass="ti ti-chart-bar" variant="purple" isMoney duration={1200} />
            </div>
          </div>

          {/* ===== Filters (Preferences-style tiles) ===== */}
          <div className="card mb-3">
            <div className="card-header border-0 pb-1">
              <h5 className="mb-0 pt-2">Filters</h5>
            </div>
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
                <button type="button" className="btn btn-outline-light me-2" onClick={resetFilters}>
                  Reset
                </button>
                <button type="button" className="btn btn-primary" onClick={downloadCSV}>
                  <i className="ti ti-cloud-download me-1" /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* ===== Card + Table (Visits-style) ===== */}
          <div className="card mb-0">
            <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <h5 className="d-inline-flex align-items-center mb-0">
                MisMatching Scripts <span className="badge bg-danger ms-2">{filteredData.length}</span>
              </h5>

              <div className="d-flex align-items-center gap-2">
                <button type="button" className="btn btn-icon btn-white" title="Refresh" onClick={() => window.location.reload()}>
                  <i className="ti ti-refresh" />
                </button>
                <button type="button" className="btn btn-icon btn-white" title="Print" onClick={() => window.print()}>
                  <i className="ti ti-printer" />
                </button>
                <button type="button" className="btn btn-icon btn-white" title="Download" onClick={downloadCSV}>
                  <i className="ti ti-cloud-download" />
                </button>

                <div className="dropdown">
                  <button className="dropdown-toggle btn btn-md btn-outline-light d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-sort-descending-2 me-1" />
                    <span className="me-1">Sort By : </span>
                    {sortConfig?.key === "date" && sortConfig.direction === "ascending" ? "Oldest" : "Newest"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end p-2">
                    <li>
                      <button type="button" className="dropdown-item rounded-1"
                        onClick={() => setSortConfig({ key: "date" as keyof DrugTransaction, direction: "descending" })}>
                        Newest
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1"
                        onClick={() => setSortConfig({ key: "date" as keyof DrugTransaction, direction: "ascending" })}>
                        Oldest
                      </button>
                    </li>
                  </ul>
                </div>
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
                            {label} <i className={sortIcon(key)} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {currentRecords.map((item, index) => {
                      const diff = ((item.highestNet ?? 0) - (item.netProfit ?? 0)) as number;
                      const diffPer = ((item.highestNetProfitPerItem ?? 0) - (item.netProfitPerItem ?? 0)) as number;

                      return (
                        <tr key={index}>
                          <td className="text-nowrap">{formatDate((item as any).date)}</td>
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
                          <td>{normalizeName(String(item.prescriber || ""))}</td>
                          <td className="text-end">{item.quantity}</td>

                          <td className="text-end">{(item.netProfitPerItem ?? 0).toFixed(3)}</td>
                          <td className="text-end">{(item.netProfit ?? 0).toFixed(3)}</td>
                          <td className="text-end">{(item.highestNetProfitPerItem ?? 0).toFixed(3)}</td>
                          <td className="text-end">{(item.highestNet ?? 0).toFixed(3)}</td>

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
          {/* /card */}
        </div>
      </div>
    </motion.div>
  );
};

export default ThirdDashBoard;
