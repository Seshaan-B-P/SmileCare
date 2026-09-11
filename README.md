# 🦷 SmileCare

### Modern Dental Clinic ERP & Electronic Health Records Platform

> **SmileCare** is a modern, full-stack Dental Clinic ERP and Electronic Health Records (EHR) platform designed to help dental clinics manage patients, appointments, clinical consultations, digital prescriptions, dental charts, billing, staff access, follow-ups, and analytics from a unified workspace.

Built with **React, Node.js, Express, MongoDB, and Tailwind CSS**, SmileCare focuses on simplifying day-to-day dental clinic operations while maintaining structured clinical records and role-based access.

---

## ✨ Overview

Managing a dental clinic often requires multiple disconnected systems for patient records, appointments, treatment history, prescriptions, billing, staff management, and patient follow-ups.

**SmileCare brings these workflows together into one centralized platform.**

The system provides an interactive **32-tooth odontogram**, longitudinal patient records, digital prescriptions, GST-enabled billing, staff RBAC, appointment management, analytics, and bilingual Tamil/English WhatsApp follow-up workflows.

### 🎯 Designed For

* 🦷 Dental Surgeons
* 🧑‍⚕️ Orthodontists
* 🩺 Endodontists
* 🧑‍💼 Receptionists
* 🧑‍⚕️ Dental Assistants
* 🏥 Small & Medium Dental Clinics

---

# 🚀 Key Features

## 🦷 1. Interactive 32-Tooth Odontogram

A digital dental chart for recording and tracking tooth-level clinical conditions.

### Supported Notations

* **Universal Numbering System** — 1–32
* **FDI Two-Digit Notation** — 11–48

### Clinical Conditions

| Code  | Condition               | Description              |
| ----- | ----------------------- | ------------------------ |
| `CAV` | 🔴 Cavity / Decay       | Tooth affected by decay  |
| `FIL` | 🔵 Composite Filling    | Existing filling         |
| `RCT` | 🟣 Root Canal Treatment | RCT completed / required |
| `CRN` | 🟡 Crown                | Dental crown / cap       |
| `EXT` | 🟤 Extraction           | Extraction required      |
| `IMP` | 🟢 Implant              | Dental implant           |
| `MIS` | ⚪ Missing               | Missing tooth            |

### Odontogram Capabilities

* Interactive tooth selection
* Tooth-specific clinical information
* Surface-level notes
* Diagnostic remarks
* Condition tracking
* Upper / Lower arch visualization
* Right / Left side classification
* Real-time dental condition summary

---

# 🩺 2. Clinical Consultation & E-Prescription

SmileCare provides a dedicated consultation workspace for dental professionals.

### Consultation Records

* Chief Complaint
* Clinical Examination
* Diagnosis
* Procedure Notes
* Treatment Plan
* Follow-up Instructions
* Prescription

### 💊 Smart Prescription Generator

Includes reusable dental medication templates such as:

* Post-extraction protocols
* Root canal medication protocols
* Analgesics
* Antibiotics
* Chlorhexidine mouthwash
* Dosage instructions
* Frequency patterns such as `1-0-1`
* Dietary instructions

### 🖨️ Printable Prescription

Generate professional print-ready prescriptions containing:

* Clinic information
* Doctor information
* Registration number
* Patient information
* Diagnosis
* Medicines
* Dosage
* Instructions
* Follow-up information

---

# 📲 3. Tamil WhatsApp Patient Follow-ups

SmileCare is designed with **local patient communication** in mind.

The follow-up system supports:

### 🌐 Bilingual Messaging

* 🇮🇳 Tamil
* 🇬🇧 English

### WhatsApp Workflow

```text
Treatment Completed
       ↓
Follow-up Scheduled
       ↓
WhatsApp Message Generated
       ↓
Patient Receives Reminder
       ↓
Patient Opens Booking Link
       ↓
Self-Service Appointment Confirmation
```

### Features

