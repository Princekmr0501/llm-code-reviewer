# Requirements Document

**Local Web App for LLM-Based Code Review and Commit Message Suggestions**

---

## 1. Objective

You will build a **local web application** that analyzes a local Git repository and:

1. Suggests a **Conventional Commit message** based on staged changes.
2. Performs a **code review** by comparing one Git branch against another.

The application must:

* Run locally
* Use a browser-based UI
* Be read-only with respect to Git
* Use an LLM only for analysis and text generation

---

## 2. Repository Setup (Mandatory First Step)

### 2.1 GitHub Repository

Create a new GitHub repository with the **exact name**:

```
llm-code-reviewer
```

Rules:

* The repository must be public
* Initialize it with a README
* Clone it to your local machine

---

### 2.2 Monorepo Structure (Mandatory)

You must use a **monorepo** with exactly two projects:

```
llm-code-reviewer/
├── backend/
└── frontend/
```

No additional top-level folders are allowed.

---

## 3. High-Level Architecture

* Frontend: Browser-based UI
* Backend: Local HTTP server
* Communication: HTTP API calls
* State: Ephemeral only, no persistence
* Startup: Via npm scripts

---

## 4. Startup and Execution

### 4.1 Backend

* You must start the backend via npm
* Example expectation:

  ```
  npm install
  npm run dev
  ```

  or

  ```
  npm start
  ```

### 4.2 Frontend

* You must start the frontend via npm
* The app must be accessible in a browser on localhost

There must be **no CLI-based interaction** for the core functionality.

---

## 5. Backend Requirements

### 5.1 Backend Responsibilities

The backend must:

* Expose HTTP APIs
* Read directory structure information
* Validate Git repositories
* Execute **read-only Git commands**
* Prepare data for LLM analysis
* Call the LLM
* Return results or errors to the frontend

---

### 5.2 Backend Restrictions

You must not:

* Modify Git state
* Stage files
* Commit code
* Write to `.git`
* Read file contents directly from disk
* Persist any data
* Cache responses
* Run background jobs

---

### 5.3 Git Access Rules

* All **read-only Git commands** are allowed
* All Git commands that mutate state are strictly disallowed

Examples of allowed operations:

* Reading diffs
* Reading branch lists
* Reading repository tree and structure

---

### 5.4 Directory Access Rule

* The backend may read **directory names only**
* All file-level information must be derived via Git commands
* The backend must never read file contents directly from the filesystem

---

### 5.5 Git Repository Validation

* Only **root Git repositories** are valid
* Subdirectories inside a Git repository are invalid
* Non-Git directories are invalid
* Validation must be enforced by the backend even if the frontend already filters directories

---

### 5.6 Backend Project Structure

Your backend must logically separate:

* Routing
* Git-related logic
* LLM-related logic

All LLM API calls must live inside a folder named:

```
connectors/
```

This folder must contain all code responsible for calling the LLM provider.

---

## 6. Backend API Endpoints (Mandatory)

### 6.1 Health Endpoint

```
GET /health
```

Purpose:

* Verify that the backend server is running

---

### 6.2 Directory Contents Endpoint

```
GET /repo/directories
```

Query parameters:

* `path` (optional): absolute or resolved path to a directory

Behavior:

* If `path` is not provided:

  * Return the contents of the root directory
* If `path` is provided:

  * Return the contents of the specified directory

Response requirements:

* Return only **directory names**
* For each directory, return metadata indicating:

  * Whether it is a **root Git repository**

This endpoint is the **single source of truth** for:

* Directory navigation in the UI
* Git repository validation

---

### 6.3 Commit Message Suggestion Endpoint

```
POST /analyze/commit
```

Purpose:

* Analyze **staged changes only**
* Return a suggested commit message

Behavior:

* Use staged Git diff
* If nothing is staged:

  * Return a valid response indicating this
  * This must not be treated as an error

---

### 6.4 Branch Review Endpoint

```
POST /analyze/review
```

Purpose:

* Review one branch against another

Inputs:

* Base branch name
* Compare branch name

Behavior:

* Compute Git diff between branches
* Return a structured review

---

### 6.5 Error Handling

* You must return appropriate HTTP status codes
* Error messages must be:

  * Human-readable
  * Safe to display directly in the UI
* Errors must fail fast
* No retries are allowed

---

## 7. Frontend Requirements

### 7.1 Application Model

* Single-page application
* Step-based selector
* React components rendered per step
* No routing
* No saved state

---

### 7.2 Step 1: Repository Selection

* You must allow the user to browse directories using the directory contents endpoint
* Only **root Git repositories** must be selectable
* The select button must be disabled unless the directory is a valid root Git repository
* Subdirectories inside a Git repository must not be selectable

---

### 7.3 Step 2: Analysis Mode Selection

* Implement mode selection using **tabs**
* Two tabs:

  1. Suggest Commit
  2. Review Branch

Switching tabs:

* Clears any existing output
* Switches the rendered React component

---

### 7.4 Suggest Commit Tab

Inputs:

* None

Behavior:

* Uses staged Git diff
* Button labeled **“Suggest Commit”**
* Calls the commit suggestion backend endpoint

Output:

* Read-only text area
* Copy-to-clipboard button
* Output replaces any previous result

---

### 7.5 Review Branch Tab

Inputs:

* Base branch dropdown
* Compare branch dropdown
* Branch names must be populated from the backend

Behavior:

* Button labeled **“Review”**
* Calls the branch review backend endpoint

Output:

* Single structured review output
* Output replaces any previous result

---

### 7.6 Output Rules

* Only one output may be visible at any time
* Output must always correspond to the last action performed
* No historical or stacked outputs

---

### 7.7 Error Handling (Frontend)

* Display errors in a **global error banner**
* Show backend error messages verbatim
* Errors must persist until manually dismissed
* Successful actions must clear the error banner

---

## 8. Git Diff and Context Rules

### 8.1 Commit Suggestion

* Use `git diff --staged`
* Do not include unstaged or untracked changes

---

### 8.2 Branch Review

* Use `git diff <base>..<compare>`

---

### 8.3 Context Policy

* Use **raw Git diff only**
* No additional context expansion
* No full file content

---

### 8.4 Size Limit

* Up to 100,000 characters of diff content is allowed

---

### 8.5 Binary Files

* Include binary file changes as metadata only
* Do not attempt to interpret binary content

---

## 9. LLM Interaction Requirements

### 9.1 LLM Role

* Advisory only
* Stateless
* Non-autonomous

---

### 9.2 Call Structure

* Commit suggestion and branch review must be **separate LLM calls**
* One-shot calls only
* No retries
* Fail fast on error

---

### 9.3 Output Handling

* Do not validate or enforce output schemas
* Render LLM output directly in the UI
* Do not post-process content beyond display

---

### 9.4 Commit Message Style

* Use **Conventional Commits**
* Best-effort guidance only
* No enforcement logic

---

## 10. Explicit Non-Goals

You must not implement:

* CLI tools
* Git hooks
* Editor extensions
* Persistent storage
* Authentication
* Caching
* Streaming responses
* Automatic Git actions

---

## 11. Completion Criteria

Your implementation is complete when:

* The app runs locally via npm
* You can browse directories and select a root Git repository
* Commit message suggestions work on staged changes
* Branch reviews work between two branches
* Errors are handled cleanly and visibly
* No Git state is modified
* All requirements in this document are satisfied exactly