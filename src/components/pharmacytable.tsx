import React from "react";
import type { DrugTransaction } from "../types";

type SortCfg =
  | { key: keyof DrugTransaction; direction: "ascending" | "descending" }
  | null;

interface Props {
  rows: DrugTransaction[];
  requestSort: (key: keyof DrugTransaction) => void;
  sortConfig: SortCfg;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  totalRows?: number;
}

const money = (n?: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n ?? 0
  );
const d3 = (n?: number) => (n ?? 0).toFixed(3);
const d2 = (n?: number) => (n ?? 0).toFixed(2);
const dt = (d: any) =>
  new Date(d as any).toString() === "Invalid Date"
    ? "-"
    : new Date(d as any).toLocaleDateString("en-US");

const SortIcon: React.FC<{ col: keyof DrugTransaction; cfg: SortCfg }> = ({
  col,
  cfg,
}) => {
  if (!cfg || cfg.key !== col)
    return <i className="ti ti-arrows-sort text-muted ms-1" />;
  return cfg.direction === "ascending" ? (
    <i className="ti ti-chevron-up ms-1" />
  ) : (
    <i className="ti ti-chevron-down ms-1" />
  );
};

const title = (s: string) =>
  (s || "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace(/[.,]/g, "");

const PharmacyTable: React.FC<Props> = ({
  rows,
  requestSort,
  sortConfig,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  totalRows,
}) => {
  return (
    <div className="card shadow flex-fill w-100">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h5 className="mb-0">Scripts</h5>
        <span className="badge badge-soft-primary">
          {totalRows ?? rows.length} records
        </span>
      </div>

      <div className="table-responsive table-nowrap">
        <table className="table border table-hover align-middle mb-0">
          <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 5 }}>
            <tr>
              {[
                ["Date", "date"],
                ["Script Code", "scriptCode"],
                ["Branch", "branchCode"],
                ["Rx Group", "insuranceRx"],
                ["BIN", "binCode"],
                ["PCN", "pcnName"],
                ["Drug Class", "drugClass"],
                ["Drug Name", "drugName"],
                ["NDC Code", "ndcCode"],
                ["User", "user"],
                ["Patient Pay", "patientPayment"],
                ["ACQ", "acquisitionCost"],
                ["Ins. Pay", "insurancePayment"],
                ["Prescriber", "prescriber"],
                ["Qty", "quantity"],
                ["Net/Item", "netProfitPerItem"],
                ["Total Net", "netProfit"],
                ["Best/Item", "highestNetProfitPerItem"],
                ["Best Total", "highestNet"],
                ["Diff", "difference"],
                ["Diff/Item", "DifferencePerItem"],
                ["Best NDC", "highestDrugNDC"],
                ["Best Drug", "highestDrugName"],
                ["Best Script", "highestScriptCode"],
                ["Best Qty", "highestQuantity"],
                ["Best RxGrp", "highestInsuranceRx"],
                ["Best BIN", "highestBINCode"],
                ["Best PCN", "highestPCNName"],
                ["Best Date", "highestScriptDate"],
              ].map(([label, key]) => (
                <th
                  key={key}
                  className="text-nowrap cursor-pointer"
                  onClick={() => requestSort(key as keyof DrugTransaction)}
                >
                  <span className="d-inline-flex align-items-center">
                    {label}
                    <SortIcon col={key as keyof DrugTransaction} cfg={sortConfig} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((item, idx) => {
              const diff = (item.highestNet ?? 0) - (item.netProfit ?? 0);
              const diffItem =
                (item.highestNetProfitPerItem ?? 0) - (item.netProfitPerItem ?? 0);
              return (
                <tr key={idx} className="transition hover-bg">
                  <td className="text-nowrap">{dt(item.date as any)}</td>
                  <td>
                    <a className="link-primary" href={`/scriptitems/${item.scriptCode}`}>
                      {item.scriptCode}
                    </a>
                  </td>
                  <td>{item.branchCode}</td>

                  <td className="text-nowrap">
                    <a
                      className="link-primary"
                      href={`/InsuranceDetails/${item.rxGroupId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.insuranceRx || "NA"}
                    </a>
                  </td>

                  <td className="text-nowrap">
                    <a
                      className="link-primary"
                      href={`/InsuranceBINDetails/${item.binId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {(item.binName ? `${item.binName} - ` : "") + (item.binCode || "NA")}
                    </a>
                  </td>

                  <td className="text-nowrap">
                    <a
                      className="link-primary"
                      href={`/InsurancePCNDetails/${item.pcnId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.pcnName || "NA"}
                    </a>
                  </td>

                  <td>{item.drugClass}</td>

                  <td className="text-nowrap">
                    <a
                      className="link-primary"
                      href={`/drug/${item.drugId}?ndc=${item.ndcCode}&insuranceId=${item.insuranceId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.drugName}
                    </a>
                  </td>

                  <td className="text-nowrap">
                    <a
                      className="link-primary"
                      href={`https://ndclist.com/ndc/${item.ndcCode}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.ndcCode}
                    </a>
                  </td>

                  <td>{item.user}</td>
                  <td>{d2(item.patientPayment as any)}</td>
                  <td>{d2(item.acquisitionCost as any)}</td>
                  <td>{d2(item.insurancePayment as any)}</td>
                  <td>{title(String(item.prescriber || ""))}</td>
                  <td>{item.quantity}</td>

                  <td>{d3(item.netProfitPerItem)}</td>
                  <td>{d3(item.netProfit)}</td>
                  <td>{d3(item.highestNetProfitPerItem)}</td>
                  <td>{d3(item.highestNet)}</td>

                  <td className={diff > 0 ? "text-danger" : "text-success"}>
                    {d3(diff)}
                  </td>
                  <td className={diffItem > 0 ? "text-danger" : "text-success"}>
                    {d3(diffItem)}
                  </td>

                  <td className="text-nowrap">
                    <a
                      className="fw-semibold link-primary"
                      href={`https://ndclist.com/ndc/${item.highestDrugNDC}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.highestDrugNDC}
                    </a>
                  </td>
                  <td className="text-nowrap">
                    <a
                      className="fw-semibold link-primary"
                      href={`/drug/${item.highestDrugId}?ndc=${item.highestDrugNDC}&insuranceId=${item.insuranceId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.highestDrugName}
                    </a>
                  </td>

                  <td className="text-nowrap">
                    <a
                      className="fw-semibold link-primary"
                      href={`/scriptitems/${item.highestScriptCode}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.highestScriptCode || "NA"}
                    </a>
                  </td>

                  <td>{item.highestQuantity ?? "NA"}</td>

                  <td className="text-nowrap">
                    {item.highestRxGroupId ? (
                      <a
                        className="fw-semibold link-primary"
                        href={`/InsuranceDetails/${item.highestRxGroupId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.highestInsuranceRx}
                      </a>
                    ) : (
                      item.highestInsuranceRx || "NA"
                    )}
                  </td>

                  <td className="text-nowrap">
                    {item.highestBinId ? (
                      <a
                        className="fw-semibold link-primary"
                        href={`/InsuranceBINDetails/${item.highestBinId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {(item.highestBINName ? `${item.highestBINName} - ` : "") +
                          (item.highestBINCode || "NA")}
                      </a>
                    ) : (
                      item.highestBINCode || "NA"
                    )}
                  </td>

                  <td className="text-nowrap">
                    {item.highestPcnId ? (
                      <a
                        className="fw-semibold link-primary"
                        href={`/InsurancePCNDetails/${item.highestPcnId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.highestPCNName}
                      </a>
                    ) : (
                      item.highestPCNName || "NA"
                    )}
                  </td>

                  <td className="text-nowrap">{dt(item.highestScriptDate as any)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination — template style */}
      <div className="card-footer d-flex align-items-center justify-content-between flex-wrap gap-2">
        <p className="mb-0">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </p>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-light d-inline-flex align-items-center"
            onClick={onPrev}
            disabled={currentPage === 1}
          >
            <i className="ti ti-chevron-left me-1" /> Previous
          </button>
          <button
            className="btn btn-outline-light d-inline-flex align-items-center"
            onClick={onNext}
            disabled={currentPage === totalPages}
          >
            Next <i className="ti ti-chevron-right ms-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyTable;
