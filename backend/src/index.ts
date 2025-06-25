import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabase";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

interface LoginBody {
	email: string;
	password: string;
}

app.post("/register", async (req: Request, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
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

		// Використовуємо upsert замість insert — вставить або оновить, якщо такий uid вже є
		const { error: upsertError } = await supabase.from("users").upsert(
			[
				{
					uid: user.id,
					email: user.email,
					user_role: "customer",
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
});
app.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
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

		// 🔍 Отримати роль користувача з таблиці users
		const { data: userRow, error: userError } = await supabase.from("users").select("user_role").eq("uid", user.id).single();
		if (userError) {
			console.error("Supabase error:", userError.message);
			return res.status(500).json({ error: "Supabase query error: " + userError.message });
		}
		if (!userRow) {
			console.error("User not found in users table for uid:", user.id);
			return res.status(404).json({ error: "User record not found" });
		}

		// Додаємо роль до user
		const fullUser = {
			...user,
			user_role: userRow.user_role,
		};

		return res.status(200).json({ message: "Login successful", user: fullUser, session: session ?? null });
	} catch (err) {
		console.error("Login failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
});
app.get("/me", async (req: Request, res: Response) => {
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
});

app.post("/set-role/worker", async (req: Request, res: Response) => {
	const { uid } = req.body;

	if (!uid) {
		return res.status(400).json({ error: "uid is required" });
	}

	try {
		const { error } = await supabase.from("users").update({ user_role: "worker" }).eq("uid", uid);

		if (error) {
			console.error("Set worker role error:", error.message);
			return res.status(400).json({ error: error.message });
		}

		return res.json({ message: "Role updated to worker" });
	} catch (err) {
		console.error("Set worker role failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
});
app.post("/set-role/customer", async (req: Request, res: Response) => {
	const { uid } = req.body;

	if (!uid) {
		return res.status(400).json({ error: "uid is required" });
	}

	try {
		const { error } = await supabase.from("users").update({ user_role: "customer" }).eq("uid", uid);
		if (error) {
			console.error("Set customer role error:", error.message);
			return res.status(400).json({ error: error.message });
		}

		return res.json({ message: "Role updated to customer" });
	} catch (err) {
		console.error("Set customer role failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
});

app.post("/logout", async (req: Request, res: Response) => {
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
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`✅ Server is running on http://localhost:${PORT}`);
});
