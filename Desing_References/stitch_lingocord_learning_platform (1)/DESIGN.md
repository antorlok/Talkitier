---
name: LinguDiscord System
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#454655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#767686'
  outline-variant: '#c6c5d7'
  surface-tint: '#3f4cda'
  primary: '#3d4ad8'
  on-primary: '#ffffff'
  primary-container: '#5865f2'
  on-primary-container: '#fffdff'
  inverse-primary: '#bdc2ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#00657d'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f7e97'
  on-tertiary-container: '#fcfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000668'
  on-primary-fixed-variant: '#222fc2'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#b7eaff'
  tertiary-fixed-dim: '#87d1ec'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e61'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  section-padding: 80px
---

## Brand & Style

The LinguDiscord brand is built on the intersection of structured education and the dynamic, social energy of Discord. It targets young adults and tech-savvy learners who find traditional language apps too sterile or isolating. 

The design style is **Corporate / Modern** with a **Social-First** twist. It utilizes the "Discord Blurple" as a bridge between professional SaaS aesthetics and gaming-community familiarity. The UI should evoke a sense of high-energy collaboration, accessibility, and community-driven progress. It balances a clean, systematic layout with playful elements like floating status cards and vibrant iconography to ensure the experience feels approachable rather than academic.

## Colors

The palette is anchored by a high-fidelity "Discord Blurple" (`#5865F2`), which serves as the primary brand signal. We utilize a "Fidelity" variant approach where the primary action color is a slightly deeper Indigo (`#3D4AD8`) for better contrast against light surfaces.

The surface system uses a refined scale of cool grays. **Surface Lowest** (Pure White) is reserved for interactive cards and panels, while the **Background/Surface** (`#F8F9FB`) provides a soft, low-glare canvas for content. Secondary and Tertiary colors are used sparingly for categorization (e.g., specific Discord roles or mentor statuses) to prevent visual overwhelm.

## Typography

The system relies exclusively on **Inter** to maintain a clean, utilitarian, and highly readable interface across all screen sizes. 

- **Headlines** utilize tight letter-spacing and bold weights to create strong visual hierarchy and a modern "startup" feel.
- **Body text** uses a generous line-height (1.6) to ensure long-form descriptions of methodologies are comfortable to read.
- **Labels** are emphasized with semi-bold or bold weights and occasionally increased letter-spacing in the `label-sm` tier to ensure clarity in navigation and small UI badges.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy with a maximum content width of 1280px. A standard 8px base unit drives all spacing decisions.

Sections are separated by significant vertical padding (80px to 128px) to allow the content to breathe. Interior card layouts use a 24px gutter to maintain clear separation between features. Content is often organized in a 2-column hero split or a 4-column feature grid to maximize scanability.

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layers** and **Ambient Shadows**. 

1.  **Base Layer:** The background surface (`#F8F9FB`).
2.  **Interactive Layer:** White surfaces (`#FFFFFF`) with a very soft, diffused shadow (`0 4px 20px rgba(0,0,0,0.04)`) to indicate elevation.
3.  **Floating Elements:** Elements like status indicators or "connected" badges use a slightly more aggressive shadow and semi-transparent backdrops with a blur effect (10px-12px) to simulate presence over the main UI.
4.  **Borders:** Subtle `outline-variant` borders (`#C6C5D7`) are used on cards and inputs to provide structural definition without the weight of heavy shadows.

## Shapes

The shape language is consistently **Rounded**, reflecting a friendly and modern community vibe. 

- **Standard Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Cards & Panels:** 0.75rem to 1rem (12px-16px) corner radius to create a soft, contained look.
- **Badges & Tags:** Full pill-shaped rounding for high-contrast secondary information.
- **Images:** Always utilize 1rem or 1.5rem rounding to match the softness of the surrounding UI containers.

## Components

### Buttons
- **Primary:** Discord Blurple background, white text. Soft hover state (opacity or slight darken). 
- **Secondary:** Surface container background with a subtle border.
- **Interactive States:** All buttons should include a subtle `active:scale-95` transition for tactile feedback.

### Input Fields & Selects
- Use a light background (`surface-container-low`) with a thin border. 
- On focus: Border changes to Primary Indigo with a soft 20% opacity glow (ring).

### Cards
- Interactive cards use a white background and transition upward (`-translate-y-1`) on hover.
- Feature cards utilize iconography in colored "soft-fixed" containers (e.g., Primary Fixed or Secondary Fixed) to categorize functionality.

### Chips / Badges
- Used for Discord roles and community stats. They utilize semi-transparent backgrounds of their respective role color with high-contrast text.

### Navigation
- A fixed top navigation bar using `backdrop-blur-md` and 90% opacity to maintain context of the scroll position while providing clear access to links.