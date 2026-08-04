import Recipe, { RecipeProps } from "../models/Recipe";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { requireAuth, requireOwner } from "../auth/middleware";

/**
 * Controller for handling Todo CRUD operations.
 * Routes are registered in the `registerRoutes` method.
 * Each method should be called when a request is made to the corresponding route.
 */
export default class AllRecipesController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	/**
	 * To register a route, call the corresponding method on
	 * the router instance based on the HTTP method of the route.
	 *
	 * @param router Router instance to register routes on.
	 *
	 * @example router.get("/todos", this.getTodoList);
	 */
	registerRoutes(router: Router) {
		router.get("/recipes", requireAuth(this.getAllRecipes));
		router.post("/recipes", requireAuth(this.createRecipe));
		router.get("/recipes/:id", requireAuth(this.getRecipeById));
		router.get(
			"/recipes/search-recipe/:name",
			requireAuth(this.getRecipesByName),
		);
		router.put("/recipes/:id", requireAuth(this.updateRecipe));
		router.del("/recipes/:id", requireAuth(this.deleteRecipe));
		router.get("/users/:id/recipes", requireAuth(this.getRecipesByUserId));
	}

	getAllRecipes = async (req: Request, res: Response) => {
		const queryParams = req.getSearchParams();

		const sortBy = queryParams.get("sortBy") ?? "recipeId";
		const orderBy = queryParams.get("orderBy") ?? "asc";
		const category = queryParams.get("category");

		console.log("sortBy =", sortBy);
		console.log("orderBy =", orderBy);
		console.log("category =", category);

		let recipes: Recipe[] = [];

		if (sortBy && !this.isSortByValid(sortBy)) {
			res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid sortBy parameter.",
			});
			return;
		}

		if (orderBy && !this.isOrderByValid(orderBy)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid orderBy parameter.",
			});
			return;
		}

		try {
			recipes = await Recipe.readAll(
				this.sql,
				sortBy,
				orderBy,
				category ?? undefined,
			);
		} catch (error) {
			const message = `Error while getting all recipe list: ${error}`;
			console.error(message);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message,
			});
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "All recipes list retrieved",
			payload: {
				recipes: recipes.map((recipe) => recipe.props),
			},
		});
	};

	getRecipesByName = async (req: Request, res: Response) => {
		const queryParams = req.getSearchParams();
		const sortBy = queryParams.get("sortBy") ?? "recipeId";
		const orderBy = queryParams.get("orderBy") ?? "asc";

		const name = req.getName();
		let recipes: Recipe[] = [];

		if (!name || name.trim() === "") {
			res.send({
				statusCode: StatusCode.BadRequest,
				message: "A recipe name is required.",
			});
			return;
		}

		if (sortBy && !this.isSortByValid(sortBy)) {
			res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid sortBy parameter.",
			});
			return;
		}

		if (orderBy && !this.isOrderByValid(orderBy)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid orderBy parameter.",
			});
			return;
		}

		try {
			recipes = await Recipe.search(this.sql, name, sortBy, orderBy); // ← Make sure sortBy and orderBy are passed
		} catch (error) {
			const message = `Error while getting searched recipes list: ${error}`;
			console.error(message);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message,
			});
			return;
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "Search recipes list retrieved",
			payload: {
				recipes: recipes.map((recipe) => recipe.props),
			},
		});
	};

	getRecipeById = async (req: Request, res: Response) => {
		const id = req.getId();

		if (isNaN(id)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
			});
			return;
		}

		let recipe: Recipe | null = null;

		try {
			recipe = await Recipe.read(this.sql, id);
		} catch (error) {
			const message = `Error while getting recipe: ${error}`;
			console.error(message);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message,
			});
		}

		if (recipe) {
			await res.send({
				statusCode: StatusCode.OK,
				message: "Recipe retrieved",
				payload: { recipe: recipe.props },
			});
		} else {
			await res.send({
				statusCode: StatusCode.NotFound,
				message: "Recipe not found",
			});
		}
	};

	createRecipe = async (req: Request, res: Response) => {
		let recipe: Recipe | null = null;

		const userId = req.body.userId;

		let recipeProps: RecipeProps = {
			userId: userId,
			recipeName: req.body.recipeName,
			preparationTime: req.body.preparationTime,
			servings: req.body.servings,
			category: req.body.category,
			pictureLink: req.body.pictureLink,
		};

		try {
			recipe = await Recipe.create(this.sql, recipeProps);
		} catch (error) {
			console.error("Error while creating recipe:", error);
		}

		if (!recipe) {
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while creating recipe",
			});
			return;
		}

		await res.send({
			statusCode: StatusCode.Created,
			message: "Recipe created successfully!",
			payload: { recipe: recipe.props },
		});
	};

	updateRecipe = async (req: Request, res: Response) => {
		const id = req.getId();

		if (isNaN(id)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
			});
			return;
		}

		const recipeProps: Partial<RecipeProps> = {};

		if (req.body.recipeName) {
			recipeProps.recipeName = req.body.recipeName;
		}

		if (req.body.preparationTime) {
			recipeProps.preparationTime = req.body.preparationTime;
		}

		if (req.body.servings) {
			recipeProps.servings = req.body.servings;
		}

		if (req.body.category) {
			recipeProps.category = req.body.category;
		}

		if (req.body.pictureLink) {
			recipeProps.pictureLink = req.body.pictureLink;
		}

		try {
			const recipe = await Recipe.read(this.sql, id);
			if (recipe) {
				await recipe.update(recipeProps);
				await res.send({
					statusCode: StatusCode.OK,
					message: "Recipe updated successfully!",
					payload: { recipe: recipe.props },
				});
			} else {
				await res.send({
					statusCode: StatusCode.NotFound,
					message: "Recipe not found",
				});
			}
		} catch (error) {
			console.error("Error while updating recipe:", error);
		}
	};

	deleteRecipe = async (req: Request, res: Response) => {
		const id = req.getId();

		if (isNaN(id)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
			});
			return;
		}

		try {
			const recipe = await Recipe.read(this.sql, id);
			if (!recipe) {
				await res.send({
					statusCode: StatusCode.NotFound,
					message: "Recipe not found",
				});
				return;
			}

			if (await recipe.delete()) {
				await res.send({
					statusCode: StatusCode.OK,
					message: "Recipe deleted successfully!",
					payload: { recipe: recipe.props },
				});
			} else {
				await res.send({
					statusCode: StatusCode.InternalServerError,
					message: "Error while deleting recipe.",
				});
			}
		} catch (error) {
			console.error("Error while deleting recipe:", error);
		}
	};

	//-------------------EXTRA METHODS---------------------------
	isSortByValid = (sortBy: string | undefined): boolean => {
		return (
			sortBy === "recipeName" ||
			sortBy === "preparationTime" ||
			sortBy === "recipeId"
		);
	};

	isOrderByValid = (orderBy: string | undefined): boolean => {
		return orderBy === "asc" || orderBy === "desc";
	};

	getRecipesByUserId = async (req: Request, res: Response) => {
		const userId = req.getId();

		if (isNaN(userId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid user ID",
			});
			return;
		}

		const queryParams = req.getSearchParams();
		const sortBy = queryParams.get("sortBy") ?? "recipeId";
		const orderBy = queryParams.get("orderBy") ?? "asc";

		if (sortBy && !this.isSortByValid(sortBy)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid sortBy parameter.",
			});
			return;
		}

		if (orderBy && !this.isOrderByValid(orderBy)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid orderBy parameter.",
			});
			return;
		}

		try {
			const recipes = await Recipe.readAllForUser(
				this.sql,
				userId,
				sortBy,
				orderBy,
			);
			await res.send({
				statusCode: StatusCode.OK,
				message: "User recipes retrieved",
				payload: {
					recipes: recipes.map((recipe) => recipe.props),
				},
			});
		} catch (error) {
			const message = `Error while getting user recipes: ${error}`;
			console.error(message);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message,
			});
		}
	};
}
