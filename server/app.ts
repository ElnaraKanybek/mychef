import postgres from "postgres";
import Server from "./src/Server";
import { HttpResponse, makeHttpRequest } from "./tests/client";

/**
 * Only use this if your tests are running slowly
 * and you need a way to test your server manually.
 */

const sql = postgres({
	database: "TodoDB",
});

const server = new Server({
	host: "localhost",
	port: 3000,
	sql,
});

const main = async () => {
	await server.start();

	// const { statusCode, body }: HttpResponse = await makeHttpRequest(
	// 	"GET",
	// 	"/todos?status=complete", //&sortBy=title",
	// );

	//test passed.
	// const { statusCode, body }: HttpResponse = await makeHttpRequest(
	// 	"GET",
	// 	"/todos/1",
	// );

	//test passed
	// const { statusCode, body }: HttpResponse = await makeHttpRequest(
	// 	"POST",
	// 	"/todos",
	// 	{
	// 		title: "My new task",
	// 		description: "Make exercise",
	// 		status: "incomplete",
	// 		dueAt: new Date(new Date().setDate(new Date().getDate() + 7)),
	// 	},
	// );

	// test passed.
	// const { statusCode, body }: HttpResponse = await makeHttpRequest(
	// 	"PUT",
	// 	"/todos/1",
	// 	{ title: "mongo a Game" },
	// );

	//test passed
	// const { statusCode, body }: HttpResponse = await makeHttpRequest(
	// 	"PUT",
	// 	"/todos/1/complete",
	// );

	//test passed
	// const { statusCode, body }: HttpResponse = await makeHttpRequest(
	// 	"DELETE",
	// 	"/todos/1/complete",
	// );

	//console.log(statusCode, body);

	//await sql.end();
	//await server.stop();
};

main();
