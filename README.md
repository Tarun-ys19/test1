# SmartCare — Clinic Management & Patient Assistance

SmartCare is a role-based clinic management demonstration built with React, Express, MongoDB/Mongoose, JWT, and Cypress. It supports patient booking, staff workflows, digital check-in/queues, prescriptions, laboratory requests, pharmacy stock, and admin reporting. No automatic diagnosis is performed; doctors enter clinical notes themselves.

## Run locally

Requirements: Node.js 20+, MongoDB Community running locally (or Atlas URI), and Chrome for Cypress browser runs.

1. Run `npm install` and `npm run install:all`.
2. Copy `backend/.env.example` to `backend/.env`; set `MONGO_URI` and a long `JWT_SECRET`.
3. Run `npm run dev`; API uses http://localhost:5000 and UI http://localhost:5173.
4. Log in with a demo account (password: `SmartCare123!`). Demo users are seeded at server start.
5. Run `npm run cypress:open` or `npm run cypress:run`. The launcher clears an inherited Electron setting that can stop Cypress from starting on Windows. Failure screenshots and run videos go to `cypress/screenshots` and `cypress/videos`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@smartcare.com | SmartCare123! |
| Doctor | doctor@smartcare.com | SmartCare123! |
| Patient | patient@smartcare.com | SmartCare123! |
| Receptionist | reception@smartcare.com | SmartCare123! |
| Pharmacist | pharmacy@smartcare.com | SmartCare123! |
| Lab staff | lab@smartcare.com | SmartCare123! |

These credentials are for local demonstration only. Change them and the JWT secret before shared deployment.

## Architecture and database

`frontend/` is a responsive Vite React app with role specific navigation and workflows. `backend/` is an Express REST API. MongoDB stores Users (including patient profiles/history), Departments, Appointments/queue state, Prescriptions, Medicines, LabReports, Payments, Notifications and ActivityLogs. Documents use Mongoose references for patients, doctors and appointments.

## REST routes

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`. Doctors: `GET /api/doctors`; available time slots: `GET /api/appointments/slots?doctor=<id>&date=YYYY-MM-DD`. Appointments: `GET/POST /api/appointments`, `PUT/DELETE /api/appointments/:id`, `POST /api/appointments/:id/checkin`, `POST /api/checkin/:token`, `GET /api/appointments/:id/qr`, `POST /api/appointments/:id/call`, `GET /api/queue`. Patients: `GET /api/patients`, `GET/PUT /api/patients/:id`. Prescriptions: `GET/POST /api/prescriptions`, `PUT /api/prescriptions/:id/dispense`. Medicines: `GET/POST /api/medicines`, `PUT /api/medicines/:id`, `GET /api/medicines/alerts`. Lab reports: `GET/POST /api/lab-reports`, `PUT /api/lab-reports/:id`. Departments: `GET/POST /api/departments`, `DELETE /api/departments/:id`. Admin: `GET /api/admin/stats`, `GET /api/admin/activity`, `GET/POST/DELETE /api/users`. Notifications and payments are available under `/api/notifications` and `/api/payments`; authorized reception/admin users can mark payments paid at `PUT /api/payments/:id/status`.

## Cypress coverage and expected results

`cypress/e2e/auth.cy.js`, `appointments.cy.js`, `api.cy.js`, and `workflows.cy.js` cover registration, login/logout, authorization, slot listing, booking conflict, QR/queue check-in, prescriptions, dispensing, lab reports and inventory alerts. Expected: valid login returns a signed token; invalid input returns 4xx; duplicates return 409; check-in assigns a queue; unauthorized admin access returns 403. Cypress terminal output shows counts and duration; failures produce screenshots and videos.

Latest local run (Chrome headless, October 5, 2026): 20 tests passed, 0 failed across the four specs. The run took about 13 seconds. Rerun after starting MongoDB and both services with `npm run cypress:run -- --browser chrome`. Cypress writes videos under `cypress/videos` and failure screenshots under `cypress/screenshots`.

## Viva walkthrough

1. Patient: search, book an appointment, and show conflict handling.
2. Check in and show queue number; doctor calls the next patient.
3. Create a prescription and lab request, then process them in staff accounts.
4. Show admin-only statistics and patient 403 response.
5. Run Cypress and discuss positive, negative, boundary, UI, E2E, and API cases.

## Security and future work

Passwords use bcrypt; JWT and role middleware protect endpoints; Mongoose validates stored data. For deployment, add rate limiting, recovery flows, secure cookie/session handling, jurisdiction-appropriate privacy controls, richer audit trails, payment gateway integration, email/SMS delivery, and expanded test coverage.
