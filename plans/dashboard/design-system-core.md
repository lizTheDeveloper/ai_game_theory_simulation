# Subplan 0A: Design System Core

**Phase:** 0 (Foundation)
**Agent Assignment:** Agent 1
**Duration:** 1-2 days
**Priority:** HIGH (foundation for all UI components)
**Dependencies:** Phase -1 complete (API infrastructure exists)

---

## Context & Research

**Purpose:** Establish the foundational design system that all components will use

### Key Documents

- **Design Spec:** `docs/design/dashboard-redesign-spec.md` (Aesthetic guidelines)
- **Existing Design:** `/designs/00_design_system.md` (Elysium-inspired aesthetic)
- **Research:** `research/dashboard_visualization_best_practices_20251022.md` (Accessibility)

### Design Aesthetic

**Elysium-Inspired Far-Future:**
- **Colors:** Black/white/glowing cyan (primary), red (danger), amber (warning)
- **Typography:** Inter ultra-light (UI text) + JetBrains Mono (code/numbers)
- **Effects:** Glass morphism, glow shadows, smooth animations
- **Contrast:** Ultra-high contrast for data density
- **Accessibility:** WCAG AA compliant minimum

---

## Objectives

Create the core design system foundation:

1. **CSS Variables:** Color palette, spacing, typography scales
2. **Design Tokens:** Reusable values for consistency
3. **Animation Utilities:** Standard transitions and effects
4. **Glow Effects:** Signature neon cyan glow
5. **Glass Morphism:** Translucent panels with blur
6. **Responsive System:** Mobile breakpoints

---

## Technical Implementation

### 1. Global CSS Variables

**`src/styles/design-system.css`**
```css
:root {
  /* ========================================
     COLOR PALETTE
     ======================================== */

  /* Base */
  --color-black: #000000;
  --color-white: #FFFFFF;

  /* Grays */
  --color-gray-50: #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E5E5E5;
  --color-gray-300: #D4D4D4;
  --color-gray-400: #A3A3A3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-700: #404040;
  --color-gray-800: #262626;
  --color-gray-900: #171717;
  --color-gray-950: #0A0A0A;

  /* Primary (Cyan Glow) */
  --color-primary: #00E5FF;
  --color-primary-light: #4DFFFF;
  --color-primary-dark: #00B8CC;

  /* Status Colors */
  --color-success: #00FF9D;
  --color-warning: #FFB800;
  --color-danger: #FF3366;
  --color-info: #00E5FF;

  /* Paradigm Colors */
  --color-western-liberal: #00E5FF; /* Cyan */
  --color-development: #00FF9D;     /* Green */
  --color-ecological: #4DFF88;      /* Light Green */
  --color-indigenous: #FFB800;      /* Amber */

  /* Semantic Colors */
  --color-utopia: #00FF9D;
  --color-hybrid: #FFB800;
  --color-dystopia: #FF3366;

  /* ========================================
     SPACING SCALE (8px base)
     ======================================== */

  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */

  /* ========================================
     TYPOGRAPHY
     ======================================== */

  /* Font Families */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Font Weights */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* ========================================
     EFFECTS
     ======================================== */

  /* Glow Shadows */
  --glow-sm: 0 0 8px currentColor;
  --glow-md: 0 0 16px currentColor;
  --glow-lg: 0 0 24px currentColor;
  --glow-xl: 0 0 32px currentColor;

  /* Box Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.25rem;   /* 4px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-full: 9999px;

  /* Blur */
  --blur-sm: 4px;
  --blur-md: 8px;
  --blur-lg: 16px;
  --blur-xl: 24px;

  /* ========================================
     ANIMATION
     ======================================== */

  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* ========================================
     BREAKPOINTS
     ======================================== */

  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* ========================================
   DARK MODE (default)
   ======================================== */

body {
  background-color: var(--color-black);
  color: var(--color-white);
  font-family: var(--font-ui);
  font-weight: var(--font-extralight);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ========================================
   UTILITY CLASSES
   ======================================== */

/* Glow Effects */
.glow-cyan {
  color: var(--color-primary);
  text-shadow: var(--glow-md);
}

.glow-sm {
  box-shadow: var(--glow-sm);
}

.glow-md {
  box-shadow: var(--glow-md);
}

.glow-lg {
  box-shadow: var(--glow-lg);
}

/* Glass Morphism */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(var(--blur-lg));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(var(--blur-lg));
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Animations */
.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.slide-down {
  animation: slideDown var(--duration-normal) var(--ease-out);
}

.slide-left {
  animation: slideLeft var(--duration-normal) var(--ease-out);
}

.slide-right {
  animation: slideRight var(--duration-normal) var(--ease-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideLeft {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideRight {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Pulsing Glow (for status indicators) */
.pulse-glow {
  animation: pulseGlow 2s var(--ease-in-out) infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: var(--glow-sm);
  }
  50% {
    box-shadow: var(--glow-lg);
  }
}

/* ========================================
   FOCUS STATES (Accessibility)
   ======================================== */

*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ========================================
   SCROLLBARS (Styled)
   ======================================== */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-950);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-700);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-600);
}
```

