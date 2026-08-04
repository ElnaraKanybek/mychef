export default function Footer() {
	return (
		<footer
			style={{
				marginTop: "50px",
				padding: "20px",
				textAlign: "center",
				borderTop: "1px solid #ddd",
				color: "#666",
				fontSize: "14px",
			}}
		>
			<p>
				&copy; {new Date().getFullYear()} MyChef - Your Personal Recipe
				Collection
			</p>
			<p>Share, discover, and save amazing recipes!</p>
		</footer>
	);
}
