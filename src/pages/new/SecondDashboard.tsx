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
/* ============================================================= */

/* ================= Safe date helpers ================= */
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
/* ===================================================== */

interface DashboardProps { data?: DrugTransaction[]; }

/* -------------------- Mock data generator -------------------- */
const seeded = (seed: number) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x); };
const pick = <T,>(arr: T[], seed: number) => arr[Math.floor(seeded(seed) * arr.length)];
const ndc = (seed: number) =>
  `${10000 + Math.floor(seeded(seed + 1) * 90000)}-${100 + Math.floor(seeded(seed + 2) * 900)}-${1 + Math.floor(seeded(seed + 3) * 4)}`;

const RX_GROUPS = ["Medi-Cal", "Medi-Cal Plus", "OPT-RX", "OPTUM GOLD", "Caremark", "UHC"];
const BRANCHES = ["LA-01", "LA-02", "SF-01", "OC-01", "SD-01"];
const USERS = ["sara", "mohamed", "ali", "lina", "youssef"];
const PRESCRIBERS = ["Dr Noor", "Dr Patel", "Dr Gomez", "Dr Brown", "Dr Wong"];
const DRUGS = [
  { name: "Metformin", className: "Biguanides" },
  { name: "Atorvastatin", className: "Statins" },
  { name: "Lisinopril", className: "ACE Inhibitors" },
  { name: "Amlodipine", className: "CCB" },
  { name: "Losartan", className: "ARBs" },
];
const BINS = [
  { id: 1, name: "Medi-Cal", code: "012345" },
  { id: 2, name: "Caremark", code: "610591" },
  { id: 3, name: "OptumRx", code: "987654" },
  { id: 4, name: "ExpressScripts", code: "004336" },
];
const PCNS = [
  { id: 1, name: "MEDICAL" },
  { id: 2, name: "OPTUM" },
  { id: 3, name: "CMK" },
  { id: 4, name: "MCAL-ALT" },
];

function dollars(seed: number, base = 5, spread = 50) {
  return +(base + seeded(seed) * spread).toFixed(2);
}

function makeMockTransactions(count = 120): DrugTransaction[] {
  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const drug = pick(DRUGS, i + 7);
    const rx = pick(RX_GROUPS, i + 9);
    const bin = pick(BINS, i + 11);
    const pcn = pick(PCNS, i + 13);
    const branch = pick(BRANCHES, i + 17);
    const user = pick(USERS, i + 19);
    const prescriber = pick(PRESCRIBERS, i + 23);

    const qty = [30, 60, 90][i % 3];
    const netPer = dollars(i + 31, 6, 20);
    const totalNet = +(netPer * qty).toFixed(2);
    const acq = dollars(i + 33, 10, 60);
    const insPay = +(totalNet + dollars(i + 35, 2, 10)).toFixed(2);
    const patPay = dollars(i + 37, 0, 15);

    const betterPer = +(netPer + seeded(i + 41) * 4 + 1).toFixed(3);
    const betterTotal = +(betterPer * qty).toFixed(3);

    const ndcCode = ndc(i);
    const altSame = i % 2 === 0;
    const altNdc = altSame ? ndcCode : ndc(i + 1000);
    const altDrug = altSame ? drug : pick(DRUGS, i + 45);

    const today = new Date();
    const d = new Date(today.getTime() - (i % 60) * 24 * 60 * 60 * 1000);

    rows.push({
      date: d.toISOString(),
      scriptCode: `RX-${10000 + i}`,
      highestScriptCode: `RX-${20000 + i}`,
      highestScriptDate: new Date(d.getTime() - 86400000).toISOString(),
      branchCode: branch,
      user,
      prescriber,
      insuranceRx: rx, rxGroupId: (i % 6) + 1,
      binCode: bin.code, binName: bin.name, binId: bin.id,
      pcnName: pcn.name, pcnId: pcn.id,
      insuranceId: (i % 6) + 1,
      drugClass: drug.className, drugName: drug.name, ndcCode, drugId: (i % 100) + 1,
      patientPayment: patPay, acquisitionCost: acq, insurancePayment: insPay, quantity: qty,
      netProfitPerItem: +netPer.toFixed(3), netProfit: +totalNet.toFixed(3),
      highestNetProfitPerItem: +betterPer.toFixed(3), highestNet: +betterTotal.toFixed(3),
      difference: +(betterTotal - totalNet).toFixed(3),
      DifferencePerItem: +(betterPer - netPer).toFixed(3),
      highestDrugNDC: altNdc, highestDrugName: altDrug.name, highestDrugId: (i % 100) + 501,
      highestRxGroupId: (i % 6) + 10, highestInsuranceRx: pick(RX_GROUPS, i + 51),
      highestBinId: pick(BINS, i + 53).id, highestBINName: pick(BINS, i + 53).name, highestBINCode: pick(BINS, i + 53).code,
      highestPcnId: pick(PCNS, i + 57).id, highestPCNName: pick(PCNS, i + 57).name,
      highestQuantity: qty + ((i % 2) * 30),
    });
  }
  return rows as DrugTransaction[];
}
/* ----------------------------------------------------------- */

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

