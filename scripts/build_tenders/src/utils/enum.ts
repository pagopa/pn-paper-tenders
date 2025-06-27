export enum Products {
  PRODUCT_RS = 'RS',
  PRODUCT_RIR = 'RIR',
  PRODUCT_RIS = 'RIS',
  PRODUCT_AR = 'AR',
  PRODUCT_890 = '890',
}

export enum Zone {
  ZONE_EU = 'EU',
  ZONE_AM = 'AM',
  ZONE_CP = 'CP',
  ZONE_1 = 'ZONE_1',
  ZONE_2 = 'ZONE_2',
  ZONE_3 = 'ZONE_3',
}

export enum DynamoTables {
  TENDER = 'pn-PaperChannelTender',
  COST = 'pn-PaperChannelCost',
  GEOKEY = 'pn-PaperChannelGeokey',
  DELIVERY_DRIVER = 'pn-PaperChannelDeliveryDriver',
  CAPACITY = 'pn-PaperDeliveryDriverCapacities',
  PROVINCE = 'pn-Provinces',
}

export enum Envs {
  DEV = 'dev',
  TEST = 'test',
  UAT = 'uat',
  HOTFIX = 'hotfix',
  PROD = 'prod',
}

export enum RequiredTenderFiles {
  TENDER = 'Tender.csv',
  TENDER_COSTS = 'TenderCosts.csv',
  GEOKEY = 'Geokey_v1.csv',
  DELIVERY_DRIVER = 'DeliveryDriver.csv'
}
