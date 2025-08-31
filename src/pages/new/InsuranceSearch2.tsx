import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/PageMeta";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";

/* ===================== Types (kept compatible) ===================== */
interface BinModel {
  id: number;
  name?: string;
  bin: string;
  helpDeskNumber?: string;
}
interface PcnModel {
  id: number;
  pcn: string;
  insuranceId: number;
}
interface RxGroupModel {
  id: number;
  rxGroup: string;
  insurancePCNId: number;
}
interface ClassInfo {
  id: number;        // internal id of the class record
  classId: number;   // "business" class id used by drugs
  className: string;
  classType: string; // e.g., "ClassV1"
}
interface DrugModel {
  id: number;
  name: string;
  ndc: string;
  form: string;
  strength: string;
  classId: number;
  classType: string;
  className: string;
  acq: number;
  awp: number;
  rxcui: number;
  route: string;
  teCode: string;
  ingrdient: string;
  applicationNumber: string;
  applicationType: string;
  strengthUnit: string;
  type: string;
}
interface Prescription {
  net?: number;
  ndc?: string;
  drugName?: string;
}

/* ===================== Mock Data ===================== */
const CLASS_TYPE_DEFAULT = (typeof window !== "undefined" && localStorage.getItem("classType")) || "ClassV1";

const MOCK_BINS: BinModel[] = [
  { id: 1, name: "Medi-Cal", bin: "012345", helpDeskNumber: "800-111-2222" },
  { id: 2, name: "OptumRx",  bin: "987654", helpDeskNumber: "800-333-4444" },
  { id: 3, name: "Caremark", bin: "610591", helpDeskNumber: "800-555-6666" },
];

const MOCK_PCNS_BY_BIN: Record<number, PcnModel[]> = {
  1: [
    { id: 11, pcn: "MEDICAL", insuranceId: 1 },
    { id: 12, pcn: "MCAL-ALT", insuranceId: 1 },
  ],
  2: [
    { id: 21, pcn: "OPTUM", insuranceId: 2 },
    { id: 22, pcn: "OPX-PLUS", insuranceId: 2 },
  ],
  3: [
    { id: 31, pcn: "CMK", insuranceId: 3 },
    { id: 32, pcn: "CMK-RX", insuranceId: 3 },
  ],
};

const MOCK_RXGROUPS_BY_PCN: Record<number, RxGroupModel[]> = {
  11: [
    { id: 101, rxGroup: "Medi-Cal",      insurancePCNId: 11 },
    { id: 102, rxGroup: "Medi-Cal Plus", insurancePCNId: 11 },
  ],
  12: [{ id: 103, rxGroup: "Medi-Cal Alt", insurancePCNId: 12 }],
  21: [{ id: 201, rxGroup: "OPT-RX", insurancePCNId: 21 }],
  22: [{ id: 202, rxGroup: "OPT-GOLD", insurancePCNId: 22 }],
  31: [{ id: 301, rxGroup: "CMK-STD", insurancePCNId: 31 }],
  32: [{ id: 302, rxGroup: "CMK-PLUS", insurancePCNId: 32 }],
};

const CLASS_NAMES = [
  "Biguanides", "Statins", "ACE Inhibitors", "Calcium Channel Blockers",
  "ARBs", "Thyroid Hormones", "PPIs", "Anticonvulsants", "Diuretics",
  "Penicillins", "Antiplatelets", "SSRIs", "SNRIs",
];

function makeClassInfo(i: number): ClassInfo {
  const classId = 1000 + i;
  return {
    id: i,
    classId,
    className: CLASS_NAMES[i % CLASS_NAMES.length] + ` ${i}`,
    classType: CLASS_TYPE_DEFAULT,
  };
}

const ALL_CLASS_INFOS: ClassInfo[] = Array.from({ length: 80 }, (_, i) => makeClassInfo(i + 1));

function makeDrugForClass(classInfo: ClassInfo, idx: number): DrugModel {
  const id = classInfo.classId * 10 + idx;
  const nameSeed = ["Metformin", "Atorvastatin", "Lisinopril", "Amlodipine", "Losartan"][idx % 5];
  const strengthNum = 5 + ((id % 6) * 5);
  const ndc = `${10000 + id}-${100 + (id % 80)}-${1 + (id % 4)}`;
  return {
    id,
    name: nameSeed,
    ndc,
    form: ["Tab", "Cap", "Sol"][id % 3],
    strength: `${strengthNum}`,
    classId: classInfo.classId,
    classType: classInfo.classType,
    className: classInfo.className,
    acq: +(2 + (id % 10) * 0.65).toFixed(2),
    awp: +(8 + (id % 12) * 1.15).toFixed(2),
    rxcui: 200000 + id,
    route: ["Oral", "IV", "IM"][id % 3],
    teCode: ["AB", "BX", "AA"][id % 3],
    ingrdient: ["Metformin HCl", "Atorvastatin", "Lisinopril", "Amlodipine", "Losartan"][idx % 5],
    applicationNumber: `ANDA${7000 + id}`,
    applicationType: ["ANDA", "NDA"][id % 2],
    strengthUnit: "mg",
    type: ["Generic", "Brand"][id % 2],
  };
}

