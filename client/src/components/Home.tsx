import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type HomeProps = {
	loggedIn: boolean;
	username: string;
	userRole: string;
};

export default function Home({ loggedIn, username, userRole }: HomeProps) {
	if (loggedIn == false) {
		return (
			<div>
				<p>You must be logged in to access this page!</p>
				<Link to="/log-in">Log in</Link>
			</div>
		);
	}

	const navigate = useNavigate();

	function handleBtnClick() {
		navigate("/recipes/search");
	}

	return (
		<div>
			<h2
				style={{
					marginTop: 45,
					marginLeft: 10,
					marginBottom: 20,
					fontFamily: "fangsong",
				}}
			>
				Hello, {username}!
			</h2>

			<button className={userRole == "admin" ? "" : "hide"}>
				See All Users
			</button>

			<div
				style={{
					marginTop: 60,
					marginLeft: 20,
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<div>
					<p style={{ fontFamily: "cursive" }}>
						Trending recipes this week:
					</p>

					<ol style={{ border: "2px solid white", padding: "20px" }}>
						<p>1. Recipe 1</p>
						<p>2. Recipe 2</p>
						<p>3. Recipe 3</p>
					</ol>
				</div>

				<div
					style={{
						backgroundImage:
							'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),url("https://t4.ftcdn.net/jpg/01/04/68/53/360_F_104685353_lFpGYikJSxndIMs19Wx7anM9qce0XDP8.jpg")',
						backgroundSize: "cover",
						backgroundPosition: "center",

						width: "350px",
						height: "220px",
						alignContent: "center",
						marginRight: 30,
					}}
				>
					<button
						onClick={handleBtnClick}
						style={{
							marginLeft: 80,
							marginTop: 45,
							backgroundColor: "darkblue",
						}}
					>
						Browse Recipes
					</button>
				</div>
			</div>
		</div>
	);
}
