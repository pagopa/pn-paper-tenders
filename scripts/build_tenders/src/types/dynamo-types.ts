export type PaperChannelTender = {
  tenderId: string;
  activationDate: string;
  tenderName: string;
  vat: number;
  nonDeductibleVat: number;
  fee: number;
  pagePrice: number;
  basePriceAR: number;
  basePriceRS: number;
  basePrice890: number;
  createdAt: string;
};

export type PaperChannelTenderCosts = {
  tenderId: string;
  productLotZone: string;
  product: string;
  lot: string;
  zone: string;
  deliveryDriverName: string;
  deliveryDriverId: string;
  dematerializationCost: number;
  rangedCosts: PaperChannelTenderCostsRange[];
  createdAt: string;
};

export type PaperChannelTenderCostsRange = {
  cost: number;
  minWeight: number;
  maxWeight: number;
};

export type PaperChannelGeokey = {
  tenderProductGeokey: string;
  activationDate: string;
  tenderId: string;
  product: string;
  geokey: string;
  lot: string;
  zone: string;
  coverFlag: boolean;
  dismissed: boolean;
  createdAt: string;
};

export type PaperChannelDeliveryDriver = {
  deliveryDriverId: string;
  taxId: string;
  businessName: string;
  fiscalCode: string;
  pec: string;
  phoneNumber: string;
  registeredOffice: string;
  unifiedDeliveryDriver: string;
  createdAt: string;
};
