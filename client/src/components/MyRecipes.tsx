import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Recipe } from "./type";

type MyRecipesProps = {
	loggedIn: boolean;
	userId: number | null;
};

export default function MyRecipes({ loggedIn, userId }: MyRecipesProps) {
	const navigate = useNavigate();

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
	const [loading, setLoading] = useState(true);

	const fetchMyRecipes = async () => {
		if (!userId) return;

		try {
			const params = new URLSearchParams();
			if (sortBy) params.append("sortBy", sortBy.toLowerCase());
			if (sortOrder) params.append("orderBy", sortOrder.toLowerCase());

			const url = `http://localhost:3000/users/${userId}/recipes${
				params.toString() ? `?${params.toString()}` : ""
			}`;

			const response = await fetch(url, {
				method: "GET",
				mode: "cors",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch your recipes.");
			}

			const data = await response.json();
			setRecipes(data.payload.recipes);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMyRecipes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, sortBy, sortOrder]);

	const handleDelete = async (recipeId: number) => {
		if (
			!confirm(
				"Are you sure you want to delete this recipe? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:3000/recipes/${recipeId}`,
				{
					method: "DELETE",
					mode: "cors",
					credentials: "include",
				},
			);

			if (!response.ok) {
				alert("Failed to delete recipe.");
				return;
			}

			setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
			alert("Recipe deleted successfully!");
		} catch (error) {
			console.log(error);
			alert("Error deleting recipe.");
		}
	};

	const handleEdit = (recipeId: number) => {
		navigate(`/edit-recipe/${recipeId}`);
	};

	const categories = Array.from(
		new Set(recipes.map((r) => r.category).filter(Boolean)),
	);

	let displayed = categoryFilter
		? recipes.filter((r) => r.category === categoryFilter)
		: [...recipes];

	if (sortBy === "recipeName") {
		displayed.sort((a, b) =>
			(a.recipeName ?? "").localeCompare(b.recipeName ?? ""),
		);
	} else if (sortBy === "preparationTime") {
		displayed.sort(
			(a, b) => (a.preparationTime ?? 0) - (b.preparationTime ?? 0),
		);
	}

	if (sortOrder === "desc") displayed.reverse();

	if (loading) {
		return <p>Loading your recipes...</p>;
	}

	return (
		<div>
			<h2 style={{ textAlign: "center" }}>MY RECIPES</h2>

			<div
				style={{
					display: "flex",
					gap: "20px",
					marginBottom: "20px",
					flexWrap: "wrap",
				}}
			>
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

				<button onClick={() => fetchMyRecipes()}>Apply</button>
				<Link to="/create-recipe">
					<button style={{ backgroundColor: "green" }}>
						+ Create New Recipe
					</button>
				</Link>
			</div>

			{displayed.length === 0 ? (
				<p>
					You haven't created any recipes yet.{" "}
					<Link to="/create-recipe">Create your first recipe!</Link>
				</p>
			) : (
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr style={{ backgroundColor: "#f2f2f2" }}>
							<th style={{ padding: "12px", textAlign: "left" }}>
								Recipe Name
							</th>
							<th style={{ padding: "12px", textAlign: "left" }}>
								Category
							</th>
							<th style={{ padding: "12px", textAlign: "left" }}>
								Preparation Time
							</th>
							<th style={{ padding: "12px", textAlign: "left" }}>
								Servings
							</th>
							<th style={{ padding: "12px", textAlign: "left" }}>
								Created Date
							</th>
							<th style={{ padding: "12px", textAlign: "left" }}>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{displayed.map((recipe: Recipe) => (
							<tr
								key={recipe.recipeId}
								style={{ borderBottom: "1px solid #ddd" }}
							>
								<td style={{ padding: "12px" }}>
									<Link
										to={`/recipes/id-search/${recipe.recipeId}`}
									>
										{recipe.recipeName}
									</Link>
								</td>
								<td style={{ padding: "12px" }}>
									{recipe.category}
								</td>
								<td style={{ padding: "12px" }}>
									{recipe.preparationTime} mins
								</td>
								<td style={{ padding: "12px" }}>
									{recipe.servings}
								</td>
								<td style={{ padding: "12px" }}>
									{recipe.createdAt
										? new Date(
												recipe.createdAt,
											).toLocaleDateString()
										: "—"}
								</td>
								<td style={{ padding: "12px" }}>
									<button
										onClick={() =>
											handleEdit(recipe.recipeId!)
										}
										style={{
											marginRight: "10px",
											backgroundColor: "blue",
										}}
									>
										Edit
									</button>
									<button
										onClick={() =>
											handleDelete(recipe.recipeId!)
										}
										style={{ backgroundColor: "red" }}
									>
										Delete
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