* Tamil follow-up templates
* English follow-up templates
* Direct WhatsApp `wa.me` dispatch
* Appointment confirmation links
* Recall appointment workflow
* Self-service booking portal
* WhatsApp message simulator

Example booking route:

```text
/#book?id=<followUpId>
```

---

# 👥 4. Patient Management & EHR

SmileCare maintains a centralized longitudinal patient record.

### Patient Information

* Full Name
* Age
* Gender
* Phone Number
* Medical Alerts
* Allergies
* Emergency Contact

### Patient Timeline

Each patient profile can connect:

```text
Patient
 ├── Appointments
 ├── Consultations
 ├── Dental Chart
 ├── Prescriptions
 ├── Treatment History
 ├── Invoices
 └── Follow-ups
```

This provides clinicians with a consolidated view of the patient's dental history.

---

# 📅 5. Appointment Management

A centralized appointment scheduling system helps clinics manage daily consultations.

### Features

* Date-based appointment filtering
* Appointment creation
* Patient check-in
* Consultation launch
* Upcoming appointments
* Time-slot management
* Appointment status tracking
* Conflict prevention
* Default 30-minute appointment intervals

---

# 💳 6. Billing & GST Invoicing

SmileCare includes an integrated clinic billing module.

### Procedure Library

Example services include:

* Consultation
* Scaling
* Root Canal Treatment
* Zirconia Crown
* Dental Implant
* Laser Whitening

### Billing Features

* Itemized invoices
* Discounts
* GST calculation
* Payment tracking
* Partial payments
* Outstanding balances
* Multiple payment methods
* Printable invoices

### Supported Payment Methods

* UPI / GPay
* Card
* Cash
* Net Banking

### Payment Status

```text
PAID
PARTIAL
UNPAID
```

---

# 🔐 7. Role-Based Access Control

SmileCare provides role-based access to protect sensitive clinic operations.

### 👨‍⚕️ Doctor / Administrator

Full access to:

* Patients
* Consultations
* Dental charts
* Prescriptions
* Billing
* Reports
* Staff management
* Clinic settings
* Financial analytics

### 🧑‍💼 Clinic Staff

Access can be restricted according to assigned permissions.

Typical access includes:

* Patient registration
* Appointment management
* Billing
* Front-desk operations

Restricted capabilities may include:

* Clinical consultations
* Financial reports
* Record deletion
* Discount management
* Data exports

### Permission Examples

```text
CONSULTATION_ACCESS
DISCOUNT_ACCESS
REPORT_EXPORT
RECORD_DELETE
BILLING_ACCESS
PATIENT_MANAGEMENT
APPOINTMENT_MANAGEMENT
```

---

# 📊 8. Analytics & Reports

SmileCare provides operational and financial insights through a centralized dashboard.

### Dashboard Metrics

* Total Patients
* Consultation Volume
* Appointment Count
* Revenue
* Pending Payments
* Monthly Collection
* Appointment Distribution

### Reports

* Financial reports
* Clinical summaries
* Appointment analytics
* Revenue trends
* Patient statistics

### Export

* CSV
* Excel-compatible data
* Printable reports
* PDF-ready clinical summaries

---

# 🏗️ System Architecture

