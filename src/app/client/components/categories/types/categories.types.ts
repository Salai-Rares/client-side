export type CategoryBase = {
  id: string;
  name: string;
  path: string;
  image: string | null;
};

export type CategorySummary = Pick<CategoryBase, 'id' | 'name'>;
export type CategoryCard = Pick<CategoryBase, 'id' | 'name' | 'image' | 'path'>;
export type AnyCat = CategorySummary | CategoryCard | CategoryBase;
