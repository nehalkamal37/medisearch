import React, { useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";

/** ====== Mock Data ====== */
type Drug = { id: number; name: string };
type DrugInsuranceInfo = { insuranceId: number; insurance: string };
type Prescription = { net?: number; ndc?: string; drugName?: string };

const MOCK_DRUGS: Drug[] = [
  { id: 1, name: "Metformin" },
  { id: 2, name: "Atorvastatin" },
  { id: 3, name: "Lisinopril" },
  { id: 4, name: "Amlodipine" },
  { id: 5, name: "Losartan" },
  { id: 6, name: "Levothyroxine" },
  { id: 7, name: "Omeprazole" },
  { id: 8, name: "Gabapentin" },
  { id: 9, name: "Hydrochlorothiazide" },
  { id: 10, name: "Simvastatin" },
];

const MOCK_NDCS_BY_DRUG: Record<string, string[]> = {
  Metformin: ["00093-1048-01", "00185-0730-01"],
  Atorvastatin: ["00603-1930-21", "60505-3673-3"],
  Lisinopril: ["68180-0518-01", "00093-1044-01"],
  Amlodipine: ["69097-127-05", "00603-3895-21"],
  Losartan: ["00603-5880-21"],
};

const MOCK_INS_BY_NDC: Record<string, DrugInsuranceInfo[]> = {
  "00093-1048-01": [
    { insuranceId: 11, insurance: "Blue Cross" },
    { insuranceId: 12, insurance: "Aetna" },
  ],
  "00185-0730-01": [{ insuranceId: 13, insurance: "United" }],
  "00603-1930-21": [{ insuranceId: 21, insurance: "Medicare" }],
  "60505-3673-3": [{ insuranceId: 22, insurance: "Cigna" }],
  "68180-0518-01": [{ insuranceId: 31, insurance: "Anthem" }],
  "00093-1044-01": [{ insuranceId: 32, insurance: "Blue Cross" }],
  "69097-127-05": [{ insuranceId: 41, insurance: "Aetna" }],
  "00603-3895-21": [{ insuranceId: 42, insurance: "United" }],
  "00603-5880-21": [{ insuranceId: 51, insurance: "Cigna" }],
};

const MOCK_DETAILS: Record<string, Prescription> = {
  "00093-1048-01::11": { net: 12.7, ndc: "00093-1048-01", drugName: "Metformin" },
  "00093-1048-01::12": { net: 8.2, ndc: "00093-1048-01", drugName: "Metformin" },
  "00185-0730-01::13": { net: 10.4, ndc: "00185-0730-01", drugName: "Metformin" },
  "00603-1930-21::21": { net: 6.9, ndc: "00603-1930-21", drugName: "Atorvastatin" },
  "60505-3673-3::22": { net: 9.5, ndc: "60505-3673-3", drugName: "Atorvastatin" },
};

/** ====== Component ====== */
const DrugSearch: React.FC = () => {
  // Search State
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Selected State
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [selectedNdc, setSelectedNdc] = useState("");
  const [insList, setInsList] = useState<DrugInsuranceInfo[]>([]);
  const [selectedIns, setSelectedIns] = useState<DrugInsuranceInfo | null>(null);

  // Details Preview (Mock)
  const details: Prescription | null = useMemo(() => {
    if (!selectedNdc || !selectedIns) return null;
    const key = `${selectedNdc}::${selectedIns.insuranceId}`;
    return MOCK_DETAILS[key] ?? null;
  }, [selectedNdc, selectedIns]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Filtered suggestions
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_DRUGS.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 30);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("#drugSearch") && !t.closest("#suggestion-list")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Handlers
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
    setShowSuggestions(true);
  };

  const handlePickDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setQuery(drug.name);
    setShowSuggestions(false);

    const ndcs = MOCK_NDCS_BY_DRUG[drug.name] ?? [];
    setNdcList(ndcs);
    setSelectedNdc("");
    setInsList([]);
    setSelectedIns(null);
  };

  const handlePickNdc = (ndc: string) => {
    setSelectedNdc(ndc);
    setInsList(MOCK_INS_BY_NDC[ndc] ?? []);
    setSelectedIns(null);
  };

  const handlePickIns = (id: number) => {
    const found = insList.find((i) => i.insuranceId === id) ?? null;
    setSelectedIns(found);
  };

  const clearAll = () => {
    setQuery("");
    setShowSuggestions(false);
    setActiveIndex(-1);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setInsList([]);
    setSelectedIns(null);
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="Search Medicines" description="Search for medicines with mock data." />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-pill me-2"></i>
                Medicine Search
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Search by name, then select the NDC and the insurance — all mock data until we connect the API.
              </p>
            </div>
            
            <div className="card-body p-5">
              {/* Search input */}
              <div className="mb-4 position-relative">
                <label htmlFor="drugSearch" className="form-label fw-medium text-dark mb-2">Drug name</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="ti ti-search text-primary" aria-hidden="true" />
                  </span>
                  <input
                    id="drugSearch"
                    ref={inputRef}
                    type="text"
                    className="form-control border-start-0 ps-2"
                    placeholder="e.g., Metformin"
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (!showSuggestions || suggestions.length === 0) return;
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIndex((p) => (p + 1 < suggestions.length ? p + 1 : 0));
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIndex((p) => (p - 1 >= 0 ? p - 1 : suggestions.length - 1));
                      } else if (e.key === "Enter" && activeIndex >= 0) {
                        e.preventDefault();
                        handlePickDrug(suggestions[activeIndex]);
                      } else if (e.key === "Escape") {
                        setShowSuggestions(false);
                        setActiveIndex(-1);
                      }
                    }}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls="suggestion-list"
                    aria-activedescendant={activeIndex >= 0 ? `sugg-${activeIndex}` : undefined}
                    style={{ height: "52px" }}
                  />
                  {query && (
                    <button 
                      className="btn btn-outline-secondary d-flex align-items-center" 
                      onClick={clearAll} 
                      aria-label="Clear search"
                      style={{ height: "52px" }}
                    >
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                  <div
                    id="suggestion-list"
                    ref={dropdownRef}
                    className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                    style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                    role="listbox"
                    aria-label="Drug search suggestions"
                  >
                    {suggestions.map((d, i) => (
                      <button
                        key={d.id}
                        id={`sugg-${i}`}
                        role="option"
                        aria-selected={activeIndex === i}
                        className={`list-group-item list-group-item-action border-0 py-3 px-4 ${activeIndex === i ? "active bg-primary" : ""}`}
                        onClick={() => handlePickDrug(d)}
                      >
                        <i className="ti ti-pill me-2"></i>
                        {d.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* NDC */}
              {ndcList.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="ndcSelect" className="form-label fw-medium text-dark mb-2">Select NDC</label>
                  <select
                    id="ndcSelect"
                    className="form-select form-select-lg"
                    value={selectedNdc}
                    onChange={(e) => handlePickNdc(e.target.value)}
                    style={{ height: "52px" }}
                  >
                    <option value="">Select NDC…</option>
                    {ndcList.map((ndc) => (
                      <option key={ndc} value={ndc}>{ndc}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Insurance */}
              {selectedNdc && insList.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="insSelect" className="form-label fw-medium text-dark mb-2">Select Insurance</label>
                  <select
                    id="insSelect"
                    className="form-select form-select-lg"
                    value={selectedIns?.insuranceId ?? ""}
                    onChange={(e) => handlePickIns(Number(e.target.value))}
                    style={{ height: "52px" }}
                  >
                    <option value="">Select insurance…</option>
                    {insList.map((i) => (
                      <option key={i.insuranceId} value={i.insuranceId}>
                        {i.insurance}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preview (Mock) */}
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
              {selectedDrug && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="ti ti-file-text me-2"></i>
                  View Drug Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal (Mock) */}
      <div className="modal fade" id="detailsModal" tabIndex={-1} aria-hidden="true">
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
                  <div className="text-muted small">Drug:</div>
                  <div className="fw-semibold">{selectedDrug?.name || "-"}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">NDC:</div>
                  <div className="fw-semibold">{selectedNdc || "-"}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-muted small">Insurance:</div>
                  <div className="fw-semibold">{selectedIns?.insurance || "-"}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Net Price:</div>
                  <div className="fw-semibold">{details?.net != null ? `$${details.net}` : "-"}</div>
                </div>
              </div>
              <hr />
              <div className="small text-muted">
                <i className="ti ti-info-circle me-1"></i>
                This is mock data until we connect to the actual API.
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

export default DrugSearch;