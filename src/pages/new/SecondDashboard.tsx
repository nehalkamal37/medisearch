import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  AlertTriangle,
  PieChart,
  Pill,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { DrugTransaction } from "../../types";
import { motion } from "framer-motion";
import FiltersBar from "./FiltersBar";
import PharmacyTable from "../../components/pharmacytable";
// ==== Safe date helpers (paste once per dashboard file) ====
const toSafeDate = (d: any) => {
  if (!d) return new Date('Invalid'); // invalid on purpose
  // لو التاريخ جاي بصيغة "2025-01-01 00:00:00" هنبدّل المسافة بـ T
  const s = typeof d === 'string' ? d.replace(' ', 'T') : d;
  return new Date(s);
};
const isValidDate = (d: any) => {
  const dt = toSafeDate(d);
  return !isNaN(dt.getTime());
};
const monthKey = (d: any) => {
  const dt = toSafeDate(d);
  return isValidDate(dt) ? dt.toISOString().slice(0, 7) : "";
};
const formatDate = (d: any, locale = "en-US") => {
  const dt = toSafeDate(d);
  return isValidDate(dt) ? dt.toLocaleDateString(locale) : "-";
};
// ============================================================

// Make data optional; if not passed, we'll generate mocks.
interface DashboardProps {
  data?: DrugTransaction[];
}

/* ----------------------------- Mock generator ----------------------------- */
// Deterministic helpers for stable mock data
const seeded = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
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

// Generate full rows with all fields used by this page
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

    // Best alternative (>= current)
    const betterPer = +(netPer + seeded(i + 41) * 4 + 1).toFixed(3);
    const betterTotal = +(betterPer * qty).toFixed(3);

    const ndcCode = ndc(i);
    // Force ~50% of rows to have same highest NDC (so they show in this dashboard)
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

      insuranceRx: rx,
      rxGroupId: (i % 6) + 1,
      binCode: bin.code,
      binName: bin.name,
      binId: bin.id,
      pcnName: pcn.name,
      pcnId: pcn.id,
      insuranceId: (i % 6) + 1,

      drugClass: drug.className,
      drugName: drug.name,
      ndcCode,
      drugId: (i % 100) + 1,

      patientPayment: patPay,
      acquisitionCost: acq,
      insurancePayment: insPay,
      quantity: qty,

      netProfitPerItem: +netPer.toFixed(3),
      netProfit: +totalNet.toFixed(3),
      highestNetProfitPerItem: +betterPer.toFixed(3),
      highestNet: +betterTotal.toFixed(3),

      difference: +(betterTotal - totalNet).toFixed(3),
      DifferencePerItem: +(betterPer - netPer).toFixed(3),

      highestDrugNDC: altNdc,
      highestDrugName: altDrug.name,
      highestDrugId: (i % 100) + 501,

      highestRxGroupId: (i % 6) + 10,
      highestInsuranceRx: pick(RX_GROUPS, i + 51),
      highestBinId: pick(BINS, i + 53).id,
      highestBINName: pick(BINS, i + 53).name,
      highestBINCode: pick(BINS, i + 53).code,
      highestPcnId: pick(PCNS, i + 57).id,
      highestPCNName: pick(PCNS, i + 57).name,

      highestQuantity: qty + ((i % 2) * 30),
    });
  }
  return rows as DrugTransaction[];
}
/* ------------------------------------------------------------------------- */

const insurance_mapping: { [key: string]: string } = {
  AL: "Aetna (AL)",
  BW: "aetna (BW)",
  AD: "Aetna Medicare (AD)",
  AF: "Anthem BCBS (AF)",
  DS: "Blue Cross Blue Shield (DS)",
  CA: "blue shield medicare (CA)",
  FQ: "Capital Rx (FQ)",
  BF: "Caremark (BF)",
  ED: "CatalystRx (ED)",
  AM: "Cigna (AM)",
  BO: "Default Claim Format (BO)",
  AP: "Envision Rx Options (AP)",
  CG: "Express Scripts (CG)",
  BI: "Horizon (BI)",
  AJ: "Humana Medicare (AJ)",
  BP: "informedRx (BP)",
  AO: "MEDCO HEALTH (AO)",
  AC: "MEDCO MEDICARE PART D (AC)",
  AQ: "MEDGR (AQ)",
  CC: "MY HEALTH LA (CC)",
  AG: "Navitus Health Solutions (AG)",
  AH: "OptumRx (AH)",
  AS: "PACIFICARE LIFE AND H (AS)",
  FJ: "Paramount Rx (FJ)",
  "X ": "PF - DEFAULT (X )",
  EA: "Pharmacy Data Management (EA)",
  DW: "phcs (DW)",
  AX: "PINNACLE (AX)",
  BN: "Prescription Solutions (BN)",
  AA: "Tri-Care Express Scripts (AA)",
  AI: "United Healthcare (AI)",
};

