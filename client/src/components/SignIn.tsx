import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

type SignInProps = {
	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	setFirstName: React.Dispatch<React.SetStateAction<string>>;
	setUserId: React.Dispatch<React.SetStateAction<number | null>>;
	setUserRole: React.Dispatch<React.SetStateAction<string>>;
};

export default function SignIn({
	setLoggedIn,
	setFirstName,
	setUserId,
	setUserRole,
}: SignInProps) {
	const navigate = useNavigate();
	const [inputField, setInputField] = useState({
		username: "",
		first_name: "",
		password: "",
	});

	const inputsHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault(); // prevent page reload

		const { name, value } = event.target;

		// Update the corresponding input field in state
		setInputField((prevState) => ({
			// prevState is the previous state before updating.
			// ...prevState ensures we keep the existing values in inputField instead of replacing everything.
			...prevState, // Keeps existing values in inputField
			[name]: value, // Updates only the changed field
		}));
	};

	const submitHandler = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		try {
			//Validating that the title has been provided (it is a required field)
			if (
				!inputField.username.trim() ||
				!inputField.first_name.trim() ||
				!inputField.password.trim()
			) {
				alert("Please fill out all the fields.");
				return;
			}

			const requestOption: RequestInit = {
				method: "POST",
				mode: "cors",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: inputField.username,
					firstName: inputField.first_name,
					password: inputField.password,
				}),
			};

			const response = await fetch(
				"http://localhost:3000/signup",
				requestOption,
			);
			const data: {
				payload: {
					user: { userId: number; firstName: string; role: string };
				};
			} = await response.json();

			if (!response.ok) {
				alert(
					"Failed to create account. Username may already be taken.",
				);
				return;
			}

			setLoggedIn(true);
			setFirstName(inputField.first_name);
			setUserId(data.payload.user.userId);
			setUserRole(data.payload.user.role);
			navigate(`/home`);
		} catch {
			throw new Error("Something went wrong");
		}
	};

	return (
		<div>
			<h2 style={{ textAlign: "center", margin: 10 }}>SIGN IN</h2>
			<div>
				<label>Username:</label>
				<input
					name="username"
					type="text"
					value={inputField.username}
					onChange={inputsHandler}
					required
				/>
			</div>

			<label>First Name:</label>
			<input
				name="first_name"
				type="text"
				value={inputField.first_name}
				onChange={inputsHandler}
				required
			/>

			<label>Password:</label>
			<input
				name="password"
				type="password"
				value={inputField.password}
				onChange={inputsHandler}
				required
			/>

			<button onClick={submitHandler}>Sign Up</button>

			<div
				style={{
					display: "flex",
					width: "100%",
					margin: 10,
					gap: "10px",
				}}
			>
				<p>Already have an account?</p>
				<Link to="/log-in"> Log In</Link>
			</div>
		</div>
	);
}
