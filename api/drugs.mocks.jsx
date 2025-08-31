// types الخفيفة للموك
export type InsuranceMini = {
  name: string;
  bin: string;
  binFullName: string;
  pcn: string;
  rxgroup: string;
};

export type DrugMini = {
  id: string;
  name: string;
  ndc: string;
  drugClass: string;
  form?: string;
  strength?: string;
  strengthUnit?: string;
  ingredient?: string;
  route?: string;
  teCode?: string;
  marketType?: string;
  awp?: number;
  acq?: number;
  image: string; // relative to assets
  insurances: InsuranceMini[];
};

// موك داتا بسيطة تكفي للتجربة
export const MOCK_DRUGS: DrugMini[] = [
  {
    id: "d1",
    name: "Amoxicillin 500mg Cap",
    ndc: "12345678901",
    drugClass: "Antibiotic",
    form: "Capsule",
    strength: "500",
    strengthUnit: "mg",
    ingredient: "Amoxicillin",
    route: "Oral",
    teCode: "AB",
    marketType: "Generic",
    awp: 45.2,
    acq: 12.7,
    image: "assets/img/media/img-1.jpg",
    insurances: [
      { name: "Aetna Rx", bin: "012345", binFullName: "Aetna BIN 012345", pcn: "AETNA01", rxgroup: "AET-RX" },
      { name: "CVS Caremark", bin: "610591", binFullName: "CVS BIN 610591", pcn: "MEDDPRIME", rxgroup: "CVS-STD" },
    ],
  },
  {
    id: "d2",
    name: "Atorvastatin 20mg Tab",
    ndc: "00093012345",
    drugClass: "Statin",
    form: "Tablet",
    strength: "20",
    strengthUnit: "mg",
    ingredient: "Atorvastatin",
    route: "Oral",
    teCode: "AB",
    marketType: "Generic",
    awp: 32.9,
    acq: 8.5,
    image: "assets/img/media/img-2.jpg",
    insurances: [
      { name: "OptumRx", bin: "610279", binFullName: "OPTUM BIN 610279", pcn: "9999", rxgroup: "OPX-PLUS" },
    ],
  },
  {
    id: "d3",
    name: "Ozempic 1mg/dose Pen",
    ndc: "00169413611",
    drugClass: "GLP-1",
    form: "Pen Injector",
    strength: "1",
    strengthUnit: "mg/dose",
    ingredient: "Semaglutide",
    route: "Subcutaneous",
    teCode: "NA",
    marketType: "Brand",
    awp: 980,
    acq: 720,
    image: "assets/img/media/img-3.jpg",
    insurances: [
      { name: "Blue Cross", bin: "003858", binFullName: "BCBS BIN 003858", pcn: "BCBS01", rxgroup: "BC-STND" },
      { name: "Medicaid", bin: "610084", binFullName: "Medicaid BIN 610084", pcn: "MEDICAID", rxgroup: "MCD" },
    ],
  },
];
