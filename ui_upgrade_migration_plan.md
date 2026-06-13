# UI Redesign & Corporate Migration Plan for AviralVidhya

This document outlines the migration plan to upgrade the **AviralVidhya** frontend interface (`aviral-ui`) from its current layout into a highly polished, premium corporate-style School ERP software. This upgrade is designed to enhance the visual appeal of the software to make it ready for enterprise sales to educational institutions, while ensuring that all existing multi-tenant contexts and backend API integrations remain fully functional.

---

## 📋 Executive UI Objectives

1. **Enterprise Aesthetic**: Transition from simple card layouts to a premium, SaaS-ready dashboard structure (using a responsive collapsible sidebar + top header layout).
2. **Visual Hierarchy & Premium Design**: Introduce cohesive styling with professional typography (e.g., `Plus Jakarta Sans` or `Inter` instead of system fonts), sleek borders, curated color palettes, elegant dark-mode-ready cards, and subtle micro-animations.
3. **White-Label Customization**: Retain the dynamic school branding colors (Indigo, Orange, Emerald, Blue, Rose, Amber) while upgrading their visual styling to feel modern (e.g., matching border shadows, soft-glow backgrounds, and clean badges).
4. **Preserve Business Logic & APIs**: Ensure absolutely zero modifications to the fetch wrappers, state handlers, translation features (English/Hindi), and data model binds defined in `src/api.ts` and `src/types.ts`.

---

## 🏁 Phase-wise Implementation Status Checkpoints

Use this section to track implementation status. Mark completed tasks with `[x]` and in-progress tasks with `[/]`. Update the `Status:` field at the header of each phase as you transition.

