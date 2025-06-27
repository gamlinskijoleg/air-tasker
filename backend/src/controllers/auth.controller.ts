import { Request, Response } from "express";
import { LoginBody } from "../types";
import { supabase } from "../config/supabaseClient";

export const register = async (req: Request, res: Response) => {
	const { email, password, username } = req.body;

	if (!email || !password || !username) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.error("Register error:", error.message);
			return res.status(400).json({ error: error.message });
		}

		const user = data.user;
		const session = data.session;

		if (!user) {
			return res.status(500).json({ error: "User not created properly" });
		}

		const { error: upsertError } = await supabase.from("users").upsert(
			[
				{
					uid: user.id,
					email: user.email,
					user_role: "customer",
					username: username,
				},
			],
			{ onConflict: "uid" }
		);

		if (upsertError) {
			console.error("Error upserting into users table:", upsertError.message);
			return res.status(500).json({ error: "User registered but failed to update users table" });
		}

		return res.status(201).json({ message: "Registration successful", user, session: session ?? null });
	} catch (err) {
		console.error("Register failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Login error:", error.message);
			return res.status(401).json({ error: error.message });
		}

		const user = data.user;
		const session = data.session;

		if (!user) {
			return res.status(401).json({ error: "Invalid login credentials" });
		}

		const { data: userRow, error: userError } = await supabase.from("users").select("user_role").eq("uid", user.id).single();
		if (userError) {
			console.error("Supabase error:", userError.message);
			return res.status(500).json({ error: "Supabase query error: " + userError.message });
		}
		if (!userRow) {
			console.error("User not found in users table for uid:", user.id);
			return res.status(404).json({ error: "User record not found" });
		}

		const fullUser = {
			...user,
			user_role: userRow.user_role,
		};

		return res.status(200).json({ message: "Login successful", user: fullUser, session: session ?? null });
	} catch (err) {
		console.error("Login failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Logout error:", error.message);
			return res.status(400).json({ error: error.message });
		}

		return res.json({ message: "Logged out successfully" });
	} catch (err) {
		console.error("Logout failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
};

export const getMe = async (req: Request, res: Response) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data.user) {
			return res.status(401).json({ error: error?.message || "User not found" });
		}

		const user = data.user;

		const { data: userRow, error: roleError } = await supabase.from("users").select("user_role").eq("uid", user.id).single();

		if (roleError) {
			return res.status(500).json({ error: roleError.message });
		}

		return res.status(200).json({
			user: {
				...user,
				user_role: userRow.user_role,
			},
		});
	} catch (err) {
		console.error("Get user failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
};