// map classId -> drugs
const DRUGS_BY_CLASS: Record<number, DrugModel[]> = {};
ALL_CLASS_INFOS.forEach(ci => {
  DRUGS_BY_CLASS[ci.classId] = Array.from({ length: 6 }, (_, i) => makeDrugForClass(ci, i));
});

// Tiny mock "net" calculator for details preview
function mockNet(ndc: string, rxGroupId?: number) {
  const base = ndc.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 130;
  return +(((base / 10) + ((rxGroupId ?? 0) % 7)).toFixed(2));
}

/* ===================== Component ===================== */
const InsuranceSearch2: React.FC = () => {
  const navigate = useNavigate();

  // toggles / filters
  const [limitSearch, setLimitSearch] = useState(true);

  // BIN → PCN → RxGroup
  const [binQuery, setBinQuery] = useState("");
  const [showBinSuggestions, setShowBinSuggestions] = useState(false);
  const [selectedBin, setSelectedBin] = useState<BinModel | null>(null);

  const [pcnList, setPcnList] = useState<PcnModel[]>([]);
  const [pcnSearchQuery, setPcnSearchQuery] = useState("");
  const [showPcnSuggestions, setShowPcnSuggestions] = useState(false);
  const filteredPcnList = useMemo(() => {
    const q = pcnSearchQuery.toLowerCase();
    return q ? pcnList.filter(p => p.pcn.toLowerCase().includes(q)) : pcnList;
  }, [pcnList, pcnSearchQuery]);

  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [rxGroupSearchQuery, setRxGroupSearchQuery] = useState("");
  const [showRxGroupSuggestions, setShowRxGroupSuggestions] = useState(false);
  const filteredRxGroupList = useMemo(() => {
    const q = rxGroupSearchQuery.toLowerCase();
    return q ? rxGroups.filter(r => r.rxGroup.toLowerCase().includes(q)) : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);

  const [selectedPcn, setSelectedPcn] = useState<PcnModel | null>(null);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(null);

  // Drug Class search (infinite)
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [classInfos, setClassInfos] = useState<ClassInfo[]>([]);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const listRef = useRef<HTMLDivElement | null>(null);

  // Selected drug & NDC
  const [drugs, setDrugs] = useState<DrugModel[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugModel | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [selectedNdc, setSelectedNdc] = useState("");
void drugs; void classInfos; void selectedPcn;
  // Suggestions helpers
  const filteredBins = useMemo(() => {
    const q = binQuery.toLowerCase();
    return q ? MOCK_BINS.filter(b => (b.bin + " " + (b.name ?? "")).toLowerCase().includes(q)) : [];
  }, [binQuery]);

  const filteredClassInfos = useMemo(() => {
    const q = drugSearchQuery.toLowerCase();
    let pool = ALL_CLASS_INFOS.filter(c => c.className.toLowerCase().includes(q));

    if (limitSearch && selectedRxGroup) {
      // emulate coverage restriction
      const mod = selectedRxGroup.id % 3;
      pool = pool.filter(c => c.classId % 3 === mod);
    }
    return pool;
  }, [drugSearchQuery, limitSearch, selectedRxGroup]);

  const pagedClassInfos = useMemo(() => {
    const end = page * PAGE_SIZE;
    return filteredClassInfos.slice(0, end);
  }, [filteredClassInfos, page]);

  // Infinite scrolling on class list
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        if (pagedClassInfos.length < filteredClassInfos.length) {
          setPage(p => p + 1);
        }
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [pagedClassInfos.length, filteredClassInfos.length]);

  // Reset page when query/filters change
  useEffect(() => {
    setPage(1);
  }, [drugSearchQuery, limitSearch, selectedRxGroup]);

  const hideAllSuggestions = () => {
    setShowBinSuggestions(false);
    setShowPcnSuggestions(false);
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
  };

  // BIN select
  const onSelectBin = (bin: BinModel) => {
    setSelectedBin(bin);
    setBinQuery(`${bin.name ?? ""} - ${bin.bin}`);
    setShowBinSuggestions(false);

    // downstream reset & load
    const pcns = MOCK_PCNS_BY_BIN[bin.id] ?? [];
    setPcnList(pcns);
    setSelectedPcn(null);
    setRxGroups([]);
    setSelectedRxGroup(null);

    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);

    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
  };

  // PCN select
  const onSelectPcn = (pcn: PcnModel) => {
    setSelectedPcn(pcn);
    setPcnSearchQuery(pcn.pcn);
    setShowPcnSuggestions(false);

    const rxs = MOCK_RXGROUPS_BY_PCN[pcn.id] ?? [];
    setRxGroups(rxs);
    setSelectedRxGroup(null);

    // downstream reset
    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
  };

  // RxGroup select
  const onSelectRxGroup = (rg: RxGroupModel) => {
    setSelectedRxGroup(rg);
    setRxGroupSearchQuery(rg.rxGroup);
    setShowRxGroupSuggestions(false);

    // downstream reset
    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
  };

  // Search class (local mock)
  useEffect(() => {
    if (!drugSearchQuery.trim()) {
      setClassInfos([]);
      return;
    }
    setClassInfos(pagedClassInfos);
  }, [drugSearchQuery, pagedClassInfos]);

  // Click class → fetch drugs (mock)
  const onSelectClass = (ci: ClassInfo) => {
    const arr = DRUGS_BY_CLASS[ci.classId] ?? [];
    setDrugs(arr);
    const first = arr[0];
    setSelectedDrug(first ?? null);

    const ndcs = Array.from(new Set(arr.map(d => d.ndc)));
    setNdcList(ndcs);
    setSelectedNdc(ndcs[0] ?? "");
    setShowDrugSuggestions(false);
  };

  const clearAll = () => {
    setBinQuery("");
    setSelectedBin(null);
    setPcnList([]);
    setPcnSearchQuery("");
    setShowPcnSuggestions(false);
    setSelectedPcn(null);
    setRxGroups([]);
    setRxGroupSearchQuery("");
    setShowRxGroupSuggestions(false);
    setSelectedRxGroup(null);
    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
  };

  const details: Prescription | null = useMemo(() => {
    if (!selectedNdc) return null;
    return { ndc: selectedNdc, drugName: selectedDrug?.name, net: mockNet(selectedNdc, selectedRxGroup?.id) };
  }, [selectedNdc, selectedDrug, selectedRxGroup?.id]);

  return (
    <div className="container py-4">
      <PageMeta
        title="Insurance Search (Drug Class)"
        description="Search by BIN → PCN → Rx Group, then by Drug Class — mock data until API hookup."
        canonical={window.location.origin + "/insurance-search-2"}
      />
      
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="Insurance Search (Drug Class)" 
         />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-building-bank me-2"></i>
                Insurance Search (Drug Class)
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Type BIN/PCN/Rx Group, then search Drug Class. All values are mock data until API connection.
              </p>
            </div>
            
            <div className="card-body p-5">
              {/* Toggle */}
              <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3 mb-4">
                <label htmlFor="limitSearch" className="form-label m-0 fw-medium">
                  <i className="ti ti-filter me-1"></i>
                  Limit search to selected insurance data
                </label>
                <div className="form-check form-switch m-0">
                  <input
                    id="limitSearch"
                    className="form-check-input"
                    type="checkbox"
                    checked={limitSearch}
                    onChange={() => { clearAll(); setLimitSearch(!limitSearch); }}
                    style={{ width: "2.5em" }}
                  />
                </div>
              </div>

              {/* Insurance Information Section */}
              <div className="mb-4">
                <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                  <i className="ti ti-id me-2"></i>
                  Insurance Information
                </h6>
                
                <div className="row g-3">
                  {/* BIN */}
                  <div className="col-md-6 position-relative">
                    <label className="form-label fw-medium text-dark mb-2">BIN or Insurance Name</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="ti ti-search text-primary" />
                      </span>
                      <input
                        type="text"
                        value={binQuery}
                        onChange={(e) => setBinQuery(e.target.value)}
                        onFocus={() => { hideAllSuggestions(); setShowBinSuggestions(true); }}
                        placeholder="e.g., 012345 or Medi-Cal"
                        className="form-control border-start-0 ps-2"
                        style={{ height: "52px" }}
                      />
                      {binQuery && (
                        <button 
                          className="btn btn-outline-secondary d-flex align-items-center" 
                          onClick={clearAll}
                          style={{ height: "52px" }}
                        >
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                    {showBinSuggestions && filteredBins.length > 0 && (
                      <div
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                        role="listbox"
                      >
                        {filteredBins.map(b => (
                          <button
                            key={b.id}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectBin(b)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-medium">{b.bin}</span>
                              <span className="text-muted small">{b.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PCN */}
                  {pncOr(selectedBin) && (
                    <div className="col-md-6 position-relative">
                      <label className="form-label fw-medium text-dark mb-2">Search for PCN</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-search text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2"
                          value={pcnSearchQuery}
                          onChange={(e) => setPcnSearchQuery(e.target.value)}
                          onFocus={() => { hideAllSuggestions(); setShowPcnSuggestions(true); }}
                          placeholder="e.g., MEDICAL"
                          style={{ height: "52px" }}
                        />
                      </div>
                      {showPcnSuggestions && filteredPcnList.length > 0 && (
                        <div
                          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                          style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                          role="listbox"
                        >
                          {filteredPcnList.map(p => (
                            <button
                              key={p.id}
                              className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                              onClick={() => onSelectPcn(p)}
                            >
                              {p.pcn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rx Group */}
                  {rxGroups.length > 0 && (
                    <div className="col-md-6 position-relative">
                      <label className="form-label fw-medium text-dark mb-2">Search for Rx Group</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-search text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2"
                          value={rxGroupSearchQuery}
                          onChange={(e) => setRxGroupSearchQuery(e.target.value)}
                          onFocus={() => { hideAllSuggestions(); setShowRxGroupSuggestions(true); }}
                          placeholder="e.g., Medi-Cal"
                          style={{ height: "52px" }}
                        />
                      </div>
                      {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                        <div
                          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                          style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                          role="listbox"
                        >
                          {filteredRxGroupList.map(rx => (
                            <button
                              key={rx.id}
                              className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                              onClick={() => onSelectRxGroup(rx)}
                            >
                              {rx.rxGroup}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drug Class Section */}
              {!!selectedRxGroup && (
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                    <i className="ti ti-pill me-2"></i>
                    Drug Class Information
                  </h6>
                  
                  <div className="position-relative">
                    <label className="form-label fw-medium text-dark mb-2">Search for Drug Class</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="ti ti-search text-primary" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-2"
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        onFocus={() => { hideAllSuggestions(); setShowDrugSuggestions(true); }}
                        placeholder="e.g., Statins"
                        style={{ height: "52px" }}
                      />
                    </div>
                    {showDrugSuggestions && drugSearchQuery && (
                      <div
                        ref={listRef}
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                        role="listbox"
                      >
                        {pagedClassInfos.map(ci => (
                          <button
                            key={ci.id}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectClass(ci)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{ci.className}</span>
                              <span className="text-muted small">{ci.classType}</span>
                            </div>
                          </button>
                        ))}
                        {pagedClassInfos.length < filteredClassInfos.length && (
                          <div className="text-center small text-muted py-3 border-top">
                            <i className="ti ti-loader me-1"></i>
                            Loading more…
                          </div>
                        )}
                        {pagedClassInfos.length === 0 && (
                          <div className="text-center small text-muted py-3">No classes found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NDC Section */}
              {ndcList.length > 0 && (
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                    <i className="ti ti-barcode me-2"></i>
                    NDC Information
                  </h6>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-dark mb-2">NDC</label>
                      {ndcList.length === 1 ? (
                        <input className="form-control form-control-lg" value={selectedNdc} readOnly />
                      ) : (
                        <select
                          className="form-select form-select-lg"
                          value={selectedNdc}
                          onChange={(e) => setSelectedNdc(e.target.value)}
                        >
                          {ndcList.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      )}
                    </div>
                    
                    {/* Drug Details Preview */}
                    {selectedDrug && (
                      <div className="col-md-6">
                        <label className="form-label fw-medium text-dark mb-2">Drug Details</label>
                        <div className="bg-light rounded-3 p-3">
                          <div className="fw-semibold">{selectedDrug.name}</div>
                          <div className="small text-muted">{selectedDrug.className}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview */}
              {selectedDrug && selectedNdc && (
                <div className="alert alert-primary d-flex align-items-center gap-3 p-3 rounded-3 mb-4">
                  <div className="bg-white p-3 rounded-3">
                    <i className="ti ti-currency-dollar text-primary fs-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="fw-semibold">Estimated Net Price</div>
                    <div className="fs-5 fw-bold">{details?.net != null ? `$${details.net}` : "N/A"}</div>
                  </div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && selectedNdc && (
                <button
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  onClick={() => {
                    // mimic your original navigate pattern
                    navigate(`/drug/${selectedDrug.id}?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${selectedRxGroup?.id ?? ""}`);
                  }}
                >
                  <i className="ti ti-file-text me-2"></i>
                  View Drug Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** convenience: show PCN section only when a BIN is selected */
function pncOr(bin: BinModel | null) {
  return !!bin;
}

export default InsuranceSearch2;