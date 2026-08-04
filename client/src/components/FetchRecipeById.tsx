import { useState, useEffect } from "react";
import RecipeView from "./RecipeView";
import { Recipe } from "./type";

type FetchRecipeByIdProps = {
	recipeId: string;
	userId: number | null;
	userRole: string;
};
// FindOne component fetches and displays a single Todo item
export default function FetchRecipeById({
	recipeId,
	userId,
	userRole
}: FetchRecipeByIdProps) {
	const [recipeItem, setRecipeItem] = useState<Recipe | null>(null); // Holds the fetched todo item, add the type

	const fetchRecipe = async () => {
		try {
			// eslint-disable-next-line no-undef
			const requestOption: RequestInit = {
				method: "GET",
				mode: "cors",
				credentials: "include",
			};

			const response = await fetch(
				`http://localhost:3000/recipes/${recipeId}`,
				requestOption,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch recipe");
			} else {
				const data: { payload: { recipe: Recipe } } =
					await response.json();
				const recipe = data.payload.recipe;
				setRecipeItem(recipe);
			}
		} catch (error) {
			console.log(error);
			throw new Error("Something went wrong");
		}
	};

	useEffect(() => {
		if (!recipeId) return;
		fetchRecipe();
	}, [recipeId]);

	return <RecipeView recipe={recipeItem} userId={userId} userRole={userRole} />;
}
