import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";

export interface RecipeProps {
	recipeId?: number;
	userId?: number;
	username?: string;
	recipeName: string;
	preparationTime: number;
	servings: number;
	category: string;
	pictureLink?: string;
	createdAt?: Date;
}

export default class Recipe {
	constructor(
		private sql: postgres.Sql<any>,
		public props: RecipeProps,
	) {}

	static async create(
		sql: postgres.Sql<any>,
		props: RecipeProps,
	): Promise<Recipe> {
		const connection = await sql.reserve();

		const [row] = await connection<RecipeProps[]>`
			INSERT INTO recipes
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();

		return new Recipe(sql, convertToCase(snakeToCamel, row) as RecipeProps);
	}

	static async read(sql: postgres.Sql<any>, id: number) {
		const connection = await sql.reserve();

		const [row] = await connection<RecipeProps[]>`
			SELECT 
            r.recipe_id,
            r.user_id,
            r.recipe_name,
            r.preparation_time,
            r.servings,
            r.category,
            r.picture_link,
            r.created_at,
            u.username
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.recipe_id = ${id}
    `;

		await connection.release();

		if (!row) {
			return null;
		}

		return new Recipe(sql, convertToCase(snakeToCamel, row) as RecipeProps);
	}

	static async readAll(
		sql: postgres.Sql<any>,
		sortBy?: string,
		orderBy?: string,
		category?: string,
	): Promise<Recipe[]> {
		const connection = await sql.reserve();

		const getSortBy = (sortBy: string) => {
			switch (sortBy) {
				case "recipeName":
					return sql`recipe_name`;
				case "preparationTime":
					return sql`preparation_time`;
				default:
					return sql`recipe_id`;
			}
		};

		const getOrderBy = (orderBy: string) => {
			return orderBy === "asc" ? sql`ASC` : sql`DESC`;
		};

		let query = sql`
			SELECT 
				r.recipe_id,
				r.user_id,
				r.recipe_name,
				r.preparation_time,
				r.servings,
				r.category,
				r.picture_link,
				r.created_at,
				u.username
			FROM recipes r
			LEFT JOIN users u ON r.user_id = u.user_id
		`;

		if (category) {
			query = sql`${query} WHERE r.category = ${category}`;
		}

		// Add sorting
		if (sortBy) {
			query = sql`${query} ORDER BY ${getSortBy(sortBy)}`;
			if (orderBy) {
				query = sql`${query} ${getOrderBy(orderBy)}`;
			}
		}

		const rows = await connection<any[]>`${query}`;

		await connection.release();

		return rows.map(
			(row) =>
				new Recipe(
					sql,
					convertToCase(snakeToCamel, row) as RecipeProps,
				),
		);
	}

	static async search(
		sql: postgres.Sql<any>,
		name: string,
		sortBy?: string,
		orderBy?: string,
	): Promise<Recipe[]> {
		const connection = await sql.reserve();
		const getSortBy = (sortBy: string) => {
			switch (sortBy) {
				case "recipeName":
					return sql`recipe_name`;
				case "preparationTime":
					return sql`preparation_time`;
				default:
					return sql`recipe_id`;
			}
		};

		const getOrderBy = (orderBy: string) => {
			return orderBy === "asc" ? sql`ASC` : sql`DESC`;
		};

		let query = sql`
        SELECT 
            r.recipe_id,
            r.user_id,
            r.recipe_name,
            r.preparation_time,
            r.servings,
            r.category,
            r.picture_link,
            r.created_at,
            u.username
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.recipe_name ILIKE ${`%${name}%`}
    `;

		if (sortBy) {
			query = sql`${query} ORDER BY ${getSortBy(sortBy)}`;
			if (orderBy) {
				query = sql`${query} ${getOrderBy(orderBy)}`;
			}
		}

		const rows = await connection<any[]>`${query}`;

		await connection.release();

		return rows.map(
			(row) =>
				new Recipe(
					sql,
					convertToCase(snakeToCamel, row) as RecipeProps,
				),
		);
	}

	async update(updateProps: Partial<RecipeProps>) {
		const connection = await this.sql.reserve();

		const [row] = await connection`
			UPDATE recipes
			SET
				${this.sql(convertToCase(camelToSnake, updateProps))}
			WHERE
				recipe_id = ${this.props.recipeId}
			RETURNING *
		`;

		await connection.release();

		this.props = { ...this.props, ...convertToCase(snakeToCamel, row) };
	}

	async delete() {
		const connection = await this.sql.reserve();

		const result = await connection`
			DELETE FROM recipes
			WHERE recipe_id = ${this.props.recipeId}
		`;

		await connection.release();

		return result.count === 1;
	}

	static async readAllForUser(
		sql: postgres.Sql<any>,
		userId: number,
		sortBy?: string,
		orderBy?: string,
	): Promise<Recipe[]> {
		const connection = await sql.reserve();

		const getSortBy = (sortBy: string) => {
			switch (sortBy) {
				case "recipeName":
					return sql`recipe_name`;
				case "preparationTime":
					return sql`preparation_time`;
				default:
					return sql`recipe_id`;
			}
		};

		const getOrderBy = (orderBy: string) => {
			return orderBy === "asc" ? sql`ASC` : sql`DESC`;
		};

		let query = sql`
        SELECT 
            r.recipe_id,
            r.user_id,
            r.recipe_name,
            r.preparation_time,
            r.servings,
            r.category,
            r.picture_link,
            r.created_at,
            u.username
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.user_id = ${userId}
    `;

		if (sortBy) {
			query = sql`${query} ORDER BY ${getSortBy(sortBy)}`;
			if (orderBy) {
				query = sql`${query} ${getOrderBy(orderBy)}`;
			}
		}

		const rows = await connection<any[]>`${query}`;

		await connection.release();

		return rows.map(
			(row) =>
				new Recipe(
					sql,
					convertToCase(snakeToCamel, row) as RecipeProps,
				),
		);
	}
}
