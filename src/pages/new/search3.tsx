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

// "Database" of drugs to search/paginate
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

  // Compute drug suggestions (mock "coverage" when limitSearch is ON)
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

      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="RxGroup, Drugs & NDC" />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-users me-2"></i>
                RxGroup, Drugs & NDC Search
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Search by Rx Group, then select a drug and NDC — all mock data until we connect the API.
              </p>
            </div>
            
            <div className="card-body p-5">
              {/* Toggle limit search */}
              <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3 mb-4">
                <label htmlFor="limitSearch" className="form-label m-0 fw-medium">
                  <i className="ti ti-filter me-1"></i>
                  Limit search to selected Rx Group
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

              {/* Rx Group Section */}
              <div className="mb-4">
                <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                  <i className="ti ti-id-badge me-2"></i>
                  Rx Group Information
                </h6>
                
                <div className="position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">Search for Rx Group</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="Type Rx Group…"
                      value={rxGroupSearchQuery}
                      onChange={e => setRxGroupSearchQuery(e.target.value)}
                      onFocus={() => { hideAllSuggestions(); setShowRxGroupSuggestions(true); }}
                      aria-autocomplete="list"
                      aria-controls="rxgroup-listbox"
                      style={{ height: "52px" }}
                    />
                    {rxGroupSearchQuery && (
                      <button 
                        className="btn btn-outline-secondary d-flex align-items-center" 
                        onClick={clearAll}
                        aria-label="Clear"
                        style={{ height: "52px" }}
                      >
                        <i className="ti ti-x" />
                      </button>
                    )}
                  </div>

                  {showRxGroupSuggestions && filteredRxGroups.length > 0 && (
                    <ul
                      id="rxgroup-listbox"
                      role="listbox"
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                    >
                      {filteredRxGroups.map(rg => (
                        <li
                          key={rg.id}
                          role="option"
                          tabIndex={0}
                          onClick={() => onSelectRxGroup(rg)}
                          onKeyDown={(e) => e.key === "Enter" && onSelectRxGroup(rg)}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                        >
                          {rg.rxGroup}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Drug and NDC Section */}
              {!!selectedRxGroup && (
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                    <i className="ti ti-pill me-2"></i>
                    Drug Information
                  </h6>
                  
                  <div className="row g-3">
                    {/* Drug combobox */}
                    <div className="col-md-6 position-relative js-suggest">
                      <label className="form-label fw-medium text-dark mb-2">Search for Drug</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-search text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2"
                          placeholder="Type drug name…"
                          value={drugSearchQuery}
                          onChange={e => setDrugSearchQuery(e.target.value)}
                          onFocus={() => { hideAllSuggestions(); setShowDrugSuggestions(true); }}
                          aria-autocomplete="list"
                          aria-controls="drug-listbox"
                          style={{ height: "52px" }}
                        />
                      </div>
                      {showDrugSuggestions && drugSearchQuery.length > 0 && suggestedDrugs.length > 0 && (
                        <ul
                          id="drug-listbox"
                          ref={dropdownRef}
                          role="listbox"
                          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                          style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                        >
                          {suggestedDrugs.map(d => (
                            <li
                              key={d.id}
                              role="option"
                              tabIndex={0}
                              onClick={() => onSelectDrug(d)}
                              onKeyDown={(e) => e.key === "Enter" && onSelectDrug(d)}
                              className="list-group-item list-group-item-action border-0 py-3 px-4"
                            >
                              <div className="d-flex align-items-center">
                                <i className="ti ti-pill text-primary me-2"></i>
                                {d.name}
                              </div>
                            </li>
                          ))}
                          {suggestedDrugs.length >= PAGE_SIZE * currentPage && (
                            <li className="text-center small text-muted py-3 border-top">
                              <i className="ti ti-loader me-1"></i>
                              Loading more…
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* NDC combobox */}
                    {ndcList.length > 0 && (
                      <div className="col-md-6 position-relative js-suggest">
                        <label className="form-label fw-medium text-dark mb-2">Search for NDC</label>
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
                            onFocus={() => { hideAllSuggestions(); setShowNdcSuggestions(true); }}
                            aria-autocomplete="list"
                            aria-controls="ndc-listbox"
                            style={{ height: "52px" }}
                          />
                        </div>
                        {showNdcSuggestions && filteredNdcList.length > 0 && (
                          <ul
                            id="ndc-listbox"
                            role="listbox"
                            className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                            style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                          >
                            {filteredNdcList.map((ndc, i) => (
                              <li
                                key={`${ndc}-${i}`}
                                role="option"
                                tabIndex={0}
                                onClick={() => onSelectNdc(ndc)}
                                onKeyDown={(e) => e.key === "Enter" && onSelectNdc(ndc)}
                                className="list-group-item list-group-item-action border-0 py-3 px-4"
                              >
                                <div className="d-flex align-items-center">
                                  <i className="ti ti-barcode text-primary me-2"></i>
                                  {ndc}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
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
                  data-bs-target="#search3DetailsModal"
                >
                  <i className="ti ti-file-text me-2"></i>
                  View Drug Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal (mock) */}
      <div className="modal fade" id="search3DetailsModal" tabIndex={-1} aria-hidden="true">
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

export default Search3;