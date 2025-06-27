import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export const setWorkerRole = async (req: Request, res: Response) => {
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
};

export const setCustomerRole = async (req: Request, res: Response) => {
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
};

export const getUsername = async (req: Request, res: Response) => {
	const email = req.query.email as string;

	if (!email) {
		return res.status(400).json({ error: "Email query parameter is required" });
	}

	try {
		const { data, error } = await supabase.from("users").select("username").eq("email", email).single();

		if (error) {
			console.error("Error fetching username:", error.message);
			return res.status(404).json({ error: "User not found" });
		}

		return res.status(200).json({ username: data?.username || null });
	} catch (err) {
		console.error("Failed to get username:", err);
		return res.status(500).json({ error: "Server error" });
	}
};
