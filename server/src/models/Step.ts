import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";

export interface StepProps {
	stepId?: number;
	recipeId: number;
	stepNumber: number;
	description: string;
}

export default class Step {
	constructor(
		private sql: postgres.Sql<any>,
		public props: StepProps,
	) {}

	static async create(
		sql: postgres.Sql<any>,
		props: StepProps,
	): Promise<Step> {
		const connection = await sql.reserve();

		const [row] = await connection<StepProps[]>`
			INSERT INTO steps
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();

		return new Step(sql, convertToCase(snakeToCamel, row) as StepProps);
	}

	static async read(sql: postgres.Sql<any>, stepId: number): Promise<Step | null> {
		const connection = await sql.reserve();

		const [row] = await connection<StepProps[]>`
			SELECT * FROM steps WHERE step_id = ${stepId}
		`;

		await connection.release();

		if (!row) return null;

		return new Step(sql, convertToCase(snakeToCamel, row) as StepProps);
	}

	// Get all steps for a given recipe, ordered by step_number
	static async readAllForRecipe(
		sql: postgres.Sql<any>,
		recipeId: number,
	): Promise<Step[]> {
		const connection = await sql.reserve();

		const rows = await connection<StepProps[]>`
			SELECT * FROM steps
			WHERE recipe_id = ${recipeId}
			ORDER BY step_number ASC
		`;

		await connection.release();

		return rows.map(
			(row) => new Step(sql, convertToCase(snakeToCamel, row) as StepProps),
		);
	}

	async update(updateProps: Partial<StepProps>) {
		const connection = await this.sql.reserve();

		const [row] = await connection<StepProps[]>`
			UPDATE steps
			SET ${this.sql(convertToCase(camelToSnake, updateProps))}
			WHERE step_id = ${this.props.stepId}
			RETURNING *
		`;

		await connection.release();

		this.props = { ...this.props, ...convertToCase(snakeToCamel, row) as StepProps };
	}

	async delete(): Promise<boolean> {
		const connection = await this.sql.reserve();

		const result = await connection`
			DELETE FROM steps WHERE step_id = ${this.props.stepId}
		`;

		await connection.release();

		return result.count === 1;
	}
}