### 🟢 Phase 1: CSS Design System Baseline (Status: `Completed`)
- [x] Update [index.css](file:///c:/github/aviralvidhya/aviral-ui/src/index.css) with new variables (`--surface-bg`, `--surface-card`, `--border-default`, `--text-main`, etc.).
- [x] Configure custom corporate typography (`Inter` / `Plus Jakarta Sans` imports).
- [x] Modernize utility classes (`.glass-panel`, `.btn-primary`, and color maps).

### 🟢 Phase 2: Navigation Shell & Login Makeover (Status: `Completed`)
- [x] Redesign multi-tenant login gate in [App.tsx](file:///c:/github/aviralvidhya/aviral-ui/src/App.tsx) into a side-by-side marketing/auth split layout.
- [x] Refactor [App.tsx](file:///c:/github/aviralvidhya/aviral-ui/src/App.tsx) core component structure into a Sidebar + Header Shell.
- [x] Ensure responsive menu toggles on mobile viewports.

### 🟢 Phase 3: Super Admin & School Admin Dashboards (Status: `Completed`)
- [x] Redesign [SuperAdminDashboard.tsx](file:///c:/github/aviralvidhya/aviral-ui/src/components/SuperAdminDashboard.tsx) (tenant control list, stats, modals).
- [x] Modernize [SchoolAdminDashboard.tsx](file:///c:/github/aviralvidhya/aviral-ui/src/components/SchoolAdminDashboard.tsx) tabs (Dashboard, Attendance, Fees, Students, Teachers, Circulars, Timetable).
- [x] Implement slide-out panels/modals for profile creation instead of inline tables.

### ⚪ Phase 4: Teacher & Parent Portals (Status: `Pending`)
- [ ] Revamp [TeacherDashboard.tsx](file:///c:/github/aviralvidhya/aviral-ui/src/components/TeacherDashboard.tsx) (period schedule timeline, custom attendance marking button states, and homework form).
- [ ] Revamp [ParentPortal.tsx](file:///c:/github/aviralvidhya/aviral-ui/src/components/ParentPortal.tsx) (scorecard metrics, fee timelines, payment checkout pop-up, notice feeds, and homework checks).

### ⚪ Phase 5: Verification & Quality Assurance (Status: `Pending`)
- [ ] Run TypeScript linting check (`npm run lint`).
- [ ] Compile production build check (`npm run build`).
- [ ] Multi-role credential logging checks (Super Admin, School Admin, Teacher, Parent).

---

## 🎨 Design System & Styling Upgrades

The existing design system in `src/index.css` relies on `@theme` configurations of Tailwind CSS v4. The first phase of migration must update `src/index.css` to build a professional design foundation.

### 1. Updated Core CSS Tokens

We will refine the base theme colors to support soft backgrounds, neutral text systems, and specific branding accents:

```css
@theme {
  --font-sans: "Inter", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer base {
  :root {
    /* Corporate Light Theme Variables */
    --surface-bg: #f8fafc;            /* Clean light grey backdrop */
    --surface-card: #ffffff;          /* Flat pure white for panels */
    --border-subtle: #f1f5f9;         /* Very light divider lines */
    --border-default: #e2e8f0;        /* Card boundaries and borders */
    --text-main: #0f172a;             /* High contrast deep slate text */
    --text-muted: #475569;            /* Secondary information slate grey */
    --text-placeholder: #94a3b8;      /* Label placeholders */
    
    /* Branding Core Accents */
    --primary: #2563eb;               /* Enterprise Sapphire Blue */
    --primary-hover: #1d4ed8;
    --primary-soft: rgba(37, 99, 235, 0.05);
    
    /* Semantic Colors */
    --success: #10b981;               /* Emerald green for paid fees and present marks */
    --warning: #f59e0b;               /* Amber for partial balances / leaves */
    --danger: #ef4444;                /* Rose red for outstanding dues and absences */
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
  }
}
```

### 2. Styling Rules
* **Borders & Radii**: Replace sharp corners with rounded cards (`rounded-xl` or `rounded-2xl`). Avoid double borders. All borders should use `--border-default` or `--border-subtle`.
* **Glow & Glassmorphism**: Remove neon color borders. Instead of `.glass-panel`, use clean cards with solid white background, high-blur backdrop filters, and subtle, soft shadows (`box-shadow: var(--shadow-md)`).
* **Buttons**: Implement uniform button styles. Principal CTA buttons must use corporate gradients or solid filled colors, rounded edges, and small shadow transitions on hover.

---

## 🏛️ Layout Architecture (The Sidebar Shell)

The current layout stacks the header and dashboard content in a single vertical stream. The new layout must implement a classic enterprise SaaS multi-role structure:

```
+-------------------------------------------------------------------------+
|  [Sidebar]       |  [Top Header]                                         |
|  AviralVidhya     |  🏫 School Name | Active Role Switcher | [Sign Out]  |
|  [Logo]           +-----------------------------------------------------+
|                  |                                                      |
|  - Dashboard      |  [Main Canvas]                                       |
|  - Students       |  Contains the active dashboard tab content           |
|  - Teachers       |                                                      |
|  - Fees Ledger    |                                                      |
|  - Timetable      |                                                      |
|                  |                                                      |
+-------------------------------------------------------------------------+
```

### Sidebar Navigation Refactoring
1. Move the sidebar toggle options into a responsive menu that collapses on tablet/mobile views.
2. Render role-based navigation links with consistent Lucide icons (`Sliders`, `Users`, `UserCheck`, `DollarSign`, `Calendar`, `Award`, `FileText`).
3. Active states in the sidebar should use the school's whitelisted theme color (e.g. `bg-blue-50/80 text-blue-700` for the Blue theme) as a subtle background highlight with a 3px border-left accent.

---

## 🚀 View-by-View Redesign Roadmap

### 1. Landing & Portal Login Gate (`src/App.tsx`)
* **Layout**: Change from a centered box form to a split-screen page layout.
  * **Left Panel (60%)**: A clean marketing introduction detailing ERP capabilities (Student management, circular notices, digital LMS, fees books) with vector badges and feature highlights.
  * **Right Panel (40%)**: The multi-tenant authentication gate.
* **School Code Input**: Make the "Enter School Access Code" screen look premium. When a valid code is submitted, show the resolved school's name with an emoji icon, transitioning smoothly to the password phase.
* **Credential Forms**: Remove default inputs. Use elegant inputs with floating label animations and visual outline rings matched to the resolved school's brand color. Add a password visibility toggle (Eye/EyeOff icon).
* **Role Redirection**: Maintain the existing auto-role detection based on username lookup. (For example, typing `principal@...` triggers the `school_admin` dashboard without forcing the user to pick their role manually).

### 2. Super Admin Dashboard (`src/components/SuperAdminDashboard.tsx`)
* **Statistics Grid**: Create four clean cards at the top using neutral, slate backdrops. Display:
  * Total Registered Tenants (Schools)
  * Estimated billing statistics
  * Platform traffic
  * Operational API node statuses (e.g. Database, Auth services)
* **School Directory**: Instead of standard grid cards, implement a clean data table showing:
  * School Name and Code
  * State & Registration date
  * Credentials lookup (with a small eye-icon toggle to hide/show passwords and a copy-to-clipboard button)
  * Feature Module Toggles: Instead of standard checkbox controls, style these as custom modern UI toggle switches (slide toggle icons).
* **Add Tenant Panel**: Relocate the school creation form to a collapsible sliding side-panel (drawer) or a clean modal triggered by a "+ Register School" button.

### 3. School Admin Dashboard (`src/components/SchoolAdminDashboard.tsx`)
This is the core workspace containing multiple modules. We must style each tab separately:
* **Dashboard Tab**:
  * Show key metrics with custom SVG progress wheels: Present attendance rate for teachers vs students, Collected Fees vs Outstanding Dues, and active notices count.
  * Leave Application Review widget: List requests as small cards with Accept (green check) and Reject (red close) inline actions.
* **Daily Attendance Tab**:
  * Display a clear list of classes with percentage stats. Provide buttons to download reports or trigger notifications.
* **Fees & Balances Tab**:
  * Implement clean invoice rows. Replace simple tags with formatted status pills (`Paid` = Emerald bg, `Partial` = Amber bg, `Unpaid` = Red bg).
  * Logging Expenses: Include a quick form showing category dropdowns and input logs.
* **Students Index & Faculty Directory Tabs**:
  * Use a clean data table containing profile pictures (placeholders/avatars), name, class/subject, roll number/email, and credentials copy indicators.
  * Integrate search bars with Lucide filter options (e.g., search student name or filter by Class IX/X).
* **Target Notices Tab**:
  * Style the notices creator with rich-text textareas. Give notice category types (academic, fees, holiday, events) distinct colors and badges.

### 4. Teacher Dashboard (`src/components/TeacherDashboard.tsx`)
* **My Classes Overview**: Display current day periods with a timeline layout.
* **Attendance Ledger**:
  * Create a clean grid showing student names.
  * Integrate interactive status button sets: `Present` (green outline/solid fill) and `Absent` (red outline/solid fill). Teachers can click to toggle, firing the existing `onMarkAttendance` backend hook under the hood.
* **Homework Composer**:
  * Standardize form fields. When homework is successfully added, show a non-intrusive toast success alert instead of basic alert modals.

### 5. Parent Portal (`src/components/ParentPortal.tsx`)
* **Header / Branding Banner**: Display the school's whitelabeled logo and student credentials clearly.
* **Student Scorecard Card**: Show attendance ratios using a sleek progress ring.
* **Fee Payment Section**:
  * Display total outstanding fees in a billing detail box.
  * Integrate an elegant mock checkout dialog where parents can choose simulated payment types (UPI, Card, Net Banking), completing the transaction via the existing `onFeePayment` callback handler.
* **Homework Checklist**:
  * List homework tasks with strike-through text transitions when parents mark them as complete.

---

## 🔒 Constraints & Rules for AI Agents

To ensure the system works seamlessly after the makeover, follow these rules strictly:

1. **Do Not Alter API Signatures**:
   * All functions imported from `src/api.ts` (e.g., `login`, `fetchSchools`, `updateStudent`, `createNotice`, etc.) must keep their exact parameter signatures and return types.
2. **Preserve Multi-Tenant Filtering Key**:
   * Dashboard renders must isolate items based on `schoolId` filter rules. Do not bypass or remove context constraints:
     ```typescript
     const isolatedStudents = students.filter(s => s.schoolId === schoolId);
     ```
3. **Preserve State & Callback Wrappers**:
   * All callback handlers provided as properties from `App.tsx` (e.g., `onAddStudent`, `onAddNotice`, `onFeePayment`, `onUpdateSchoolFeatures`) must remain wired to form submission endpoints.
4. **Preserve Translation Contexts**:
   * The bilingual support switch (`isAdminHindi`) and translation dictionaries (`t.en` and `t.hi` or student circular notice multi-lingual properties) must remain fully intact.
5. **No Placeholders**:
   * If any image, mock chart, or logo asset is added, use inline SVGs, Lucide icons, or assets generated in the workspace. Avoid using external web links that might fail to load.

---

## 🧪 Verification & QA Testing Protocol

After completing UI edits, run the following automated and manual tests to verify code compliance:

### 1. Build and Compile Check
Run the TypeScript linter to verify that no interface type signatures are broken:
```powershell
npm run lint
```
Compile the production bundle to verify compilation is free of build errors:
```powershell
npm run build
```

### 2. Multi-Role Account Verification
Verify the visual styling and database reads by logging in with each role:
* **Super Admin**:
  * Access credentials: Check `App.tsx` or backend defaults (e.g., `superadmin@system.local`).
  * Verify the school registrar form, tenant feature flags, and statistics dashboard.
* **School Admin**:
  * Access credentials: Create a test school in the Super Admin dashboard and use the generated credentials to log in.
  * Verify student and teacher registration, billing records, notice circulars, and leaves approvals.
* **Teacher**:
  * Access credentials: Create a teacher account under the test school and log in.
  * Verify attendance registers, homework composition, and class lists.
* **Parent**:
  * Access credentials: Check student parents generated by the School Admin.
  * Verify attendance records, circular notices, homework updates, and fee checkout forms.
