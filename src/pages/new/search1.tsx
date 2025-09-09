// src/pages/new/DrugSearch.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import debounce from "debounce";
import axiosInstance from "../../api/axiosInstance";
import type { SearchLog } from "../../types";

// Optional react-router (no hard dependency)
let navigateFn: ((path: string) => void) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useNavigate } = require("react-router-dom");
  // @ts-ignore
  const nav = typeof useNavigate === "function" ? useNavigate : null;
  if (nav) navigateFn = nav();
} catch {/* no-op */}

/* ========== Types ========== */
type Drug = { id: number; name: string; ndc?: string };
type DrugInsuranceInfo = { insuranceId: number; insurance: string };
type Prescription = { net?: number; ndcCode?: string; drugName?: string; drugClassId?: number };

const DrugSearch: React.FC = () => {
  /* ---------- Search state ---------- */
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchLog, setSearchLog] = useState<SearchLog | null>(null);

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ---------- Selections ---------- */
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [selectedNdc, setSelectedNdc] = useState("");
  const [insList, setInsList] = useState<DrugInsuranceInfo[]>([]);
  const [selectedIns, setSelectedIns] = useState<DrugInsuranceInfo | null>(null);
  const [details, setDetails] = useState<Prescription | null>(null);

  // Prevent instant re-open after picking
  const suppressNextSearch = useRef(false);

  /* ---------- Debounced API search ---------- */
  const debouncedSearch = useCallback(
    debounce(async (text: string, page: number) => {
      if (suppressNextSearch.current) {
        suppressNextSearch.current = false;
        setShowSuggestions(false);
        return;
      }
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

  const pageRef = useRef(pageNumber);
  useEffect(() => { pageRef.current = pageNumber; }, [pageNumber]);

  useEffect(() => {
    if (searchLog) localStorage.setItem("searchLogDetails", JSON.stringify(searchLog));
  }, [searchLog]);

  /* ---------- Matched/unmatched for "Did you mean?" ---------- */
  const { matched, unmatched, flatSuggestions } = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return { matched: suggestions, unmatched: [], flatSuggestions: suggestions };
    const m = suggestions.filter((d) => d.name?.toLowerCase().startsWith(q));
    const u = suggestions.filter((d) => !d.name?.toLowerCase().startsWith(q));
    return { matched: m, unmatched: u, flatSuggestions: [...m, ...u] };
  }, [suggestions, query]);

  /* ---------- Portal dropdown positioning ---------- */
  const [overlayStyle, setOverlayStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const computeOverlayPos = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    setOverlayStyle({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
  }, []);
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0) computeOverlayPos();
  }, [showSuggestions, suggestions.length, computeOverlayPos]);
  useEffect(() => {
    if (!showSuggestions) return;
    const onWin = () => computeOverlayPos();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [showSuggestions, computeOverlayPos]);

  /* ---------- Infinite scroll inside suggestions ---------- */
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

  /* ---------- Handlers ---------- */
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
    suppressNextSearch.current = true;
    setQuery(drug.name);
    setShowSuggestions(false);
    inputRef.current?.blur();

    // reset downstream
    setNdcList([]); setSelectedNdc("");
    setInsList([]); setSelectedIns(null);
    setDetails(null);

    try {
      const { data } = await axiosInstance.get(`/drug/getDrugNDCs?name=${encodeURIComponent(drug.name)}`);
      const list: string[] = data ?? [];
      setNdcList(list);
      // Auto-pick first NDC (if any)
      if (list[0]) {
        setSelectedNdc(list[0]);
        await fetchInsurancesForNdc(list[0]); // fetch and auto-pick first insurance + details
      }
    } catch (e) {
      console.error("Error fetching NDCs:", e);
    }
  };

  const fetchInsurancesForNdc = async (ndc: string) => {
    try {
      const { data } = await axiosInstance.get(`/drug/GetInsuranceByNdc?ndc=${encodeURIComponent(ndc)}`);
      const ins: DrugInsuranceInfo[] = data ?? [];
      setInsList(ins);
      const firstIns = ins[0] ?? null;
      setSelectedIns(firstIns);
      if (firstIns?.insuranceId != null) {
        // fetch details directly (don’t rely on state being updated)
        const { data: det } = await axiosInstance.get(
          `/drug/GetDetails?ndc=${encodeURIComponent(ndc)}&insuranceId=${firstIns.insuranceId}`
        );
        setDetails(det ?? null);
      } else {
        setDetails(null);
      }
    } catch (e) {
      console.error("Error fetching insurances:", e);
      setDetails(null);
    }
  };

  const handlePickNdc = async (ndc: string) => {
    setSelectedNdc(ndc);
    setInsList([]); setSelectedIns(null); setDetails(null);
    if (ndc) await fetchInsurancesForNdc(ndc);
  };

  const handlePickIns = async (id: number) => {
    const found = insList.find((i) => i.insuranceId === id) ?? null;
    setSelectedIns(found);
    localStorage.setItem("selectedRx", String(found?.insuranceId ?? id));
    setDetails(null);
    if (selectedNdc && (found?.insuranceId ?? id)) {
      try {
        const { data } = await axiosInstance.get(
          `/drug/GetDetails?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${found?.insuranceId ?? id}`
        );
        setDetails(data ?? null);
      } catch (e) {
        console.error("Error fetching details:", e);
        setDetails(null);
      }
    }
  };

  const clearAll = () => {
    setQuery(""); setShowSuggestions(false); setActiveIndex(-1); setSuggestions([]);
    setSelectedDrug(null); setNdcList([]); setSelectedNdc("");
    setInsList([]); setSelectedIns(null); setDetails(null);
    setPageNumber(1); setHasMore(true);
  };

  const viewDrugDetails = async () => {
    if (!selectedDrug) return;

    if (selectedIns?.insuranceId != null) {
      localStorage.setItem("selectedRx", String(selectedIns.insuranceId));
      localStorage.setItem("InsuranceId", String(selectedIns.insuranceId));
    }
    localStorage.setItem("DrugId", String(selectedDrug.id ?? ""));
    localStorage.setItem("NDCCode", String(selectedNdc ?? ""));

    setSearchLog({
      rxgroupId: selectedIns?.insuranceId || 0,
      binId: 0, pcnId: 0,
      drugNDC: selectedDrug?.ndc || "",
      date: new Date().toISOString(),
      searchType: "Search By Drug",
    });

    const action =
      `User Search for NDC: ${selectedDrug?.ndc || ""} using Search By Drug with insuranceId: ${selectedIns?.insuranceId || 0}`;
    await axiosInstance.post("/order/ViewDrugDetailsLog", JSON.stringify(action), {
      headers: { "Content-Type": "application/json" },
    });

    const url = `/drug-page`;
    if (navigateFn) navigateFn(url); else window.location.href = url;
  };

  /* ---------- UI ---------- */
  return (
<div className="content-area py-3 drugsearch-page">
      {/* Title + breadcrumb */}
     <div className="text-center mb-3 fs-5">
  <AutoBreadcrumb title="Search Medicines" />
</div>

 <div className="container-xxl gw-wide">
    <div className="row justify-content-center">
      {/* 3) Give the card more width */}
      <div className="col-12 col-lg-11 col-xl-8">  {/* was col-lg-10 col-xl-8 */}
        
            <div className="card shadow border-0 rounded-4 overflow-visible">
              <div className="card-header text-center py-4 px-5">
                <h4 className="mb-1 fw-semibold"><i className="ti ti-pill me-2" />Medicine Search</h4>
                <p className="mb-0 text-muted">Search by name, then pick NDC and (optionally) insurance — live API.</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {/* 1) Drug search */}
                <div className="mb-4 position-relative">
                  <label htmlFor="drugSearch" className="form-label fw-medium text-dark mb-2">Drug name</label>
                  <div className="input-group input-group-lg" ref={anchorRef}>
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" aria-hidden="true" />
                    </span>
                    <input
                      id="drugSearch"
                      ref={inputRef}
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="Type drug name or NDC…"
                      value={query}
                      onChange={handleQueryChange}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={(e) => {
                        if (!showSuggestions || flatSuggestions.length === 0) return;
                        if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((p) => (p + 1 < flatSuggestions.length ? p + 1 : 0)); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((p) => (p - 1 >= 0 ? p - 1 : flatSuggestions.length - 1)); }
                        else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); handlePickDrug(flatSuggestions[activeIndex]); }
                        else if (e.key === "Escape") { setShowSuggestions(false); setActiveIndex(-1); }
                      }}
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={showSuggestions}
                      aria-controls="suggestion-list"
                      aria-activedescendant={activeIndex >= 0 ? `sugg-${activeIndex}` : undefined}
                      style={{ height: "52px" }}
                    />
                    {query && (
                      <button className="btn btn-outline-secondary d-flex align-items-center" onClick={clearAll} aria-label="Clear search" style={{ height: "52px" }}>
                        <i className="ti ti-x" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions portal */}
                  {showSuggestions && suggestions.length > 0 && overlayStyle &&
                    createPortal(
                      <div
                        id="suggestion-list"
                        ref={dropdownRef}
                        className="bg-white border rounded-3 shadow-lg"
                        style={{
                          position: "fixed",
                          top: overlayStyle.top,
                          left: overlayStyle.left,
                          width: overlayStyle.width,
                          maxHeight: 260,
                          overflowY: "auto",
                          zIndex: 1050,
                        }}
                        role="listbox"
                        aria-label="Drug search suggestions"
                      >
                        {matched.map((d, i) => (
                          <button
                            key={d.id}
                            id={`sugg-${i}`}
                            role="option"
                            aria-selected={activeIndex === i}
                            className={`list-group-item list-group-item-action border-0 py-3 px-4 ${activeIndex === i ? "active bg-primary" : ""} border-start border-3 border-success`}
                            onClick={() => handlePickDrug(d)}
                          >
                            <i className="ti ti-pill me-2" />{d.name}
                          </button>
                        ))}

                        {unmatched.length > 0 && (
                          <div className="px-4 py-2 small text-primary bg-light border-top fw-medium" role="separator" aria-hidden="true">
                            Did you mean?
                          </div>
                        )}

                        {unmatched.map((d, i) => {
                          const idx = matched.length + i;
                          return (
                            <button
                              key={d.id}
                              id={`sugg-${idx}`}
                              role="option"
                              aria-selected={activeIndex === idx}
                              className={`list-group-item list-group-item-action border-0 py-3 px-4 ${activeIndex === idx ? "active bg-primary" : ""}`}
                              onClick={() => handlePickDrug(d)}
                            >
                              <i className="ti ti-help-circle me-2" />{d.name}
                            </button>
                          );
                        })}
                        {isLoading && <div className="px-4 py-2 small text-muted">Loading…</div>}
                      </div>,
                      document.body
                    )}
                </div>

                {/* 2) NDC */}
                <div className="mb-4">
                  <label htmlFor="ndcSelect" className="form-label fw-medium text-dark mb-2">Select NDC</label>
                  <select
                    id="ndcSelect"
                    className="form-select form-select-lg"
                    value={selectedNdc}
                    onChange={(e) => handlePickNdc(e.target.value)}
                    disabled={!selectedDrug || ndcList.length === 0}
                    aria-disabled={!selectedDrug || ndcList.length === 0}
                    style={{ height: "52px" }}
                  >
                    {!selectedDrug && <option value="">Select a drug first…</option>}
                    {selectedDrug && ndcList.length === 0 && <option value="">No NDCs found</option>}
                    {ndcList.map((ndc) => <option key={ndc} value={ndc}>{ndc}</option>)}
                  </select>
                  {!selectedDrug && <small className="text-muted">Pick a drug to enable this field.</small>}
                </div>

                {/* 3) Insurance */}
                <div className="mb-4">
                  <label htmlFor="insSelect" className="form-label fw-medium text-dark mb-2">Select Insurance</label>
                  <select
                    id="insSelect"
                    className="form-select form-select-lg"
                    value={selectedIns?.insuranceId ?? ""}
                    onChange={(e) => handlePickIns(Number(e.target.value))}
                    disabled={!selectedNdc || insList.length === 0}
                    aria-disabled={!selectedNdc || insList.length === 0}
                    style={{ height: "52px" }}
                  >
                    {!selectedNdc && <option value="">Select an NDC first…</option>}
                    {selectedNdc && insList.length === 0 && <option value="">No insurances found</option>}
                    {insList.map((i) => <option key={i.insuranceId} value={i.insuranceId}>{i.insurance}</option>)}
                  </select>
                  {!selectedNdc && <small className="text-muted">Choose NDC to enable insurance list.</small>}
                </div>

                {/* 4) Net preview */}
                <div className={`${details ? "alert alert-primary" : "alert alert-light border"} d-flex align-items-center gap-3 p-3 rounded-3 mb-4`}>
                  <div className={`p-3 rounded-3 ${details ? "bg-white" : "bg-light"}`}>
                    <i className={`ti ti-currency-dollar ${details ? "text-primary" : "text-muted"} fs-4`} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="fw-semibold">Estimated Net Price</div>
                    <div className="fs-5 fw-bold">
                      {details?.net != null ? `$${Number(details.net).toFixed(2)}` : "Select insurance to preview"}
                    </div>
                  </div>
                </div>

                {/* 5) Action */}
                {selectedDrug && (
                  <button type="button" className="btn btn-primary btn-lg w-100 py-3 fw-semibold" onClick={viewDrugDetails}>
                    <i className="ti ti-file-text me-2" /> View Drug Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        /* Use your app's content area; no manual sidebar margin */
        .content-area { padding-left: 1rem; padding-right: 1rem; }
        .gw-narrow{ max-width: clamp(900px, 68vw, 1100px); margin-inline: auto; }

        /* Avoid clipping for suggestion portal */
        .overflow-visible { overflow: visible !important; }

        @media (max-width: 991.98px){
          .gw-narrow{ max-width: 100%; }
        }


          /* Wider lane (still responsive) */
.gw-wide{
  max-width: clamp(1100px, 78vw, 1320px);
  margin-inline: auto;
}

/* Center ONLY this page's breadcrumb */
.drugsearch-page .breadcrumb{
  justify-content: center !important;
}

/* Optional: nudge the breadcrumb text to feel truly centered on long lines */
.drugsearch-page .breadcrumb .breadcrumb-item{
  white-space: nowrap;
}

      `}</style>
    </div>
  );
};

export default DrugSearch;
