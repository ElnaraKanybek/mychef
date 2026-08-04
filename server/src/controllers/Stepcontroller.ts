import Step, { StepProps } from "../models/Step";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { requireAuth } from "../auth/middleware";

export default class StepController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		router.get("/recipes/:id/steps", requireAuth(this.getStepsByRecipeId));
		router.post("/recipes/:id/steps", requireAuth(this.addStep));
		router.put("/recipes/:id/steps/:stepId", requireAuth(this.updateStep));
		router.del("/recipes/:id/steps/:stepId", requireAuth(this.deleteStep));
	}

	getStepsByRecipeId = async (req: Request, res: Response) => {
		const recipeId = req.getId();

		if (isNaN(recipeId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid recipe ID.",
			});
			return;
		}

		try {
			const steps = await Step.readAllForRecipe(this.sql, recipeId);
			await res.send({
				statusCode: StatusCode.OK,
				message: "Steps retrieved successfully!",
				payload: { steps: steps.map((step) => step.props) },
			});
		} catch (error) {
			console.error("Error while getting steps:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while getting steps.",
			});
		}
	};

	/**
	 * POST /recipes/:id/steps
	 * Adds a new step to a recipe.
	 */
	addStep = async (req: Request, res: Response) => {
		const recipeId = req.getId();

		if (isNaN(recipeId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid recipe ID.",
			});
			return;
		}

		const { stepNumber, description } = req.body;

		if (!stepNumber || !description) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Step number and description are required.",
			});
			return;
		}

		let step: Step | null = null;

		try {
			step = await Step.create(this.sql, {
				recipeId,
				stepNumber,
				description,
			});
		} catch (error) {
			console.error("Error while adding step:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while adding step.",
			});
			return;
		}

		await res.send({
			statusCode: StatusCode.Created,
			message: "Step added successfully!",
			payload: { step: step.props },
		});
	};

	/**
	 * PUT /recipes/:id/steps/:stepId
	 * Updates an existing step.
	 */
	updateStep = async (req: Request, res: Response) => {
		const stepId = req.getSubTodoId(); // reusing existing URL helper: /recipes/:id/steps/:stepId

		if (isNaN(stepId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid step ID.",
			});
			return;
		}

		const step = await Step.read(this.sql, stepId);

		if (!step) {
			await res.send({
				statusCode: StatusCode.NotFound,
				message: "Step not found.",
			});
			return;
		}

		const updateProps: Partial<StepProps> = {};

		if (req.body.stepNumber) updateProps.stepNumber = req.body.stepNumber;
		if (req.body.description)
			updateProps.description = req.body.description;

		try {
			await step.update(updateProps);
		} catch (error) {
			console.error("Error while updating step:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while updating step.",
			});
			return;
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "Step updated successfully!",
			payload: { step: step.props },
		});
	};

	/**
	 * DELETE /recipes/:id/steps/:stepId
	 * Deletes a step from a recipe.
	 */
	deleteStep = async (req: Request, res: Response) => {
		const stepId = req.getSubTodoId();

		if (isNaN(stepId)) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid step ID.",
			});
			return;
		}

		const step = await Step.read(this.sql, stepId);

		if (!step) {
			await res.send({
				statusCode: StatusCode.NotFound,
				message: "Step not found.",
			});
			return;
		}

		try {
			await step.delete();
			await res.send({
				statusCode: StatusCode.OK,
				message: "Step deleted successfully!",
				payload: { step: step.props },
			});
		} catch (error) {
			console.error("Error while deleting step:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while deleting step.",
			});
		}
	};
}
