# Research Opportunity Portal

Computer Networks — Assignment 1 (Fall 2026)

This is a small website for keeping track of research positions offered by university faculty. I used React for the pages, Express for the API, and MySQL to keep the records. The frontend gets its data from the API; there are no preloaded opportunity records in the code.

GitHub link: **Add your repository link here after pushing the project.**

## What the website does

You can add an opportunity, see the list, open its details, edit it, mark it Closed, or remove it. There is also a search box and a status filter. The form checks required values, and the backend checks data again before saving it.

Each opportunity has an ID, title, description, research area, faculty name, department, skills, positions, deadline and status.

## Running it on my computer

You need Node.js, npm, MySQL and Postman installed.

**1. Create the database**

Open MySQL Workbench and run `backend/sql/schema.sql`, or run this command from the project folder:

```bash
mysql -u root -p < backend/sql/schema.sql
```

This makes a database called `research_portal` with an `opportunities` table.

**2. Start the backend**

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`. Put your own MySQL password in the new `.env` file. Then:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`. You can also check `http://localhost:5000/api/health` to see whether the database is connected.

**3. Start the frontend in another terminal**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in the browser. If you changed the backend port, you can set `VITE_API_URL` in a `frontend/.env` file (see `.env.example`).

## API routes

| Method | Route | Use |
| --- | --- | --- |
| POST | `/api/opportunities` | Add an opportunity |
| GET | `/api/opportunities` | Get the list |
| GET | `/api/opportunities/:id` | Get one record |
| PUT | `/api/opportunities/:id` | Edit or close a record |
| DELETE | `/api/opportunities/:id` | Delete a record |

The API returns 201 when an item is created, 200 for successful requests, 400 for invalid input, 404 when a record cannot be found, and 500 for unexpected server problems.

For example, a new opportunity can be added by sending JSON like this:

```json
{
  "title": "Network Traffic Analysis",
  "description": "Study traffic patterns in a small campus network.",
  "research_area": "Computer Networks",
  "faculty_name": "Dr. Ahmed",
  "department": "Computer Science",
  "required_skills": "Python, Wireshark",
  "available_positions": 2,
  "application_deadline": "2026-12-15",
  "status": "Open"
}
```

The example above is just a sample request in the documentation, not a record built into the website.

## Testing with Postman

Import `postman/Research_Opportunity_Portal.postman_collection.json` and run the numbered requests in order. The collection creates three records and then tests getting the list, fetching one record, editing it, changing its status, deleting it and trying to fetch the deleted record. The last request checks invalid input. The collection uses `http://localhost:5000` unless you change its `baseUrl` variable.

## GitHub submission

Create a repository called `research-opportunity-portal`. Commit your changes as you work and push them to GitHub. For example, separate commits can be made for the database, API, frontend and tests. Add the **real** repository link near the top of this file. Do not commit `.env` files or passwords.

## One-minute screen recording

Show both servers running, add a new opportunity, open its details, edit it, close it and delete it. Then briefly show the API requests in Postman, including one 404 or validation error. Keep the recording under one minute.

## What needs to be submitted

The ZIP should have the frontend, backend, SQL schema, Postman collection, this README and the demonstration video (or video link). The assignment asks for a filename in the form `P24_0000_NAME_CLASS.zip`; replace those parts with your actual details.

Note: This is a classroom project. It does not include faculty login or permissions because those were not part of the assignment requirements.
