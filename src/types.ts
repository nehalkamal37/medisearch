export interface Drug {
  route: any;
  ndcCode(ndcCode: any): unknown;
  id: number;
  name: string;
  ndc: string;
  form: string;
  strength: string;
  classId: number;
  drugClassV2Id: number;
  drugClass: string | null;
  acq: number;
  awp: number;
  rxcui: number;
  ingrdient: string;
  teCode: string;
  type: string;
  strengthUnit: string;
}
export interface EPCMOAClass {
  id: number;
  name: string;
  type: string;
}
export interface ClassInfo {
  id: number;
  classTypeName: string;
  classTypeId: number;
  name: string;
}
export interface DrugMedi {
  drugName: string;
  drugId: number;
  drugNDC: string;
  priorAuthorization: string;
  extendedDuration: string;
  costCeilingTier: string;
  nonCapitatedDrugIndicator: string;
  ccsPanelAuthority: string;
}

export interface BestAlternative {
  classId: number;
  date: string; // ISO date string, e.g., "2024-01-01T00:00:00Z"
  branchId: number;
  className: string;
  bestNet: number;
  drugId: number;
  scriptCode: string;
  scriptDateTime: string; // ISO date string, e.g., "2024-01-15T22:00:00Z"
  drugName: string;
  drugClass: string;
  branchName: string;
  ndc: string;
  binId: number;
  pcnId: number;
  rxGroupId: number;
  binFullName: string;
  bin: string;
  pcn: string;
  rxgroup: string;
}
export interface CartItem {
  id: string;
  name: string;
  ndc: string;
  acq: number;
  insurancePayment: number;
  patientPayment: number;
  price: number;
  quantity: number;
  insurance: string;
}

export interface OrderRequestBody {
  orderItems: OrderItem[];
  searchLogs: SearchLog[];
}

export interface OrderItem {
  drugNDC: string;
  netPrice: number;
  patientPay: number;
  insurancePay: number;
  acquisitionCost: number;
  additionalCost: number;
  insuranceRxId: number;
  amount: number;
}

export interface SearchLog {
  rxgroupId: number;
  binId: number;
  pcnId: number;
  drugNDC: string;
  date: string;
  searchType: string;
}

export interface Prescription {
  insuranceId: number;
  drugId: number;
  ndcCode: string;
  drugName: string;
  drugClassId: number;
  insuranceName: string;
  net: number;
  date: string; // Alternatively, use Date if you parse this value
  prescriber: string;
  quantity: number;
  acquisitionCost: number;
  discount: number;
  insurancePayment: number;
  patientPayment: number;
  drugClass: string;
  branchName: string;
  insurance: any | null;
  bin: string;
  pcn: string;
  binFullName: string;
  binId: number;
  pcnId: number;
  scriptCode: string;
  rxgroupId: number;
  rxgroup: string;
  applicationNumber: string;
  applicationType: string;
  strength: string;
  form: string;
  route: string;
  teCode: string;
  ingrdient: string;
  type: string;
  strengthUnit: string;
}

export interface DrugInsuranceInfo {
  insuranceId: number;
  drugId: number;
  ndcCode: string;
  drugName: string;
  drugClassId: number;
  insuranceName: string;
  net: number;
  date: string;
  prescriber: string;
  quantity: number;
  acquisitionCost: number;
  discount: number;
  insurancePayment: number;
  patientPayment: number;
  drugClass: string;
  insurance: any | null;
  drug: any | null;
}
export interface Insurance {
  id: number;
  rxGroup: string; //code
  description: string; //full name
  insuranceBin: string;
  insurancePCN: string;
  insuranceFullName: string;
  helpDeskNumber: string;
}
export interface Bin {
  id: number;
  rxGroup: string; //code
  name: string; //full name
  bin: string;
  helpDeskNumber: string;
}
export interface DrugTransaction {
   totalNetProfit:number;
   totalHighestNet:number;
   difference:number;

  differencePerItem?: number;   // ← add this line
  insuranceId?: string | number; // if it’s not already present
  /** Allow legacy/mock name for now so mocks compile */
  insurance?: string;
  date: string;
  scriptCode: string;
  rxNumber: string;
  user: string;
  prescriber: string;
  drugName: string;
  drugId: number;
  //insuranceId: number;
  insurancePayment: number;
  patientPayment: number;
  acquisitionCost: number;
  discount: number;
  quantity: number;
  pf: string;
  ndcCode: string;
  netProfit: number;
  netProfitPerItem: number;
  drugClass: string;
  branchCode: string;

  // 🔹 Current Script Info
  insuranceRx: string;
  binCode: string;
  binName: string;
  pcnName: string;
  remainingStock: number;

  // 🔹 Best Alternative Info
  highestDrugId: number;
  highestDrugName: string;
  highestDrugNDC: string;
  highestScriptCode: string;
  highestScriptDate: string;
  highestNet: number;
  highestNetProfitPerItem: number;
  highestQuantity: number;
  highestRemainingStock: number;
  highestInsuranceRx: string;
  highestBINCode: string;
  highestBINName: string;
  highestPCNName: string;
  rxGroupId?: number;
  binId?: number;
  pcnId?: number;
  highestRxGroupId?: number;
  highestBinId?: number;
  highestPcnId?: number;
}

export interface ScriptData {
  id: number;
  drugName: string;
  insuranceName: string;
  drugClassName: string;
  prescriberName: string;
  userName: string;
  pf: string;
  quantity: number;
  acquisitionCost: number;
  discount: number;
  insurancePayment: number;
  patientPayment: number;
  netProfit: number;
  ndcCode: string;
  branchName: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
export interface RxGroupModel {
  id: number;
  rxGroup: string;
  insurancePCNId: number;
}
export interface PCNModel {
  id: number;
  pcn: string;
  insuranceId: number;
}
export interface PharmacySale {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  drugId: string;
  drugName: string;
  salePrice: number;
  netPrice: number;
  quantity: number;
  date: string;
  insuranceId: string;
  insuranceName: string;
}

export interface SalesAnalytics {
  totalSales: number;
  totalScripts: number;
  totalRevenue: number;
  belowNetPriceCount: number;
  salesByDrug: {
    [drugName: string]: {
      scripts: number;
      revenue: number;
    };
  };
}
export interface SearchLogReadDto {
  id: number;
  rxgroupId: number;
  rxgroupName: string;
  binId: number;
  pcnId: number;
  binName: string | null;
  pcnName: string | null;
  drugId: number;
  drugName: string;
  ndc: string;
  userId: number;
  orderItemId: number;
  date: string;
  searchType: string;
}

export interface OrderItemReadDto {
  id: number;
  orderId: number;
  drugId: number;
  drugName: string;
  ndc: string;
  netPrice: number;
  patientPay: number;
  insurancePay: number;
  acquisitionCost: number;
  addtionalCost: number;
  insuranceRxId: number;
  insuranceRxName: string;
  amount: number;
  searchLogReadDto: SearchLogReadDto;
}

export interface OrderReadDto {
  id: number;
  userId: string;
  date: string;
  totalNet: number;
  totalPatientPay: number;
  totalInsurancePay: number;
  totalAcquisitionCost: number;
  additionalCost: number;
  orderItemReadDtos: OrderItemReadDto[];
}
/*
interface Question {
  questionId: string;
  questionText: string;
  type: "SingleChoice" | "MultipleChoice" | "ShortAnswer" | "Paragraph";
  options?: string[];
  selectedAnswers: string[];
  textAnswer: string;
}
/*
interface Section {
  sectionTitle: string;
  questions: Question[];
}

interface FeedbackFormData {
  formTitle: string;
  sections: Section[];
}
  */