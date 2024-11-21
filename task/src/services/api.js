import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8003",
  withCredentials: true, // Maintain Frappe session cookies
});

export const getTasks = () =>
  api.get("/api/method/employee_task_tracker.api.get_tasks");

export const createTask = (data) =>
  api.post("/api/method/employee_task_tracker.api.create_task", data);

export const updateTask = (data) =>
  api.put("/api/method/employee_task_tracker.api.update_task", data);

export const getEmployeeEmails = () =>
    api.get("/api/method/employee_task_tracker.api.get_employees_emails_except_current_user");

export default api;