export const SecondDashBoard: React.FC<DashboardProps> = ({ data }) => {
  // If no real data arrives, generate mocks and then filter to "matching highest NDC"
  const initialRows = useMemo<DrugTransaction[]>(
    () => (data?.length ? data : makeMockTransactions(160)),
    [data]
  );

  const [latestScripts, setLatestScripts] = useState<DrugTransaction[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [filteredData, setFilteredData] = useState<DrugTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DrugTransaction;
    direction: "ascending" | "descending";
  } | null>(null);
  const [belowNetPriceCount, setBelowNetPriceCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNet, setTotalNet] = useState<number>(0);
  const [selectedPrescriber, setSelectedPrescriber] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const rowsPerPage = 10;

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  const handleTooltipEnter = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    content: string
  ) => setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
  const handleTooltipMove = (e: React.MouseEvent<HTMLParagraphElement, MouseEvent>) =>
    setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
  const handleTooltipLeave = () => setTooltip((prev) => ({ ...prev, visible: false }));

  // Load data and keep only rows where ndcCode === highestDrugNDC
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
    name
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .replace(/[.,]/g, "");

  // Filters + (optional) sort
  useEffect(() => {
    let sortedData = [...latestScripts];

    if (sortConfig) {
      const { key, direction } = sortConfig;
      sortedData.sort((a, b) => {
        const va = (a as any)[key];
        const vb = (b as any)[key];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return direction === "ascending" ? -1 : 1;
        if (va > vb) return direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    const filtered = sortedData.filter((item) => {
      const itemDate = new Date(item.date as any);
      const itemMonth = isNaN(+itemDate) ? "" : itemDate.toISOString().slice(0, 7);
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
    selectedClass,
    selectedInsurance,
    selectedPrescriber,
    selectedUser,
    selectedBranch,
    selectedMonth,
    latestScripts,
    sortConfig,
  ]);

  const requestSort = (key: keyof DrugTransaction) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "ascending" };
      return { key, direction: prev.direction === "ascending" ? "descending" : "ascending" };
    });
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const currentRecords = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalRevenue ?? 0);

  const formattedDeviation = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalNet ?? 0);

  const downloadCSV = () => {
    const headers = [
      "Date",
      "Script",
      "Insurance",
      "Drug Class",
      "Drug Name",
      "NDC Code",
      "Patient Payment",
      "ACQ",
      "Insurance Payment",
      "Prescriber",
      "Net Profit",
      "Highest Net",
      "Difference",
      "Highest NDC",
      "Highest Drug",
    ];
    const rows = filteredData.map((item) => [
      new Date(item.date as any).toLocaleDateString("en-US"),
      item.scriptCode,
      item.insuranceRx,
      item.drugClass,
      item.drugName,
      item.ndcCode,
      item.patientPayment,
      item.acquisitionCost,
      item.insurancePayment,
      normalizeName(item.prescriber as any),
      (item.netProfit ?? 0).toFixed(2),
      item.highestNet ?? 0,
      ((item.highestNet ?? 0) - (item.netProfit ?? 0)).toFixed(2),
      item.highestDrugNDC,
      item.highestDrugName,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
const money = (n: number) =>
  new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n ?? 0);

  /* filters  */
const months = useMemo(
  () =>
    Array.from(new Set(latestScripts.map(i => monthKey((i as any).date))))
      .sort()
      .map(m => ({ value: m, label: m || "—" })),
  [latestScripts]
);

const classesOpts = useMemo(
  () => [...new Set(latestScripts.map(i => i.drugClass))]
          .sort()
          .map(x => ({ value: String(x), label: String(x) })),
  [latestScripts]
);

const insurancesOpts = useMemo(
  () => [...new Set(latestScripts.map(i => i.insuranceRx))]
          .sort()
          .map(ins => ({
            value: String(ins),
            label: ins === "  " ? "MARCOG" : (insurance_mapping[String(ins)] || String(ins)),
          })),
  [latestScripts]
);

const prescribersOpts = useMemo(
  () => [...new Set(latestScripts.map(i => i.prescriber))]
          .sort()
          .map(x => ({ value: String(x), label: String(x) })),
  [latestScripts]
);

const usersOpts = useMemo(
  () => [...new Set(latestScripts.map(i => i.user))]
          .sort()
          .map(x => ({ value: String(x), label: String(x) })),
  [latestScripts]
);

const branchesOpts = useMemo(
  () => [...new Set(latestScripts.map(i => i.branchCode))]
          .sort()
          .map(x => ({ value: String(x), label: String(x) })),
  [latestScripts]
);

const resetFilters = () => {
  setSelectedMonth("");
  setSelectedClass("");
  setSelectedInsurance("");
  setSelectedPrescriber("");
  setSelectedUser("");
  setSelectedBranch("");
};


  return (
    <motion.div>

    <div className="page-wrapper" id="main-content">
            <div className="content">
                      <h3 className="text-4xl sm:text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-6 text-center tracking-wide">
          Estimated Best Net Differences
        </h3>

        {/* Analytics Cards */}
      {/* KPI Cards — template look */}
<div className="row g-3 mb-4">
  {/* Total Scripts */}
  <div className="col-xl-3 col-md-6 d-flex">
    <div className="card pb-2 flex-fill">
      <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
        <div className="d-flex align-items-center overflow-hidden">
          <span className="avatar bg-primary rounded-circle flex-shrink-0">
            <i className="ti ti-pill fs-20" />
          </span>
          <div className="ms-2 overflow-hidden">
            <p className="mb-1 text-truncate">Total Scripts</p>
            <h5 className="mb-0">{filteredData.length}</h5>
          </div>
        </div>
        <span className="badge badge-soft-success">+0%</span>
      </div>
    </div>
  </div>

  {/* Prescriptions with Deviation */}
  <div className="col-xl-3 col-md-6 d-flex">
    <div className="card pb-2 flex-fill">
      <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
        <div className="d-flex align-items-center overflow-hidden">
          <span className="avatar bg-danger rounded-circle flex-shrink-0">
            <i className="ti ti-alert-triangle fs-20" />
          </span>
          <div className="ms-2 overflow-hidden">
            <p className="mb-1 text-truncate">Deviation Count</p>
            <h5 className="mb-0">{belowNetPriceCount}</h5>
          </div>
        </div>
        <span className="badge badge-soft-danger">-</span>
      </div>
    </div>
  </div>

  {/* Total Deviation (sum of diffs) */}
  <div className="col-xl-3 col-md-6 d-flex">
    <div className="card pb-2 flex-fill">
      <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
        <div className="d-flex align-items-center overflow-hidden">
          <span className="avatar bg-success rounded-circle flex-shrink-0">
            <i className="ti ti-chart-line fs-20" />
          </span>
          <div className="ms-2 overflow-hidden">
            <p className="mb-1 text-truncate">Total Deviation</p>
            <h5 className="mb-0">{money(totalNet)}</h5>
          </div>
        </div>
        <span className="badge badge-soft-success">+✓</span>
      </div>
    </div>
  </div>

  {/* Revenue from Matching Scripts */}
  <div className="col-xl-3 col-md-6 d-flex">
    <div className="card pb-2 flex-fill">
      <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
        <div className="d-flex align-items-center overflow-hidden">
          <span className="avatar bg-purple rounded-circle flex-shrink-0">
            <i className="ti ti-chart-bar fs-20" />
          </span>
          <div className="ms-2 overflow-hidden">
            <p className="mb-1 text-truncate">Total Revenue</p>
            <h5 className="mb-0">{money(totalRevenue)}</h5>
          </div>
        </div>
        <span className="badge badge-soft-success">+0%</span>
      </div>
    </div>
  </div>
</div>


        {/* Filters */}
      <FiltersBar
  months={months}
  classes={classesOpts}
  insurances={insurancesOpts}
  prescribers={prescribersOpts}
  users={usersOpts}
  branches={branchesOpts}

  selectedMonth={selectedMonth}
  setSelectedMonth={setSelectedMonth}
  selectedClass={selectedClass}
  setSelectedClass={setSelectedClass}
  selectedInsurance={selectedInsurance}
  setSelectedInsurance={setSelectedInsurance}
  selectedPrescriber={selectedPrescriber}
  setSelectedPrescriber={setSelectedPrescriber}
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  selectedBranch={selectedBranch}
  setSelectedBranch={setSelectedBranch}

  onDownload={downloadCSV}
  onReset={resetFilters}
/>

        {/* CSV Download */}
          
          <div className="col-12 col-md-auto ms-md-auto d-flex gap-2 mt-2 mt-md-0">
            <button className="btn btn-sm btn-primary" onClick={downloadCSV}>
              <i className="ti ti-download me-1" />
              Download CSV
            </button>
            </div>
        <div className="mb-4">

        </div>

        {/* Table */}

       

<PharmacyTable
  rows={currentRecords}
  requestSort={requestSort}
  sortConfig={sortConfig}
  currentPage={currentPage}
  totalPages={totalPages}
  onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
  onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
  totalRows={filteredData.length}
/>


        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md mb-2 sm:mb-0 transition-colors duration-150 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <ChevronLeft className="inline-block w-4 h-4 mr-1" />
            Previous
          </button>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-150 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Next <ChevronRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            style={{ position: "fixed", top: tooltip.y + 10, left: tooltip.x + 10, zIndex: 1000 }}
            className="bg-gray-800 text-white text-xs p-1 rounded shadow"
          >
            {tooltip.content}
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
};

export default SecondDashBoard;
