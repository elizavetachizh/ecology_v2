export type DistrictClassifier = {
  id: number;
  name: string;
};

export type DistrictClassifierListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: DistrictClassifier[];
};
