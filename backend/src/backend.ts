import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticate } from "./middlewares/authenticate";
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

		const { data: userRow, error: roleError } = await supabase.from("users").select("user_role, username").eq("uid", user.id).single();

		if (roleError) {
			return res.status(500).json({ error: roleError.message });
		}

		return res.status(200).json({
			user: {
				id: user.id,
				email: user.email,
				user_role: userRow.user_role,
				username: userRow.username,
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

app.post("/tasks/create", async (req: Request, res: Response) => {
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
		console.log(req.body);

		const { price, place, day, time, type, description, title, who_made_username } = req.body;
		console.log("====================================");
		console.log(req.body);
		console.log("====================================");
		if (!price || !place || !day || !time || !type) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const { error: insertError } = await supabase.from("tasks").insert([
			{
				who_made_username: who_made_username,
				who_made_id: user.id,
				price,
				place,
				day,
				time,
				type,
				description,
				title,
			},
		]);

		if (insertError) {
			console.error("Insert task error:", insertError.message);
			return res.status(500).json({ error: insertError.message });
		}

		return res.status(201).json({ message: "Task created successfully" });
	} catch (err) {
		console.error("Create task failed:", err);
		return res.status(500).json({ error: "Server error" });
	}
});

app.get("/tasks/all", async (req: Request, res: Response) => {
	try {
		const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*");

		if (tasksError) {
			console.error("Fetch tasks error:", tasksError.message);
			return res.status(500).json({ error: tasksError.message });
		}

		const taskIds = tasks.map((t: any) => t.id);
		const { data: applications, error: appsError } = await supabase.from("task_applications").select("task_id", { count: "exact", head: false });

		if (appsError) {
			console.error("Error fetching applications:", appsError.message);
			return res.status(500).json({ error: appsError.message });
		}

		const appCountMap = applications.reduce((acc: any, app: any) => {
			acc[app.task_id] = (acc[app.task_id] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const tasksWithCounts = tasks.map((task: any) => ({
			...task,
			applicationsCount: appCountMap[task.id] || 0,
		}));

		res.status(200).json({ tasks: tasksWithCounts });
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.get("/user/username", async (req: Request, res: Response) => {
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
});

app.post("/tasks/apply/:taskId", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;
	const { bid_price } = req.body;

	if (bid_price === undefined || bid_price === null) {
		return res.status(400).json({ error: "Bid price is required" });
	}

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("status").eq("id", taskId).single();

		if (taskError || !task) {
			return res.status(404).json({ error: "Task not found" });
		}

		const forbiddenStatuses = ["Canceled", "Assigned", "Done", "Completed"];

		if (forbiddenStatuses.includes(task.status)) {
			return res.status(400).json({ error: `Cannot bid on a task with status '${task.status}'` });
		}

		const { data: existing, error: existingError } = await supabase.from("task_applications").select("*").eq("task_id", taskId).eq("user_id", user.id).single();

		if (existing) {
			return res.status(400).json({ error: "You have already applied for this task" });
		}

		if (existingError && existingError.code !== "PGRST116") {
			return res.status(500).json({ error: existingError.message });
		}

		const { error } = await supabase.from("task_applications").insert({
			task_id: taskId,
			user_id: user.id,
			bid_price,
		});

		if (error) {
			console.error("Error applying for task:", error.message);
			return res.status(500).json({ error: error.message });
		}

		return res.status(200).json({ success: true, message: "Application submitted" });
	} catch (err) {
		console.error("Server error applying for task:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/tasks/user/:userId", async (req: Request, res: Response) => {
	const { userId } = req.params;

	try {
		const { data: tasks, error } = await supabase.from("tasks").select("*, users!inner(uid, username)").eq("who_made_id", userId);

		if (error) {
			console.error("Fetch user tasks error:", error.message);
			return res.status(500).json({ error: error.message });
		}

		if (!tasks || tasks.length === 0) {
			return res.status(200).json({ tasks: [] });
		}

		const taskIds = tasks.map((t: any) => t.id);
		const { data: applications, error: appsError } = await supabase.from("task_applications").select("task_id").in("task_id", taskIds);

		if (appsError) {
			console.error("Fetch applications error:", appsError.message);
			return res.status(500).json({ error: appsError.message });
		}

		const appCountMap = applications.reduce((acc: any, app: any) => {
			acc[app.task_id] = (acc[app.task_id] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const tasksWithMeta = tasks.map((task: any) => {
			const applicationsCount = appCountMap[task.id] || 0;
			const status = applicationsCount > 0 && task.status === "Open" ? "Applied" : task.status;

			return {
				...task,
				username: task.users?.username || null,
				applicationsCount,
				status,
			};
		});

		res.status(200).json({ tasks: tasksWithMeta });
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.get("/tasks/:taskId/applications", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;

	interface Application {
		user_id: string;
		bid_price: number;
		users?: { username: string } | null;
	}

	try {
		const { data, error } = await supabase.from<any, any>("task_applications").select("user_id, bid_price, users(username)").eq("task_id", taskId);

		if (error) {
			console.error("Error fetching applications:", error.message);
			return res.status(500).json({ error: error.message });
		}

		const applications = data?.map((app: Application) => ({
			user_id: app.user_id,
			bid_price: app.bid_price,
			username: app.users?.username ?? "Unknown",
		}));

		res.json(applications);
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.patch("/tasks/:taskId/assign", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;
	const { user_id } = req.body;

	if (!user_id) {
		return res.status(400).json({ error: "user_id is required" });
	}

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("who_made_id").eq("id", taskId).single();

		if (taskError || !task) {
			return res.status(404).json({ error: "Task not found" });
		}

		if (task.who_made_id !== user.id) {
			return res.status(403).json({ error: "Not authorized to assign this task" });
		}

		const { error: updateError } = await supabase.from("tasks").update({ who_took: user_id, status: "Assigned", is_open: false }).eq("id", taskId);

		if (updateError) {
			console.error("Error assigning task:", updateError.message);
			return res.status(500).json({ error: updateError.message });
		}

		res.json({ message: "Worker assigned successfully" });
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.delete("/tasks/:taskId", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("who_made_id").eq("id", taskId).single();

		if (taskError || !task) {
			return res.status(404).json({ error: "Task not found" });
		}

		if (task.who_made_id !== user.id) {
			return res.status(403).json({ error: "Not authorized to delete this task" });
		}

		const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId);

		if (deleteError) {
			console.error("Error deleting task:", deleteError.message);
			return res.status(500).json({ error: deleteError.message });
		}

		res.json({ message: "Task deleted successfully" });
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.get("/tasks/bids/:userId", authenticate, async (req: Request, res: Response) => {
	const { userId } = req.params;

	try {
		const { data, error } = await supabase
			.from("task_applications")
			.select(
				`
        task_id,
        bid_price,
        tasks (
          id,
          title,
          description,
          price,
          place,
          day,
          time,
          type,
          status,
          who_made_id
        )
      `
			)
			.eq("user_id", userId);

		if (error) {
			console.error("Error fetching bids:", error.message);
			return res.status(500).json({ error: error.message });
		}

		const bidsWithTasks = data.map((bid: any) => ({
			bid_price: bid.bid_price,
			task: bid.tasks,
		}));

		res.json(bidsWithTasks);
	} catch (err) {
		console.error("Server error fetching bids:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.patch("/tasks/:taskId/complete", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single();

		if (taskError) {
			console.error("Fetch task error:", taskError.message);
			return res.status(500).json({ error: taskError.message });
		}

		if (!task) {
			return res.status(404).json({ error: "Завдання не знайдено" });
		}

		if (task.status !== "Assigned" || task.who_took !== user.id) {
			return res.status(403).json({ error: "Ви не маєте права змінювати статус цього завдання" });
		}

		const { error: updateError } = await supabase.from("tasks").update({ status: "Completed", is_taken: true, is_open: false }).eq("id", taskId);

		if (updateError) {
			console.error("Update task error:", updateError.message);
			return res.status(500).json({ error: updateError.message });
		}

		return res.json({ success: true, message: "Завдання позначено як виконане" });
	} catch (err) {
		console.error("Server error:", err);
		return res.status(500).json({ error: "Внутрішня помилка сервера" });
	}
});

app.get("/tasks/:taskId/details", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single();

		if (taskError || !task) {
			return res.status(404).json({ error: "Завдання не знайдено" });
		}

		const { data: rawApps, error: appsError } = await supabase.from("task_applications").select("user_id, bid_price, users(username)").eq("task_id", taskId);

		if (appsError) {
			return res.status(500).json({ error: "Не вдалося отримати заявки" });
		}

		const applications = rawApps.map((app: any) => ({
			user_id: app.user_id,
			bid_price: app.bid_price,
			username: app.users?.[0]?.username ?? "Unknown",
		}));

		const hasApplied = applications.some((app: any) => app.user_id === user.id);

		const isAssignedToUser = task.who_took === user.id && task.status === "Assigned";

		return res.json({
			task,
			applications,
			meta: {
				hasApplied,
				isAssignedToUser,
			},
		});
	} catch (err) {
		console.error("Помилка сервера:", err);
		return res.status(500).json({ error: "Внутрішня помилка сервера" });
	}
});

app.patch("/tasks/:id/complete", authenticate, async (req, res) => {
	const { id } = req.params;
	const user = (req as any).user;

	try {
		const { data, error } = await supabase.from("tasks").update({ status: "Done" }).eq("id", id).eq("who_took", user.id).select();

		if (error) return res.status(500).json({ error: error.message });
		if (!data.length) return res.status(404).json({ error: "Завдання не знайдено або не ваше" });

		return res.json({ message: "Статус змінено на Done" });
	} catch (err) {
		return res.status(500).json({ error: "Помилка сервера" });
	}
});

app.patch("/tasks/:id/approve", authenticate, async (req, res) => {
	const { id } = req.params;
	const user = (req as any).user;

	try {
		const { data, error } = await supabase.from("tasks").update({ status: "Completed" }).eq("id", id).eq("who_made_id", user.id).select();

		if (error) return res.status(500).json({ error: error.message });
		if (!data.length) return res.status(404).json({ error: "Завдання не знайдено або не ваше" });

		return res.json({ message: "Завдання підтверджено як виконане" });
	} catch (err) {
		return res.status(500).json({ error: "Помилка сервера" });
	}
});

app.patch("/tasks/:id/cancel", authenticate, async (req, res) => {
	const { id } = req.params;
	const user = (req as any).user;

	try {
		const { data, error } = await supabase.from("tasks").update({ status: "Canceled" }).eq("id", id).eq("who_made_id", user.id).select();

		if (error) return res.status(500).json({ error: error.message });
		if (!data.length) return res.status(404).json({ error: "Завдання не знайдено або не ваше" });

		return res.json({ message: "Завдання скасовано" });
	} catch (err) {
		return res.status(500).json({ error: "Помилка сервера" });
	}
});

app.patch("/tasks/:taskId/reopen", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	console.log("Reopen request by user:", user);
	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("who_took, status").eq("id", taskId).single();

		console.log("Task data:", task);

		if (taskError) return res.status(404).json({ error: "Task not found" });

		if (task.who_took !== user.id) return res.status(403).json({ error: "Forbidden: not assigned to this task" });

		await supabase.from("tasks").update({ status: "Open", who_took: null }).eq("id", taskId);

		res.json({ message: "Task reopened successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.patch("/tasks/:taskId/unassign", authenticate, async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	if (user.user_role !== "customer") return res.status(403).json({ error: "Forbidden" });

	try {
		await supabase.from("tasks").update({ status: "Open", who_took: null }).eq("id", taskId);

		res.json({ message: "Assignment cancelled successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`✅ Server is running on http:/localhost:${PORT}`);
});
