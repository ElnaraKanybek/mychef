import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type NavBarProps = {
	loggedIn: boolean;
	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

function NavBar({ loggedIn, setLoggedIn }: NavBarProps) {
	const navigate = useNavigate();

	function handleLogout() {
		setLoggedIn(false);
		navigate("/log-in");
	}

	return (
		<nav className="nav">
			<ul>
				<li>
					<strong
						style={{
							margin: 5,
							fontSize: 35,
							fontFamily: "cursive",
						}}
					>
						MyChef
					</strong>
				</li>
			</ul>

			<ul>
				<li>
					<Link to="/home">Home</Link>
				</li>
				<li>
					<Link to="/all-recipes">All Recipes</Link>
				</li>
				<li>
					<Link to="/saved-recipes">Saved Recipes</Link>
				</li>
				<li>
					<Link to="/create-recipe">Create Recipe</Link>
				</li>
			</ul>

			<ul>
				<button
					className={loggedIn ? "" : "hide"}
					onClick={handleLogout}
				>
					Log Out
				</button>
			</ul>
		</nav>
	);
}
export default NavBar;
