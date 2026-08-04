import { Recipe } from "./type";
import { useEffect, useState } from "react";
import RecipeListView from "./RecipeListView";

type FetchRecipesByNameProps = {
	recipeName: string;
	userId: number | null;
};

export default function FetchRecipesByName({
	recipeName,
	userId,
}: FetchRecipesByNameProps) {
	const [recipeList, setRecipeList] = useState<Recipe[] | null>(null);

	const fetchRecipes = async () => {
		if (!recipeName.trim()) {
			setRecipeList(null);
			return;
		}

		const response = await fetch(
			`http://localhost:3000/recipes/search-recipe/${encodeURIComponent(recipeName.trim())}`,
			{
				method: "GET",
				credentials: "include",
			},
		);

		if (response.ok) {
			const data = await response.json();
			setRecipeList(data.payload.recipes);
		} else {
			setRecipeList([]);
		}
	};

	useEffect(() => {
		fetchRecipes();
	}, [recipeName]);

	return (
		<div>
			{!recipeList || recipeList.length === 0 ? (
				<p>No recipes found for "{recipeName}"</p>
			) : (
				<RecipeListView recipes={recipeList} userId={userId} />
			)}
		</div>
	);
}
