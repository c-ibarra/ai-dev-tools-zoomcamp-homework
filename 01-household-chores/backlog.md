# Product Backlog: Shared Household Chores Manager

Based on the specification defined in `_docs/plan.md`, the implementation is broken down into small, incremental tasks:

---

### Task 1: Define Data Models and Run Migrations
* **Description:** Create the core domain models (`HouseholdMember` and `Chore`) in `chores/models.py`.
* **Details:**
  * `HouseholdMember`: `name` (CharField), `created_at` (DateTimeField).
  * `Chore`: `title` (CharField), `description` (TextField, optional), `assigned_to` (ForeignKey to `HouseholdMember`), `is_completed` (BooleanField, default False), `created_at` (DateTimeField).
* **Acceptance Criteria:**
  * Run `uv run python manage.py makemigrations` and generate migration file.
  * Run `uv run python manage.py migrate` and verify SQLite database schema creation.

---

### Task 2: Register Models in Django Admin
* **Description:** Register `HouseholdMember` and `Chore` in `chores/admin.py` with custom list displays and search filters.
* **Acceptance Criteria:**
  * Models are manageable via the Django administration interface (`/admin/`).

---

### Task 3: Build Centralized Dashboard View and HTML Template
* **Description:** Create the main dashboard view in `chores/views.py` and template in `chores/templates/chores/dashboard.html` to display all chores split into **Pending** and **Completed** sections.
* **Acceptance Criteria:**
  * URL route `/` connects to the dashboard.
  * Dashboard displays chores grouped by status.

---

### Task 4: Implement Chore Creation Form on Dashboard
* **Description:** Add a form directly onto the dashboard allowing users to input a chore title, optional description, and select an assigned household member.
* **Acceptance Criteria:**
  * Submitting valid chore form creates a record in the database and refreshes the dashboard.

---

### Task 5: Implement One-Click Status Toggle Action
* **Description:** Create a POST action/endpoint to toggle `is_completed` between `True` and `False` directly from the chore item card on the dashboard.
* **Acceptance Criteria:**
  * Clicking the toggle button instantly updates the chore status and moves it between Pending and Completed.

---

### Task 6: Unit and Integration Testing
* **Description:** Write comprehensive automated test cases in `chores/tests.py` covering model constraints, dashboard rendering, chore creation, and status toggling.
* **Acceptance Criteria:**
  * Run `uv run python manage.py test` and all tests pass with 0 failures.
