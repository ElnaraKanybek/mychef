import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Recipe } from "./type";

type AllRecipesProps = {
	loggedIn: boolean;
	userId: number | null;
};

export default function AllRecipes({ loggedIn, userId }: AllRecipesProps) {
	if (loggedIn == false) {
		return (
			<div>
				<p>You must be logged in to access this page!</p>
				<Link to="/log-in">Log in</Link>
			</div>
		);
	}

	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [sortBy, setSortBy] = useState("");
	const [sortOrder, setSortOrder] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

	const getAll = async () => {
		try {
			let url = `http://localhost:3000/recipes`;

			const queryParams = [];
			if (sortBy) queryParams.push(`sortBy=${sortBy}`);
			if (sortOrder) queryParams.push(`orderBy=${sortOrder}`);
			if (categoryFilter) queryParams.push(`category=${categoryFilter}`);

			if (queryParams.length > 0) {
				url += `?${queryParams.join("&")}`;
			}

			const response = await fetch(url, {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Server error:", response.status, errorText);
				return;
			}

			const data = await response.json();
			console.log("Recipes received:", data.payload.recipes.length);
			setRecipes(data.payload.recipes);
		} catch (error) {
			console.error("Fetch error:", error);
		}
	};

	useEffect(() => {
		getAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortBy, sortOrder, categoryFilter]);

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

	const categories = Array.from(
		new Set(recipes.map((r) => r.category).filter(Boolean)),
	);

	return (
		<div>
			<h2 style={{ textAlign: "center" }}>ALL RECIPES</h2>

			<div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
				>
					<option value="">Sort By</option>
					<option value="recipeName">Name</option>
					<option value="preparationTime">Preparation Time</option>
				</select>

				<select
					value={sortOrder}
					onChange={(e) => setSortOrder(e.target.value)}
				>
					<option value="">Order</option>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</select>

				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
				>
					<option value="">All Categories</option>
					{categories.map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>

				<button onClick={() => getAll()}>Apply</button>
			</div>

			<table>
				<thead>
					<tr>
						<th>Recipe Name</th>
						<th>Created by</th>
						<th>Preparation Time</th>
						<th>Category</th>
						<th>Save</th>
					</tr>
				</thead>

				<tbody>
					{recipes.map((recipe: Recipe) => (
						<tr key={recipe.recipeId}>
							<td>
								<Link
									to={`/recipes/id-search/${recipe.recipeId}`}
								>
									{recipe.recipeName}
								</Link>
							</td>
							<td>{recipe.username}</td>
							<td>{recipe.preparationTime} mins</td>
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
