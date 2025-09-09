import React from "react";
import {
  Calendar,
  Beaker,
  ShieldCheck,
  UserRound,
  UserCog,
  Building2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

type Control = {
  value: string;
  onChange: (v: string) => void;
  options: string[];
};

type InsuranceControl = Control & {
  labelMapper?: (v: string) => string;
};

interface FilterRowProps {
  month: Control;
  drugClass: Control;
  insurance: InsuranceControl;
  prescriber: Control;
  user: Control;
  branch: Control;
  onReset?: () => void;
  className?: string;
}

const SelectShell: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  labelMapper?: (v: string) => string;
}> = ({ label, icon, value, onChange, options, placeholder, labelMapper }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          {icon}
        </span>

        <select
          className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {labelMapper ? labelMapper(opt) : opt}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

const FilterRow: React.FC<FilterRowProps> = ({
  month,
  drugClass,
  insurance,
  prescriber,
  user,
  branch,
  onReset,
  className = "",
}) => {
  return (
    <div className={`card mb-5 ${className}`}>
      <div className="card-body">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h6 className="m-0 text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wide">
            Filters
          </h6>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectShell
            label="Month"
            icon={<Calendar className="h-4 w-4" />}
            value={month.value}
            onChange={month.onChange}
            options={month.options}
            placeholder="All Months"
          />
          <SelectShell
            label="Drug Class"
            icon={<Beaker className="h-4 w-4" />}
            value={drugClass.value}
            onChange={drugClass.onChange}
            options={drugClass.options}
            placeholder="All Classes"
          />
          <SelectShell
            label="Rx Group"
            icon={<ShieldCheck className="h-4 w-4" />}
            value={insurance.value}
            onChange={insurance.onChange}
            options={insurance.options}
            placeholder="All RxGroups"
            labelMapper={insurance.labelMapper}
          />
          <SelectShell
            label="Prescriber"
            icon={<UserCog className="h-4 w-4" />}
            value={prescriber.value}
            onChange={prescriber.onChange}
            options={prescriber.options}
            placeholder="All Prescribers"
          />
          <SelectShell
            label="User"
            icon={<UserRound className="h-4 w-4" />}
            value={user.value}
            onChange={user.onChange}
            options={user.options}
            placeholder="All Users"
          />
          <SelectShell
            label="Branch"
            icon={<Building2 className="h-4 w-4" />}
            value={branch.value}
            onChange={branch.onChange}
            options={branch.options}
            placeholder="All Branches"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterRow;
