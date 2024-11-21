import frappe

@frappe.whitelist()
def get_tasks():
    user = frappe.session.user
    role_profile = frappe.db.get_value("User", user, "role_profile_name")

    # Check if the user is a Manager
    if "Manager" in role_profile:
        # Managers can see all tasks
        tasks = frappe.get_all(
            "Task",
            fields=["name", "title", "description", "status", "due_date", "assigned_to"]
        )
    else:
        # Employees can only see tasks assigned to them
        tasks = frappe.get_all(
            "Task",
            filters={"assigned_to": user},
            fields=["name", "title", "description", "status", "due_date"]
        )

    # Rename 'name' to 'id' in the response
    for task in tasks:
        task["id"] = task.pop("name")

    return {
        "tasks": tasks,
        "role": role_profile,
    }





@frappe.whitelist(allow_guest=False)
def create_task(title, description, assigned_to, due_date):
    task = frappe.get_doc({
        "doctype": "Task",
        "title": title,
        "description": description,
        "assigned_to": assigned_to,
        "due_date": due_date,
        "status": "To Do"
    })
    task.insert()
    return task.as_dict()

@frappe.whitelist(allow_guest=False)
def update_task(task_id, status):
    task = frappe.get_doc("Task", task_id)
    task.status = status
    task.save()
    return task.as_dict()



@frappe.whitelist(allow_guest=True)
def login_user(email, password):
    """
    API to authenticate a user and return success if login is successful.

    :param email: User's email address
    :param password: User's password
    :return: Success message if login is successful, error otherwise
    """
    try:
        # Authenticate the user
        frappe.auth.LoginManager().authenticate(user=email, pwd=password)
        frappe.auth.LoginManager().post_login()

        return {"status": "success", "message": _("Login successful")}
    except frappe.exceptions.AuthenticationError:
        frappe.clear_messages()
        return {"status": "failed", "message": _("Invalid email or password")}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@frappe.whitelist()
def get_employees_emails_except_current_user():
    """Fetch all employee emails except the current user's."""
    try:
        current_user = frappe.session.user

        # Fetch all employee emails excluding the current user
        employee_emails = frappe.get_all(
            "User",
            filters={
                "enabled": 1,  # Only enabled users
                "email": ["!=", current_user]  # Exclude the current user's email
            },
            fields=["email"]
        )

        # Extract the email addresses into a list
        emails = [user["email"] for user in employee_emails]
        return {"status": "success", "emails": emails}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Error fetching employee emails"))
        return {"status": "error", "message": str(e)}
