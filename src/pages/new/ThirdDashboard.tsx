// src/pages/new/ThirdDashBoard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DrugTransaction } from "../../types";
import { motion } from "framer-motion";
import FiltersBar from "./FiltersBar";      // ⬅️ use your FiltersBar
import PharmacyTable from "../../components/pharmacytable";  // ⬅️ your shared table

/* ----------------------------- helpers ----------------------------- */
const toSafeDate = (d: any) => {
  if (!d) return new Date("Invalid");
  const s = typeof d === "string" ? d.replace(" ", "T") : d;
  return new Date(s);
};
const isValidDate = (d: any) => !isNaN(toSafeDate(d).getTime());
const monthKey = (d: any) => (isValidDate(d) ? toSafeDate(d).toISOString().slice(0, 7) : "");
const money = (n?: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
const titleCase = (s: string) =>
  (s || "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace(/[.,]/g, "");
const uniq = (xs: (string | undefined | null)[]) =>
  Array.from(new Set(xs.filter(Boolean))) as string[];
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
type SortCfg =
  | { key: keyof DrugTransaction; direction: "ascending" | "descending" }
  | null;

interface DashboardProps {
  data?: DrugTransaction[];
}

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

const ThirdDashBoard: React.FC<DashboardProps> = ({ data }) => {
  // Source (use mocks if empty)
  const sourceData = useMemo<DrugTransaction[]>(
    () => (data && data.length ? data : MOCK_THIRD_DASHBOARD),
    [data]
  );

  // State
  const [latestScripts, setLatestScripts] = useState<DrugTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<DrugTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortCfg>(null);

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
  const currentRecords = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* -------- options for FiltersBar (value/label) -------- */
  const monthOptions = uniq(latestScripts.map((i) => monthKey(i.date as any)))
    .sort()
    .map((m) => ({ value: m, label: monthLabel(m) || m }));

  const classOptions = uniq(latestScripts.map((i) => i.drugClass))
    .sort()
    .map((x) => ({ value: x, label: x }));

  const insuranceOptions = uniq(latestScripts.map((i) => i.insuranceRx))
    .sort()
    .map((x) => ({
      value: x,
      label: x === "  " ? "MARCOG" : insurance_mapping[x] || x,
    }));

  const prescriberOptions = uniq(latestScripts.map((i) => i.prescriber))
    .sort()
    .map((x) => ({ value: x, label: x }));

  const userOptions = uniq(latestScripts.map((i) => i.user))
    .sort()
    .map((x) => ({ value: x, label: x }));

  const branchOptions = uniq(latestScripts.map((i) => i.branchCode))
    .sort()
    .map((x) => ({ value: x, label: x }));

  // CSV
  const downloadCSV = () => {
    const headers = [
      "Date",
      "Script",
      "Rx Group",
      "Drug Class",
      "Drug Name",
      "NDC Code",
      "Prescriber",
      "Net Profit",
      "Highest Net",
      "Difference",
      "Highest NDC",
      "Highest Drug",
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

  return (
    <motion.div>
      <div className="page-wrapper" id="main-content">
        <div className="content">
          <h3 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-6 text-center">
            MisMatching Prescriptions (NDC ≠ Best NDC)
          </h3>

          {/* KPI cards – same template feel */}
          <div className="row g-3 mb-3">
            <div className="col-xl-4 col-md-6 d-flex">
              <div className="card pb-2 flex-fill">
                <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                  <div className="d-flex align-items-center overflow-hidden">
                    <span className="avatar bg-primary rounded-circle flex-shrink-0">
                      <i className="ti ti-pill fs-20" />
                    </span>
                    <div className="ms-2 overflow-hidden">
                      <p className="mb-1 text-truncate">Total MisMatches</p>
                      <h5 className="mb-0">{filteredData.length}</h5>
                    </div>
                  </div>
                  <span className="badge badge-soft-primary">NDC</span>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6 d-flex">
              <div className="card pb-2 flex-fill">
                <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                  <div className="d-flex align-items-center overflow-hidden">
                    <span className="avatar bg-success rounded-circle flex-shrink-0">
                      <i className="ti ti-chart-line fs-20" />
                    </span>
                    <div className="ms-2 overflow-hidden">
                      <p className="mb-1 text-truncate">Best Total Estimated Revenue</p>
                      <h5 className="mb-0">{money(totalNet)}</h5>
                    </div>
                  </div>
                  <span className="badge badge-soft-success">best</span>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6 d-flex">
              <div className="card pb-2 flex-fill">
                <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                  <div className="d-flex align-items-center overflow-hidden">
                    <span className="avatar bg-purple rounded-circle flex-shrink-0">
                      <i className="ti ti-chart-bar fs-20" />
                    </span>
                    <div className="ms-2 overflow-hidden">
                      <p className="mb-1 text-truncate">Current Total Revenue</p>
                      <h5 className="mb-0">{money(totalRevenue)}</h5>
                    </div>
                  </div>
                  <span className="badge badge-soft-secondary">
                    {belowNetPriceCount} below best
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shared FILTERS UI */}
          <FiltersBar
            months={monthOptions}
            classes={classOptions}
            insurances={insuranceOptions}
            prescribers={prescriberOptions}
            users={userOptions}
            branches={branchOptions}
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
            onDownload={downloadCSV} // not shown in FiltersBar UI (commented inside) but OK to pass
            onReset={() => {
              setSelectedMonth("");
              setSelectedClass("");
              setSelectedInsurance("");
              setSelectedPrescriber("");
              setSelectedUser("");
              setSelectedBranch("");
            }}
          />

          {/* CSV button (kept below filters) */}
          <div className="mb-3">
            <button className="btn btn-primary" onClick={downloadCSV}>
              <i className="ti ti-download me-2" />
              Download CSV
            </button>
          </div>

          {/* TABLE (shared) */}
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

          {/* Minimal pager fallback */}
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
    </motion.div>
  );
};

export default ThirdDashBoard;
