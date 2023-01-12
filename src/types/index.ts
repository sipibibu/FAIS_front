export interface IMenu {
  id: string;
  title: string;
  description: string;
  timeToService: number;
  dishes: IDish[];
}

export interface IDish {
  id: string;
  title: string;
  description: string;
  price: number;
  imageId?: string;
}
