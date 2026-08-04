import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";

type RouteHandler = (req: Request, res: Response) => Promise<void>;

/**
 * Ensures the user is logged in.
 * Checks that a userId exists in the session.
 *
 * router.get("/home", requireAuth(this.getHome));
 */
export const requireAuth = (handler: RouteHandler): RouteHandler => {
	return async (req: Request, res: Response) => {
		const userId = req.session.get("userId");

		if (!userId) {
			await res.send({
				statusCode: StatusCode.Unauthorized,
				message: "You must be logged in to access this resource.",
			});
			return;
		}

		await handler(req, res);
	};
};

/**
 * Ensures the logged-in user is the owner of the resource.
 * The ownerIdExtractor function receives the request and returns
 * the userId of whoever owns the resource being accessed.
 * If the session userId doesn't match, a 403 is returned.
 */
export const requireOwner = (
	handler: RouteHandler,
	ownerIdExtractor: (req: Request) => Promise<number | null>,
): RouteHandler => {
	return async (req: Request, res: Response) => {
		const sessionUserId = req.session.get("userId");

		if (!sessionUserId) {
			await res.send({
				statusCode: StatusCode.Unauthorized,
				message: "You must be logged in to access this resource.",
			});
			return;
		}

		const ownerId = await ownerIdExtractor(req);

		if (ownerId === null || sessionUserId !== ownerId) {
			await res.send({
				statusCode: StatusCode.Forbidden,
				message: "You do not have permission to perform this action.",
			});
			return;
		}

		await handler(req, res);
	};
};

/**
 * Ensures the logged-in user has the admin role.
 *
 * router.get("/admin/users", requireAdmin(this.getAllUsers));
 */
export const requireAdmin = (handler: RouteHandler): RouteHandler => {
	return async (req: Request, res: Response) => {
		const role = req.session.get("role");

		if (role !== "admin") {
			await res.send({
				statusCode: StatusCode.Forbidden,
				message: "You do not have permission to access this resource.",
			});
			return;
		}

		await handler(req, res);
	};
};
