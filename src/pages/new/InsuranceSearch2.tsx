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
  classId: number;   // “business” class id used by drugs
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

// Tiny mock “net” calculator for details preview
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
      <AutoBreadcrumb title="Insurance Search (Drug Class)" />

      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center mb-3">
                <h5 className="mb-1">Insurance Search Using Drug Class</h5>
                <div className="text-muted">
                  Type BIN/PCN/Rx Group, then search Drug Class. All values are mock data.
                </div>
              </div>

              {/* Toggle */}
              <div className="d-flex align-items-center justify-content-between border-top pt-3 pb-2 mb-3">
                <label htmlFor="limitSearch" className="form-label m-0">
                  Limit search to selected insurance data
                </label>
                <div className="form-check form-switch m-0">
                  <input
                    id="limitSearch"
                    className="form-check-input"
                    type="checkbox"
                    checked={limitSearch}
                    onChange={() => { clearAll(); setLimitSearch(!limitSearch); }}
                  />
                </div>
              </div>

              {/* BIN */}
              <div className="mb-4 position-relative">
                <label className="form-label">Type BIN or Insurance Name</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="ti ti-search" /></span>
                  <input
                    type="text"
                    value={binQuery}
                    onChange={(e) => setBinQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowBinSuggestions(true); }}
                    placeholder="e.g., 012345 or Medi-Cal"
                    className="form-control"
                  />
                  {binQuery && (
                    <button className="btn btn-outline-secondary" onClick={clearAll}>
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
                {showBinSuggestions && filteredBins.length > 0 && (
                  <div
                    className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                    style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                    role="listbox"
                  >
                    {filteredBins.map(b => (
                      <button
                        key={b.id}
                        className="list-group-item list-group-item-action border-0 text-start"
                        onClick={() => onSelectBin(b)}
                      >
                        {b.bin} {b.name ? `- ${b.name}` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PCN */}
              {pncOr(selectedBin) && (
                <div className="mb-4 position-relative">
                  <label className="form-label">Search for PCN</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pcnSearchQuery}
                    onChange={(e) => setPcnSearchQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowPcnSuggestions(true); }}
                    placeholder="e.g., MEDICAL"
                  />
                  {showPcnSuggestions && filteredPcnList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                    >
                      {filteredPcnList.map(p => (
                        <button
                          key={p.id}
                          className="list-group-item list-group-item-action border-0 text-start"
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
                <div className="mb-4 position-relative">
                  <label className="form-label">Search for Rx Group</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rxGroupSearchQuery}
                    onChange={(e) => setRxGroupSearchQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowRxGroupSuggestions(true); }}
                    placeholder="e.g., Medi-Cal"
                  />
                  {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                    >
                      {filteredRxGroupList.map(rx => (
                        <button
                          key={rx.id}
                          className="list-group-item list-group-item-action border-0 text-start"
                          onClick={() => onSelectRxGroup(rx)}
                        >
                          {rx.rxGroup}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drug Class (infinite) */}
              {!!selectedRxGroup && (
                <div className="mb-4 position-relative">
                  <label className="form-label">Search for Drug Class</label>
                  <input
                    type="text"
                    className="form-control"
                    value={drugSearchQuery}
                    onChange={(e) => setDrugSearchQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowDrugSuggestions(true); }}
                    placeholder="e.g., Statins"
                  />
                  {showDrugSuggestions && drugSearchQuery && (
                    <div
                      ref={listRef}
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                    >
                      {pagedClassInfos.map(ci => (
                        <button
                          key={ci.id}
                          className="list-group-item list-group-item-action border-0 text-start"
                          onClick={() => onSelectClass(ci)}
                        >
                          {ci.className}
                          <span className="text-muted small ms-2">{ci.classType}</span>
                        </button>
                      ))}
                      {pagedClassInfos.length < filteredClassInfos.length && (
                        <div className="text-center small text-muted py-2 border-top">Loading more…</div>
                      )}
                      {pagedClassInfos.length === 0 && (
                        <div className="text-center small text-muted py-2">No classes found</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* NDC (read-only display or choose if multiple) */}
              {ndcList.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">NDC</label>
                  {ndcList.length === 1 ? (
                    <input className="form-control" value={selectedNdc} readOnly />
                  ) : (
                    <select
                      className="form-select"
                      value={selectedNdc}
                      onChange={(e) => setSelectedNdc(e.target.value)}
                    >
                      {ndcList.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  )}
                </div>
              )}

              {/* Preview */}
              {selectedDrug && selectedNdc && (
                <div className="alert alert-secondary">
                  <div className="row g-2">
                    <div className="col-6"><span className="text-muted">Drug:</span> <strong>{selectedDrug.name}</strong></div>
                    <div className="col-6"><span className="text-muted">NDC:</span> <strong>{selectedNdc}</strong></div>
                    <div className="col-12"><span className="text-muted">Class:</span> <strong>{selectedDrug.className}</strong></div>
                    <div className="col-6"><span className="text-muted">ACQ:</span> ${selectedDrug.acq}</div>
                    <div className="col-6"><span className="text-muted">AWP:</span> ${selectedDrug.awp}</div>
                    <div className="col-6"><span className="text-muted">Route:</span> {selectedDrug.route}</div>
                    <div className="col-6"><span className="text-muted">TE Code:</span> {selectedDrug.teCode}</div>
                    <div className="col-12"><span className="text-muted">Net (mock):</span> <strong>${mockNet(selectedNdc, selectedRxGroup?.id)}</strong></div>
                  </div>
                  <div className="small text-muted mt-2">All values are mock data until the API is connected.</div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && selectedNdc && (
                <button
                  className="btn btn-primary w-100"
                  onClick={() => {
                    // mimic your original navigate pattern
                    navigate(`/drug/${selectedDrug.id}?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${selectedRxGroup?.id ?? ""}`);
                  }}
                >
                  View Drug Details <i className="ti ti-external-link ms-1" />
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
