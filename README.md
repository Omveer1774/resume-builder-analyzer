# Resumint — Resume Builder & ATS Analyzer

A responsive full-stack resume studio built with **React + Vite**, **Node.js + Express**, and **MongoDB**.

## Features
- Responsive premium UI with dark/light mode
- Live resume editor and preview
- Three resume templates: Modern, Classic, Minimal
- ATS keyword matching, match score, and improvement suggestions
- Save, edit, and delete resumes in MongoDB
- Searchable resume library
- Export resume preview as PDF
- Existing `POST /api/analyze` functionality retained

## Requirements
- Node.js 18+
- MongoDB Community Server running locally (default URI: `mongodb://127.0.0.1:27017/resumeBuilder`)

## Run locally

### 1. Start MongoDB
Make sure the MongoDB service is running on your computer.

### 2. Start the backend
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Start the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/analyze` | Analyze resume against job description |
| POST | `/api/resumes` | Save a resume |
| GET | `/api/resumes` | List saved resumes |
| PUT | `/api/resumes/:id` | Update a saved resume |
| DELETE | `/api/resumes/:id` | Delete a saved resume |

## Notes
- Resume records are stored in the local MongoDB database `resumeBuilder`.
- ATS matching is a helpful keyword-based estimate, not a guarantee of passing any employer's ATS.
- The PDF export captures the visible resume preview; review page breaks before sending the PDF to employers.
"# resume-builder-analyzer" 
