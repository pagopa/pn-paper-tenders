export type Validator = (value: string) => boolean | string | number;
export type NumberValidator = (value: string) => number;
export type StringValidator = (value: string) => string;
export type BooleanValidator = (value: string) => boolean;

export type TenderValidators = {
  activationDate: StringValidator;
  tenderName: StringValidator;
  vat: NumberValidator;
  nonDeductibleVat: NumberValidator;
  fee: NumberValidator;
  pagePrice: NumberValidator;
  basePriceAR: NumberValidator;
  basePriceRS: NumberValidator;
  basePrice890: NumberValidator;
};

export type TenderCostsValidators = {
  product: StringValidator;
  lot: StringValidator;
  zone: StringValidator;
  deliveryDriverName: StringValidator;
  deliveryDriverId: StringValidator;
  dematerializationCost: NumberValidator;
  range: NumberValidator;
};

export type DeliveryDriverValidators = {
  deliveryDriverId: StringValidator;
  taxId: StringValidator;
  businessName: StringValidator;
  fiscalCode: StringValidator;
  pec: StringValidator;
  phoneNumber: StringValidator;
  registeredOffice: StringValidator;
  unifiedDeliveryDriver: StringValidator;
};

export type GeokeyValidators = {
  activationDate: StringValidator;
  geokey: StringValidator;
  product: StringValidator;
  lot: StringValidator;
  zone: StringValidator;
  coverFlag: BooleanValidator;
  dismissed: BooleanValidator;
};

export type CapacityValidators = {
    unifiedDeliveryDriver: StringValidator;
    geoKey: StringValidator;
    capacity: NumberValidator;
    peakCapacity: NumberValidator;
    activationDateFrom: StringValidator;
    activationDateTo: StringValidator;
    };

export type ProvinceValidators = {
    province: StringValidator;  
    region: StringValidator;
};
