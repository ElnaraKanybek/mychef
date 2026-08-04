import Ingredient, { IngredientProps } from "../models/Ingredient";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { requireAuth } from "../auth/middleware";

export default class IngredientController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		router.get(
			"/recipes/:id/ingredients",
			requireAuth(this.getIngredientsByRecipeId),
		);
		router.post(
			"/recipes/:id/ingredients",
			requireAuth(this.addIngredient),
		);
		router.del(
			"/recipes/:id/ingredients/:ingredientId",
			requireAuth(this.deleteIngredient),
		);
	}

	getIngredientsByRecipeId = async (req: Request, res: Response) => {
		const recipeId = req.getId();

		if (isNaN(recipeId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid recipe ID.",
			});
			return;
		}

		try {
			const ingredients = await Ingredient.readAllForRecipe(
				this.sql,
				recipeId,
			);
			await res.send({
				statusCode: StatusCode.OK,
				message: "Ingredients retrieved successfully!",
				payload: { ingredients: ingredients.map((ing) => ing.props) },
			});
		} catch (error) {
			console.error("Error while getting ingredients:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while getting ingredients.",
			});
		}
	};
	/**
	 * POST /recipes/:id/ingredients
	 * Adds a new ingredient to a recipe.
	 */
	addIngredient = async (req: Request, res: Response) => {
		const recipeId = req.getId();

		if (isNaN(recipeId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid recipe ID.",
			});
			return;
		}

		const { name } = req.body;

		if (!name) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Ingredient name is required.",
			});
			return;
		}

		let ingredient: Ingredient | null = null;

		try {
			ingredient = await Ingredient.create(this.sql, {
				recipeId,
				name,
			});
		} catch (error) {
			console.error("Error while adding ingredient:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while adding ingredient.",
			});
			return;
		}

		await res.send({
			statusCode: StatusCode.Created,
			message: "Ingredient added successfully!",
			payload: { ingredient: ingredient.props },
		});
	};

	/**
	 * DELETE /recipes/:id/ingredients/:ingredientId
	 * Deletes an ingredient from a recipe.
	 */
	deleteIngredient = async (req: Request, res: Response) => {
		const ingredientId = req.getSubTodoId();

		if (isNaN(ingredientId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ingredient ID.",
			});
			return;
		}

		const ingredient = await Ingredient.read(this.sql, ingredientId);

		if (!ingredient) {
			await res.send({
				statusCode: StatusCode.NotFound,
				message: "Ingredient not found.",
			});
			return;
		}

		try {
			await ingredient.delete();
			await res.send({
				statusCode: StatusCode.OK,
				message: "Ingredient deleted successfully!",
				payload: { ingredient: ingredient.props },
			});
		} catch (error) {
			console.error("Error while deleting ingredient:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while deleting ingredient.",
			});
		}
	};
}
