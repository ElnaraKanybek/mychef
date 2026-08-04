import User, { UserProps } from "../models/User";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";

export default class UserController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		router.post("/signup", this.signup);
		router.post("/login", this.login);
		router.del("/logout", this.logout);
	}

	/**
	 * POST /signup
	 * Creates a new user account and logs them in immediately.
	 */
	signup = async (req: Request, res: Response) => {
		const { username, firstName, password } = req.body;

		if (!username || !firstName || !password) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Username, first name, and password are required.",
			});
			return;
		}

		// Check if username is already taken
		const existing = await User.readByUsername(this.sql, username);
		if (existing) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Username already taken.",
			});
			return;
		}

		let user: User | null = null;

		try {
			user = await User.create(this.sql, {
				username,
				firstName,
				password,
				role: "user",
			});
		} catch (error) {
			console.error("Error while creating user:", error);
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error while creating user.",
			});
			return;
		}

		// Log the user in right away by storing their info in the session
		req.session.set("userId", user.props.userId);
		req.session.set("username", user.props.username);
		req.session.set("firstName", user.props.firstName);
		req.session.set("role", user.props.role);
		res.setCookie(req.session.cookie);

		await res.send({
			statusCode: StatusCode.Created,
			message: "User created successfully!",
			payload: {
				user: {
					userId: user.props.userId,
					username: user.props.username,
					firstName: user.props.firstName,
					role: user.props.role,
				},
			},
		});
	};

	/**
	 * POST /login
	 * Validates credentials and creates a session.
	 */
	login = async (req: Request, res: Response) => {
		const { username, password } = req.body;

		if (!username || !password) {
			await res.send({
				statusCode: StatusCode.BadRequest,
				message: "Username and password are required.",
			});
			return;
		}

		const user = await User.readByUsername(this.sql, username);

		if (!user || user.props.password !== password) {
			await res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Invalid username or password.",
			});
			return;
		}

		// Store user info in session
		req.session.set("userId", user.props.userId);
		req.session.set("username", user.props.username);
		req.session.set("firstName", user.props.firstName);
		req.session.set("role", user.props.role);
		res.setCookie(req.session.cookie);

		await res.send({
			statusCode: StatusCode.OK,
			message: "Logged in successfully!",
			payload: {
				user: {
					userId: user.props.userId,
					username: user.props.username,
					firstName: user.props.firstName,
					role: user.props.role,
				},
			},
		});
	};

	/**
	 * DELETE /logout
	 * Destroys the current session.
	 */
	logout = async (req: Request, res: Response) => {
		req.session.destroy();
		res.setCookie(req.session.cookie);

		await res.send({
			statusCode: StatusCode.OK,
			message: "Logged out successfully!",
		});
	};
}