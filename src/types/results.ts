export type Item = {
  id: string; 
  Name: string;
  Price: number;
  Quantity: number;
};

export type ParsedData = {
    items: Item[];
    tax: number;
    tip: number;
};

export type NameInfo = {
  id: string; 
  name: string;
}

export type NameMatrix = {
  [itemId: string]: Set<string>;
};