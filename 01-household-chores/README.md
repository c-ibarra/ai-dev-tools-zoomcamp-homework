# Shared Household Chores Manager

A lightweight web application built with Django and Python to manage and track shared household chores among roommates.

Part of the **AI Dev Tools Zoomcamp** (Homework 1).

## Features
1. **Household Member Management:** Register and list roommates.
2. **Chore Creation & Assignment:** Add chores and assign them to members.
3. **Centralized Dashboard:** View all chores organized by Pending and Completed.
4. **Quick Status Toggle:** Mark chores as completed or pending directly from the dashboard.

## Prerequisites
* Python 3.12+
* [uv](https://docs.astral.sh/uv/)

## Getting Started
1. Clone the repository:
   ```bash
   git clone <REPO_URL>
   cd ai-dev-tools-zoomcamp-homework
   ```

2. Set up the virtual environment and install dependencies:
   ```bash
   uv sync
   ```

3. Run migrations and start the development server:
   ```bash
   uv run python manage.py migrate
   uv run python manage.py runserver
   ```

## Documentation
* [Specification & Plan](_docs/plan.md)
