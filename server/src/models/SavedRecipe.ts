import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";
import { RecipeProps } from "./Recipe";

export interface SavedRecipeProps {
	savedId?: number;
	userId: number;
	recipeId: number;
	savedAt?: Date;
}

// This is used when fetching saved recipes with joined recipe details
export interface SavedRecipeWithDetails extends SavedRecipeProps {
	recipeName: string;
	category: string;
	preparationTime: number;
	servings: number;
	pictureLink?: string;
	username?: string;
}

export default class SavedRecipe {
	constructor(
		private sql: postgres.Sql<any>,
		public props: SavedRecipeProps,
	) {}

	static async create(
		sql: postgres.Sql<any>,
		props: SavedRecipeProps,
	): Promise<SavedRecipe> {
		const connection = await sql.reserve();

		const [row] = await connection<SavedRecipeProps[]>`
			INSERT INTO saved_recipes
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();

		return new SavedRecipe(sql, convertToCase(snakeToCamel, row) as SavedRecipeProps);
	}

	// Check if a user has already saved a specific recipe
	static async findByUserAndRecipe(
		sql: postgres.Sql<any>,
		userId: number,
		recipeId: number,
	): Promise<SavedRecipe | null> {
		const connection = await sql.reserve();

		const [row] = await connection<SavedRecipeProps[]>`
			SELECT * FROM saved_recipes
			WHERE user_id = ${userId} AND recipe_id = ${recipeId}
		`;

		await connection.release();

		if (!row) return null;

		return new SavedRecipe(sql, convertToCase(snakeToCamel, row) as SavedRecipeProps);
	}

	// Get all saved recipes for a user, joined with recipe details
	static async readAllForUser(
		sql: postgres.Sql<any>,
		userId: number,
	): Promise<SavedRecipeWithDetails[]> {
		const connection = await sql.reserve();

		const rows = await connection<SavedRecipeWithDetails[]>`
			SELECT
				sr.saved_id,
				sr.user_id,
				sr.recipe_id,
				sr.saved_at,
				r.recipe_name,
				r.category,
				r.preparation_time,
				r.servings,
				r.picture_link,
				u.username
			FROM saved_recipes sr
			JOIN recipes r ON sr.recipe_id = r.recipe_id
			JOIN users u ON r.user_id = u.user_id
			WHERE sr.user_id = ${userId}
			ORDER BY sr.saved_at DESC
		`;

		await connection.release();

		return rows.map((row) => convertToCase(snakeToCamel, row) as SavedRecipeWithDetails);
	}

	async delete(): Promise<boolean> {
		const connection = await this.sql.reserve();

		const result = await connection`
			DELETE FROM saved_recipes
			WHERE user_id = ${this.props.userId} AND recipe_id = ${this.props.recipeId}
		`;

		await connection.release();

		return result.count === 1;
	}
}