
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Ingredient {
  name: string;
  amount: string;
  isOwned: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  prepTime: number; // in minutes
  calories: number;
  ingredients: Ingredient[];
  steps: string[];
  imagePrompt: string;
  dietaryTags: string[];
}

export enum DietaryRestriction {
  VEGETARIAN = 'Vegetarian',
  KETO = 'Keto',
  VEGAN = 'Vegan',
  GLUTEN_FREE = 'Gluten-Free',
  PALEO = 'Paleo',
  DAIRY_FREE = 'Dairy-Free'
}

export interface AppState {
  view: 'landing' | 'fridge' | 'recipes' | 'cooking' | 'shopping';
  capturedImage: string | null;
  foundIngredients: string[];
  suggestedRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  shoppingList: string[];
  filters: DietaryRestriction[];
  isAnalyzing: boolean;
}
