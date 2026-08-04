import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";

export interface IngredientProps {
	ingredientId?: number;
	recipeId: number;
	name: string;
}

export default class Ingredient {
	constructor(
		private sql: postgres.Sql<any>,
		public props: IngredientProps,
	) {}

	static async create(
		sql: postgres.Sql<any>,
		props: IngredientProps,
	): Promise<Ingredient> {
		const connection = await sql.reserve();

		const [row] = await connection<IngredientProps[]>`
			INSERT INTO ingredients
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();

		return new Ingredient(sql, convertToCase(snakeToCamel, row) as IngredientProps);
	}

	static async read(
		sql: postgres.Sql<any>,
		ingredientId: number,
	): Promise<Ingredient | null> {
		const connection = await sql.reserve();

		const [row] = await connection<IngredientProps[]>`
			SELECT * FROM ingredients WHERE ingredient_id = ${ingredientId}
		`;

		await connection.release();

		if (!row) return null;

		return new Ingredient(sql, convertToCase(snakeToCamel, row) as IngredientProps);
	}

	// Get all ingredients for a given recipe
	static async readAllForRecipe(
		sql: postgres.Sql<any>,
		recipeId: number,
	): Promise<Ingredient[]> {
		const connection = await sql.reserve();

		const rows = await connection<IngredientProps[]>`
			SELECT * FROM ingredients
			WHERE recipe_id = ${recipeId}
			ORDER BY ingredient_id ASC
		`;

		await connection.release();

		return rows.map(
			(row) =>
				new Ingredient(sql, convertToCase(snakeToCamel, row) as IngredientProps),
		);
	}

	async delete(): Promise<boolean> {
		const connection = await this.sql.reserve();

		const result = await connection`
			DELETE FROM ingredients WHERE ingredient_id = ${this.props.ingredientId}
		`;

		await connection.release();

		return result.count === 1;
	}
}