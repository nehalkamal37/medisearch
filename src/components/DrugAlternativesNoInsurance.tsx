import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

type AltLite = {
  drugId: number;
  drugName: string;
  ndcCode: string;
  drugClassId: number;
  drugClass: string;
  form: string;
  strength: string;
  strengthUnit: string;
  route: string;
  type: string;
  teCode: string;
  applicationNumber: string;
  applicationType: string;
  stock: number;
  branchName?: string | null;
};

type PagedResult<T> = {
  items: T[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
};

type Props = {
  classInfoId: number;
  sourceDrugNDC: string | null;
};

export default function DrugAlternativesNoInsurance({
  classInfoId,
  sourceDrugNDC,
}: Props) {
  const [rows, setRows] = useState<AltLite[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRows() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        classInfoId: String(classInfoId),
        sourceDrugNDC: String(sourceDrugNDC),
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      });

      const { data } = await axiosInstance.get<PagedResult<AltLite>>(
        `/drug/GetAlternativesNoInsurance?${params.toString()}`
      );
    console.log("hohiii ", data);
      setRows(data.items ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalCount(data.totalCount ?? 0);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load alternatives (no insurance).");
      setRows([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  // Refetch on class change, NDC change, or page change
  useEffect(() => {
    setPageNumber(1);
  }, [classInfoId, sourceDrugNDC]);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classInfoId, sourceDrugNDC, pageNumber]);

  const canPrev = pageNumber > 1;
  const canNext = pageNumber < totalPages;

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-layers" /> Drug Alternatives (No Insurance)
        </h5>

        {loading && <div className="text-muted">Loading…</div>}
        {error && <div className="text-danger">{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <div className="alert alert-warning">No alternatives found.</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Drug</th>
                    <th>NDC</th>
                    <th>Form/Strength</th>
                    <th>Route / TE / Type</th>
                    <th>Class</th>
                    <th className="text-center">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.ndcCode}-${r.drugId}`}>
                      <td>
                        <div className="fw-semibold">{r.drugName}</div>
                        <div className="small text-muted">
                          {r.applicationType} {r.applicationNumber}
                        </div>
                      </td>
                      <td className="text-muted">{r.ndcCode}</td>
                      <td>
                        <div>{r.form}</div>
                        <div className="small text-muted">
                          {r.strength} {r.strengthUnit}
                        </div>
                      </td>
                      <td>
                        <div className="small">{r.route || "—"}</div>
                        <div className="mt-1">
                          {r.teCode && (
                            <span className="badge rounded-pill text-bg-light me-1">
                              TE {r.teCode}
                            </span>
                          )}
                          {r.type && (
                            <span
                              className="badge rounded-pill"
                              style={{
                                background: "#eaf2ff",
                                color: "#1f4fd1",
                                border: "1px solid #d7e5ff",
                              }}
                            >
                              {r.type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge text-bg-light">
                          {r.drugClass}
                        </span>
                      </td>
                      <td className="text-center">
                        {r.stock ?? 0}
                        {r.branchName ? (
                          <div className="small text-muted">{r.branchName}</div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <div className="small text-muted">
                Showing page <strong>{pageNumber}</strong> of{" "}
                <strong>{totalPages}</strong> • total{" "}
                <strong>{totalCount}</strong> alternatives
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={!canPrev}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                >
                  <i className="bi bi-chevron-left me-1" />
                  Prev
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={!canNext}
                  onClick={() => setPageNumber((p) => p + 1)}
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
