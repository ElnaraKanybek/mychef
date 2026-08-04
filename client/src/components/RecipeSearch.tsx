import React, { useEffect, useState } from "react";

import FetchRecipesByName from "./FetchRecipesByName";

type RecipeSearchProps = {
	userId: number | null;
};
export default function RecipeSearch({ userId }: RecipeSearchProps) {
	const [recipeName, setRecipeName] = useState<string>("");

	const inputsHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		//Setting the input field:
		setRecipeName(e.target.value);
	};

	return (
		<div style={{ textAlign: "center" }}>
			<h2 style={{ margin: 35 }}>SEARCH RECIPES</h2>
			<input
				type="text"
				name="recipe_name"
				placeholder="Enter a recipe name (ex: 'Homemade cookies')"
				value={recipeName}
				onChange={inputsHandler}
			/>
			<br />

			{recipeName && (
				<FetchRecipesByName recipeName={recipeName} userId={userId} />
			)}
		</div>
	);
}
