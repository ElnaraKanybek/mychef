import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";

export interface UserProps {
	userId?: number;
	username: string;
	password: string;
	firstName: string;
	role: "user" | "admin";
}

export default class User {
	constructor(
		private sql: postgres.Sql<any>,
		public props: UserProps,
	) {}

	static async create(
		sql: postgres.Sql<any>,
		props: UserProps,
	): Promise<User> {
		const connection = await sql.reserve();

		const [row] = await connection<UserProps[]>`
            INSERT INTO users
                ${sql(convertToCase(camelToSnake, props))}
            RETURNING *
        `;

		await connection.release();

		return new User(sql, convertToCase(snakeToCamel, row) as UserProps);
	}

	static async read(sql: postgres.Sql<any>, id: number) {
		const connection = await sql.reserve();

		const [row] = await connection<UserProps[]>`
                SELECT * FROM
                users WHERE user_id = ${id}
            `;

		await connection.release();

		if (!row) {
			return null;
		}

		return new User(sql, convertToCase(snakeToCamel, row) as UserProps);
	}

	static async readAll(sql: postgres.Sql<any>): Promise<User[]> {
		const connection = await sql.reserve();

		const rows = await connection<UserProps[]>`
            SELECT *
            FROM users
        `;

		await connection.release();

		return rows.map(
			(row) =>
				new User(sql, convertToCase(snakeToCamel, row) as UserProps),
		);
	}

	async delete() {
		const connection = await this.sql.reserve();

		const result = await connection`
            DELETE FROM users
            WHERE user_id = ${this.props.userId}
        `;

		await connection.release();

		return result.count === 1;
	}

	static async readByUsername(
		sql: postgres.Sql<any>,
		username: string,
	): Promise<User | null> {
		const connection = await sql.reserve();

		const [row] = await connection<UserProps[]>`
			SELECT * FROM users WHERE username = ${username}
		`;

		await connection.release();

		if (!row) return null;

		return new User(sql, convertToCase(snakeToCamel, row) as UserProps);
	}
}
