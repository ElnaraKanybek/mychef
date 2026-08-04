import { Link } from "react-router-dom";
import { Recipe } from "./type";
import { useState } from "react";

type RecipeListViewProps = {
	recipes: Recipe[] | null;
	userId: number | null;
};
export default function RecipeListView({
	recipes,
	userId,
}: RecipeListViewProps) {
	const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

	const handleSave = async (recipeId: number) => {
		if (!userId) {
			alert("You must be logged in to save recipes.");
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:3000/users/${userId}/saved`,
				{
					method: "POST",
					mode: "cors",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ recipeId }),
				},
			);

			if (!response.ok) {
				alert("Could not save recipe. It may already be saved.");
				return;
			}

			setSavedIds((prev) => new Set(prev).add(recipeId));
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>Recipe Name</th>
						<th>Created by</th>
						<th>Preparation Time (mins)</th>
						<th>Category</th>
						<th>Save</th>
					</tr>
				</thead>

				<tbody>
					{recipes?.map((recipe: Recipe) => (
						<tr key={recipe.recipeId}>
							<td>
								<Link
									to={`/recipes/id-search/${recipe.recipeId}`}
								>
									{recipe.recipeName}
								</Link>
							</td>
							<td>{recipe.username}</td>
							<td>{recipe.preparationTime}</td>
							<td>{recipe.category}</td>
							<td>
								<button
									disabled={savedIds.has(recipe.recipeId!)}
									onClick={() => handleSave(recipe.recipeId!)}
								>
									{savedIds.has(recipe.recipeId!)
										? "Saved ✓"
										: "Save"}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
