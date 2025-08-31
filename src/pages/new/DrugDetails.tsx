import React from "react";

/* ====== STANDALONE PATCH (types) ====== */
export interface ClassInfo { id: number; classTypeName: string; name?: string; }
export interface Drug {
  id: number; name: string; ndc: string; form?: string; route?: string;
  strength?: string | number; strengthUnit?: string; ingrdient?: string;
  teCode?: string; type?: string; awp?: number; acq?: number; rxcui?: string;
}
export interface Prescription {
  drugId: number; drugName: string; ndcCode: string; quantity: number;
  net: number; acquisitionCost: number; insurancePayment: number; patientPayment: number;
  drugClass?: string; ingrdient?: string; form?: string; route?: string; strength?: string | number; strengthUnit?: string;
  teCode?: string; type?: string; rxgroup?: string; rxgroupId?: number; insuranceName?: string;
  bin?: string; binFullName?: string; binId?: number; pcn?: string; pcnId?: number;
  branchName?: string; date?: string; scriptCode?: string; insuranceId?: number;
}
export interface DrugMedi {
  drugNDC?: string; drugName?: string; priorAuthorization?: string;
  extendedDuration?: string; costCeilingTier?: string; nonCapitatedDrugIndicator?: string;
  ccsPanelAuthority?: string;
}
export interface SearchLog { [k: string]: any }
export interface OrderItem {
  drugNDC?: string; netPrice: number; patientPay: number; insurancePay: number;
  acquisitionCost: number; additionalCost: number; insuranceRxId: number; amount: number;
}

/* ---- MOCK DATA ---- */
const MOCK_DRUG: Drug = {
  id: 3, name: "Ozempic 1mg/dose Pen", ndc: "00169143161",
  form: "Pen injector", route: "Subcutaneous", strength: "1", strengthUnit: "mg/dose",
  ingrdient: "Semaglutide", teCode: "NA", type: "Brand", awp: 980, acq: 980, rxcui: "999999"
};
const MOCK_CLASSES: ClassInfo[] = [
  { id: 101, classTypeName: "ClassV1", name: "GLP-1" },
  { id: 102, classTypeName: "ClassV2", name: "GLP-1 (alt)" },
];

const MOCK_ALTS: Prescription[] = [
  { drugId:1, drugName:"Amoxicillin 500mg Cap", ndcCode:"00601591", quantity:30, net:12.7, acquisitionCost:45.2, insurancePayment:30, patientPayment:5,
    drugClass:"Antibiotic", ingrdient:"Amoxicillin", form:"Capsule", route:"Oral", strength:"500", strengthUnit:"mg", teCode:"AB", type:"Generic",
    rxgroup:"Aetna Rx", rxgroupId:11, insuranceName:"Aetna Rx", bin:"610591", binFullName:"Aetna", binId:1, pcn:"AETNA", pcnId:1, branchName:"Main", date:"2025-08-01", scriptCode:"S1001", insuranceId: 11 },
  { drugId:2, drugName:"Atorvastatin 20mg Tab", ndcCode:"00093012345", quantity:30, net:8.5, acquisitionCost:32.9, insurancePayment:25, patientPayment:3,
    drugClass:"Statin", ingrdient:"Atorvastatin", form:"Tablet", route:"Oral", strength:"20", strengthUnit:"mg", teCode:"AB", type:"Generic",
    rxgroup:"OptumRx", rxgroupId:12, insuranceName:"OptumRx", bin:"610011", binFullName:"Optum", binId:2, pcn:"OPT", pcnId:2, branchName:"East", date:"2025-07-20", scriptCode:"S1002", insuranceId: 12 },
  { drugId:3, drugName:"Ozempic 1mg/dose Pen", ndcCode:"00169143161", quantity:4, net:720, acquisitionCost:980, insurancePayment:700, patientPayment:20,
    drugClass:"GLP-1", ingrdient:"Semaglutide", form:"Pen injector", route:"Subcutaneous", strength:"1", strengthUnit:"mg/dose", teCode:"NA", type:"Brand",
    rxgroup:"Blue Cross", rxgroupId:13, insuranceName:"Blue Cross", bin:"004336", binFullName:"Blue Cross BIN", binId:3, pcn:"BC", pcnId:3, branchName:"North", date:"2025-06-11", scriptCode:"S1003", insuranceId: 13 },
  // no-insurance examples
  { drugId:4, drugName:"Generic Alt (no BIN)", ndcCode:"00000000001", quantity:30, net:6.5, acquisitionCost:20, insurancePayment:0, patientPayment:0, type:"Generic", binId:0, pcnId:0 }
];

