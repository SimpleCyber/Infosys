export type MealWindow = 'lunch' | 'dinner';

export interface FoodCourt {
  id: string;
  name: string;
  description: string;
}

export interface OutletMenu {
  id: string;
  foodCourtId: string;
  foodCourtName: string;
  outletName: string;
  mealWindow: MealWindow;
  imageUrl: string;
  isFixedMenu: boolean;
  dateStr: string;
  updatedAt: string;
  updatedAtFormatted: string;
}

export interface FoodCourtGroup {
  foodCourtId: string;
  foodCourtName: string;
  description: string;
  outlets: OutletMenu[];
  hasActiveMenus: boolean;
}

export interface FeedResponse {
  source: 'cache' | 'database';
  data: {
    dateStr: string;
    mealWindow: MealWindow;
    timestamp: string;
    foodCourts: FoodCourtGroup[];
  };
}
