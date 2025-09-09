import { useEffect, useMemo, useState } from "react";
import type { ClassInfo } from "../../types";
import axiosInstance from "../../api/axiosInstance";
import DrugAlternativesNoInsurance from "../../components/DrugAlternativesNoInsurance";
import DrugMediTable from "../../components/DrugAlternativeWithPA";
import DrugDetails from "../../components/drugDetails";
import DrugAlternativesWithInsurance from "../../components/DrugAlternativesWithInsurance";

export default function DrugPage() {
  // pulled from localStorage (strings by default)
  const SearchedDrugIdRaw = localStorage.getItem("DrugId");
  const SearchedInsuranceIdRaw = localStorage.getItem("InsuranceId");
  const SearchedNDCCode = localStorage.getItem("NDCCode") || "";

  // best-effort coercion for numbers where needed
  const SearchedDrugId = SearchedDrugIdRaw ? Number(SearchedDrugIdRaw) : undefined;
  const SearchedInsuranceId = SearchedInsuranceIdRaw ? Number(SearchedInsuranceIdRaw) : undefined;

  const initialClassVersion = useMemo(
    () => localStorage.getItem("classType") || "ClassV1",
    []
  );

  const [classVersion, setClassVersion] = useState<string>(initialClassVersion);
  const [classInfoId, setClassInfoId] = useState<number | null>(null);
  const [availableClassVersions, setAvailableClassVersions] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const classTypeNames = useMemo(
    () =>
      Array.from(new Set(availableClassVersions.map((c) => c.classTypeName))).sort(),
    [availableClassVersions]
  );

  const [cvSearch, setCvSearch] = useState("");
  const allVersions = useMemo(
    () => [classVersion, ...classTypeNames.filter((n) => n !== classVersion)],
    [classVersion, classTypeNames]
  );

  const filtered = useMemo(
    () => allVersions.filter((n) => n.toLowerCase().includes(cvSearch.toLowerCase())),
    [allVersions, cvSearch]
  );

  const handlePick = (name: string) => {
    setClassVersion(name);
    setCvSearch("");
  };

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      if (!SearchedDrugId) {
        setError("No DrugId found in local storage.");
        setSelectedClass(null);
        setClassInfoId(null);
        return;
      }

      const { data } = await axiosInstance.get(
        `/drug/GetClassesByDrugId?drugId=${SearchedDrugId}`
      );

      // unique by classTypeName
      const seen = new Set<string>();
      const uniqueClasses: ClassInfo[] = [];
      for (const item of data as ClassInfo[]) {
        if (!seen.has(item.classTypeName)) {
          seen.add(item.classTypeName);
          uniqueClasses.push(item);
        }
      }
      uniqueClasses.sort((a, b) => a.classTypeName.localeCompare(b.classTypeName));
      setAvailableClassVersions(uniqueClasses);

      const wanted =
        uniqueClasses.find((c) => c.classTypeName === classVersion) ??
        uniqueClasses[0] ??
        null;

      setSelectedClass(wanted);
      setClassInfoId(wanted?.id ?? null);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load class information.");
      setSelectedClass(null);
      setClassInfoId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SearchedDrugId, classVersion]);

  useEffect(() => {
    localStorage.setItem("classType", classVersion);
  }, [classVersion]);

  // helpers for badges
  const badge = (label: string, value?: string | number) => (
    <div className="d-flex justify-content-between align-items-center mb-1 small">
      <span className="text-muted">{label}</span>
      <span className="badge text-bg-light">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="container-xxl py-3">
      {/* Top controls */}
      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        <label className="form-label mb-0 me-1 d-flex align-items-center gap-2">
          <i className="ti ti-box-seam fs-6 text-primary" />
          Class Version:
        </label>

        {/* Enhanced, searchable picker */}
        <div className="dropdown">
          <button
            className="btn btn-light border d-flex align-items-center gap-2"
            type="button"
            data-bs-toggle="dropdown"
            data-bs-auto-close="outside"
            aria-expanded="false"
          >
            <span className="badge rounded-pill text-bg-primary">{allVersions.length}</span>
            <span className="fw-medium text-truncate" style={{ maxWidth: 160 }}>
              {classVersion}
            </span>
            <i className="ti ti-chevron-down ms-1" />
          </button>

          <div className="dropdown-menu shadow-lg p-2 responsive-dd" role="menu" aria-label="Class versions">
            {/* Sticky search field */}
            <div className="position-sticky top-0 bg-white rounded-2 p-2 mb-2 border">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-0">
                  <i className="ti ti-search text-secondary" />
                </span>
                <input
                  type="search"
                  className="form-control border-0"
                  placeholder="Search versions…"
                  value={cvSearch}
                  onChange={(e) => setCvSearch(e.target.value)}
                  autoFocus
                />
                {cvSearch && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCvSearch("")}
                    title="Clear"
                    type="button"
                  >
                    <i className="ti ti-x" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="list-group list-group-flush dd-scroll">
              {filtered.length === 0 && (
                <div className="text-center text-muted small py-3">No matches</div>
              )}

              {filtered.map((name) => {
                const active = name === classVersion;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${
                      active ? "active" : ""
                    }`}
                    onClick={() => handlePick(name)}
                  >
                    <span className="text-truncate me-2">{name}</span>
                    {active ? <i className="ti ti-checks" /> : <i className="ti ti-circle" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current selection pill */}
        {selectedClass && (
          <span className="badge text-bg-light d-flex align-items-center gap-1">
            <i className="ti ti-info-circle text-secondary" />
            Selected: <span className="fw-medium">{selectedClass.name}</span>
          </span>
        )}

        {/* Mobile: open page map offcanvas */}
        <button
          className="btn btn-outline-secondary btn-sm ms-auto d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#drugpage-offcanvas"
          aria-controls="drugpage-offcanvas"
        >
          <i className="bi bi-list-ul me-1" />
          Page map
        </button>
      </div>

      {loading && <div className="text-muted">Loading class info…</div>}
      {error && <div className="text-danger small">{error}</div>}

      {/* 2-column layout: content + right sidebar (offcanvas on <lg) */}
      <div className="row mt-2">
        {/* Main content */}
        <div
          className="col-lg-9"
          id="scrollable-content"
          data-bs-spy="scroll"
          data-bs-target="#drugpage-sidenav"
          data-bs-offset="100"
          tabIndex={0}
          style={{ scrollBehavior: "smooth" }}
        >
          {/* DRUG DETAILS */}
          <section id="sec-details" className="pt-2">
            {!loading && !error && classInfoId != null && SearchedDrugId && (
              <DrugDetails
                drugId={SearchedDrugId}
                insuranceId={SearchedInsuranceId ?? 0}
                ndcCode={SearchedNDCCode}
                classInfoId={classInfoId}
                classInfoName={selectedClass?.name}
              />
            )}

            {!loading && !error && classInfoId == null && (
              <div className="alert alert-warning mt-3">
                No class information available for this drug.
              </div>
            )}
          </section>

          {/* WITH INSURANCE */}
          <section id="sec-alt-ins" className="pt-4">
            {classInfoId != null && SearchedNDCCode && (
              <DrugAlternativesWithInsurance
                key={`alt-ins-${classInfoId}-${SearchedNDCCode}`}
                classInfoId={classInfoId}
                sourceDrugNDC={SearchedNDCCode}
                target={{
                  branchName: "",
                  date: Date.now().toString(),
                  rxgroupId: SearchedInsuranceId ?? undefined,
                }}
              />
            )}
          </section>

          {/* WITHOUT INSURANCE */}
          <section id="sec-alt-noins" className="pt-4">
            {classInfoId != null && SearchedNDCCode && (
              <DrugAlternativesNoInsurance
                key={`alt-noins-${classInfoId}-${SearchedNDCCode}`}
                classInfoId={classInfoId}
                sourceDrugNDC={SearchedNDCCode}
              />
            )}
          </section>

          {/* MEDI TABLE / PA */}
          <section id="sec-medi" className="pt-4">
            <DrugMediTable
              classInfoId={classInfoId} // number | null
              ndcCode={SearchedNDCCode} // highlight the row if matches
              pageSize={10}
            />
          </section>

          <div className="my-4">
            <a href="#top" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-up me-1" />
              Back to top
            </a>
          </div>
        </div>

        {/* Right sidebar: sticky on lg+, offcanvas on <lg */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="position-sticky" id="drugpage-sidenav" style={{ top: "5rem" }}>
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-list-ul" />
                  On this page
                </h6>
                <nav className="nav flex-column gap-1">
                  <a className="nav-link px-0" href="#sec-details">
                    <i className="bi bi-capsule me-2" />
                    Drug Details
                  </a>
                  <a className="nav-link px-0" href="#sec-alt-ins">
                    <i className="bi bi-shield-check me-2" />
                    Alternatives (with Insurance)
                  </a>
                  <a className="nav-link px-0" href="#sec-alt-noins">
                    <i className="bi bi-shield-slash me-2" />
                    Alternatives (no Insurance)
                  </a>
                  <a className="nav-link px-0" href="#sec-medi">
                    <i className="bi bi-clipboard2-data me-2" />
                    Medi / PA Table
                  </a>
                </nav>

                <hr className="my-3" />

                <div className="small text-muted mb-1">Selected class</div>
                <div className="d-flex flex-wrap gap-1">
                  <span className="badge text-bg-light">{classVersion}</span>
                  {selectedClass?.name && (
                    <span className="badge bg-primary-subtle text-primary-emphasis">
                      {selectedClass.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 d-grid gap-2">
              <a href="#sec-alt-ins" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-search me-1" />
                Jump to Alternatives
              </a>
              <a href="#sec-medi" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-clipboard2 me-1" />
                Jump to Medi/PA
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Offcanvas for page map on mobile */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="drugpage-offcanvas"
        aria-labelledby="drugpage-offcanvas-label"
      >
        <div className="offcanvas-header">
          <h5 id="drugpage-offcanvas-label" className="offcanvas-title">
            On this page
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body">
          <nav className="nav flex-column gap-2 fs-6" id="drugpage-sidenav">
            <a className="nav-link px-0" href="#sec-details" data-bs-dismiss="offcanvas">
              <i className="bi bi-capsule me-2" />
              Drug Details
            </a>
            <a className="nav-link px-0" href="#sec-alt-ins" data-bs-dismiss="offcanvas">
              <i className="bi bi-shield-check me-2" />
              Alternatives (with Insurance)
            </a>
            <a className="nav-link px-0" href="#sec-alt-noins" data-bs-dismiss="offcanvas">
              <i className="bi bi-shield-slash me-2" />
              Alternatives (no Insurance)
            </a>
            <a className="nav-link px-0" href="#sec-medi" data-bs-dismiss="offcanvas">
              <i className="bi bi-clipboard2-data me-2" />
              Medi / PA Table
            </a>
          </nav>

          <hr className="my-3" />
          <div className="small text-muted mb-1">Selected class</div>
          <div className="d-flex flex-wrap gap-1">
            <span className="badge text-bg-light">{classVersion}</span>
            {selectedClass?.name && (
              <span className="badge bg-primary-subtle text-primary-emphasis">
                {selectedClass.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== Styles & responsive behaviors ===== */}
      <style>{`
        /* Dropdown: let it breathe on small screens */
        .responsive-dd {
          padding: .5rem;
          min-width: 280px;
        }
        .responsive-dd .dd-scroll {
          max-height: 260px;
          overflow-y: auto;
        }
        @media (max-width: 576px) {
          .responsive-dd {
            width: calc(100vw - 2rem);
            max-width: 420px;
            inset: auto !important; /* rely on natural flow */
          }
        }

        /* Hover dock: only hover on lg+; on small screens we’ll use a modal trigger */
        .hover-dock {
          position: fixed;
          right: 1rem;
          bottom: 1rem;
          z-index: 1080;
        }
        .hover-dock .dock-panel {
          position: absolute;
          right: 0;
          bottom: 2.75rem;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity .18s ease, transform .18s ease;
          min-width: 240px;
        }
        .hover-dock:hover .dock-panel,
        .hover-dock:focus-within .dock-panel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .hover-dock .fab {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(0,0,0,.08);
        }
        @media (max-width: 992px) {
          /* Disable hover reveal on touch; we’ll open a modal instead */
          .hover-dock .dock-panel { display: none; }
        }
      `}</style>

      {/* ===== Hover dock (bottom-right). On mobile it opens a modal instead) ===== */}
      <div className="hover-dock">
        {/* Hover panel (desktop/tablet lg+) */}
        <div className="dock-panel d-none d-lg-block">
          <div className="card shadow-sm border-0">
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong className="small">Searched Inputs</strong>
              </div>
              {badge("DrugId", SearchedDrugIdRaw ?? "—")}
              {badge("InsuranceId", SearchedInsuranceIdRaw ?? "—")}
              {badge("NDCCode", SearchedNDCCode || "—")}
            </div>
          </div>
        </div>

        {/* FAB: on lg+ it shows hover panel; on <lg it triggers modal */}
        <button
          type="button"
          className="btn btn-primary fab"
          title="View searched inputs"
          aria-label="View searched inputs"
          data-bs-toggle="modal"
          data-bs-target="#searchedInputsModal"
        >
          <i className="bi bi-info-circle" />
        </button>
      </div>

      {/* Mobile modal for searched inputs */}
      <div className="modal fade" id="searchedInputsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-sm modal-dialog-bottom">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h6 className="modal-title">Searched Inputs</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {badge("DrugId", SearchedDrugIdRaw ?? "—")}
              {badge("InsuranceId", SearchedInsuranceIdRaw ?? "—")}
              {badge("NDCCode", SearchedNDCCode || "—")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
