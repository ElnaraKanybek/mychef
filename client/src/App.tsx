/**
 * The `App` component serves as the main entry point of the application.
 * It sets up routing, renders navigation components, and determines which
 * page should be displayed based on the URL.
 */
import React, { useState } from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css";

import Home from "./components/Home";
import NavBar from "./components/NavBar";
import SignIn from "./components/SignIn.tsx";
import LogIn from "./components/Login.tsx";
import CreateRecipe from "./components/CreateRecipe.tsx";
import AllRecipes from "./components/AllRecipes.tsx";
import RecipeSearch from "./components/RecipeSearch.tsx";
import RecipeSearchById from "./components/RecipeSearchById.tsx";
import SavedRecipes from "./components/SavedRecipes.tsx";
import MyRecipes from "./components/MyRecipes.tsx";

//you will need to create and import required components based on your routes.
function App() {
	const [loggedIn, setLoggedIn] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [userId, setUserId] = useState<number | null>(null);
	const [userRole, setUserRole] = useState("user");

	return (
		<>
			<Router
				future={{
					v7_startTransition: true,
				}}
			>
				<div className="container">
					<NavBar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
					<article>
						<Routes>
							{/*Define application  routes for your application*/}
							<Route
								path="/"
								element={
									<SignIn
										setLoggedIn={setLoggedIn}
										setFirstName={setFirstName}
										setUserId={setUserId}
										setUserRole={setUserRole}
									/>
								}
							/>
							<Route
								path="/log-in"
								element={
									<LogIn
										setLoggedIn={setLoggedIn}
										setFirstName={setFirstName}
										setUserId={setUserId}
										setUserRole={setUserRole}
									/>
								}
							/>
							<Route
								path="/home"
								element={
									<Home
										loggedIn={loggedIn}
										username={firstName}
										userRole={userRole}
									/>
								}
							/>

							<Route
								path="/create-recipe"
								element={
									<CreateRecipe
										loggedIn={loggedIn}
										userId={userId}
									/>
								}
							/>

							<Route
								path="/all-recipes"
								element={
									<AllRecipes
										loggedIn={loggedIn}
										userId={userId}
									/>
								}
							/>

							<Route
								path="/recipes/search"
								element={<RecipeSearch userId={userId} />}
							/>

							<Route
								path="/recipes/:name"
								element={<RecipeSearch userId={userId} />}
							/>

							<Route
								path="/recipes/id-search/:id"
								element={
									<RecipeSearchById
										userId={userId}
										userRole={userRole}
									/>
								}
							/>

							<Route
								path="/saved-recipes"
								element={
									<SavedRecipes
										loggedIn={loggedIn}
										userId={userId}
									/>
								}
							/>

							<Route
								path="/my-recipes"
								element={
									<MyRecipes
										loggedIn={loggedIn}
										userId={userId}
									/>
								}
							/>
						</Routes>
					</article>
				</div>
			</Router>
		</>
	);
}

export default App;
