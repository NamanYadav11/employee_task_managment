import frappe
from frappe.model.document import Document


class Task(Document):

	def create_task_permission(doc, method):
		if not frappe.has_permission("Task", "create"):
			frappe.throw(_("You do not have permission to create tasks."))

	def write_task_permission(doc, method):
		if doc.assigned_to != frappe.session.user and not frappe.has_permission("Task", "write"):
			frappe.throw(_("You do not have permission to modify this task."))