/* ===== UI bits شبيهة بـ Preferences ===== */
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

const SecondDashBoard: React.FC<DashboardProps> = ({ data }) => {
  // KPI layout (row by default)
  const [kpiLayout, setKpiLayout] = useState<"row" | "grid">("row");
  useEffect(() => {
    const saved = localStorage.getItem("second_kpiLayout");
    if (saved === "row" || saved === "grid") setKpiLayout(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("second_kpiLayout", kpiLayout);
  }, [kpiLayout]);

  const initialRows = useMemo<DrugTransaction[]>(
    () => (data?.length ? data : makeMockTransactions(160)),
    [data]
  );

  // نعرض بس الحالات اللي الـ ndcCode = highestDrugNDC
  const [latestScripts, setLatestScripts] = useState<DrugTransaction[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [selectedPrescriber, setSelectedPrescriber] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [filteredData, setFilteredData] = useState<DrugTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DrugTransaction; direction: "ascending" | "descending" } | null>(null);

  const [belowNetPriceCount, setBelowNetPriceCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNet, setTotalNet] = useState<number>(0);

  const rowsPerPage = 10;

  useEffect(() => {
    const result = initialRows || [];
    const matches = result.filter((item) => item.ndcCode === item.highestDrugNDC);
    setLatestScripts(matches);

    const belowNetCount = matches.filter((item) => (item.netProfit ?? 0) < (item.highestNet ?? 0)).length;
    const totalRev = matches.reduce((sum, item) => sum + (item.netProfit ?? 0), 0);
    const totalNetProfit = matches.reduce((sum, item) => sum + ((item.highestNet ?? 0) - (item.netProfit ?? 0)), 0);

    setBelowNetPriceCount(belowNetCount);
    setTotalRevenue(+totalRev.toFixed(2));
    setTotalNet(+totalNetProfit.toFixed(2));
  }, [initialRows]);

  const normalizeName = (name: string) =>
    name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ").replace(/[.,]/g, "");

  useEffect(() => {
    let sortedData = [...latestScripts];

    if (sortConfig) {
      const { key, direction } = sortConfig;
      sortedData.sort((a, b) => {
        const va = (a as any)[key], vb = (b as any)[key];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return direction === "ascending" ? -1 : 1;
        if (va > vb) return direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    const filtered = sortedData.filter((item) => {
      const itemMonth = monthKey((item as any).date);
      return (
        (!selectedClass || item.drugClass === selectedClass) &&
        (!selectedInsurance || item.insuranceRx === selectedInsurance) &&
        (!selectedPrescriber || item.prescriber === selectedPrescriber) &&
        (!selectedUser || item.user === selectedUser) &&
        (!selectedBranch || item.branchCode === selectedBranch) &&
        (!selectedMonth || itemMonth === selectedMonth)
      );
    });

    setFilteredData(filtered);

    const belowNetCount = filtered.filter((item) => (item.netProfit ?? 0) < (item.highestNet ?? 0)).length;
    const totalRev = filtered.reduce((sum, item) => sum + (item.netProfit ?? 0), 0);
    const totalNetProfit = filtered.reduce((sum, item) => sum + ((item.highestNet ?? 0) - (item.netProfit ?? 0)), 0);

    setBelowNetPriceCount(belowNetCount);
    setTotalRevenue(+totalRev.toFixed(2));
    setTotalNet(+totalNetProfit.toFixed(2));
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

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const currentRecords = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const downloadCSV = () => {
    const headers = [
      "Date","Script","Insurance","Drug Class","Drug Name","NDC Code","Patient Payment","ACQ",
      "Insurance Payment","Prescriber","Net Profit","Highest Net","Difference","Highest NDC","Highest Drug",
    ];
    const rows = filteredData.map((item) => [
      new Date(item.date as any).toLocaleDateString("en-US"),
      item.scriptCode, item.insuranceRx, item.drugClass, item.drugName, item.ndcCode,
      item.patientPayment, item.acquisitionCost, item.insurancePayment, normalizeName(item.prescriber as any),
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
    a.download = "audit_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const months = useMemo(
    () => Array.from(new Set(latestScripts.map(i => monthKey((i as any).date)))).sort().map(m => ({ value: m, label: m || "—" })),
    [latestScripts]
  );
  const classesOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.drugClass))].sort().map(x => ({ value: String(x), label: String(x) })),
    [latestScripts]
  );
  const insurancesOpts = useMemo(
    () => [...new Set(latestScripts.map(i => i.insuranceRx))].sort().map(ins => ({
      value: String(ins), label: ins === "  " ? "MARCOG" : (insurance_mapping[String(ins)] || String(ins)),
    })),
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
  const resetFilters = () => {
    setSelectedMonth(""); setSelectedClass(""); setSelectedInsurance("");
    setSelectedPrescriber(""); setSelectedUser(""); setSelectedBranch("");
  };

  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
  const sortIcon = (k: keyof DrugTransaction) => {
    if (!sortConfig || sortConfig.key !== k) return "ti ti-arrows-sort text-muted";
    return sortConfig.direction === "ascending" ? "ti ti-arrow-up" : "ti ti-arrow-down";
  };

  return (
    <motion.div>
      <div className="page-wrapper" id="main-content">
        <div className="content">
          <h3 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-4 text-center">
            Estimated Best Net Differences
          </h3>

          {/* ===== KPIs + layout toggle ===== */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small">Overview</span>
            <div className="btn-group">
              <button
                type="button"
                className={`btn btn-sm btn-outline-light ${kpiLayout === "row" ? "active" : ""}`}
                title="1 × 4"
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

          <div className="row g-3 mb-4">
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-3 col-md-6 d-flex"}>
              <KpiCard title="Total Scripts" value={filteredData.length} iconClass="ti ti-pill" variant="primary" />
            </div>
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-3 col-md-6 d-flex"}>
              <KpiCard title="Deviation Count" value={belowNetPriceCount} iconClass="ti ti-alert-triangle" variant="danger" duration={1100} />
            </div>
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-3 col-md-6 d-flex"}>
              <KpiCard title="Total Deviation" value={totalNet} iconClass="ti ti-chart-line" variant="success" isMoney duration={1200} />
            </div>
            <div className={kpiLayout === "grid" ? "col-xl-6 col-md-6 d-flex" : "col-xl-3 col-md-6 d-flex"}>
              <KpiCard title="Total Revenue" value={totalRevenue} iconClass="ti ti-chart-bar" variant="purple" isMoney duration={1200} />
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
                Matching Scripts <span className="badge bg-danger ms-2">{filteredData.length}</span>
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

              {/* Pagination (نفس الشكل) */}
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

export default SecondDashBoard;
