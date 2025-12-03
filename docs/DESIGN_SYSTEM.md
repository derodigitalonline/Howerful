# Howerful Design Guidelines

## Design Approach: Gamified Productivity System Design
**Selected Framework:** Linear/Todoist-inspired productivity tool
**Rationale:** Utility-focused task management requires clean, distraction-free interface with emphasis on keyboard efficiency and visual clarity

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Base Interface):**
- Background: 222 15% 11% (deep charcoal)
- Surface: 222 13% 15% (elevated surface)
- Border: 222 10% 25% (subtle separation)

**Typography & UI:**
- Text Primary: 0 0% 95% 
- Text Secondary: 0 0% 65%
- Input Background: 222 13% 18%
- Focus Ring: Match active quadrant color

### B. Typography
**Font Stack:** Funnel Display for large text, Funnel Sans for smaller text

### C. Layout System
**Spacing Primitives:** Consistent use of 2, 3, 4, 6, 8, 12 units
- Container padding: p-8
- Card spacing: p-4
- Grid gap: gap-4
- Input field: p-3
- Micro spacing: space-y-2, space-y-3

**Grid Structure:**
- 2x2 equal quadrant grid (grid-cols-2)
- Responsive: Single column on mobile (grid-cols-1)
- Maximum container width: max-w-7xl

### D. Component Library

**Task Input Field:**
- Full-width text input with rounded corners (rounded-lg)
- Placeholder: "Type a task and press Enter..."
- Focus state: Ring color matches selected quadrant
- Height: h-12
- Background: Slightly elevated from base

**Quadrant Container:**
- Rounded corners: rounded-xl
- Border: 2px solid (quadrant color at 20% opacity)
- Background: Quadrant color at 3-5% opacity
- Minimum height: min-h-[400px]
- Padding: p-6

**Header Section:**
- App title with icon/logo
- Keyboard shortcut helper text
- Centered layout with max-w-4xl

**Visual Indicators:**
- Active quadrant selection: Glowing border (ring-2, quadrant color)
- Keyboard navigation hint: Arrow icons with subtle animation
- Empty state: Centered icon + text in muted color

### E. Interaction States

**Keyboard Focus Flow:**
1. Input field: Default focus with blue ring
2. Quadrant selection: Highlight with animated border glow
3. Task locked: Brief success flash animation (200ms)

**Hover States:**
- Task cards: Subtle elevation + border opacity increase
- Delete button: Fade in smoothly (transition-opacity duration-200)

**Animations:** Minimal and purposeful
- Task entry: Slide-in from top (150ms ease-out)
- Quadrant selection: Border pulse (300ms)
- Task deletion: Fade-out (200ms)

## Layout Specifications

**Application Structure:**
```
Header (centered, mb-8)
  - Title + Helper text

Task Input (mb-6)
  - Full-width input field
  - Active quadrant indicator below

Matrix Grid (2x2)
  - Do First (top-left)
  - Schedule (top-right) 
  - Delegate (bottom-left)
  - Eliminate (bottom-right)
```

**Responsive Behavior:**
- Desktop: 2x2 grid with generous spacing
- Tablet: 2x2 grid with reduced spacing
- Mobile: Stacked single column, quadrants full-width

## Key UX Principles
1. **Keyboard-First:** All actions accessible via keyboard
2. **Visual Feedback:** Clear indication of current state and quadrant
3. **Minimal Friction:** No modals, no confirmations, instant task creation
4. **Persistent State:** Tasks saved in localStorage, no login required
5. **Accessibility:** High contrast, clear focus states, keyboard navigation

## Images
No images required for this utility-focused application. The design relies on clean typography, color-coding, and layout structure for visual communication.