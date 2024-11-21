import { useState, useEffect } from "react";
import { getTasks, updateTask, createTask, getEmployeeEmails} from "../services/api"; // Assume you have this API function
import { useFrappeAuth } from "frappe-react-sdk";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null); // For managing the selected task
  const [isPopupOpen, setIsPopupOpen] = useState(false); // For task update popup
  const [isAddTaskPopupOpen, setIsAddTaskPopupOpen] = useState(false); // For task creation popup
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to:"",
    status: "Not Started",
    due_date: "",
  }); // For new task data
  const [emails,setEmails]=useState({})

  const { currentUser, logout } = useFrappeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await getTasks();
        setTasks(data.message.tasks || []);
        setRole(data.message.role || "Employee");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  useEffect(()=>{
    async function getData() {
      try {
        const {data}  = await getEmployeeEmails();
        const refdata = [...new Set(data.message.emails)]
        setEmails(refdata)
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getData();
  },[])

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsPopupOpen(true);
  };

  const handleTaskUpdate = async (event) => {
    event.preventDefault();
    try {
      const taskData = {
        task_id: selectedTask.id,
        status: selectedTask.status,
      };
      const res = await updateTask(taskData);
      const updatedTask = {
        id: res.data.message.name,
        title: res.data.message.title,
        description: res.data.message.description,
        status: res.data.message.status,
        due_date: res.data.message.due_date,
      };
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleClose = () => {
    setIsPopupOpen(false);
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    try {
      const res = await createTask(newTask);
      const createdTask = {
        id: res.data.message.name,
        title: res.data.message.title,
        description: res.data.message.description,
        status: res.data.message.status,
        due_date: res.data.message.due_date,
      };
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      setIsAddTaskPopupOpen(false);
      setNewTask({
        title: "",
        description: "",
        status: "Not Started",
        due_date: "",
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-10 bg-white p-5 rounded-md">
        <h1 className="text-3xl font-bold text-gray-800">Task Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-800 font-medium">
            Welcome, {currentUser ? currentUser || "User" : "User"}
          </span>
          <button
            onClick={() => {
              logout().then(() => {
                setTasks([]);
                navigate("/");
              });
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6 mt-7">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {role === "Manager" ? "All Tasks Overview" : "Your Tasks"}
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <div className="space-y-4 mt-4 mb-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <h3 className="text-xl font-medium text-gray-900">{task.title}</h3>
                <p className="text-gray-600">
                  <strong>Due:</strong> {task.due_date}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    task.status === "Completed"
                      ? "text-green-600"
                      : task.status === "In Progress"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {task.status}
                </p>
                {role === "Manager" && (
                  <div className="text-sm text-gray-500 mt-2">
                    <p>
                      <strong>Assigned To:</strong> {task.assigned_to || "Not Assigned"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tasks found.</p>
        )}
        {role === "Manager" && (
          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddTaskPopupOpen(true)}
            >
              Add Task
            </Button>
          </div>
        )}

      </div>

      <Modal
        open={isPopupOpen}
        onClose={handleClose}
        aria-labelledby="update-task-modal"
        aria-describedby="update-task-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography id="update-task-modal" variant="h6" component="h2">
            Update Task
          </Typography>
          <form onSubmit={handleTaskUpdate}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={selectedTask?.title || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, title: e.target.value })
              }
            />
            <TextField
              label="Status"
              select
              fullWidth
              margin="normal"
              value={selectedTask?.status || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, status: e.target.value })
              }
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={handleClose}
                variant="outlined"
                color="secondary"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
      

      {/* Add Task Modal */}
      <Modal
        open={isAddTaskPopupOpen}
        onClose={() => setIsAddTaskPopupOpen(false)}
        aria-labelledby="add-task-modal"
        aria-describedby="add-task-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography id="add-task-modal" variant="h6" component="h2">
            Add New Task
          </Typography>
          <form onSubmit={handleAddTask}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <TextField
              label="Assigned To"
              select
              fullWidth
              margin="normal"
              value={newTask.assigned_to}
              onChange={(e) =>
                setNewTask({ ...newTask, assigned_to: e.target.value })
              }
            >
             
                {Array.from(emails).map((email, index) => (
                  <MenuItem value={email} key={index}>{email}</MenuItem>
                ))}

            </TextField>
            <TextField
              label="Status"
              select
              fullWidth
              margin="normal"
              value={newTask.status}
              onChange={(e) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
            >
              <MenuItem value="To Do">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              value={newTask.due_date}
              onChange={(e) =>
                setNewTask({ ...newTask, due_date: e.target.value })
              }
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={() => setIsAddTaskPopupOpen(false)}
                variant="outlined"
                color="secondary"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
