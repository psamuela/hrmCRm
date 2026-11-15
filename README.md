# Enterprise HRM + CRM Cloud Platform

A unified, modular business management platform built with **Laravel 12 (API)** and **React 19 + TypeScript (Vite + Tailwind CSS)**.

Inspired by top modern SaaS dashboard designs (Innowise, Opedia Studio, Kyra, and ByteBit), this platform couples human resource management with client relationship operations under a shared multi-tenant business core.

---

## 🏛 Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │      BUSINESS MANAGEMENT PLATFORM      │
                      │  One Application · One Subscription    │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │              SHARED CORE SYSTEM               │
                 │   Auth (Sanctum) · RBAC · Multi-Company       │
                 │   Notifications · Audit Trails · Automations  │
                 └───────────────┬───────────────────────┬───────┘
                                 │                       │
                 ┌───────────────▼────────┐      ┌───────▼──────────────┐
                 │       HRM MODULE       │      │      CRM MODULE      │
                 │  1.1 Employees         │      │  2.1 Leads & AI Score│
                 │  1.2 Recruitment & ATS │      │  2.3 B2B Accounts    │
                 │  1.3 Attendance & Clock│      │  2.4 Deals Kanban    │
                 │  1.4 Leave Management  │      │  2.7 Product Catalog │
                 │  1.5 Statutory Payroll │      │  2.8 Quotes & Offers │
                 │  1.6 Performance (360) │      │  2.10 Invoices & Pay │
                 │  1.8 ESS Self-Service  │      │  2.15 Helpdesk (SLA) │
                 │  1.9 Expense Claims    │      │  2.13 Campaigns      │
                 └────────────────────────┘      └──────────────────────┘
```

---

## 💼 Subscription Packaging Model

The platform enforces 3 subscription packages:
1. **HRM Package**: Focuses strictly on workforce, attendance, leaves, recruitment, and payroll. CRM features are locked.
2. **CRM Package**: Focuses strictly on leads, accounts, pipeline deals, invoices, and customer helpdesk. HRM features are locked.
3. **Enterprise Package**: Unlocks both HRM and CRM with cross-module automations (e.g. Closing a Deal automatically generates an Invoice; Employee leave submissions notify managers).

---

## 🇳🇬 Nigerian Statutory Payroll & Tax Compliance

The payroll engine implements Nigerian statutory deductions with configurable rules:
- **Gross Salary**: Basic Salary + Housing Allowance (25%) + Transport Allowance (12%) + Bonuses.
- **Pension Reform Act (PRA 2014)**:
  - Employee Contribution: **8.0%**
  - Employer Contribution: **10.0%**
- **National Housing Fund (NHF)**: **2.5%** of basic salary.
- **Pay As You Earn (PAYE)**: Progressive tax calculation.
- **Value Added Tax (VAT)**: Configured at standard **7.5%**.
- **Payment Gateways**: Direct support for Paystack and Flutterwave gateway references and NIP bank transfers.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **PHP 8.3+** (with `pdo_sqlite`, `curl`, `mbstring`)
- **Composer 2+**
- **Node.js 20+** & **npm**

### 2. Backend (Laravel API)
```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve --port=8000
```
Backend API will run at `http://127.0.0.1:8000`.

### 3. Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will run at `http://127.0.0.1:5173`.

---

## 🔑 Demo Personas & Pre-Seeded Accounts

All accounts share the password: `password123`

| Persona | Email | Primary Responsibilities |
| :--- | :--- | :--- |
| **👑 Super Admin** | `admin@innowise.com` | Full administrative control over all HRM + CRM modules |
| **👥 HR Manager** | `chidi.hrm@innowise.com` | Employee onboarding, attendance oversight, payroll generation, ATS |
| **💼 Sales VP** | `amaka.crm@innowise.com` | Deal pipeline management, lead scoring, quotation approvals |
| **💻 Staff (ESS)** | `femi.engineer@innowise.com` | Employee self-service: clock in/out, view payslips, apply for leave |
| **💼 Sales Rep** | `ibrahim.sales@innowise.com` | Regional sales execution (Abuja branch) & follow-ups |

*(You can switch between any of these personas with 1-click in the top-right header dropdown)*.

---

## 🤖 Advanced AI Features Included

- **AI CV Screening (4.1)**: Automatic match scoring, strengths analysis, and custom interview guide generation.
- **AI Lead Scoring (4.2)**: Predictive win probability calculation and decision timeline factor breakdown.
- **AI Job Description Generator**: Generates full job postings with requirements by seniority and department.
- **AI Sales Email Drafter**: Context-aware outreach drafting for client meetings and proposals.