/* ---- axiosInstance shim ---- */
const axiosInstance = {
  get: async (url: string) => {
    if (url.startsWith("/drug/GetDrugById")) return { data: MOCK_DRUG };
    if (url.startsWith("/drug/GetClassesByDrugId")) return { data: MOCK_CLASSES };
    if (url.startsWith("/drug/GetDetails")) {
      const u = new URL("http://x" + url);
      const ndc = u.searchParams.get("ndc") || "";
      const ins = u.searchParams.get("insuranceId") || "";
      const found = MOCK_ALTS.find(a => a.ndcCode === ndc && (a.insuranceId+"")===ins) || null;
      return { data: found };
    }
    if (url.startsWith("/drug/GetAllDrugs")) return { data: MOCK_ALTS };
    if (url.startsWith("/drug/GetAllMediDrugs")) return { data: MOCK_MEDI };
    return { data: [] };
  }
};

/* ---- useCart shim ---- */
const useCart = () => {
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const addToCart = (item:any) => setCartItems(prev => [...prev, item]);
  return { cartItems, addToCart };
};

/* ---- DrugDetailsModal stub ---- */
const DrugDetailsModal: React.FC<{
  drug: Drug; drugDetail: Prescription|null; onClose: ()=>void; formatCurrency: (n:number)=>string; drugClass: string;
}> = ({ onClose, drug, drugDetail }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-[520px] max-w-[90vw]">
      <h3 className="text-lg font-semibold mb-2">{drug.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">NDC: {drug.ndc}</p>
      {drugDetail && <p className="mt-2 text-sm">Net/Item: {(drugDetail.net/(drugDetail.quantity||1)).toFixed(3)}</p>}
      <div className="mt-4 flex justify-end">
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

/* ===== Mock Data داخل الصفحة مؤقتاً ===== */
const MOCK_MEDI: DrugMedi[] = [
  { drugNDC: "00601591", drugName: "Amoxicillin 500mg Cap", priorAuthorization: "No",  extendedDuration: "No",  costCeilingTier: "1", nonCapitatedDrugIndicator: "N", ccsPanelAuthority: "—" },
  { drugNDC: "00093012345", drugName: "Atorvastatin 20mg Tab", priorAuthorization: "Yes", extendedDuration: "Yes", costCeilingTier: "2", nonCapitatedDrugIndicator: "Y", ccsPanelAuthority: "—" },
  { drugNDC: "00169143161", drugName: "Ozempic 1mg/dose Pen",  priorAuthorization: "Yes", extendedDuration: "No",  costCeilingTier: "3", nonCapitatedDrugIndicator: "N", ccsPanelAuthority: "CCS" },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    drugId: 1, drugName: "Amoxicillin 500mg Cap", ndcCode: "00601591",
    quantity: 30, net: 12.7, acquisitionCost: 45.2, insurancePayment: 30, patientPayment: 5,
    drugClass: "Antibiotic", ingrdient: "Amoxicillin", form: "Capsule", route: "Oral", strength: "500", strengthUnit: "mg", teCode: "AB", type: "Generic",
    rxgroup: "Aetna Rx", rxgroupId: 11, insuranceName: "Aetna Rx",
    bin: "610591", binFullName: "Aetna", binId: 1,
    pcn: "AETNA", pcnId: 1, branchName: "Main", date: "2025-08-01", scriptCode: "S1001",
  },
  {
    drugId: 2, drugName: "Atorvastatin 20mg Tab", ndcCode: "00093012345",
    quantity: 30, net: 8.5, acquisitionCost: 32.9, insurancePayment: 25, patientPayment: 3,
    drugClass: "Statin", ingrdient: "Atorvastatin", form: "Tablet", route: "Oral", strength: "20", strengthUnit: "mg", teCode: "AB", type: "Generic",
    rxgroup: "OptumRx", rxgroupId: 12, insuranceName: "OptumRx",
    bin: "610011", binFullName: "Optum", binId: 2,
    pcn: "OPT", pcnId: 2, branchName: "East", date: "2025-07-20", scriptCode: "S1002",
  },
  {
    drugId: 3, drugName: "Ozempic 1mg/dose Pen", ndcCode: "00169143161",
    quantity: 4, net: 720, acquisitionCost: 980, insurancePayment: 700, patientPayment: 20,
    drugClass: "GLP-1", ingrdient: "Semaglutide", form: "Pen injector", route: "Subcutaneous", strength: "1", strengthUnit: "mg/dose", teCode: "NA", type: "Brand",
    rxgroup: "Blue Cross", rxgroupId: 13, insuranceName: "Blue Cross",
    bin: "004336", binFullName: "Blue Cross BIN", binId: 3,
    pcn: "BC", pcnId: 3, branchName: "North", date: "2025-06-11", scriptCode: "S1003",
  },
];

/* ===== Utilities ===== */
const padCode = (code?: string) => (code ? code.toString().padStart(11, "0") : "N/A");
const money = (n?: number) => (typeof n === "number" ? `$${n.toFixed(2)}` : "NA");

/* ========= NEW helpers ========= */
function MetricCard({ label, value, hint, progress }: { label: string; value: string; hint?: string; progress?: number }) {
  const pct = Math.max(0, Math.min(100, progress ?? 0));
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <span className="text-muted small">{label}</span>
        </div>
        <div className="h4 fw-bold mt-1">{value}</div>
        {hint && <div className="small text-muted">{hint}</div>}
        {typeof progress === "number" && (
          <div className="progress mt-3" style={{ height: 6 }}>
            <div className="progress-bar" role="progressbar" style={{ width: `${pct}%` }} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChipTag({ title }: { title: string }) {
  return <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis me-2">{title}</span>;
}

function InfoGroup({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center mb-2"><h6 className="mb-0">{title}</h6></div>
        <div className="row g-3">{children}</div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="col-md-4">
      <div className="small text-muted">{label}</div>
      <div className="fw-semibold">{value ?? "NA"}</div>
    </div>
  );
}

/* ====== Medi Policy Table ====== */
function MediPolicyTable({ data, selectedNdc }: { data: typeof MOCK_MEDI; selectedNdc?: string }) {
  const [qNdc, setQNdc] = React.useState("");
  const [qName, setQName] = React.useState("");
  const [page, setPage] = React.useState(1);
  const perPage = 10;

  const filtered = React.useMemo(() => {
    const ndc = qNdc.trim().toLowerCase();
    const name = qName.trim().toLowerCase();
    return data.filter(r => {
      const m1 = ndc ? (r.drugNDC || "").toLowerCase().includes(ndc) : true;
      const m2 = name ? (r.drugName || "").toLowerCase().includes(name) : true;
      return m1 && m2;
    });
  }, [data, qNdc, qName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);
  React.useEffect(() => setPage(1), [qNdc, qName]);

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">Medical Coverage Policy</h5>
          <span className="text-muted small">Showing {filtered.length} result(s)</span>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Search by NDC</label>
            <input className="form-control" value={qNdc} onChange={(e) => setQNdc(e.target.value)} placeholder="Enter NDC" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Search by Name</label>
            <input className="form-control" value={qName} onChange={(e) => setQName(e.target.value)} placeholder="Enter drug name" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 56 }}>#</th>
                <th>Name</th>
                <th>NDC</th>
                <th>Prior Authorization</th>
                <th>Extended Duration</th>
                <th>Cost Ceiling Tier</th>
                <th>Non-Capitated</th>
                <th>CCS Panel</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => {
                const isSel = r.drugNDC && selectedNdc && r.drugNDC === selectedNdc;
                return (
                  <tr key={(r.drugNDC || "") + i} className={isSel ? "table-info" : ""}>
                    <td>{(page - 1) * perPage + i + 1}</td>
                    <td className="fw-semibold">{r.drugName || "N/A"}</td>
                    <td className="font-monospace">
                      {r.drugNDC ? (
                        <a href={`https://ndclist.com/ndc/${padCode(r.drugNDC)}`} target="_blank" rel="noreferrer">
                          {padCode(r.drugNDC)}
                        </a>
                      ) : "N/A"}
                    </td>
                    <td>{r.priorAuthorization || "N/A"}</td>
                    <td>{r.extendedDuration || "N/A"}</td>
                    <td>{r.costCeilingTier || "N/A"}</td>
                    <td>{r.nonCapitatedDrugIndicator || "N/A"}</td>
                    <td>{r.ccsPanelAuthority || "N/A"}</td>
                  </tr>
                );
              })}
              {!slice.length && (
                <tr><td colSpan={8} className="text-center text-muted py-4">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <span className="small">Page {page} of {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== Alternatives (Tabs) ====== */
function AlternativesTabs({ data, selectedNdc }: { data: typeof MOCK_PRESCRIPTIONS; selectedNdc?: string }) {
  const [tab, setTab] = React.useState<"drug" | "pricing" | "insurance">("drug");
  const [sort, setSort] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [fRx, setFRx] = React.useState("");
  const [fBin, setFBin] = React.useState("");
  const [fPcn, setFPcn] = React.useState("");
  const perPage = 10;

  const rxNames = React.useMemo(() => Array.from(new Set(data.map(d => d.insuranceName).filter(Boolean))) as string[], [data]);
  const bins    = React.useMemo(() => Array.from(new Set(data.map(d => d.bin).filter(Boolean))) as string[], [data]);
  const pcns    = React.useMemo(() => Array.from(new Set(data.map(d => d.pcn).filter(Boolean))) as string[], [data]);

  const filtered = React.useMemo(() => {
    let arr = data.filter(d =>
      (!fRx  || d.insuranceName === fRx) &&
      (!fBin || d.bin === fBin) &&
      (!fPcn || d.pcn === fPcn)
    );
    arr = arr.sort((a, b) => {
      const aVal = a.net / (a.quantity || 1);
      const bVal = b.net / (b.quantity || 1);
      return sort === "asc" ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [data, fRx, fBin, fPcn, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);
  React.useEffect(() => setPage(1), [fRx, fBin, fPcn, sort]);

  return (
    <div className="card mt-3">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="mb-0">Drug alternatives with reimbursement / copay</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setSort(s => (s === "asc" ? "desc" : "asc"))}>
            Sort by Net/Item ({sort === "asc" ? "Low→High" : "High→Low"})
          </button>
        </div>

        <div className="row g-2 mt-2">
          <div className="col-md-4">
            <label className="form-label">Rx Group</label>
            <select className="form-select" value={fRx} onChange={(e) => setFRx(e.target.value)}>
              <option value="">All</option>
              {rxNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">BIN</label>
            <select className="form-select" value={fBin} onChange={(e) => setFBin(e.target.value)}>
              <option value="">All</option>
              {bins.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">PCN</label>
            <select className="form-select" value={fPcn} onChange={(e) => setFPcn(e.target.value)}>
              <option value="">All</option>
              {pcns.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <ul className="nav nav-tabs mt-3">
          <li className="nav-item"><button className={`nav-link ${tab === "drug" ? "active" : ""}`} onClick={() => setTab("drug")}>Drug Info</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === "pricing" ? "active" : ""}`} onClick={() => setTab("pricing")}>Pricing Info</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === "insurance" ? "active" : ""}`} onClick={() => setTab("insurance")}>Insurance Info</button></li>
        </ul>

        <div className="table-responsive border border-light border-top-0 rounded-bottom">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              {tab === "drug" && (
                <tr>
                  <th>Name</th><th>NDC</th><th>Class</th><th>Form</th>
                  <th>Strength</th><th>Ingredient</th><th>Route</th><th>TE Code</th><th>Market</th>
                </tr>
              )}
              {tab === "pricing" && (
                <tr>
                  <th>Name</th><th>NDC</th><th>Qty</th><th>Net</th><th>Insurance</th>
                  <th>Patient</th><th>ACQ</th><th>Net/Item</th><th>Script</th>
                </tr>
              )}
              {tab === "insurance" && (
                <tr>
                  <th>Name</th><th>NDC</th><th>Branch</th><th>RxGroup</th><th>BIN</th><th>PCN</th><th>Date</th>
                </tr>
              )}
            </thead>
            <tbody>
              {slice.map((r, i) => {
                const perItem = r.net / (r.quantity || 1);
                const isSelected = selectedNdc && r.ndcCode === selectedNdc;
                return (
                  <tr key={(r.ndcCode || "") + i} className={isSelected ? "table-info" : ""}>
                    {tab === "drug" && (
                      <>
                        <td className="fw-semibold">{r.drugName}</td>
                        <td className="font-monospace">
                          {r.ndcCode ? <a href={`https://ndclist.com/ndc/${padCode(r.ndcCode)}`} target="_blank" rel="noreferrer">{padCode(r.ndcCode)}</a> : "N/A"}
                        </td>
                        <td>{r.drugClass || "N/A"}</td>
                        <td>{r.form || "N/A"}</td>
                        <td>{r.strength ? `${r.strength} ${r.strengthUnit || ""}` : "N/A"}</td>
                        <td>{r.ingrdient || "N/A"}</td>
                        <td>{r.route || "N/A"}</td>
                        <td>{r.teCode || "N/A"}</td>
                        <td>{r.type || "N/A"}</td>
                      </>
                    )}
                    {tab === "pricing" && (
                      <>
                        <td className="fw-semibold">{r.drugName}</td>
                        <td className="font-monospace">
                          {r.ndcCode ? <a href={`https://ndclist.com/ndc/${padCode(r.ndcCode)}`} target="_blank" rel="noreferrer">{padCode(r.ndcCode)}</a> : "N/A"}
                        </td>
                        <td>{r.quantity}</td>
                        <td className="text-success">{money(r.net)}</td>
                        <td className="text-success">{money(r.insurancePayment)}</td>
                        <td className="text-success">{money(r.patientPayment)}</td>
                        <td className="text-danger">{money(r.acquisitionCost)}</td>
                        <td className="fw-semibold">{perItem.toFixed(3)}</td>
                        <td>{r.scriptCode ?? "—"}</td>
                      </>
                    )}
                    {tab === "insurance" && (
                      <>
                        <td className="fw-semibold">{r.drugName}</td>
                        <td className="font-monospace">
                          {r.ndcCode ? <a href={`https://ndclist.com/ndc/${padCode(r.ndcCode)}`} target="_blank" rel="noreferrer">{padCode(r.ndcCode)}</a> : "N/A"}
                        </td>
                        <td>{r.branchName || "—"}</td>
                        <td>{r.insuranceName || "—"}</td>
                        <td>{r.bin || "—"} {r.binFullName ? `– ${r.binFullName}` : ""}</td>
                        <td>{r.pcn || "—"}</td>
                        <td className="text-muted">{r.date ? new Date(r.date).toISOString().split("T")[0] : "—"}</td>
                      </>
                    )}
                  </tr>
                );
              })}
              {!slice.length && (
                <tr><td colSpan={tab === "drug" ? 9 : tab === "pricing" ? 9 : 7} className="text-center text-muted py-4">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex gap-2 align-items-center mt-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <span className="small">Page {page} of {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Other Alternatives (no selected insurance) ===== */
function OtherAlternativesTable({ data }: { data: Prescription[]; }) {
  const rows = React.useMemo(
    () => data.filter((d) => !d.insuranceId || d.insuranceId === 0 || ((d as any).binId === 0 && (d as any).pcnId === 0)),
    [data]
  );
  const [qNdc, setQNdc] = React.useState("");
  const [qName, setQName] = React.useState("");

  const filtered = rows.filter(
    (r) =>
      (!qNdc || (r.ndcCode || "").toLowerCase().includes(qNdc.toLowerCase())) &&
      (!qName || (r.drugName || "").toLowerCase().includes(qName.toLowerCase()))
  );

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="mb-3 text-capitalize">drug alternatives without available selected insurance plan data</h5>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label">Search by NDC</label>
            <input className="form-control" value={qNdc} onChange={(e) => setQNdc(e.target.value)} placeholder="Enter NDC code" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Search by Name</label>
            <input className="form-control" value={qName} onChange={(e) => setQName(e.target.value)} placeholder="Enter drug name" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>NDC</th>
                <th>Class</th>
                <th>Form</th>
                <th>Strength</th>
                <th>Ingredient</th>
                <th>Route</th>
                <th>TE Code</th>
                <th>Market Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={(r.ndcCode || "") + i}>
                  <td className="fw-semibold">{r.drugName || "—"}</td>
                  <td className="font-monospace">
                    {r.ndcCode ? (
                      <a href={`https://ndclist.com/ndc/${padCode(r.ndcCode)}`} target="_blank" rel="noreferrer">
                        {padCode(r.ndcCode)}
                      </a>
                    ) : ("N/A")}
                  </td>
                  <td>{r.drugClass || "—"}</td>
                  <td>{r.form || "—"}</td>
                  <td>{r.strength ? `${r.strength} ${r.strengthUnit || ""}` : "—"}</td>
                  <td>{r.ingrdient || "—"}</td>
                  <td>{r.route || "—"}</td>
                  <td>{r.teCode || "—"}</td>
                  <td>{r.type || "—"}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== UPDATED PAGE ===================== */
export default function DrugDetails() {
  // selected drug from mocks
  const drug: Drug = MOCK_DRUG;
  const selectedRx = MOCK_PRESCRIPTIONS.find((p) => p.ndcCode === drug.ndc) || null;
  const netPerItem = selectedRx ? selectedRx.net / (selectedRx.quantity || 1) : 0;

  const [showInsAlt, setShowInsAlt] = React.useState(true);
  const [showOtherAlt, setShowOtherAlt] = React.useState(true);
  const [showMedi, setShowMedi] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [classVersion, setClassVersion] = React.useState<string>(MOCK_CLASSES[0]?.classTypeName || "ClassV1");

  const selectedNdc = drug.ndc;

  return (
    <div className="content">
      {/* ===== Banner / Header ===== */}
      <div className="card border-0 mb-3" style={{ overflow: "hidden" }}>
        <div
          className="p-3 p-md-4 text-white"
          style={{ background: "linear-gradient(90deg, rgba(30,64,175,1) 0%, rgba(59,130,246,1) 60%, rgba(99,102,241,1) 100%)" }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="mb-1 fw-bold text-uppercase">{drug.name}</h4>
              <div>
                <ChipTag title={`NDC: ${padCode(drug.ndc)}`} />
                <ChipTag title={`Drug Class: ${selectedRx?.drugClass || MOCK_CLASSES[0]?.name || "—"}`} />
              </div>
            </div>
            <div className="d-grid d-sm-flex gap-2">
              <button className="btn btn-light" onClick={() => setShowModal(true)}>Show Details</button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <MetricCard label="ACQ" value={money(drug.acq)} hint="Acquisition cost" />
            </div>
            <div className="col-md-4">
              <MetricCard label="AWP" value={money(drug.awp)} hint="Average wholesale price" />
            </div>
            <div className="col-md-4">
              <MetricCard
                label="Net Per Item"
                value={netPerItem ? `$${netPerItem.toFixed(2)}` : "NA"}
                hint="+/- vs ACQ"
                progress={drug.acq ? Math.min(100, (netPerItem / (drug.acq || 1)) * 100) : 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Three info cards ===== */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="row g-3">
            <div className="col-lg-12">
              <InfoGroup title="Drug Reference Information">
                <InfoItem label="RxCUI" value={drug.rxcui || "NA"} />
                <InfoItem label="Ingredient" value={drug.ingrdient || "NA"} />
                <InfoItem label="TE Code" value={drug.teCode || "NA"} />
                <InfoItem label="Market Type" value={drug.type || "NA"} />
                <InfoItem label="Strength" value={drug.strength ? `${drug.strength} ${drug.strengthUnit || ""}` : "NA"} />
              </InfoGroup>
            </div>

            <div className="col-lg-12">
              <InfoGroup title="Drug Details">
                <InfoItem label="Insurance Pay" value={money(selectedRx?.insurancePayment)} />
                <InfoItem label="Patient Pay" value={money(selectedRx?.patientPayment)} />
                <InfoItem label="Quantity" value={selectedRx?.quantity ?? "—"} />
              </InfoGroup>
            </div>

            <div className="col-lg-12">
              <InfoGroup title="Insurance Details">
                <InfoItem label="BIN" value={selectedRx?.bin || "NA"} />
                <InfoItem label="PCN" value={selectedRx?.pcn || "NA"} />
                <InfoItem label="RxGroup" value={selectedRx?.insuranceName || selectedRx?.rxgroup || "NA"} />
              </InfoGroup>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Toggles + Class version ===== */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
        <button className={`btn btn-sm ${showInsAlt ? "btn-outline-primary" : "btn-primary"}`} onClick={() => setShowInsAlt(s => !s)}>
          {showInsAlt ? "Hide" : "Show"} Insurance Alternative Table
        </button>
        <button className={`btn btn-sm ${showOtherAlt ? "btn-outline-primary" : "btn-primary"}`} onClick={() => setShowOtherAlt(s => !s)}>
          {showOtherAlt ? "Hide" : "Show"} Other Alternatives
        </button>
        <button className={`btn btn-sm ${showMedi ? "btn-outline-primary" : "btn-primary"}`} onClick={() => setShowMedi(s => !s)}>
          {showMedi ? "Hide" : "Show"} Medi-Cal Section
        </button>

        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="small text-muted">Class Version</span>
          <select className="form-select form-select-sm" style={{ width: 140 }} value={classVersion} onChange={(e) => setClassVersion(e.target.value)}>
            {MOCK_CLASSES.map((c) => (
              <option key={c.id} value={c.classTypeName}>{c.classTypeName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== Sections in order ===== */}
      {showInsAlt && <AlternativesTabs data={MOCK_PRESCRIPTIONS} selectedNdc={selectedNdc} />}
      {showOtherAlt && <OtherAlternativesTable data={MOCK_ALTS as unknown as Prescription[]} />}
      {showMedi && <MediPolicyTable data={MOCK_MEDI} selectedNdc={selectedNdc} />}

      {showModal && (
        <DrugDetailsModal
          drug={drug}
          drugDetail={selectedRx}
          drugClass={selectedRx?.drugClass || ""}
          onClose={() => setShowModal(false)}
          formatCurrency={(n) => `$${n.toFixed(2)}`}
        />
      )}
    </div>
  );
}
