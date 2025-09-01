import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import debounce from "debounce";
import axiosInstance from "../../api/axiosInstance"; // ← عدّل المسار لو لزم
// لو بتستخدم react-router:
void useMemo;
let navigateFn: ((path: string) => void) | null = null;
try {
  // optional import to avoid hard dependency if not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useNavigate } = require("react-router-dom");
  // small hook shim; if react-router exists, we'll use it below
  // @ts-ignore
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const nav = typeof useNavigate === "function" ? useNavigate : null;
  if (nav) navigateFn = nav();
} catch { /* no-op: fall back to window.location.href */ }

/** ====== Types (مطابقة للصفحة الأولى) ====== */
type Drug = {
  id: number;
  name: string;
  ndc?: string;
};
type DrugInsuranceInfo = { insuranceId: number; insurance: string };
type Prescription = { net?: number; ndcCode?: string; drugName?: string; drugClassId?: number };

/** ====== Component ====== */
const DrugSearch: React.FC = () => {
  /** Search + suggestions (من API) */
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /** Selected state */
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [selectedNdc, setSelectedNdc] = useState("");
  const [insList, setInsList] = useState<DrugInsuranceInfo[]>([]);
  const [selectedIns, setSelectedIns] = useState<DrugInsuranceInfo | null>(null);
  const [details, setDetails] = useState<Prescription | null>(null);

  /** ====== Debounced API search (مطابق للصفحة الأولى) ====== */
  const debouncedSearch = useCallback(
    debounce(async (text: string, page: number) => {
      if (!text || text.trim().length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        setHasMore(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(
          `/drug/searchByName?name=${encodeURIComponent(text)}&pageNumber=${page}&pageSize=20`
        );
        setSuggestions((prev) => (page === 1 ? data : [...prev, ...data]));
        setShowSuggestions(true);
        setHasMore(Array.isArray(data) && data.length > 0);
      } catch (e) {
        console.error("Error searching drugs:", e);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pageRef = useRef(pageNumber);
  useEffect(() => { pageRef.current = pageNumber; }, [pageNumber]);

  /** Infinite scroll داخل قائمة الاقتراحات */
  const onSuggestionsScroll = () => {
    if (!dropdownRef.current || isLoading || !hasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = dropdownRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 8) {
      const nextPage = pageRef.current + 1;
      setPageNumber(nextPage);
      debouncedSearch(query, nextPage);
    }
  };
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    el.addEventListener("scroll", onSuggestionsScroll);
    return () => el.removeEventListener("scroll", onSuggestionsScroll);
  }, [isLoading, hasMore, query]);

  /** Handlers */
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    setPageNumber(1);
    setSuggestions([]);
    debouncedSearch(val, 1);
    setShowSuggestions(true);
  };

  const handlePickDrug = async (drug: Drug) => {
    setSelectedDrug(drug);
    setQuery(drug.name);
    setShowSuggestions(false);
    // reset dependent state
    setNdcList([]);
    setSelectedNdc("");
    setInsList([]);
    setSelectedIns(null);
    setDetails(null);
    try {
      const { data } = await axiosInstance.get(`/drug/getDrugNDCs?name=${encodeURIComponent(drug.name)}`);
      setNdcList(data ?? []);
    } catch (e) {
      console.error("Error fetching NDCs:", e);
    }
  };

  const handlePickNdc = async (ndc: string) => {
    setSelectedNdc(ndc);
    setInsList([]);
    setSelectedIns(null);
    setDetails(null);
    if (!ndc) return;
    try {
      const { data } = await axiosInstance.get(`/drug/GetInsuranceByNdc?ndc=${encodeURIComponent(ndc)}`);
      setInsList(data ?? []);
    } catch (e) {
      console.error("Error fetching insurances:", e);
    }
  };

  const handlePickIns = async (id: number) => {
    const found = insList.find((i) => i.insuranceId === id) ?? null;
    setSelectedIns(found);
    setDetails(null);
  };

  /** جلب تفاصيل الـ Net عند اكتمال الـ NDC + Insurance */
  useEffect(() => {
    (async () => {
      if (!selectedNdc || !selectedIns) return;
      try {
        const { data } = await axiosInstance.get(
          `/drug/GetDetails?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${selectedIns.insuranceId}`
        );
        setDetails(data ?? null);
      } catch (e) {
        console.error("Error fetching details:", e);
        setDetails(null);
      }
    })();
  }, [selectedNdc, selectedIns]);

  const clearAll = () => {
    setQuery("");
    setShowSuggestions(false);
    setActiveIndex(-1);
    setSuggestions([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setInsList([]);
    setSelectedIns(null);
    setDetails(null);
    setPageNumber(1);
    setHasMore(true);
  };

  const viewDrugDetails = () => {
    if (!selectedDrug) return;
    // حفظ اسم التأمين (نفس سلوك الصفحة الأولى)
    if (selectedIns?.insurance) {
      localStorage.setItem("selectedRx", selectedIns.insurance);
    }
    const url = `/drug/${selectedDrug.id}?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${selectedIns?.insuranceId ?? ""}`;
    if (navigateFn) {
      navigateFn(url);
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="Search Medicines" />
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
                Search by name, then select the NDC and the insurance — now connected to the live API.
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
                    {isLoading && (
                      <div className="px-4 py-2 small text-muted">Loading…</div>
                    )}
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

              {/* Live Preview */}
              {details && (
                <div className="alert alert-primary d-flex align-items-center gap-3 p-3 rounded-3 mb-4">
                  <div className="bg-white p-3 rounded-3">
                    <i className="ti ti-currency-dollar text-primary fs-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="fw-semibold">Estimated Net Price</div>
                    <div className="fs-5 fw-bold">
                      {details.net != null ? `$${details.net}` : "N/A"}
                    </div>
                  </div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  onClick={viewDrugDetails}
                >
                  <i className="ti ti-file-text me-2"></i>
                  View Drug Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal تم إزالته لأنه كان mock؛ هنوجّه مباشرة لصفحة التفاصيل */}
    </div>
  );
};

export default DrugSearch;