```text
                    ┌───────────────────────┐
                    │      SmileCare        │
                    │    Web Application    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    React + Vite       │
                    │    Tailwind CSS       │
                    └───────────┬───────────┘
                                │
                         REST API / HTTP
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Node.js + Express   │
                    │      Backend API      │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌─────────────────┐     ┌─────────────────┐
          │    MongoDB      │     │ In-Memory Store │
          │   / Mongoose    │     │   Development   │
          └─────────────────┘     └─────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology        | Purpose           |
| ----------------- | ----------------- |
| React 18          | UI development    |
| Vite              | Frontend tooling  |
| Tailwind CSS      | Styling           |
| Lucide React      | Icons             |
| React Context API | Global state      |
| JavaScript        | Application logic |

## Backend

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Node.js    | Server runtime             |
| Express.js | REST API                   |
| Mongoose   | MongoDB ODM                |
| MongoDB    | Primary database           |
| dotenv     | Environment configuration  |
| CORS       | Cross-origin communication |

## Utilities

* CSV Export
* Native Print API
* WhatsApp `wa.me`
* Responsive UI
* RESTful APIs

---

# 📂 Project Structure

```text
SmileCare/
│
├── client/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       │   ├── appointments/
│       │   ├── billing/
│       │   ├── common/
│       │   ├── dashboard/
│       │   ├── dental/
│       │   ├── layout/
│       │   ├── prescription/
│       │   └── whatsapp/
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── DataContext.jsx
│       │
│       ├── pages/
│       │   ├── Appointments.jsx
│       │   ├── Billing.jsx
│       │   ├── Consultation.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DoctorProfile.jsx
│       │   ├── FollowUps.jsx
│       │   ├── Login.jsx
│       │   ├── PatientProfile.jsx
│       │   ├── Patients.jsx
│       │   ├── Reports.jsx
│       │   ├── Settings.jsx
│       │   └── StaffManagement.jsx
│       │
│       ├── utils/
│       │   ├── dentalData.js
│       │   └── exportUtils.js
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Consultation.js
│   │   ├── DentalChart.js
│   │   ├── Invoice.js
│   │   ├── Patient.js
│   │   ├── Setting.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   └── api.js
│   │
│   ├── seed/
│   │   └── seedData.js
│   │
│   ├── .env
│   └── server.js
│
└── README.md
```

---

# 🔌 API Overview

| Method | Endpoint                  | Description                   |
| ------ | ------------------------- | ----------------------------- |
| `GET`  | `/api/health`             | Server health check           |
| `POST` | `/api/auth/login`         | Authenticate user             |
| `GET`  | `/api/data`               | Retrieve clinic data          |
| `POST` | `/api/sync`               | Synchronize application state |
| `GET`  | `/api/patients`           | Retrieve patients             |
| `POST` | `/api/patients`           | Register patient              |
| `GET`  | `/api/appointments`       | Retrieve appointments         |
| `POST` | `/api/appointments`       | Create appointment            |
| `GET`  | `/api/invoices`           | Retrieve invoices             |
| `GET`  | `/api/reports`            | Retrieve reports              |
| `POST` | `/api/whatsapp/book-slot` | Confirm booking               |

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure the following are installed:

* Node.js 18+
* npm
* MongoDB or MongoDB Atlas
* Git

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/smilecare.git
cd smilecare
```

---

## 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smilecare_db
```

Start the backend:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔑 Demo Credentials

> ⚠️ These credentials are intended only for local/demo development. Do not use default credentials in production.

### Doctor / Administrator

```text
Email: doctor@smilecare.com
Password: Doctor@123
```

### Clinic Staff

Staff accounts can be created through the Staff Management module.

---

# 🔄 Core Workflow

```text
                Patient Registration
                        │
                        ▼
                Appointment Booking
                        │
                        ▼
                   Patient Check-in
                        │
                        ▼
                  Doctor Consultation
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       Dental Odontogram      E-Prescription
             │                     │
             └──────────┬──────────┘
                        ▼
                  Treatment Plan
                        │
                        ▼
                     Billing
                        │
                        ▼
                Payment Collection
                        │
                        ▼
                 Follow-up Schedule
                        │
                        ▼
             Tamil/English WhatsApp
                        │
                        ▼
              Recall Appointment
```

---

# 🧠 Data Model

The application is organized around the following primary entities:

```text
User
 │
 ├── Role
 ├── Permissions
 └── Activity

Patient
 │
 ├── Appointments
 ├── Consultations
 ├── DentalChart
 ├── Prescriptions
 ├── FollowUps
 └── Invoices

Appointment
 │
 ├── Patient
 ├── Doctor
 ├── Date
 ├── Time
 └── Status

Consultation
 │
 ├── Patient
 ├── Diagnosis
 ├── Examination
 ├── Treatment
 └── Prescription

