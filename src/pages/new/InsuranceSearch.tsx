import React, { useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import PageMeta from "../../components/PageMeta";

/** Types (aligned with your snippet) */
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
interface DrugModel {
  id: number;
  name: string;
  ndc: string;
  form: string;
  strength: string;
  drugClassId: number;
  drugClass?: string;
  acq: number;
  awp: number;
  rxcui: number;
}
interface Prescription {
  net?: number;
  ndc?: string;
  drugName?: string;
}

/* ===================== MOCK DATA ===================== */
const MOCK_BINS: BinModel[] = [
  { id: 1, name: "Optum", bin: "610011", helpDeskNumber: "800-555-0001" },
  { id: 2, name: "Medi-Cal", bin: "610205", helpDeskNumber: "800-555-0002" },
  { id: 3, name: "Caremark", bin: "004336", helpDeskNumber: "800-555-0003" },
];

const MOCK_PCNS_BY_BIN: Record<number, PcnModel[]> = {
  1: [
    { id: 11, pcn: "OPT", insuranceId: 1 },
    { id: 12, pcn: "OPT-RX", insuranceId: 1 },
  ],
  2: [
    { id: 21, pcn: "Medi-Cal", insuranceId: 2 },
    { id: 22, pcn: "MEDI-RX", insuranceId: 2 },
  ],
  3: [
    { id: 31, pcn: "CMK", insuranceId: 3 },
    { id: 32, pcn: "CMK-RX", insuranceId: 3 },
  ],
};

const MOCK_RX_BY_PCN: Record<number, RxGroupModel[]> = {
  11: [
    { id: 111, rxGroup: "OPT-GOLD", insurancePCNId: 11 },
    { id: 112, rxGroup: "OPT-SILVER", insurancePCNId: 11 },
  ],
  21: [
    { id: 211, rxGroup: "Medi-Cal", insurancePCNId: 21 },
    { id: 212, rxGroup: "Medi-Cal Plus", insurancePCNId: 21 },
  ],
  31: [
    { id: 311, rxGroup: "CMK-STD", insurancePCNId: 31 },
    { id: 312, rxGroup: "CMK-PLUS", insurancePCNId: 31 },
  ],
  12: [{ id: 121, rxGroup: "OPT-RX", insurancePCNId: 12 }],
  22: [{ id: 221, rxGroup: "MEDI-RX", insurancePCNId: 22 }],
  32: [{ id: 321, rxGroup: "CMK-RX", insurancePCNId: 32 }],
};

// a small DB with multiple NDCs per drug name (enough to paginate)
const DRUG_NAMES = [
  "Metformin", "Atorvastatin", "Lisinopril", "Amlodipine", "Losartan",
  "Levothyroxine", "Omeprazole", "Gabapentin", "Hydrochlorothiazide",
  "Simvastatin", "Amoxicillin", "Clopidogrel", "Rosuvastatin",
  "Sertraline", "Montelukast", "Pantoprazole", "Escitalopram",
  "Duloxetine", "Fluoxetine", "Warfarin",
];

function genDrug(id: number, name: string): DrugModel {
  const strength = `${(id % 4 ? 10 : 5) + (id % 7) * 5} mg`;
  const form = ["Tab", "Cap", "Sol"][id % 3];
  const drugClassId = (id % 7) + 1;
  const ndc = `${String(10000 + id)}-${String(100 + (id % 90))}-${String(1 + (id % 5))}`;
  return {
    id,
    name,
    ndc,
    form,
    strength,
    drugClassId,
    drugClass: `Class ${drugClassId}`,
    acq: +(2 + (id % 10) * 0.7).toFixed(2),
    awp: +(8 + (id % 10) * 1.2).toFixed(2),
    rxcui: 100000 + id,
  };
}

const ALL_DRUGS_DB: DrugModel[] = Array.from({ length: 120 }).map((_, i) => {
  const name = DRUG_NAMES[i % DRUG_NAMES.length];
  return genDrug(i + 1, name);
});

// mock net-price by (ndc + rxGroup) — deterministic but simple
function mockNet(ndc: string, rxGroupId: number): number {
  const hash = ndc.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return +((hash % 120) / 10 + (rxGroupId % 7)).toFixed(2); // e.g., $5.37 .. $18.9
}

/* ===================== COMPONENT ===================== */
const InsuranceSearch: React.FC = () => {
  // BIN → PCN → RxGroup
  const [binQuery, setBinQuery] = useState("");
  const [binSuggestions, setBinSuggestions] = useState<BinModel[]>([]);
  const [showBinSuggestions, setShowBinSuggestions] = useState(false);
  const [selectedBin, setSelectedBin] = useState<BinModel | null>(null);

  const [pcnList, setPcnList] = useState<PcnModel[]>([]);
  const [pcnSearchQuery, setPcnSearchQuery] = useState("");
  const [showPcnSuggestions, setShowPcnSuggestions] = useState(false);
  const filteredPcnList = useMemo(() => {
    const q = pcnSearchQuery.toLowerCase();
    return q ? pcnList.filter(p => p.pcn.toLowerCase().includes(q)) : pcnList;
  }, [pcnList, pcnSearchQuery]);
  const [selectedPcn, setSelectedPcn] = useState<PcnModel | null>(null);

  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [rxGroupSearchQuery, setRxGroupSearchQuery] = useState("");
  const [showRxGroupSuggestions, setShowRxGroupSuggestions] = useState(false);
  const filteredRxGroupList = useMemo(() => {
    const q = rxGroupSearchQuery.toLowerCase();
    return q ? rxGroups.filter(r => r.rxGroup.toLowerCase().includes(q)) : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(null);

  // drugs & ndc (with infinite scroll)
  const [limitSearch, setLimitSearch] = useState(true);
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
  const [suggestedDrugs, setSuggestedDrugs] = useState<DrugModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [ndcList, setNdcList] = useState<string[]>([]);
  const [ndcSearchQuery, setNdcSearchQuery] = useState("");
  const [showNdcSuggestions, setShowNdcSuggestions] = useState(false);
  const filteredNdcList = useMemo(() => {
    const q = ndcSearchQuery.toLowerCase();
    return q ? ndcList.filter(n => n.toLowerCase().includes(q)) : ndcList;
  }, [ndcList, ndcSearchQuery]);

  const [selectedDrug, setSelectedDrug] = useState<DrugModel | null>(null);
  const [selectedNdc, setSelectedNdc] = useState("");

  // details preview (mock)
  const details: Prescription | null = useMemo(() => {
    if (!selectedNdc || !selectedRxGroup) return null;
    return {
      ndc: selectedNdc,
      drugName: selectedDrug?.name,
      net: mockNet(selectedNdc, selectedRxGroup.id),
    };
  }, [selectedNdc, selectedRxGroup, selectedDrug]);

  const hideAllSuggestions = () => {
    setShowBinSuggestions(false);
    setShowPcnSuggestions(false);
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
    setShowNdcSuggestions(false);
  };

  /* ------- BIN search (mock) ------- */
  useEffect(() => {
    if (!binQuery.trim()) {
      setBinSuggestions([]);
      setShowBinSuggestions(false);
      return;
    }
    const q = binQuery.toLowerCase();
    const list = MOCK_BINS.filter(
      b => b.bin.includes(binQuery) || (b.name ?? "").toLowerCase().includes(q)
    );
    setBinSuggestions(list);
    setShowBinSuggestions(true);
  }, [binQuery]);

  const onPickBin = (bin: BinModel) => {
    setSelectedBin(bin);
    setBinQuery(`${bin.name ?? ""} ${bin.name ? " - " : ""}${bin.bin}`);
    setShowBinSuggestions(false);

    // reset downstream
    const pcns = MOCK_PCNS_BY_BIN[bin.id] ?? [];
    setPcnList(pcns);
    setSelectedPcn(null);

    setRxGroups([]);
    setSelectedRxGroup(null);

    setDrugSearchQuery("");
    setSuggestedDrugs([]);
    setCurrentPage(1);

    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  /* ------- PCN ------- */
  const onPickPcn = (pcn: PcnModel) => {
    setSelectedPcn(pcn);
    setPcnSearchQuery(pcn.pcn);
    setShowPcnSuggestions(false);

    const rxs = MOCK_RX_BY_PCN[pcn.id] ?? [];
    setRxGroups(rxs);
    setSelectedRxGroup(null);

    setDrugSearchQuery("");
    setSuggestedDrugs([]);
    setCurrentPage(1);

    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  /* ------- Rx Group ------- */
  const onPickRx = (rx: RxGroupModel) => {
    setSelectedRxGroup(rx);
    setRxGroupSearchQuery(rx.rxGroup);
    setShowRxGroupSuggestions(false);

    setDrugSearchQuery("");
    setSuggestedDrugs([]);
    setCurrentPage(1);

    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  /* ------- Drug search + pagination (mock) ------- */
  const recomputeSuggestions = (page = 1) => {
    const q = drugSearchQuery.toLowerCase();

    // base: filter by text
    let pool = ALL_DRUGS_DB.filter(d => d.name.toLowerCase().includes(q));

    // if limitSearch ON, further "simulate coverage" by ids
    if (limitSearch) {
      if (selectedRxGroup) {
        const m = selectedRxGroup.id % 3;
        pool = pool.filter(d => d.drugClassId % 3 === m);
      } else if (selectedPcn) {
        const m = selectedPcn.id % 2;
        pool = pool.filter(d => d.drugClassId % 2 === m);
      } else if (selectedBin) {
        const m = selectedBin.id % 5;
        pool = pool.filter(d => d.drugClassId % 5 === m);
      }
    }

    // unique by name for suggestions
    const uniqueByName = Array.from(new Map(pool.map(d => [d.name, d])).values());

    const start = (page - 1) * PAGE_SIZE;
    const pageSlice = uniqueByName.slice(start, start + PAGE_SIZE);

    if (page === 1) setSuggestedDrugs(pageSlice);
    else setSuggestedDrugs(prev => [...prev, ...pageSlice]);
  };

  useEffect(() => {
    if (!drugSearchQuery.trim()) {
      setSuggestedDrugs([]);
      setCurrentPage(1);
      return;
    }
    setCurrentPage(1);
    recomputeSuggestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugSearchQuery, limitSearch, selectedBin, selectedPcn, selectedRxGroup]);

  // infinite scroll
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    const onScroll = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const atBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 4;
      if (atBottom && suggestedDrugs.length >= PAGE_SIZE * currentPage) {
        const next = currentPage + 1;
        setCurrentPage(next);
        recomputeSuggestions(next);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedDrugs, currentPage]);

  const filterDrugNames = suggestedDrugs; // already unique by name

  const onPickDrug = (drug: DrugModel) => {
    setSelectedDrug(drug);

    // collect all NDCs for this name from the whole DB
    const ndcs = Array.from(
      new Set(ALL_DRUGS_DB.filter(d => d.name === drug.name).map(d => d.ndc))
    );
    setNdcList(ndcs);
    setSelectedNdc(ndcs[0] ?? "");
    setNdcSearchQuery(ndcs[0] ?? "");
    setShowDrugSuggestions(false);
  };

  const onPickNdc = (ndc: string) => {
    setSelectedNdc(ndc);
    setNdcSearchQuery(ndc);
    setShowNdcSuggestions(false);
  };

  /* ------- clear all ------- */
  const clearAll = () => {
    setBinQuery("");
    setBinSuggestions([]);
    setShowBinSuggestions(false);
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
    setSuggestedDrugs([]);
    setShowDrugSuggestions(false);
    setCurrentPage(1);

    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  // click outside to close popovers
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".js-suggest")) hideAllSuggestions();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="container py-4">
      <PageMeta title="Insurance Search" description="Search by BIN / PCN / Rx Group using mock data." />
  
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="Insurance Search" />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-building-bank me-2"></i>
                Insurance Search
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Search for drugs based on BIN, PCN, and Rx Group criteria — all mock data until we connect the API.
              </p>
            </div>
            
            <div className="card-body p-5">
              {/* Toggle limit search */}
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

              {/* BIN */}
              <div className="mb-4 position-relative js-suggest">
                <label className="form-label fw-medium text-dark mb-2">
                  <i className="ti ti-id me-1"></i>
                  Type BIN or Insurance Name
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="ti ti-search text-primary" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-2"
                    placeholder="e.g., 610011 or Optum"
                    value={binQuery}
                    onChange={e => setBinQuery(e.target.value)}
                    onFocus={() => setShowBinSuggestions(true)}
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

                {showBinSuggestions && binSuggestions.length > 0 && (
                  <div
                    className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                    style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                    role="listbox"
                    aria-label="BIN suggestions"
                  >
                    {binSuggestions.map(b => (
                      <button
                        key={b.id}
                        className="list-group-item list-group-item-action border-0 py-3 px-4"
                        onClick={() => onPickBin(b)}
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
              {pcnList.length > 0 && (
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">
                    <i className="ti ti-id-badge me-1"></i>
                    Search for PCN
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="e.g., MEDI-RX…"
                      value={pcnSearchQuery}
                      onChange={e => setPcnSearchQuery(e.target.value)}
                      onFocus={() => setShowPcnSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showPcnSuggestions && filteredPcnList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="PCN suggestions"
                    >
                      {filteredPcnList.map(p => (
                        <button
                          key={p.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickPcn(p)}
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
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">
                    <i className="ti ti-users me-1"></i>
                    Search for Rx Group
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="e.g., Medi-Cal Plus…"
                      value={rxGroupSearchQuery}
                      onChange={e => setRxGroupSearchQuery(e.target.value)}
                      onFocus={() => setShowRxGroupSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="Rx Group suggestions"
                    >
                      {filteredRxGroupList.map(rx => (
                        <button
                          key={rx.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickRx(rx)}
                        >
                          {rx.rxGroup}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drug search (with infinite scroll) */}
              {(selectedBin?.bin ?? "").length > 0 && (
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">
                    <i className="ti ti-pill me-1"></i>
                    Search for Drug
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="e.g., Metformin"
                      value={drugSearchQuery}
                      onChange={e => setDrugSearchQuery(e.target.value)}
                      onFocus={() => setShowDrugSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showDrugSuggestions && filterDrugNames.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="Drug suggestions"
                    >
                      {filterDrugNames.map(d => (
                        <button
                          key={d.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickDrug(d)}
                        >
                          <div className="d-flex align-items-center">
                            <i className="ti ti-pill text-primary me-2"></i>
                            {d.name}
                          </div>
                        </button>
                      ))}
                      {filterDrugNames.length >= PAGE_SIZE * currentPage && (
                        <div className="text-center small text-muted py-3 border-top">
                          <i className="ti ti-loader me-1"></i>
                          Loading more…
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* NDC search */}
              {ndcList.length > 0 && (
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">
                    <i className="ti ti-barcode me-1"></i>
                    Search for NDC
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="Type to filter NDCs…"
                      value={ndcSearchQuery}
                      onChange={e => setNdcSearchQuery(e.target.value)}
                      onFocus={() => setShowNdcSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showNdcSuggestions && filteredNdcList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="NDC suggestions"
                    >
                      {filteredNdcList.map((ndc, i) => (
                        <button
                          key={`${ndc}-${i}`}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickNdc(ndc)}
                        >
                          <div className="d-flex align-items-center">
                            <i className="ti ti-barcode text-primary me-2"></i>
                            {ndc}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview (mock) */}
              {details && (
                <div className="alert alert-primary d-flex align-items-center gap-3 p-3 rounded-3 mb-4">
                  <div className="bg-white p-3 rounded-3">
                    <i className="ti ti-currency-dollar text-primary fs-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="fw-semibold">Estimated Net Price</div>
                    <div className="fs-5 fw-bold">{details.net != null ? `$${details.net}` : "N/A"}</div>
                  </div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && selectedNdc && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  data-bs-toggle="modal"
                  data-bs-target="#insDetailsModal"
                >
                  <i className="ti ti-file-text me-2"></i>
                  View Drug Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal with all selections (mock) */}
      <div className="modal fade" id="insDetailsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h6 className="modal-title">
                <i className="ti ti-info-circle me-2"></i>
                Drug Details (Mock)
              </h6>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-muted small">BIN:</div>
                  <div className="fw-semibold">{selectedBin ? `${selectedBin.name ?? ""}${selectedBin.name ? " - " : ""}${selectedBin.bin}` : "-"}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">PCN:</div>
                  <div className="fw-semibold">{selectedPcn?.pcn ?? "-"}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-muted small">Rx Group:</div>
                  <div className="fw-semibold">{selectedRxGroup?.rxGroup ?? "-"}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Drug:</div>
                  <div className="fw-semibold">{selectedDrug?.name ?? "-"}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-muted small">NDC:</div>
                  <div className="fw-semibold">{selectedNdc || "-"}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Net Price:</div>
                  <div className="fw-semibold">{details?.net != null ? `$${details.net}` : "-"}</div>
                </div>
              </div>
              <hr />
              <div className="small text-muted">
                <i className="ti ti-info-circle me-1"></i>
                All values are mock data until the API is connected.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceSearch;