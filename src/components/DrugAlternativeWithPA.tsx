import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { DrugMedi } from "../types";

type Props = {
  classInfoId: number | null;
  /** If provided, that row will be visually highlighted */
  ndcCode?: string | null;
  pageSize?: number; // default 10
  className?: string;
};

export default function DrugMediTable({
  classInfoId,
  ndcCode,
  pageSize = 10,
  className = "",
}: Props) {
  const [data, setData] = useState<DrugMedi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // fetch when classInfoId changes
  useEffect(() => {
    if (classInfoId == null) {
      setData([]);
      return;
    }

    const controller = new AbortController();
    async function run() {
      try {
        setLoading(true);
        setError(null);
        setPage(1);
        const resp = await axiosInstance.get<DrugMedi[]>(
          `/drug/GetAllMediDrugs?classId=${classInfoId}`,
          { signal: controller.signal }
        );
        setData(resp.data || []);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.message === "canceled") return;
        console.error(e);
        setError("Failed to load medical coverage data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [classInfoId]);

  // helpers
  const norm = (v?: string) => (v ?? "").trim().toLowerCase();
  const isYes = (v?: string) => {
    const n = norm(v);
    return n === "y" ||
      n === "yes" ||
      n === "true" ||
      n === "1" ||
      n === "required" ||
      n === "available";
  };

  const paLabel = (v?: string) => (isYes(v) ? "Required" : "Not Required");
  const edLabel = (v?: string) => (isYes(v) ? "Available" : "Not Available");
  const nonCapLabel = (v?: string) => (isYes(v) ? "Yes" : "No");
  const ccsLabel = (v?: string) => (isYes(v) ? "Required" : "Not Required");

  const yesBadge = "badge text-bg-success";
  const noBadge = "badge text-bg-secondary";

  // paging
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  return (
    <div className={`card mt-3 ${className}`}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-shield-check" />
            Medical Authorization & Coverage (Class-based)
          </h5>
          <div className="small text-muted">
            {data.length.toLocaleString()} records
          </div>
        </div>

        {classInfoId == null && (
          <div className="alert alert-warning mb-0">
            Select a class to view medical coverage data.
          </div>
        )}

        {classInfoId != null && loading && (
          <div className="text-muted">Loading…</div>
        )}

        {classInfoId != null && !loading && error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {classInfoId != null && !loading && !error && data.length === 0 && (
          <div className="alert alert-warning mb-0">
            No medical coverage records found for this class.
          </div>
        )}

        {classInfoId != null && !loading && !error && data.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th>Name</th>
                    <th>NDC</th>
                    <th>Prior Authorization</th>
                    <th>Extended Duration</th>
                    <th>Cost Ceiling Tier</th>
                    <th>Non-Capitated Indicator</th>
                    <th>CCS Panel Authority</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => {
                    const isSelected = ndcCode && r.drugNDC === ndcCode;
                    return (
                      <tr
                        key={`${r.drugId}-${r.drugNDC}-${i}`}
                        className={isSelected ? "table-light" : undefined}
                      >
                        <td className="text-muted">
                          {(page - 1) * pageSize + (i + 1)}
                        </td>
                        <td className="fw-semibold">
                          {r.drugName}
                          {isSelected && (
                            <span className="badge text-bg-light ms-2">
                              Selected
                            </span>
                          )}
                        </td>
                        <td className="text-muted">{r.drugNDC}</td>
                        <td>
                          <span className={isYes(r.priorAuthorization) ? yesBadge : noBadge}>
                            {paLabel(r.priorAuthorization)}
                          </span>
                        </td>
                        <td>
                          <span className={isYes(r.extendedDuration) ? yesBadge : noBadge}>
                            {edLabel(r.extendedDuration)}
                          </span>
                        </td>
                        <td>
                          {r.costCeilingTier ? (
                            <span className="badge text-bg-light">
                              Tier {r.costCeilingTier}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={isYes(r.nonCapitatedDrugIndicator) ? yesBadge : noBadge}>
                            {nonCapLabel(r.nonCapitatedDrugIndicator)}
                          </span>
                        </td>
                        <td>
                          <span className={isYes(r.ccsPanelAuthority) ? yesBadge : noBadge}>
                            {ccsLabel(r.ccsPanelAuthority)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <i className="bi bi-chevron-left me-1" />
                  Prev
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={!canNext}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <i className="bi bi-chevron-right ms-1" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