DentalChart
 │
 ├── Tooth Number
 ├── Notation
 ├── Condition
 ├── Surfaces
 └── Clinical Notes

Invoice
 │
 ├── Patient
 ├── Procedures
 ├── GST
 ├── Discount
 ├── Payment
 └── Balance
```

---

# 🔒 Security Considerations

SmileCare is designed with role-based access and healthcare-data considerations in mind.

Current architecture includes:

* Role-based permissions
* Restricted administrative operations
* Environment-based configuration
* API separation
* CORS configuration
* Audit-oriented staff activity structure

### Production Hardening

Before production deployment, the application should additionally implement:

* Password hashing with Argon2/bcrypt
* JWT access/refresh token strategy
* HTTPS
* Secure HTTP-only cookies where applicable
* Rate limiting
* Request validation
* Input sanitization
* Encryption for sensitive data
* Database backups
* Audit trails
* Secrets management
* Production-grade authentication
* Healthcare/privacy compliance review

> **Important:** SmileCare is a software project and should not be considered a production-ready medical records system without appropriate security, privacy, regulatory, clinical, and infrastructure validation.

---

# 📱 Responsive Design

SmileCare is designed for modern clinic environments and supports responsive layouts for:

* 💻 Desktop
* 🖥️ Large displays
* 📱 Tablet
* 📱 Mobile interfaces

The dashboard prioritizes fast access to frequently used clinical and administrative workflows.

---

# 🔮 Future Roadmap

### Phase 1 — Core Platform

* [x] Patient management
* [x] Appointment management
* [x] Consultation workflow
* [x] Dental chart
* [x] Prescription generation
* [x] Billing
* [x] Staff RBAC
* [x] Reports

### Phase 2 — Communication

* [x] Tamil follow-up templates
* [x] English follow-up templates
* [x] WhatsApp booking workflow
* [ ] Automated scheduled messaging
* [ ] WhatsApp Business API integration

### Phase 3 — Intelligence

* [ ] AI-assisted clinical documentation
* [ ] AI-powered appointment prediction
* [ ] Automated recall prioritization
* [ ] Patient risk insights
* [ ] Treatment-plan assistance

### Phase 4 — Platform Expansion

* [ ] Multi-clinic support
* [ ] Doctor-specific workspaces
* [ ] Cloud backup
* [ ] Mobile application
* [ ] Online patient portal
* [ ] Digital payment gateway
* [ ] Insurance workflow
* [ ] Advanced financial analytics

---

# 🌍 Social Impact

SmileCare aims to improve accessibility and operational efficiency for dental clinics by reducing dependence on paper-based workflows.

### Key Benefits

* 📄 Reduced paperwork
* ⚡ Faster patient management
* 🦷 Structured dental history
* 📲 Better patient follow-up
* 🌐 Tamil-language communication
* 💳 Centralized financial management
* 📊 Data-driven clinic decisions
* 🔐 Controlled staff access

---

# 🎓 Project Information

**Project:** SmileCare — Dental Clinic ERP & EHR Platform

**Domain:** Healthcare Technology / HealthTech

**Category:** SaaS / Enterprise Web Application

**Architecture:** Full Stack Web Application

**Frontend:** React + Vite + Tailwind CSS

**Backend:** Node.js + Express

**Database:** MongoDB + Mongoose

---

# 👨‍💻 Development

SmileCare was developed as a full-stack software project with a focus on:

* Healthcare workflow digitization
* Modern UI/UX
* Modular architecture
* Role-based authorization
* Clinical data organization
* Financial management
* Patient communication
* Scalable web architecture

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

# ⭐ Support

If you find **SmileCare** useful or interesting, consider giving the repository a ⭐ on GitHub.

Contributions, suggestions, and improvements are welcome.

---

<div align="center">

### 🦷 SmileCare

**Digitizing Dental Care. Simplifying Clinic Management.**

Built with ❤️ using React, Node.js & MongoDB.

</div>
