import { useState, useEffect } from "react";
import { Recipe, Step, Ingredient } from "./type";
import { useNavigate } from "react-router-dom";

type RecipeViewProps = {
	recipe: Recipe | null;
	userId: number | null;
	userRole: string;
};

export default function RecipeView({
	recipe,
	userId,
	userRole,
}: RecipeViewProps) {
	const [steps, setSteps] = useState<Step[]>([]);
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [saved, setSaved] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (!recipe?.recipeId) return;

		fetchSteps();
		fetchIngredients();
	}, [recipe]);

	const fetchSteps = async () => {
		try {
			const response = await fetch(
				`http://localhost:3000/recipes/${recipe?.recipeId}/steps`,
				{
					credentials: "include",
				},
			);

			if (!response.ok) return;

			const data: { payload: { steps: Step[] } } = await response.json();

			setSteps(data.payload.steps);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchIngredients = async () => {
		try {
			const response = await fetch(
				`http://localhost:3000/recipes/${recipe?.recipeId}/ingredients`,
				{
					credentials: "include",
				},
			);

			if (!response.ok) return;

			const data: { payload: { ingredients: Ingredient[] } } =
				await response.json();

			setIngredients(data.payload.ingredients);
		} catch (error) {
			console.log(error);
		}
	};

	const handleSave = async () => {
		if (!userId || !recipe?.recipeId) return;

		try {
			const response = await fetch(
				`http://localhost:3000/users/${userId}/saved`,
				{
					method: "POST",
					mode: "cors",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						recipeId: recipe.recipeId,
					}),
				},
			);

			if (!response.ok) {
				alert("Could not save recipe. It may already be saved.");
				return;
			}

			setSaved(true);
			alert("Recipe saved!");
		} catch (error) {
			console.log(error);
		}
	};

	const handleDelete = async () => {
		if (!userId || !recipe?.recipeId) return;

		try {
			const response = await fetch(
				`http://localhost:3000/recipes/${recipe.recipeId}`,
				{
					method: "DELETE",
					mode: "cors",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!response.ok) {
				alert("Could not delete recipe.");
				return;
			}

			alert("Recipe has been deleted.");
			navigate("/all-recipes");
		} catch (error) {
			console.log(error);
		}
	};

	const handleEdit = async () => {
		// TODO
	};

	return (
		<div>
			<h2
				style={{
					textAlign: "center",
					marginTop: 45,
					marginBottom: 100,
					fontFamily: "ui-rounded",
					fontSize: 50,
				}}
			>
				{recipe?.recipeName}
			</h2>

			<div
				style={{
					display: "flex",
					gap: "75px",
					width: "100%",
				}}
			>
				<div>
					<img
						src={recipe?.pictureLink}
						onError={(e) => {
							e.currentTarget.src =
								"https://png.pngtree.com/png-clipart/20230917/original/pngtree-icon-of-unavailable-image-illustration-in-vector-with-flat-design-vector-png-image_12324700.png";
						}}
						style={{
							width: "300px",
							height: "300px",
						}}
					></img>

					<p style={{ marginTop: 16 }}>
						Created By: {recipe?.username}
					</p>
				</div>

				<div>
					<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
						PREPARATION TIME
					</p>
					<p>{recipe?.preparationTime} mins</p>
				</div>

				<div>
					<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
						SERVINGS
					</p>
					<p>{recipe?.servings}</p>
				</div>

				<div>
					<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
						CATEGORY
					</p>
					<p>{recipe?.category}</p>
				</div>
			</div>

			<div
				style={{
					marginTop: 50,
					marginLeft: 20,
				}}
			>
				<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
					INGREDIENTS
				</p>
				{ingredients.length === 0 ? (
					<p>No ingredients listed.</p>
				) : (
					<ul>
						{ingredients.map((ing) => (
							<li key={ing.ingredientId}>{ing.name}</li>
						))}
					</ul>
				)}
			</div>

			<div
				style={{
					marginTop: 70,
					marginLeft: 20,
				}}
			>
				<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
					PREPARATION STEPS
				</p>
				{steps.length === 0 ? (
					<p>No steps listed.</p>
				) : (
					<ol>
						{steps.map((step) => (
							<li key={step.stepId}>{step.description}</li>
						))}
					</ol>
				)}
			</div>

			<div style={{ textAlign: "right" }}>
				<button
					className={
						userRole == "admin" || userId == recipe?.userId
							? ""
							: "hide"
					}
					style={{ marginRight: 10 }}
					onClick={handleDelete}
				>
					Delete
				</button>

				<button
					className={userId == recipe?.userId ? "" : "hide"}
					style={{ marginRight: 10 }}
					onClick={handleEdit}
				>
					Edit
				</button>

				<button onClick={handleSave} disabled={saved}>
					{saved ? "Saved ✓" : "Save Recipe"}
				</button>
			</div>
		</div>
	);
}
