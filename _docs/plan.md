# Shared Household Chores Manager - Specification & Plan

## 1. Overview
A lightweight web application designed for roommates living together to organize, assign, and track shared household chores in a single transparent dashboard.

## 2. Target Users & Problem Statement
* **Users:** Roommates / household members sharing living duties.
* **Problem:** Ambiguity around chore assignments, forgotten duties, and lack of visibility into who is responsible for which task and what remains pending.

## 3. Core Features (Scope)
The Minimum Viable Product (MVP) focuses on the following 4 core features:

1. **Household Member Management:**
   * Register and list household members (roommates) available for chore assignment.
2. **Chore Creation & Assignment:**
   * Create chores with a title, optional description, and assign each chore to a specific household member.
3. **Centralized Chores Dashboard:**
   * Single-page view displaying all chores categorized clearly into **Pending** and **Completed** sections.
4. **Quick Status Toggle:**
   * Allow users to mark any chore as completed (or re-open it to pending) with a single click directly from the dashboard.

## 4. Technical Architecture
* **Language & Runtime:** Python 3.12 managed with `uv`.
* **Framework:** Django 5+ (MTV architecture: Models, Templates, Views).
* **Database:** SQLite (local development storage).
* **Frontend:** Django HTML Templates styled with clean, responsive CSS.

## 5. Non-Goals (Out of Scope for MVP)
* User authentication / password logins (all household members share the local dashboard).
* Push notifications / SMS / email alerts.
* Financial settlement or chore expense splitting.
