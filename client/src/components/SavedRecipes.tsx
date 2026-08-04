import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SavedRecipe } from "./type";

type SavedRecipesProps = {
	loggedIn: boolean;
	userId: number | null;
};

export default function SavedRecipes({ loggedIn, userId }: SavedRecipesProps) {
	if (loggedIn == false) {
		return (
			<div>
				<p>You must be logged in to access this page!</p>
				<Link to="/log-in">Log in</Link>
			</div>
		);
	}

	const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
	const [categoryFilter, setCategoryFilter] = useState("");
	const [sortBy, setSortBy] = useState("");
	const [sortOrder, setSortOrder] = useState("");

	const fetchSaved = async () => {
		if (!userId) return;

		try {
			const response = await fetch(
				`http://localhost:3000/users/${userId}/saved`,
				{ method: "GET", mode: "cors", credentials: "include" },
			);

			if (!response.ok) {
				throw new Error("Failed to fetch saved recipes.");
			}

			const data = await response.json();
			setSavedRecipes(data.payload.savedRecipes);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchSaved();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const handleUnsave = async (recipeId: number) => {
		if (!userId) return;

		try {
			const response = await fetch(
				`http://localhost:3000/users/${userId}/saved/${recipeId}`,
				{ method: "DELETE", mode: "cors", credentials: "include" },
			);

			if (!response.ok) {
				alert("Could not remove recipe.");
				return;
			}

			setSavedRecipes((prev) =>
				prev.filter((r) => r.recipeId !== recipeId),
			);
		} catch (error) {
			console.log(error);
		}
	};

	const categories = Array.from(
		new Set(savedRecipes.map((r) => r.category).filter(Boolean)),
	);

	let displayed = categoryFilter
		? savedRecipes.filter((r) => r.category === categoryFilter)
		: [...savedRecipes];

	if (sortBy === "recipeName") {
		displayed.sort((a, b) =>
			(a.recipeName ?? "").localeCompare(b.recipeName ?? ""),
		);
	} else if (sortBy === "savedAt") {
		displayed.sort(
			(a, b) =>
				new Date(a.savedAt ?? "").getTime() -
				new Date(b.savedAt ?? "").getTime(),
		);
	}

	if (sortOrder === "desc") displayed.reverse();

	return (
		<div>
			<h2 style={{ textAlign: "center" }}>SAVED RECIPES</h2>

			<div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
				>
					<option value="">Sort By</option>
					<option value="recipeName">Name</option>
					<option value="savedAt">Date Added</option>
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
			</div>

			{displayed.length === 0 ? (
				<p>No saved recipes yet.</p>
			) : (
				<table>
					<thead>
						<tr>
							<th>Recipe Name</th>
							<th>Category</th>
							<th>Date Added</th>
							<th>Remove</th>
						</tr>
					</thead>
					<tbody>
						{displayed.map((recipe) => (
							<tr key={recipe.savedId ?? recipe.recipeId}>
								<td>
									<Link
										to={`/recipes/id-search/${recipe.recipeId}`}
									>
										{recipe.recipeName}
									</Link>
								</td>
								<td>{recipe.category}</td>
								<td>
									{recipe.savedAt
										? new Date(
												recipe.savedAt,
											).toLocaleDateString()
										: "—"}
								</td>
								<td>
									<button
										onClick={() =>
											handleUnsave(recipe.recipeId!)
										}
									>
										Remove
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
