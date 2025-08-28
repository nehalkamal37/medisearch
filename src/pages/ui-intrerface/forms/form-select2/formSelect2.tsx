import React from "react";
import { Select } from "antd";
import AutoBreadcrumb from "../../../../components/breadcrumb/AutoBreadcrumb";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { defaultSingle } from "../../../../core/json/selectOption";
import CommonFooter from "../../../../components/common-footer/commonFooter";



const handleChange = (_value: string) => {
  // Handle selection change
};

const onSearch = (_value: string) => {
  // Handle search
};
const FormSelect2 = () => {
  const [value, setValue] = React.useState<string[]>(["Alaska"]);
  const [value1, setValue1] = React.useState<string[]>(["Choice 1"]);
  const [value2, setValue2] = React.useState<string[]>(["Choice 1"]);
  const [value3, setValue3] = React.useState<string[]>([
    "Toronto",
    "Lyon",
    "Paris",
    "Barcelona",
  ]);

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <AutoBreadcrumb title="Form Select" />

          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Select2</h5>
                </div>
                {/* end card header */}
                <div className="card-body">
                  <p className="text-muted">
                    Select2 gives you a customizable select box with support for
                    searching, tagging, remote data sets, infinite scrolling,
                    and many other highly used options.
                  </p>
                  {/* start row */}
                  <div className="row g-3">
                    <div className="col-lg-6">
                      <p className="mb-1 fw-bold text-muted">Single Select</p>
                      <p className="text-muted fs-14">
                        Select2 can take a regular select box like this...
                      </p>
                      <Select
                        className="select w-100"
                        defaultValue="Select"
                        style={{ width: 200 }}
                        onChange={handleChange}
                        options={[
                          {
                            label: <span>Alaskan/Hawaiian Time Zone</span>,
                            title: "Alaskan/Hawaiian Time Zone",
                            options: [
                              { label: <span>Alaska</span>, value: "AK" },
                              { label: <span>Hawaii</span>, value: "HI" },
                            ],
                          },
                          {
                            label: <span>Pacific Time Zone</span>,
                            title: "Pacific Time Zone",
                            options: [
                              { label: <span>California</span>, value: "CA" },
                              { label: <span>Nevada</span>, value: "NV" },
                              { label: <span>Oregon</span>, value: "OR" },
                              { label: <span>Washington</span>, value: "WA" },
                            ],
                          },
                          {
                            label: <span>Mountain Time Zone</span>,
                            title: "Mountain Time Zone",
                            options: [
                              { label: <span>Arizona</span>, value: "AZ" },
                              { label: <span>Colorado</span>, value: "CO" },
                              { label: <span>Idaho</span>, value: "ID" },
                              { label: <span>Montana</span>, value: "MT" },
                              { label: <span>Nebraska</span>, value: "NE" },
                              { label: <span>New Mexico</span>, value: "NM" },
                              { label: <span>North Dakota</span>, value: "ND" },
                              { label: <span>Utah</span>, value: "UT" },
                              { label: <span>Wyoming</span>, value: "Wy" },
                            ],
                          },
                          {
                            label: <span>Central Time Zone</span>,
                            title: "Central Time Zone",
                            options: [
                              { label: <span>Alabama</span>, value: "AL" },
                              { label: <span>Arkansas</span>, value: "AR" },
                              { label: <span>Illinois</span>, value: "IL" },
                              { label: <span>Iowa</span>, value: "IA" },
                              { label: <span>Kansas</span>, value: "KS" },
                              { label: <span>Kentucky</span>, value: "Ky" },
                            ],
                          },
                        ]}
                      />
                    </div>
                    {/* end col */}
                    <div className="col-lg-6">
                      <p className="mb-1 fw-bold text-muted">Multiple Select</p>
                      <p className="text-muted fs-14">
                        Select2 can take a regular select box like this...
                      </p>
                      <Select
                        className="select w-100"
                        mode="multiple"
                        value={value}
                        style={{ width: "100%" }}
                        onChange={setValue}
                        placeholder="Please select"
                        options={[
                          { value: "AK", label: "Alaska" },
                          { value: "HI", label: "Hawaii" },
                          { value: "CA", label: "California" },
                          { value: "NV", label: "Nevada" },
                          { value: "OR", label: "Oregon" },
                          { value: "WA", label: "Washington" },
                          { value: "AZ", label: "Arizona" },
                          { value: "CO", label: "Colorado" },
                          { value: "ID", label: "Idaho" },
                        ]}
                      />
                    </div>
                    {/* end col */}
                  </div>
                  {/* end row */}
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            {/* start row */}
            <div className="col-lg-12">
              <div className="card mb-0">
                <div className="card-header">
                  <h5 className="card-title">Choices</h5>
                </div>
                {/* end card header */}
                <div className="card-body">
                  <div>
                    <h5 className="fs-14 mb-2">Single select input Example</h5>
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-single-default"
                            className="form-label text-muted"
                          >
                            Default
                          </label>
                          <p className="text-muted">
                            Set <code>data-choices</code> attribute to set a
                            default single select.
                          </p>
                          <CommonSelect
                            options={defaultSingle}
                            className="select"
                            defaultValue={defaultSingle[0]}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-single-groups"
                            className="form-label text-muted"
                          >
                            Option Groups
                          </label>
                          <p className="text-muted">
                            Set <code>data-choices data-choices-groups</code>
                            attribute to set option group
                          </p>
                          <Select
                            className="select w-100"
                            defaultValue="Choose a city"
                            style={{ width: 200 }}
                            onChange={handleChange}
                            options={[
                              {
                                label: <span>UK</span>,
                                title: "UK",
                                options: [
                                  {
                                    label: <span>London</span>,
                                    value: "London",
                                  },
                                  {
                                    label: <span>Manchester</span>,
                                    value: "Manchester",
                                  },
                                  {
                                    label: <span>Liverpool</span>,
                                    value: "Liverpool",
                                  },
                                ],
                              },
                              {
                                label: <span>FR</span>,
                                title: "FR",
                                options: [
                                  { label: <span>Paris</span>, value: "Paris" },
                                  { label: <span>Lyon</span>, value: "Lyon" },
                                  {
                                    label: <span>Marseille</span>,
                                    value: "Marseille",
                                  },
                                ],
                              },
                              {
                                label: <span>DE</span>,
                                title: "DE",
                                options: [
                                  {
                                    label: <span>Hamburg</span>,
                                    value: "Hamburg",
                                  },
                                  {
                                    label: <span>Munich</span>,
                                    value: "Munich",
                                  },
                                  {
                                    label: <span>Berlin</span>,
                                    value: "Berlin",
                                  },
                                ],
                              },
                              {
                                label: <span>US</span>,
                                title: "US",
                                options: [
                                  {
                                    label: <span>New York</span>,
                                    value: "New York",
                                  },
                                  {
                                    label: <span>Washington</span>,
                                    value: "Washington",
                                  },
                                  { label: <span>Michigan</span>, value: "IL" },
                                ],
                              },
                            ]}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-single-no-search"
                            className="form-label text-muted"
                          >
                            Options added via config with no search
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-choices data-choices-search-false
                              data-choices-removeItem
                            </code>
                          </p>
                          <Select
                            defaultValue="Zero"
                            className="select w-100"
                            allowClear
                            options={[
                              { value: "Zero", label: "Zero" },
                              { value: "One", label: "One" },
                              { value: "Two", label: "Two" },
                              { value: "Three", label: "Three" },
                              { value: "Four", label: "Four" },
                              { value: "Five", label: "Five" },
                              { value: "Six", label: "Six" },
                            ]}
                            placeholder="select it"
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-single-no-sorting"
                            className="form-label text-muted"
                          >
                            Options added via config with no sorting
                          </label>
                          <p className="text-muted">
                            Set
                            <code>data-choices data-choices-sorting-false</code>
                            attribute.
                          </p>
                          <Select
                            className="select w-100"
                            showSearch
                            defaultValue="Madrid"
                            optionFilterProp="label"
                            onChange={handleChange}
                            onSearch={onSearch}
                            options={[
                              { value: "Madrid", label: "Madrid" },
                              { value: "Toronto", label: "Toronto" },
                              { value: "Vancouver", label: "Vancouver" },
                              { value: "London", label: "London" },
                              { value: "Manchester", label: "Manchester" },
                              { value: "Liverpool", label: "Liverpool" },
                              { value: "Paris", label: "Paris" },
                              { value: "Malaga", label: "Malaga" },
                              { value: "Washington", label: "Washington" },
                              { value: "Lyon", label: "Lyon" },
                              { value: "Marseille", label: "Marseille" },
                              { value: "Hamburg", label: "Hamburg" },
                              { value: "Munich", label: "Munich" },
                              { value: "Barcelona", label: "Barcelona" },
                              { value: "Berlin", label: "Berlin" },
                              { value: "Montreal", label: "Montreal" },
                              { value: "New York", label: "New York" },
                              { value: "Michigan", label: "Michigan" },
                            ]}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                  </div>
                  <div className="mt-4">
                    <h5 className="fs-14 mb-3">Multiple select input</h5>
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-multiple-default"
                            className="form-label text-muted"
                          >
                            Default
                          </label>
                          <p className="text-muted">
                            Set <code>data-choices multiple</code> attribute.
                          </p>
                          <Select
                            className="select w-100"
                            mode="multiple"
                            value={value1}
                            onChange={setValue1}
                            placeholder="Please select"
                            options={[
                              { value: "Choice 1", label: "Choice 1" },
                              { value: "Choice 2", label: "Choice 2" },
                              { value: "Choice 3", label: "Choice 3" },
                              { value: "Choice 4", label: "Choice 4" },
                            ]}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-multiple-remove-button"
                            className="form-label text-muted"
                          >
                            With remove button
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-choices data-choices-removeItem multiple
                            </code>
                            attribute.
                          </p>
                          <Select
                            className="select w-100"
                            mode="multiple"
                            value={value2}
                            onChange={setValue2}
                            placeholder="Please select"
                            options={[
                              { value: "Choice 1", label: "Choice 1" },
                              { value: "Choice 2", label: "Choice 2" },
                              { value: "Choice 3", label: "Choice 3" },
                              { value: "Choice 4", label: "Choice 4" },
                            ]}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-multiple-groups"
                            className="form-label text-muted"
                          >
                            Option groups
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-choices data-choices-multiple-groups="true"
                              multiple
                            </code>
                            attribute.
                          </p>
                          <Select
                            className="select"
                            mode="multiple"
                            value={value3}
                            onChange={setValue3}
                            placeholder="Please select"
                            options={[
                              { value: "London", label: "London" },
                              { value: "Manchester", label: "Manchester" },
                              { value: "Liverpool", label: "Liverpool" },
                              { value: "Paris", label: "Paris" },
                              { value: "Lyon", label: "Lyon" },
                              { value: "Marseille", label: "Marseille" },
                              { value: "Hamburg", label: "Hamburg" },
                              { value: "Munich", label: "Munich" },
                              { value: "Berlin", label: "Berlin" },
                            ]}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                  </div>
                  <div className="mt-4">
                    <h5 className="fs-14 mb-3">Text inputs</h5>
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-text-remove-button"
                            className="form-label text-muted"
                          >
                            Set limit values with remove button
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-choices data-choices-limit="Required Limit"
                              data-choices-removeItem
                            </code>
                            attribute.
                          </p>
                           <input type="text" className="form-control" />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label
                            htmlFor="choices-text-unique-values"
                            className="form-label text-muted"
                          >
                            Unique values only, no pasting
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-choices data-choices-text-unique-true
                            </code>
                            attribute.
                          </p>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    <div>
                      <label
                        htmlFor="choices-text-disabled"
                        className="form-label text-muted"
                      >
                        Disabled
                      </label>
                      <p className="text-muted">
                        Set
                        <code>
                          data-choices data-choices-text-disabled-true
                        </code>
                        attribute.
                      </p>
                      <input
                        className="form-control"
                        id="choices-text-disabled"
                        data-choices=""
                        data-choices-text-disabled-true=""
                        type="text"
                        defaultValue="alex@example.com, laura@example.com"
                      />
                    </div>
                  </div>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <CommonFooter/>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default FormSelect2;
