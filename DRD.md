# Design Requirements Document (DRD) — TalentBridge_V2

## 1. Design System & Visual Philosophy
TalentBridge_V2 utilizes a modern, technical, clean design language engineered for readability, rapid data scanning, and high contrast. The visual system is role-color-coded to give immediate visual context to the active user persona.

---

## 2. Role-Based Color Palette

### 2.1 Job Seeker Accent Theme: Blue
- **Primary Accent:** `#2563EB` (Tailwind Blue-600)
- **Primary Hover:** `#1D4ED8` (Blue-700)
- **Background Tint:** `#EFF6FF` (Blue-50)
- **Border / Subtle:** `#BFDBFE` (Blue-200)

### 2.2 Recruiter Accent Theme: Emerald Green
- **Primary Accent:** `#059669` (Tailwind Emerald-600)
- **Primary Hover:** `#047857` (Emerald-700)
- **Background Tint:** `#ECFDF5` (Emerald-50)
- **Border / Subtle:** `#A7F3D0` (Emerald-200)

### 2.3 Company Command Center Accent Theme: Deep Slate & Indigo
- **Primary Accent:** `#4F46E5` (Tailwind Indigo-600)
- **Secondary Accent:** `#6366F1` (Indigo-500)
- **Background Dark Mode:** `#0F172A` (Slate-900)
- **Card Background:** `#1E293B` (Slate-800)
- **Text Contrast:** `#F8FAFC` (Slate-50) / `#94A3B8` (Slate-400)

---

## 3. Typography & Spacing
- **Font Stack:** System Sans-Serif (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`)
- **Scale:**
  - `Display / H1`: 24px - 28px, Semi-Bold (600)
  - `Section / H2`: 18px - 20px, Medium (500)
  - `Card / H3`: 15px - 16px, Semi-Bold (600)
  - `Body / Standard`: 14px, Regular (400)
  - `Caption / Badge`: 11px - 12px, Medium (500)
- **Elevation & Radius:**
  - Standard Card Radius: `10px`
  - Pill / Badge Radius: `9999px`
  - Shadows: Subtle box shadows (`0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`)

---

## 4. Layout Specifications

### 4.1 Global Layout Architecture
- **Navbar (Top Sticky, 60px height):**
  - Left: Logo icon + "TalentBridge V2" with role indicator badge.
  - Right: Notification Bell (with red unread count badge), current user pill (name, avatar initials, role badge), and "Logout" button.
- **Main View Area:**
  - Standard multi-column desktop layout (Sidebar navigation or tabbed controls on left, content grid on right).

### 4.2 Component Specs

#### Notification Dropdown
- Max-width: 360px, floating right aligned below the bell icon.
- Two segmented tab triggers:
  - `Messages (n)` with Mail icon.
  - `Calendar (n)` with Calendar icon.
- List item: Icon, title, message snippet, relative timestamp, unread indicator dot.
- Clicking an item marks it as read and triggers appropriate view navigation.

#### Month Calendar Grid
- Clean 7-column grid layout (Sun - Sat).
- Month header with Previous / Next navigation controls and current month/year label.
- Date cells:
  - Standard day number top-left.
  - Active booking badges placed inside the cell.
  - Event badges color-coded by type:
    - `Interview`: Amber / Orange tag (`#F59E0B`)
    - `Meeting`: Blue tag (`#3B82F6`)
    - `Call`: Purple tag (`#8B5CF6`)
- Click interaction: Opens an event detail popover / modal with full notes and participant details.

#### Direct Message Chat Interface
- Split view layout:
  - Left column (300px): Conversation list with avatar, name, last message preview, timestamp, and unread bubble.
  - Right column: Active conversation pane.
    - Header: Recipient name, title, online/offline status.
    - Message history: Scrollable timeline with sender bubbles (right aligned, role accent color) vs receiver bubbles (left aligned, neutral gray/white).
    - Footer: Input bar with text field and "Send" button (Enter to submit).

#### Visual Funnel & Analytics (View 3)
- Funnel chart rendered using visual bar blocks with relative percentages:
  - Stage 1: `Applied` (e.g. 4 candidates - 100% width)
  - Stage 2: `Interview` (e.g. 2 candidates - 50% width)
  - Stage 3: `Offer` (e.g. 1 candidate - 25% width)
- Metric KPI cards: High-contrast numbers, trend badges, and clear descriptive subtext.

---

## 5. Responsive Behavior
- Primary layout target: Desktop and laptop displays (1280px - 1920px width).
- Flexible grids with CSS Grid and Flexbox ensuring no horizontal scrollbars down to 1024px.
