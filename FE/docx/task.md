# Frontend Development Tasks

## Phase 1: Foundation Setup ✅
- [x] Vite + React + TypeScript
- [x] TailwindCSS v3 + dark mode
- [x] i18n (Vi/En)
- [x] Zustand stores (auth, theme)
- [x] Axios + JWT interceptors
- [x] React Router v6 + guards
- [x] Login page, NotFound page
- [x] CORS on backend

## Phase 2: Dashboard + Design Overhaul ✅
- [x] **REFACTOR**: Design system → enterprise SaaS
  - [x] Removed all gradients, heavy shadows, flashy animations
  - [x] Compact 13px typography, Inter font
  - [x] Muted neutral colors, subtle borders
  - [x] Table utility classes (table-header-cell, table-cell, table-row)
  - [x] Minimal buttons (btn-primary = dark gray, not blue)
- [x] **REFACTOR**: Sidebar → 220px, compact, no collapse, text logo
- [x] **REFACTOR**: Header → 48px, minimal (only lang/theme toggles)
- [x] **REFACTOR**: Login → centered single-column, no split screen
- [x] **REFACTOR**: StatusBadge → dot + text only, no pill bg
- [x] **REFACTOR**: Constants → muted STATUS_CONFIG
- [x] Dashboard API service + types
- [x] Shipments API service + types
- [x] Batches API service + types
- [x] TanStack Query hooks (stats, recent shipments, recent batches)
- [x] Dashboard: 3 KPI stat cards (real API data, 30s polling)
- [x] Dashboard: Recent Shipments table (5 rows)
- [x] Dashboard: Recent Batches table (5 rows)
- [x] Skeleton loading states
- [x] TypeScript: 0 errors ✅

## Phase 3: Master Data (Nodes + Products) ✅
- [x] DataTable component (reusable, sortable, paginated)
- [x] FormModal component
- [x] Nodes CRUD page
- [x] Products CRUD page

## Phase 4: Users ✅
- [x] Users CRUD page
- [x] Role/Node filters

## Phase 5: Batches ✅
- [x] Batches List page
- [x] Batch Detail page
- [x] QR Display + Download/Print
- [x] Timeline Stepper
- [x] Sell batch dialog

## Phase 6: Shipments ✅
- [x] Shipments List page
- [x] Shipment Detail page
- [x] Create Shipment form
- [x] Receive Shipment action

## Phase 7: Incidents + Audit ✅
- [x] Incidents List page
- [x] Create Incident form
- [x] Audit Logs page

## Phase 8: Public Pages ✅
- [x] QR Scan page
- [x] Trace Timeline page
- [x] Map page

## Phase 9: Polish ✅
- [x] Reports Export
- [x] Mobile responsive
- [x] Edge cases

## Phase 10: Public Routes, Sidebar Scan & Change Password ✅
- [x] Preserve authenticated layout on public routes `/scan` and `/trace/:batchCode`
- [x] Add QR Scan link to Sidebar navigation
- [x] Implement backend `POST /auth/change-password` endpoint and service logic
- [x] Add frontend API and Sidebar "Change Password" modal & button
- [x] Verify everything compiles and works correctly

## Phase 11: Premium UI Redesign ✅
- [x] Refactor base design tokens and utility classes in `index.css`
- [x] Redesign core reusable components (`DataTable.tsx`, `TimelineStepper.tsx`, `QRDisplay.tsx`)
- [x] Refactor pages to apply new Zinc tokens (`AuditLogsPage.tsx`, `TracePage.tsx`, `LoginPage.tsx`, `DashboardPage.tsx`, `BatchesPage.tsx`, `BatchDetailPage.tsx`, `ShipmentsPage.tsx`, `ShipmentDetailPage.tsx`, `IncidentsPage.tsx`, `ScanPage.tsx`, `MapPage.tsx`, `NotFoundPage.tsx`)
- [x] Verify compilation and bundle builds successfully




