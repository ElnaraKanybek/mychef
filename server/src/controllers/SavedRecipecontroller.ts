import SavedRecipe from "../models/SavedRecipe";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { requireAuth } from "../auth/middleware";

export default class SavedRecipeController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		router.get("/users/:id/saved", requireAuth(this.getSavedRecipes));
		router.post("/users/:id/saved", requireAuth(this.saveRecipe));
		router.del(
			"/users/:id/saved/:recipeId",
			requireAuth(this.unsaveRecipe),
		);
	}

	/**
	 * GET /users/:id/saved
	 * Returns all saved recipes for a user with full recipe details.
	 */
	getSavedRecipes = async (req: Request, res: Response) => {
		const userId = req.getId();

		if (isNaN(userId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid user ID.",
			});
			return;
		}

		try {
			const savedRecipes = await SavedRecipe.readAllForUser(
				this.sql,
				userId,
			);
			await res.send({
				statusCode: StatusCode.OK,
				message: "Saved recipes retrieved.",
				payload: { savedRecipes },
			});
		} catch (error) {
			console.error("Error while getting saved recipes:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while getting saved recipes.",
			});
		}
	};

	/**
	 * POST /users/:id/saved
	 * Saves a recipe to the user's saved list.
	 */
	saveRecipe = async (req: Request, res: Response) => {
		const userId = req.getId();

		if (isNaN(userId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid user ID.",
			});
			return;
		}

		const { recipeId } = req.body;

		if (!recipeId) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Recipe ID is required.",
			});
			return;
		}

		// Prevent saving the same recipe twice
		const existing = await SavedRecipe.findByUserAndRecipe(
			this.sql,
			userId,
			recipeId,
		);

		if (existing) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Recipe already saved.",
			});
			return;
		}

		try {
			const saved = await SavedRecipe.create(this.sql, {
				userId,
				recipeId,
			});
			await res.send({
				statusCode: StatusCode.Created,
				message: "Recipe saved successfully!",
				payload: { savedRecipe: saved.props },
			});
		} catch (error) {
			console.error("Error while saving recipe:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while saving recipe.",
			});
		}
	};

	/**
	 * DELETE /users/:id/saved/:recipeId
	 * Removes a recipe from the user's saved list.
	 */
	unsaveRecipe = async (req: Request, res: Response) => {
		const userId = req.getId();
		const recipeId = req.getSubTodoId();

		if (isNaN(userId) || isNaN(recipeId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid user ID or recipe ID.",
			});
			return;
		}

		const saved = await SavedRecipe.findByUserAndRecipe(
			this.sql,
			userId,
			recipeId,
		);

		if (!saved) {
			await res.send({
				statusCode: StatusCode.NotFound,
				message: "Saved recipe not found.",
			});
			return;
		}

		try {
			await saved.delete();
			await res.send({
				statusCode: StatusCode.OK,
				message: "Recipe removed from saved list.",
			});
		} catch (error) {
			console.error("Error while unsaving recipe:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while removing saved recipe.",
			});
		}
	};
}
