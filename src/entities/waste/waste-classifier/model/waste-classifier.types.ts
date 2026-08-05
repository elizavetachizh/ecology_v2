export type WasteClassifier = {
  id: number;
  code: number;
  name: string;
};

export type WasteClassifierListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: WasteClassifier[];
};
