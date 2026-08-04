import User, { UserProps } from "../models/User";
import Recipe, { RecipeProps } from "../models/Recipe";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { requireAdmin } from "../auth/middleware";

/**
 * Controller for handling Todo CRUD operations.
 * Routes are registered in the `registerRoutes` method.
 * Each method should be called when a request is made to the corresponding route.
 */
export default class AdminController {
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
		router.get("/admin/users", requireAdmin(this.getAllUsers));
		router.get("/admin/recipes", requireAdmin(this.getAllRecipes));
		router.del("/admin/users/:id", requireAdmin(this.deleteUser));
		router.del("/admin/recipes/:id", requireAdmin(this.deleteRecipe));
	}

	getAllRecipes = async (req: Request, res: Response) => {
		const queryParams = req.getSearchParams();

		const sortBy = queryParams.get("sortBy") ?? "recipeId";
		const orderBy = queryParams.get("orderBy") ?? "asc";
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
			recipes = await Recipe.readAll(this.sql, sortBy, orderBy);
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

	getAllUsers = async (req: Request, res: Response) => {
		let users: User[] = [];

		try {
			users = await User.readAll(this.sql);
		} catch (error) {
			const message = `Error while getting all users list: ${error}`;
			console.error(message);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message,
			});
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "All users list retrieved",
			payload: {
				users: users.map((user) => user.props),
			},
		});
	};

	deleteUser = async (req: Request, res: Response) => {
		const id = req.getId();

		if (isNaN(id)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
			});
			return;
		}

		try {
			const user = await User.read(this.sql, id);
			if (!user) {
				await res.send({
					statusCode: StatusCode.NotFound,
					message: "User not found",
				});
				return;
			}

			if (await user.delete()) {
				await res.send({
					statusCode: StatusCode.OK,
					message: "User deleted successfully!",
					payload: { recipe: user.props },
				});
			} else {
				await res.send({
					statusCode: StatusCode.InternalServerError,
					message: "Error while deleting user.",
				});
			}
		} catch (error) {
			console.error("Error while deleting user:", error);
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
			sortBy === "recipeId" ||
			sortBy === "recipeName" ||
			sortBy === "preparationTime"
		);
	};

	isOrderByValid = (orderBy: string | undefined): boolean => {
		return orderBy === "asc" || orderBy === "desc";
	};
}
