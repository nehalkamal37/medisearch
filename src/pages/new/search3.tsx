import React, { useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import PageMeta from "../../components/PageMeta";

/** ====== Types (kept to match your fields) ====== */
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

/** ====== Mock Data ====== */
// Rx Groups (pretend these came from /Insurance/GetAllRxGroups)
const MOCK_RX_GROUPS: RxGroupModel[] = [
  { id: 101, rxGroup: "Medi-Cal", insurancePCNId: 21 },
  { id: 102, rxGroup: "Medi-Cal Plus", insurancePCNId: 21 },
  { id: 111, rxGroup: "OPT-GOLD", insurancePCNId: 11 },
  { id: 112, rxGroup: "OPT-SILVER", insurancePCNId: 11 },
  { id: 121, rxGroup: "OPT-RX", insurancePCNId: 12 },
  { id: 311, rxGroup: "CMK-STD", insurancePCNId: 31 },
  { id: 312, rxGroup: "CMK-PLUS", insurancePCNId: 31 },
  { id: 321, rxGroup: "CMK-RX", insurancePCNId: 32 },
];

// A small drug name catalog
const DRUG_NAMES = [
  "Metformin", "Atorvastatin", "Lisinopril", "Amlodipine", "Losartan",
  "Levothyroxine", "Omeprazole", "Gabapentin", "Hydrochlorothiazide",
  "Simvastatin", "Amoxicillin", "Clopidogrel", "Rosuvastatin",
  "Sertraline", "Montelukast", "Pantoprazole", "Escitalopram",
  "Duloxetine", "Fluoxetine", "Warfarin",
];

function makeDrug(id: number, name: string): DrugModel {
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

// “Database” of drugs to search/paginate
const ALL_DRUGS_DB: DrugModel[] = Array.from({ length: 140 }).map((_, i) =>
  makeDrug(i + 1, DRUG_NAMES[i % DRUG_NAMES.length])
);

// Quick deterministic mock net by (ndc + rxGroupId)
function mockNet(ndc: string, rxGroupId: number): number {
  const h = ndc.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return +((h % 120) / 10 + (rxGroupId % 7)).toFixed(2); // ~$5–$18
}

/** ====== Component ====== */
const Search3: React.FC = () => {
  // Limit toggle (kept)
  const [limitSearch, setLimitSearch] = useState(true);

  // RxGroup search
  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [rxGroupSearchQuery, setRxGroupSearchQuery] = useState("");
  const [showRxGroupSuggestions, setShowRxGroupSuggestions] = useState(false);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(null);

  // Drug search & pagination (infinite dropdown)
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
  const [suggestedDrugs, setSuggestedDrugs] = useState<DrugModel[]>([]);
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  // NDC search
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [ndcSearchQuery, setNdcSearchQuery] = useState("");
  const [showNdcSuggestions, setShowNdcSuggestions] = useState(false);

  // Selected entities
  const [selectedDrug, setSelectedDrug] = useState<DrugModel | null>(null);
  const [selectedNdc, setSelectedNdc] = useState("");

  // Derived: filtered rx groups
  const filteredRxGroups = useMemo(() => {
    const q = rxGroupSearchQuery.toLowerCase();
    return q ? rxGroups.filter(r => r.rxGroup.toLowerCase().includes(q)) : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);

  // Derived: filtered NDCs
  const filteredNdcList = useMemo(() => {
    const q = ndcSearchQuery.toLowerCase();
    return q ? ndcList.filter(n => n.toLowerCase().includes(q)) : ndcList;
  }, [ndcList, ndcSearchQuery]);

  // Details preview (mock)
  const details: Prescription | null = useMemo(() => {
    if (!selectedNdc || !selectedRxGroup) return null;
    return { ndc: selectedNdc, drugName: selectedDrug?.name, net: mockNet(selectedNdc, selectedRxGroup.id) };
  }, [selectedNdc, selectedRxGroup, selectedDrug]);

  // Mount: load all RxGroups (mock)
  useEffect(() => {
    setRxGroups(MOCK_RX_GROUPS);
  }, []);

  // Close all popovers
  const hideAllSuggestions = () => {
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
    setShowNdcSuggestions(false);
  };
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".js-suggest")) hideAllSuggestions();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Compute drug suggestions (mock “coverage” when limitSearch is ON)
  const recomputeDrugSuggestions = (page = 1) => {
    const q = drugSearchQuery.toLowerCase();
    let pool = ALL_DRUGS_DB.filter(d => d.name.toLowerCase().includes(q));

    if (limitSearch) {
      if (selectedRxGroup) {
        const mod = selectedRxGroup.id % 3;
        pool = pool.filter(d => d.drugClassId % 3 === mod);
      }
    }

    // unique by name
    const uniqueByName = Array.from(new Map(pool.map(d => [d.name, d])).values());
    const start = (page - 1) * PAGE_SIZE;
    const slice = uniqueByName.slice(start, start + PAGE_SIZE);

    if (page === 1) setSuggestedDrugs(slice);
    else setSuggestedDrugs(prev => [...prev, ...slice]);
  };

  // Re-run when inputs change
  useEffect(() => {
    if (!drugSearchQuery.trim()) {
      setSuggestedDrugs([]);
      setCurrentPage(1);
      return;
    }
    setCurrentPage(1);
    recomputeDrugSuggestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugSearchQuery, limitSearch, selectedRxGroup]);

  // Infinite scroll on drug dropdown
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    const onScroll = (e: Event) => {
      const tgt = e.currentTarget as HTMLElement;
      const atBottom = tgt.scrollHeight - tgt.scrollTop <= tgt.clientHeight + 4;
      if (atBottom && suggestedDrugs.length >= PAGE_SIZE * currentPage) {
        const next = currentPage + 1;
        setCurrentPage(next);
        recomputeDrugSuggestions(next);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedDrugs, currentPage]);

  // Handlers
  const onSelectRxGroup = (rg: RxGroupModel) => {
    setSelectedRxGroup(rg);
    setRxGroupSearchQuery(rg.rxGroup);
    setShowRxGroupSuggestions(false);

    // reset downstream
    setDrugSearchQuery("");
    setSuggestedDrugs([]);
    setCurrentPage(1);

    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  const onSelectDrug = (drug: DrugModel) => {
    setSelectedDrug(drug);
    setDrugSearchQuery(drug.name);
    setShowDrugSuggestions(false);

    // collect all NDCs for this name
    const ndcs = Array.from(new Set(ALL_DRUGS_DB.filter(d => d.name === drug.name).map(d => d.ndc)));
    setNdcList(ndcs);
    setSelectedNdc(ndcs[0] ?? "");
    setNdcSearchQuery(ndcs[0] ?? "");
  };

  const onSelectNdc = (ndc: string) => {
    setSelectedNdc(ndc);
    setNdcSearchQuery(ndc);
    setShowNdcSuggestions(false);
  };

  const clearAll = () => {
    setSelectedRxGroup(null);
    setRxGroupSearchQuery("");
    setDrugSearchQuery("");
    setSuggestedDrugs([]);
    setCurrentPage(1);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  return (
   
  <div className="container py-4">
  <PageMeta
    title="Rx Group → Drug → NDC Search"
    description="Search by Rx Group, then pick a drug and NDC — all mock data until the API is connected."
    canonical={window.location.origin + "/search3"}
  />

  {/* Centered breadcrumb block */}
  <div className="d-flex flex-column align-items-center text-center mb-4">
    <AutoBreadcrumb title="RxGroup, Drugs & NDC" />
  </div>

  <div className="row g-4 justify-content-center right-0">
    <div className="col-12 col-lg-8">
      <div className="card shadow-sm">
        <div className="card-body">
        

              <div className="text-center mb-3">
                <h5 className="mb-1">RxGroup, Drugs & NDC</h5>
                <div className="text-muted">
                  Search by Rx Group, then select a drug and NDC — all mock data until we connect the API.
                </div>
              </div>

              {/* Toggle limit search */}
              <div className="d-flex align-items-center justify-content-between border-top pt-3 pb-2 mb-3">
                <label htmlFor="limitSearch" className="form-label m-0">
                  Limit search to selected Rx Group
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

              {/* Rx Group combobox */}
              <div className="mb-4 position-relative js-suggest">
                <label className="form-label">Search for Rx Group</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="ti ti-search" /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type Rx Group…"
                    value={rxGroupSearchQuery}
                    onChange={e => setRxGroupSearchQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowRxGroupSuggestions(true); }}
                    aria-autocomplete="list"
                    aria-controls="rxgroup-listbox"
                  />
                  {rxGroupSearchQuery && (
                    <button className="btn btn-outline-secondary" onClick={clearAll} aria-label="Clear">
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>

                {showRxGroupSuggestions && filteredRxGroups.length > 0 && (
                  <ul
                    id="rxgroup-listbox"
                    role="listbox"
                    className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                    style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                  >
                    {filteredRxGroups.map(rg => (
                      <li
                        key={rg.id}
                        role="option"
                        tabIndex={0}
                        onClick={() => onSelectRxGroup(rg)}
                        onKeyDown={(e) => e.key === "Enter" && onSelectRxGroup(rg)}
                        className="list-group-item list-group-item-action border-0"
                      >
                        {rg.rxGroup}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Drug combobox */}
              {!!selectedRxGroup && (
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label">Search for Drug</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type drug name…"
                    value={drugSearchQuery}
                    onChange={e => setDrugSearchQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowDrugSuggestions(true); }}
                    aria-autocomplete="list"
                    aria-controls="drug-listbox"
                  />
                  {showDrugSuggestions && drugSearchQuery.length > 0 && suggestedDrugs.length > 0 && (
                    <ul
                      id="drug-listbox"
                      ref={dropdownRef}
                      role="listbox"
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                    >
                      {suggestedDrugs.map(d => (
                        <li
                          key={d.id}
                          role="option"
                          tabIndex={0}
                          onClick={() => onSelectDrug(d)}
                          onKeyDown={(e) => e.key === "Enter" && onSelectDrug(d)}
                          className="list-group-item list-group-item-action border-0"
                        >
                          {d.name}
                        </li>
                      ))}
                      {suggestedDrugs.length >= PAGE_SIZE * currentPage && (
                        <li className="text-center small text-muted py-2 border-top">Loading more…</li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              {/* NDC combobox */}
              {ndcList.length > 0 && (
                <div className="mb-3 position-relative js-suggest">
                  <label className="form-label">Search for NDC</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type to filter NDCs…"
                    value={ndcSearchQuery}
                    onChange={e => setNdcSearchQuery(e.target.value)}
                    onFocus={() => { hideAllSuggestions(); setShowNdcSuggestions(true); }}
                    aria-autocomplete="list"
                    aria-controls="ndc-listbox"
                  />
                  {showNdcSuggestions && filteredNdcList.length > 0 && (
                    <ul
                      id="ndc-listbox"
                      role="listbox"
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-sm"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                    >
                      {filteredNdcList.map((ndc, i) => (
                        <li
                          key={`${ndc}-${i}`}
                          role="option"
                          tabIndex={0}
                          onClick={() => onSelectNdc(ndc)}
                          onKeyDown={(e) => e.key === "Enter" && onSelectNdc(ndc)}
                          className="list-group-item list-group-item-action border-0"
                        >
                          {ndc}
                        </li>
                      ))}
                    </ul>
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
                  data-bs-target="#search3DetailsModal"
                >
                  View Drug Details <i className="ti ti-external-link ms-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal (mock) */}
      <div className="modal fade" id="search3DetailsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Drug Details (Mock)</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
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

export default Search3;
