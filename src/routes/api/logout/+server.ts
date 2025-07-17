import { PROCESS_ENV } from "$env/static/private";
import { redirect } from "@sveltejs/kit";

export const GET = async ({ cookies }) => {
	cookies.delete("auth_token", {
		path: "/", 
		httpOnly: true,
		secure: process.env.NODE_ENV === PROCESS_ENV, 
		sameSite: "lax"
	});

	throw redirect(302, "/"); 
};