export interface IMenu {
  map(arg0: (dish: any) => any[]): string[] | undefined;
  DishesIds: any;
  Id: string;
  Title: string;
  Description: string;
  TimeToService: number;
  Dishes: IDish[];
}

export interface IDish {
  Id: string;
  Title: string;
  Description: string;
  Price: number;
  ImageId?: string;
}
