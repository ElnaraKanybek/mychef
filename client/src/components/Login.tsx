import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type LogInProps = {
	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	setFirstName: React.Dispatch<React.SetStateAction<string>>;
	setUserId: React.Dispatch<React.SetStateAction<number | null>>;
	setUserRole: React.Dispatch<React.SetStateAction<string>>;
};

export default function LogIn({
	setLoggedIn,
	setFirstName,
	setUserId,
	setUserRole,
}: LogInProps) {
	const navigate = useNavigate();
	const [inputField, setInputField] = useState({
		username: "",
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
			if (!inputField.username.trim() || !inputField.password.trim()) {
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
					password: inputField.password,
				}),
			};

			const response = await fetch(
				"http://localhost:3000/login",
				requestOption,
			);
			const data: {
				payload: {
					user: { userId: number; firstName: string; role: string };
				};
			} = await response.json();

			if (!response.ok) {
				alert("Invalid username or password.");
				return;
			}
			setLoggedIn(true);
			setFirstName(data.payload.user.firstName); // ← now uses real firstName from API
			setUserId(data.payload.user.userId);
			setUserRole(data.payload.user.role);
			navigate(`/home`);
		} catch {
			throw new Error("Something went wrong");
		}
	};

	return (
		<div>
			<h2 style={{ textAlign: "center", margin: 10 }}>LOG IN</h2>

			<label>Username:</label>
			<input
				name="username"
				type="text"
				value={inputField.username}
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

			<button onClick={submitHandler}>Log In</button>

			<div
				style={{
					display: "flex",
					textAlign: "center",
					width: "100%",
					margin: 10,
					gap: "10px",
				}}
			>
				<p>Not a member?</p>
				<Link to="/">Create an account</Link>
			</div>
		</div>
	);
}
