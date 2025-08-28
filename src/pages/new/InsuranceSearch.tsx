import React, { useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import PageMeta from "../../components/PageMeta"; // tiny helper we added earlier

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

    // if limitSearch ON, further “simulate coverage” by ids
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
      <AutoBreadcrumb title="Insurance Search" />

      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center mb-3">
                <h5 className="mb-1">Insurance Search</h5>
                <div className="text-muted">
                  Search for drugs based on BIN, PCN, and Rx Group criteria — all mock data until we connect the API.
                </div>
              </div>

              {/* Toggle limit search */}
              <div className="d-flex align-items-center justify-content-between border-top pt-3 pb-1 mb-3">
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
              <div className="mb-4 position-relative js-suggest">
                <label className="form-label">Type BIN or Insurance Name</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="ti ti-search" /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 610011 or Optum"
                    value={binQuery}
                    onChange={e => setBinQuery(e.target.value)}
                    onFocus={() => setShowBinSuggestions(true)}
                  />
                  {binQuery && (
                    <button className="btn btn-outline-secondary" onClick={clearAll}>
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>

                {showBinSuggestions && binSuggestions.length > 0 && (
                  <div
                    className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                    style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                    role="listbox"
                    aria-label="BIN suggestions"
                  >
                    {binSuggestions.map(b => (
                      <button
                        key={b.id}
                        className="list-group-item list-group-item-action border-0"
                        onClick={() => onPickBin(b)}
                      >
                        {b.bin} {b.name ? `- ${b.name}` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PCN */}
              {pcnList.length > 0 && (
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label">Search for PCN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., MEDI-RX…"
                    value={pcnSearchQuery}
                    onChange={e => setPcnSearchQuery(e.target.value)}
                    onFocus={() => setShowPcnSuggestions(true)}
                  />
                  {showPcnSuggestions && filteredPcnList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="PCN suggestions"
                    >
                      {filteredPcnList.map(p => (
                        <button
                          key={p.id}
                          className="list-group-item list-group-item-action border-0"
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
                  <label className="form-label">Search for Rx Group</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Medi-Cal Plus…"
                    value={rxGroupSearchQuery}
                    onChange={e => setRxGroupSearchQuery(e.target.value)}
                    onFocus={() => setShowRxGroupSuggestions(true)}
                  />
                  {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="Rx Group suggestions"
                    >
                      {filteredRxGroupList.map(rx => (
                        <button
                          key={rx.id}
                          className="list-group-item list-group-item-action border-0"
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
                  <label className="form-label">Search for Drug</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Metformin"
                    value={drugSearchQuery}
                    onChange={e => setDrugSearchQuery(e.target.value)}
                    onFocus={() => setShowDrugSuggestions(true)}
                  />
                  {showDrugSuggestions && filterDrugNames.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="Drug suggestions"
                    >
                      {filterDrugNames.map(d => (
                        <button
                          key={d.id}
                          className="list-group-item list-group-item-action border-0"
                          onClick={() => onPickDrug(d)}
                        >
                          {d.name}
                        </button>
                      ))}
                      {filterDrugNames.length >= PAGE_SIZE * currentPage && (
                        <div className="text-center small text-muted py-2 border-top">
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
                  <label className="form-label">Search for NDC</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type to filter NDCs…"
                    value={ndcSearchQuery}
                    onChange={e => setNdcSearchQuery(e.target.value)}
                    onFocus={() => setShowNdcSuggestions(true)}
                  />
                  {showNdcSuggestions && filteredNdcList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="NDC suggestions"
                    >
                      {filteredNdcList.map((ndc, i) => (
                        <button
                          key={`${ndc}-${i}`}
                          className="list-group-item list-group-item-action border-0"
                          onClick={() => onPickNdc(ndc)}
                        >
                          {ndc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview (mock) */}
              {details && (
                <div className="alert alert-secondary">
                  <div className="fw-semibold mb-1">Net Price</div>
                  <div>{details.net != null ? `$${details.net}` : "N/A"}</div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && selectedNdc && (
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  data-bs-toggle="modal"
                  data-bs-target="#insDetailsModal"
                >
                  View Drug Details <i className="ti ti-external-link ms-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal with all selections (mock) */}
      <div className="modal fade" id="insDetailsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Drug Details (Mock)</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="mb-2"><span className="text-muted">BIN:</span> <strong>{selectedBin ? `${selectedBin.name ?? ""}${selectedBin.name ? " - " : ""}${selectedBin.bin}` : "-"}</strong></div>
              <div className="mb-2"><span className="text-muted">PCN:</span> <strong>{selectedPcn?.pcn ?? "-"}</strong></div>
              <div className="mb-2"><span className="text-muted">Rx Group:</span> <strong>{selectedRxGroup?.rxGroup ?? "-"}</strong></div>
              <div className="mb-2"><span className="text-muted">Drug:</span> <strong>{selectedDrug?.name ?? "-"}</strong></div>
              <div className="mb-2"><span className="text-muted">NDC:</span> <strong>{selectedNdc || "-"}</strong></div>
              <div className="mb-2"><span className="text-muted">Net:</span> <strong>{details?.net != null ? `$${details.net}` : "-"}</strong></div>
              <hr />
              <div className="small text-muted">All values are mock data until the API is connected.</div>
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
