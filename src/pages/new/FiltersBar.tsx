import React from "react";

type Option = { value: string; label: string };

type FiltersBarProps = {
  months: Option[];
  classes: Option[];
  insurances: Option[];
  prescribers: Option[];
  users: Option[];
  branches: Option[];

  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedClass: string;
  setSelectedClass: (v: string) => void;
  selectedInsurance: string;
  setSelectedInsurance: (v: string) => void;
  selectedPrescriber: string;
  setSelectedPrescriber: (v: string) => void;
  selectedUser: string;
  setSelectedUser: (v: string) => void;
  selectedBranch: string;
  setSelectedBranch: (v: string) => void;

  onDownload: () => void;
  onReset: () => void;
};

const SelectFilter: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}> = ({ label, value, onChange, options }) => (
  <div className="col-6 col-md-2">
    <label className="form-label small text-muted mb-1">{label}</label>
    <select
      className="form-select form-select-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{`All ${label}`}</option>
      {options.map((o) => (
        <option key={o.value || o.label} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const FiltersBar: React.FC<FiltersBarProps> = (p) => {
  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <SelectFilter
            label="Months"
            value={p.selectedMonth}
            onChange={p.setSelectedMonth}
            options={p.months}
          />
          <SelectFilter
            label="Classes"
            value={p.selectedClass}
            onChange={p.setSelectedClass}
            options={p.classes}
          />
          <SelectFilter
            label="RxGroups"
            value={p.selectedInsurance}
            onChange={p.setSelectedInsurance}
            options={p.insurances}
          />
          <SelectFilter
            label="Prescribers"
            value={p.selectedPrescriber}
            onChange={p.setSelectedPrescriber}
            options={p.prescribers}
          />
          <SelectFilter
            label="Users"
            value={p.selectedUser}
            onChange={p.setSelectedUser}
            options={p.users}
          />
          <SelectFilter
            label="Branches"
            value={p.selectedBranch}
            onChange={p.setSelectedBranch}
            options={p.branches}
          />

          <div className="col-12 col-md-auto ms-md-auto d-flex gap-2 mt-2 mt-md-0">
          {/*  <button className="btn btn-sm btn-primary" onClick={p.onDownload}>
              <i className="ti ti-download me-1" />
              Download CSV
            </button>
            */}
            <button className="btn btn-sm btn-outline-light" onClick={p.onReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
