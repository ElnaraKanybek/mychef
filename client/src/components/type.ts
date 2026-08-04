export type Recipe = {
	recipeId?: number;
	userId: number;
	username?: string;
	recipeName: string;
	preparationTime: number;
	servings: number;
	category: string;
	pictureLink?: string;
	createdAt?: string;
};

export type Step = {
	stepId?: number;
	recipeId: number;
	stepNumber: number;
	description: string;
};

export type Ingredient = {
	ingredientId?: number;
	recipeId: number;
	name: string;
};

export type SavedRecipe = {
	savedId?: number;
	userId: number;
	recipeId: number;
	savedAt?: string;
	recipeName?: string;
	category?: string;
	preparationTime?: number;
	servings?: number;
	pictureLink?: string;
	username?: string;
};
