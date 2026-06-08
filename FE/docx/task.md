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

## Phase 12: SaaS Design System & UI/UX Guidelines ✅
- [x] Analyze existing UI/UX issues and document recommendations
- [x] Create `design-tokens.ts` for theme constants
- [x] Create `theme.css` with CSS custom properties (Light/Dark variables)
- [x] Create `tailwind.config.ts` config extension
- [x] Create `typography.ts` and `spacing.ts` modules
- [x] Generate comprehensive `ui-guidelines.md` covering architecture, screen layouts, enterprise UX, and AI capabilities
- [x] Verify compilation and bundle builds successfully

## Phase 13: UI v3 Re-architecture Design Documentation ✅
- [x] Create folder `FE/docx/UI v3/`
- [x] Generate `redesign_analysis.md`
- [x] Generate `architecture_plans.md`
- [x] Generate `responsive_plans.md`
- [x] Generate `design_system_plans.md`
- [x] Generate `component_specifications.md`
- [x] Generate `layout_blueprints.md`
- [x] Generate `ux_decisions.md`
- [x] Generate `migration_strategy.md`
- [x] Generate `implementation_roadmap.md`
- [x] Generate `visual_philosophy.md`
- [x] Generate `dashboard_redesign_strategy.md`
- [x] Generate `responsive_behavior_documentation.md`

## Phase 14: UI v3 Foundation & Design System Setup ✅
- [x] Implement advanced themes and CSS variables in `theme.css`
- [x] Configure Tailwind with extended 3D shadows and custom font scales
- [x] Set up new folder structure in `FE/src` (core, features, design-system, shared)

## Phase 15: App Shell v3 & Navigation Rebuild ✅
- [x] Rebuild layout shells (`AppShellV3`, `SidebarV3`, `HeaderV3`)
- [x] Implement Keyboard Command Palette (`Ctrl + K`)
- [x] Implement AI Assistant Dock (`Ctrl + A` or toggle button)
- [x] Integrate responsive bottom navigation bar for mobile portrait layout

## Phase 16: Feature Workspaces Redesign ✅
- [x] Rebuild Dashboard (AI-native command cockpit)
- [x] Rebuild Operations Workspace (Batches + Shipments + Products)
- [x] Rebuild Logistics & Maps Workspace (Fleet + Drivers + Maps)
- [x] Rebuild Admin & Settings Workspace (Users + Nodes + Audit Logs + Settings)

## Phase 17: Verification & Launch ✅
- [x] Perform E2E navigation and visual validation

## Phase 18: LoginPage Redesign ✅
- [x] Add keyframe animations to `FE/src/index.css`
- [x] Implement split-screen layout in `FE/src/pages/auth/LoginPage.tsx`
- [x] Integrate mock supply chain telemetry visualizer
- [x] Add Quick-Select demo accounts pill interface
- [x] Verify build and compile with no errors

## Phase 19: Road Routing Integration (Yêu Cầu 1) ✅
- [x] Upgrade `routing.ts` with in-memory caching and optimized Vietnam validation
- [x] Update `MapPage.tsx` to handle route rendering using cached OSRM route data
- [x] Integrate routing in `TracePage.tsx` for segmented shipping path tracing
- [x] Run verification tests and compile checks

## Phase 20: Optimize Maps & Fix Route Flash (Lag & Bird-fly Fix)
- [x] Refactor `MapPage.tsx` to initialize Leaflet Map once, reusing it via refs and L.layerGroup
- [x] Modify `MapPage.tsx` shipment drawing to fetch OSRM route first and only draw road path (solid) on resolve
- [x] Modify `TracePage.tsx` to draw road path only after Promise.all resolves
- [x] Verify compilation and execution (npx tsc and build)

## Phase 21: Date Range & Total Value Support for Reports (Yêu Cầu 4)
- [x] Update DTO and Controller in BE to support optional `startDate` and `endDate` parameters
- [x] Update `getDateRange` and `exportReport` in BE service to query by custom date range and calculate total value
- [x] Add "Total value" column and sum footer row in CSV and PDF exports
- [x] Update frontend `DashboardPage.tsx` to add Date Pickers for custom range in report export widget
- [x] Run backend tests and compile/build check for BE and FE

## Phase 22: CSV & PDF Report Styling & Clear Date Range (Yêu Cầu 4 Refinement) ✅
- [x] Display clear resolved date range boundaries ( Từ ngày ... Đến ngày ...) in both PDF and CSV metadata headers
- [x] Beautify CSV output using structured key-value cells (no wide ASCII separators) to ensure seamless Excel/Sheets parsing
- [x] Upgrade PDF layout styling using rounded boxes, Slate/Indigo professional palette, increased row heights with vertical text centering, and a neat metadata summary grid
- [x] Remove the extra trailing closing brace from the service file to fix syntax errors
- [x] Verify successful compilation and build of the backend

## Phase 23: Premium Excel (XLSX) Export Support ✅
- [x] Install `exceljs` library in backend to support generation of styled binary spreadsheets
- [x] Implement Excel (.xlsx) report format generation with slate headers, zebra rows, double-border total footers, and auto column widths
- [x] Configure numeric and currency cells to export as real numbers with Excel custom formats (`#,##0" VND"` and `#,##0`) instead of text
- [x] Integrate standard Excel SUM formulas (e.g. `=SUM(G15:G30)`) for the total row computation
- [x] Extend Validation in `ExportReportDto` and controller to support `xlsx` format option
- [x] Add Excel (XLSX) option to the frontend `DashboardPage.tsx` format dropdown and state
- [x] Verify successful frontend and backend TypeScript compilation and builds

## Phase 24: Brevo Email Notification & Created User Audit Logging (Yêu Cầu 5) ✅
- [x] Add Brevo API key and Admin sender details to backend `.env` file
- [x] Create `MailService` and its encapsulating NestJS module `MailModule`
- [x] Register `MailModule` in `UsersModule` imports
- [x] Inject `MailService` into `UsersService` and call it on Admin user creation
- [x] Enhance global `AuditLogInterceptor` to capture nested response body entity IDs
- [x] Verify compilation and test suite execution


