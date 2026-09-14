# Shared Household Chores Manager

A lightweight web application built with Django and Python to manage, assign, and track shared household chores among roommates transparently.

Built for **Homework 1 (AI Dev Tools Zoomcamp 2026)**.

---

## Features
1. **Household Member Management:** Register and list roommates.
2. **Chore Creation & Assignment:** Add chores and assign them to specific household members.
3. **Centralized Dashboard:** View all chores split into **Pending** and **Completed** sections.
4. **Quick Status Toggle:** Mark chores as completed or re-open them directly with a single click.

---

## Architecture & Tech Stack
* **Language & Runtime:** Python 3.12 managed with [`uv`](https://docs.astral.sh/uv/)
* **Framework:** Django 5+ (MTV: Models, Templates, Views)
* **Database:** SQLite (local development storage)
* **Testing:** Django TestCase suite

---

## Getting Started

### 1. Set up environment and install dependencies
From this directory:
```bash
uv sync
```

### 2. Run Database Migrations
```bash
uv run python manage.py migrate
```

### 3. Start Development Server
```bash
uv run python manage.py runserver
```
Access the application at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

---

## Running Automated Tests

To run the full suite of unit and integration tests:
```bash
uv run python manage.py test
```

---

## Documentation
* [Specification & Plan](_docs/plan.md)
* [Product Backlog](backlog.md)
