export type RegionClassifier = {
  id: number;
  name: string;
};

export type RegionClassifierListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: RegionClassifier[];
};
