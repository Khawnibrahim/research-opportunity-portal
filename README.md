# Research Opportunity Portal

Computer Networks Assignment 1

This is a small website for keeping track of research positions offered by university faculty. I used React for the pages, Express for the API, and MySQL to keep the records. The frontend gets its data from the API; there are no preloaded opportunity records in the code.

GitHub link: https://github.com/Khawnibrahim/research-opportunity-portal

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
