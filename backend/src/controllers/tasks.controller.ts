import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export const createTask = async (req: Request, res: Response) => {
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

		const { price, place, day, time, type, description, title } = req.body;

		if (!price || !place || !day || !time || !type) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const { error: insertError } = await supabase.from("tasks").insert([
			{
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
};

export const getAllTasks = async (req: Request, res: Response) => {
	try {
		const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*");

		if (tasksError) {
			console.error("Fetch tasks error:", tasksError.message);
			return res.status(500).json({ error: tasksError.message });
		}

		const taskIds = tasks.map((t) => t.id);
		const { data: applications, error: appsError } = await supabase.from("task_applications").select("task_id", { count: "exact", head: false });

		if (appsError) {
			console.error("Error fetching applications:", appsError.message);
			return res.status(500).json({ error: appsError.message });
		}

		const appCountMap = applications.reduce((acc, app) => {
			acc[app.task_id] = (acc[app.task_id] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const tasksWithCounts = tasks.map((task) => ({
			...task,
			applicationsCount: appCountMap[task.id] || 0,
		}));

		res.status(200).json({ tasks: tasksWithCounts });
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
};

export const applyForTask = async (req: Request, res: Response) => {
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
			return res.status(400).json({
				error: `Cannot bid on a task with status '${task.status}'`,
			});
		}

		const { data: existing, error: existingError } = await supabase.from("task_applications").select("*").eq("task_id", taskId).eq("user_id", user.id).single();

		if (existing) {
			return res.status(400).json({
				error: "You have already applied for this task",
			});
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

		return res.status(200).json({
			success: true,
			message: "Application submitted",
		});
	} catch (err) {
		console.error("Server error applying for task:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserTasks = async (req: Request, res: Response) => {
	const { userId } = req.params;

	try {
		const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").eq("who_made_id", userId);

		if (tasksError) {
			console.error("Fetch user tasks error:", tasksError.message);
			return res.status(500).json({ error: tasksError.message });
		}

		if (!tasks || tasks.length === 0) {
			return res.status(200).json({ tasks: [] });
		}

		const taskIds = tasks.map((t) => t.id);
		const { data: applications, error: appsError } = await supabase.from("task_applications").select("task_id").in("task_id", taskIds);

		if (appsError) {
			console.error("Fetch applications error:", appsError.message);
			return res.status(500).json({ error: appsError.message });
		}

		const appCountMap = applications.reduce((acc, app) => {
			acc[app.task_id] = (acc[app.task_id] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const userIds = tasks.map((task) => task.who_made_id);
		const { data: users, error: usersError } = await supabase.from("users").select("uid, username").in("uid", userIds);

		if (usersError) {
			console.error("Fetch users error:", usersError.message);
			return res.status(500).json({ error: usersError.message });
		}

		const usersMap = new Map(users.map((u) => [u.uid, u.username]));

		const tasksWithMeta = tasks.map((task) => {
			const applicationsCount = appCountMap[task.id] || 0;
			const status = applicationsCount > 0 && task.status === "Open" ? "Applied" : task.status;

			return {
				...task,
				username: usersMap.get(task.who_made_id) || null,
				applicationsCount,
				status,
			};
		});

		res.status(200).json({ tasks: tasksWithMeta });
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
};

export const getTaskApplications = async (req: Request, res: Response) => {
	const { taskId } = req.params;

	try {
		const { data, error } = await supabase.from("task_applications").select("user_id, bid_price, users(username)").eq("task_id", taskId);

		if (error) {
			console.error("Error fetching applications:", error.message);
			return res.status(500).json({ error: error.message });
		}

		const applications = data?.map((app: any) => ({
			user_id: app.user_id,
			bid_price: app.bid_price,
			username: app.users?.username ?? "Unknown",
		}));

		res.json(applications);
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).json({ error: "Server error" });
	}
};

export const assignTask = async (req: Request, res: Response) => {
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
			return res.status(403).json({
				error: "Not authorized to assign this task",
			});
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
};

export const deleteTask = async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("who_made_id").eq("id", taskId).single();

		if (taskError || !task) {
			return res.status(404).json({ error: "Task not found" });
		}

		if (task.who_made_id !== user.id) {
			return res.status(403).json({
				error: "Not authorized to delete this task",
			});
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
};

export const getUserBids = async (req: Request, res: Response) => {
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

		const bidsWithTasks = data.map((bid) => ({
			bid_price: bid.bid_price,
			task: bid.tasks,
		}));

		res.json(bidsWithTasks);
	} catch (err) {
		console.error("Server error fetching bids:", err);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const completeTask = async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single();

		if (taskError) {
			console.error("Fetch task error:", taskError.message);
			return res.status(500).json({ error: taskError.message });
		}

		if (!task) {
			return res.status(404).json({ error: "Task not found" });
		}

		if (task.status !== "Assigned" || task.who_took !== user.id) {
			return res.status(403).json({
				error: "You don't have permission to change this task's status",
			});
		}

		const { error: updateError } = await supabase.from("tasks").update({ status: "Completed", is_taken: true, is_open: false }).eq("id", taskId);

		if (updateError) {
			console.error("Update task error:", updateError.message);
			return res.status(500).json({ error: updateError.message });
		}

		return res.json({
			success: true,
			message: "Task marked as completed",
		});
	} catch (err) {
		console.error("Server error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getTaskDetails = async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single();

		if (taskError || !task) {
			return res.status(404).json({ error: "Task not found" });
		}

		const { data: rawApps, error: appsError } = await supabase.from("task_applications").select("user_id, bid_price, users(username)").eq("task_id", taskId);

		if (appsError) {
			return res.status(500).json({ error: "Failed to get applications" });
		}

		const applications = rawApps.map((app: any) => ({
			user_id: app.user_id,
			bid_price: app.bid_price,
			username: app.users?.username ?? "Unknown",
		}));

		const hasApplied = applications.some((app) => app.user_id === user.id);
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
		console.error("Server error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const approveTask = async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = (req as any).user;

	try {
		const { data, error } = await supabase.from("tasks").update({ status: "Completed" }).eq("id", id).eq("who_made_id", user.id).select();

		if (error) return res.status(500).json({ error: error.message });
		if (!data.length)
			return res.status(404).json({
				error: "Task not found or not yours",
			});

		return res.json({ message: "Task confirmed as completed" });
	} catch (err) {
		return res.status(500).json({ error: "Server error" });
	}
};

export const cancelTask = async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = (req as any).user;

	try {
		const { data, error } = await supabase.from("tasks").update({ status: "Canceled" }).eq("id", id).eq("who_made_id", user.id).select();

		if (error) return res.status(500).json({ error: error.message });
		if (!data.length)
			return res.status(404).json({
				error: "Task not found or not yours",
			});

		return res.json({ message: "Task canceled" });
	} catch (err) {
		return res.status(500).json({ error: "Server error" });
	}
};

export const reopenTask = async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;
	try {
		const { data: task, error: taskError } = await supabase.from("tasks").select("who_took, status").eq("id", taskId).single();

		console.log("Task data:", task);

		if (taskError) return res.status(404).json({ error: "Task not found" });

		if (task.who_took !== user.id) {
			return res.status(403).json({
				error: "Forbidden: not assigned to this task",
			});
		}

		await supabase.from("tasks").update({ status: "Open", who_took: null }).eq("id", taskId);

		res.json({ message: "Task reopened successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const unassignTask = async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const user = (req as any).user;

	if (user.user_role !== "customer") {
		return res.status(403).json({ error: "Forbidden" });
	}

	try {
		await supabase.from("tasks").update({ status: "Open", who_took: null }).eq("id", taskId);

		res.json({ message: "Assignment cancelled successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};
