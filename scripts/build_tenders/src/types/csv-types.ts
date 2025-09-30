export type TenderCSV = {
  activationDate: string;
  tenderName: string;
  vat: number;
  nonDeductibleVat: number;
  fee: number;
  pagePrice: number;
  basePriceAR: number;
  basePriceRS: number;
  basePrice890: number;
};

export type TenderCostsCSV = {
  product: string;
  lot: string;
  zone: string;
  deliveryDriverName: string;
  deliveryDriverId: string;
  dematerializationCost: number;
} & {
  [key: `range_${number}_${number}`]: number;
};

export type GeokeyCSV = {
  activationDate: string;
  geokey: string;
  product: string;
  lot: string;
  zone: string;
  coverFlag: boolean;
  dismissed: boolean;
};

export type DeliveryDriverCSV = {
  deliveryDriverId: string;
  taxId: string;
  businessName: string;
  fiscalCode: string;
  pec: string;
  phoneNumber: string;
  registeredOffice: string;
  unifiedDeliveryDriver: string;
};

export type CapacityCSV = {
    unifiedDeliveryDriver: string;
    geoKey: string;
    capacity: number;
    peakCapacity: number;
    activationDateFrom: string;
    activationDateTo: string;
    products: string;
};

export type ProvinceCSV = {
  provincia: string;
  codice_istat_provincia: string;
  sigla_provincia: string
  capolouogo_regione: string
  codice_istat_regione: string
  regione: string;
  residenti_provincia: string;
  residenti_regione: string;
  percentuale_provincia_regione: string;
  percentuale_regione_nazione: string;
};
