export type Item = {
  Name: string;
  Price: number;
  Quantity: number;
};

export type ParsedData = {
    items: Item[];
    tax: number;
    tip: number;
};