export type TenderFiles = {
  tenderId: string;
  tenderDirPath: string;
  deliveryDriverCsvPath: string;
  tenderCsvPath: string;
  geokeysCsvPaths: string[];
  tenderCostsCsvPath: string;
}

export type EnvTendersFiles = {
  dev: TenderFiles[];
  test: TenderFiles[];
  uat: TenderFiles[];
  hotfix: TenderFiles[];
  prod: TenderFiles[];
}
