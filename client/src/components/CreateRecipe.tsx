import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Recipe } from "./type";

type CreateRecipeProps = {
	loggedIn: boolean;
	userId: number | null;
};

export default function CreateRecipe({ loggedIn, userId }: CreateRecipeProps) {
	if (loggedIn == false) {
		return (
			<div>
				<p>You must be logged in to access this page!</p>
				<Link to="/log-in">Log in</Link>
			</div>
		);
	}

	const navigate = useNavigate();

	const [inputField, setInputField] = useState({
		recipe_name: "",
		picture_link: "",
		preparation_time: "",
		servings: "",
		category: "",
	});

	// Ingredients state: list of strings
	const [ingredients, setIngredients] = useState<string[]>([""]);

	// Steps state: list of strings (descriptions in order)
	const [steps, setSteps] = useState<string[]>([""]);

	const inputsHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const { name, value } = event.target;
		setInputField((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	// ---- Ingredient helpers ----
	const handleIngredientChange = (index: number, value: string) => {
		const updated = [...ingredients];
		updated[index] = value;
		setIngredients(updated);
	};

	const addIngredient = () => {
		setIngredients([...ingredients, ""]);
	};

	const removeIngredient = (index: number) => {
		setIngredients(ingredients.filter((_, i) => i !== index));
	};

	// ---- Step helpers ----
	const handleStepChange = (index: number, value: string) => {
		const updated = [...steps];
		updated[index] = value;
		setSteps(updated);
	};

	const addStep = () => {
		setSteps([...steps, ""]);
	};

	const removeStep = (index: number) => {
		setSteps(steps.filter((_, i) => i !== index));
	};

	// ---- Submit ----
	const submitHandler = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		try {
			if (
				!inputField.recipe_name.trim() ||
				!inputField.preparation_time.trim() ||
				!inputField.servings.trim() ||
				!inputField.category.trim()
			) {
				alert("Please fill out all required fields.");
				return;
			}

			const requestOption: RequestInit = {
				method: "POST",
				mode: "cors",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: userId,
					recipeName: inputField.recipe_name,
					pictureLink: inputField.picture_link,
					preparationTime: inputField.preparation_time,
					servings: inputField.servings,
					category: inputField.category,
				}),
			};

			const response = await fetch(
				`http://localhost:3000/recipes`,
				requestOption,
			);

			const data: { payload: { recipe: Recipe } } = await response.json();

			if (!response.ok) {
				alert("Failed to create recipe.");
				return;
			}

			const newRecipeId = data.payload.recipe.recipeId!;

			// Add ingredients
			const validIngredients = ingredients.filter((i) => i.trim());
			for (const name of validIngredients) {
				await fetch(
					`http://localhost:3000/recipes/${newRecipeId}/ingredients`,
					{
						method: "POST",
						mode: "cors",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name }),
					},
				);
			}

			// Add steps
			const validSteps = steps.filter((s) => s.trim());
			for (let i = 0; i < validSteps.length; i++) {
				await fetch(
					`http://localhost:3000/recipes/${newRecipeId}/steps`,
					{
						method: "POST",
						mode: "cors",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							stepNumber: i + 1,
							description: validSteps[i],
						}),
					},
				);
			}

			alert(`Recipe '${inputField.recipe_name}' successfully created.`);
			navigate(`/recipes/id-search/${newRecipeId}`);
		} catch {
			throw new Error("Something went wrong");
		}
	};

	return (
		<div>
			<h2 style={{ textAlign: "center" }}>CREATE RECIPE</h2>

			<table>
				<tbody>
					<tr>
						<td className="label">Recipe Name</td>
						<td>
							<input
								name="recipe_name"
								type="text"
								value={inputField.recipe_name}
								onChange={inputsHandler}
								required
							/>
						</td>
					</tr>
					<tr>
						<td className="label">Picture Link (Optional)</td>
						<td>
							<input
								name="picture_link"
								type="text"
								value={inputField.picture_link}
								onChange={inputsHandler}
							/>
						</td>
					</tr>
					<tr>
						<td className="label">Preparation Time (mins)</td>
						<td>
							<input
								name="preparation_time"
								type="text"
								value={inputField.preparation_time}
								onChange={inputsHandler}
								required
							/>
						</td>
					</tr>
					<tr>
						<td className="label"># Servings</td>
						<td>
							<input
								name="servings"
								type="text"
								value={inputField.servings}
								onChange={inputsHandler}
								required
							/>
						</td>
					</tr>
					<tr>
						<td className="label">Category</td>
						<td>
							<input
								name="category"
								type="text"
								value={inputField.category}
								onChange={inputsHandler}
								required
							/>
						</td>
					</tr>
				</tbody>
			</table>

			{/* Ingredients */}
			<div style={{ marginTop: "30px" }}>
				<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
					INGREDIENTS
				</p>
				{ingredients.map((ing, index) => (
					<div
						key={index}
						style={{
							display: "flex",
							gap: "10px",
							marginBottom: "6px",
						}}
					>
						<input
							type="text"
							placeholder={`Ingredient ${index + 1}`}
							value={ing}
							onChange={(e) =>
								handleIngredientChange(index, e.target.value)
							}
						/>
						<button
							onClick={() => removeIngredient(index)}
							disabled={ingredients.length === 1}
						>
							Remove
						</button>
					</div>
				))}
				<button onClick={addIngredient}>+ Add Ingredient</button>
			</div>

			{/* Steps */}
			<div style={{ marginTop: "30px" }}>
				<p style={{ fontWeight: "bold", fontFamily: "cursive" }}>
					PREPARATION STEPS
				</p>
				{steps.map((step, index) => (
					<div
						key={index}
						style={{
							display: "flex",
							gap: "10px",
							marginBottom: "6px",
						}}
					>
						<span style={{ alignSelf: "center", minWidth: "20px" }}>
							{index + 1}.
						</span>
						<input
							type="text"
							placeholder={`Step ${index + 1}`}
							value={step}
							style={{ width: "400px" }}
							onChange={(e) =>
								handleStepChange(index, e.target.value)
							}
						/>
						<button
							onClick={() => removeStep(index)}
							disabled={steps.length === 1}
						>
							Remove
						</button>
					</div>
				))}
				<button onClick={addStep}>+ Add Step</button>
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					marginTop: "30px",
				}}
			>
				<button onClick={submitHandler}>Create</button>
			</div>
		</div>
	);
}
