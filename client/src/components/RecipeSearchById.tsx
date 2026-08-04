import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import FetchRecipeById from "./FetchRecipeById";

type RecipeSearchByIdProps = {
	userId: number | null;
	userRole: string;
};
export default function RecipeSearchById({
	userId,
	userRole,
}: RecipeSearchByIdProps) {
	const [recipeId, setRecipeId] = useState<string>("");

	//Get ID from URL parameters (only used when we're creating a recipe):
	const { id } = useParams();

	useEffect(() => {
		setRecipeId(id ?? "");
	}, [id]);

	return (
		<div>
			{recipeId && (
				<FetchRecipeById
					recipeId={recipeId}
					userId={userId}
					userRole={userRole}
				/>
			)}
		</div>
	);
}