### 2. Tailwind Configuration

**`tailwind.config.ts`** (Update)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: 'var(--color-black)',
        white: 'var(--color-white)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        paradigm: {
          western: 'var(--color-western-liberal)',
          development: 'var(--color-development)',
          ecological: 'var(--color-ecological)',
          indigenous: 'var(--color-indigenous)',
        },
      },
      fontFamily: {
        ui: 'var(--font-ui)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        'glow-sm': 'var(--glow-sm)',
        'glow-md': 'var(--glow-md)',
        'glow-lg': 'var(--glow-lg)',
        'glow-xl': 'var(--glow-xl)',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--ease-out)',
        'slide-up': 'slideUp var(--duration-normal) var(--ease-out)',
        'pulse-glow': 'pulseGlow 2s var(--ease-in-out) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3. Import in Global Styles

**`src/app/globals.css`** (Update)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './styles/design-system.css';

/* Additional global styles */
html,
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

#__next {
  min-height: 100vh;
}
```

---

## Implementation Tasks

### Step 1: Create Design System CSS
- [ ] Create `src/styles/design-system.css` with all CSS variables
- [ ] Add color palette (black/white/cyan/red/amber)
- [ ] Add spacing scale (8px base)
- [ ] Add typography system (Inter + JetBrains Mono)
- [ ] Add effect utilities (glow, glass, animations)

### Step 2: Update Tailwind Configuration
- [ ] Extend Tailwind with design tokens
- [ ] Add custom colors
- [ ] Add custom spacing
- [ ] Add custom animations

### Step 3: Import in Global Styles
- [ ] Update `src/app/globals.css` to import design system
- [ ] Ensure variables are available globally

### Step 4: Testing
- [ ] Verify CSS variables are defined (`console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary'))`)
- [ ] Test glow effects on sample element
- [ ] Test glass morphism background
- [ ] Test animations (fade-in, slide-up, etc.)
- [ ] Verify accessibility (focus states, WCAG AA contrast)

---

## Acceptance Criteria

**✅ Design system is complete when:**

1. **CSS Variables work:**
   - All color variables defined and accessible
   - Spacing scale available (8px base)
   - Typography system loaded (Inter + JetBrains Mono)
   - Effect variables (glow, shadows, blur) defined

2. **Tailwind extended:**
   - Custom colors work in Tailwind classes (`bg-primary`, `text-danger`)
   - Custom spacing works (`p-4`, `m-8`)
   - Custom animations work (`animate-fade-in`, `animate-pulse-glow`)

3. **Utility classes work:**
   - `.glow-cyan` adds cyan glow
   - `.glass` creates glass morphism effect
   - `.fade-in`, `.slide-up` trigger animations
   - `.pulse-glow` creates pulsing effect

4. **Accessibility:**
   - Focus states visible (2px cyan outline)
   - WCAG AA contrast ratios met (>4.5:1 for text)
   - Keyboard navigation supported

5. **Cross-browser:**
   - Works in Chrome, Firefox, Safari
   - Scrollbars styled consistently
   - Fonts load correctly

---

## Deliverables

### Files Created
- `src/styles/design-system.css` (~400 lines)

### Files Modified
- `tailwind.config.ts` (~80 lines, extended)
- `src/app/globals.css` (~10 lines, import added)

### Exports
All CSS variables available globally via `:root`

---

## Coordination

**Check-in Channel:** `.claude/chatroom/channels/implementation.md`

**Dependencies:** Phase -1 complete (can work in parallel with other Phase 0 agents)

**Status Updates:**
- [ ] Post `[STARTED]` when beginning
- [ ] Post `[IN-PROGRESS]` with section completion updates
- [ ] Post `[COMPLETED]` with test results

**Example Check-in:**
```markdown
---
**agent-design-system** | 2025-10-23 01:00 | [IN-PROGRESS]

Completed color palette and spacing system, adding animations.

**Progress:**
✅ Color variables (black/white/cyan/red/amber)
✅ Spacing scale (8px base)
✅ Typography (Inter + JetBrains Mono)
🔄 Effects (glow, glass, animations)
⏳ Tailwind config (pending)
⏳ Global CSS import (pending)

**Next:** Complete animation keyframes, update Tailwind config
---
```

---

## Dependencies for Other Agents

This subplan ENABLES:
- **Subplan 0B** (Base Components) - needs design tokens
- **All Phase 1+ UI work** - needs design system

All component implementations depend on this foundation.

---

## Notes

**Design Philosophy:** Ultra-high contrast, minimal color (black/white/cyan), data-dense

**Performance:** CSS variables have negligible performance impact

**Future Enhancement:** Add dark/light mode toggle (currently dark only)

**Accessibility:** WCAG AA minimum, keyboard navigation required

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation
