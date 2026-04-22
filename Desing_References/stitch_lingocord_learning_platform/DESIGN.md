---
name: TalkiTier Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#d6dae7'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#eaeefb'
  surface-container-high: '#e4e8f5'
  surface-container-highest: '#dee2ef'
  on-surface: '#171c25'
  on-surface-variant: '#454655'
  inverse-surface: '#2b313a'
  inverse-on-surface: '#ecf0fe'
  outline: '#767686'
  outline-variant: '#c6c5d7'
  surface-tint: '#3f4cda'
  primary: '#3d4ad8'
  on-primary: '#ffffff'
  primary-container: '#5865f2'
  on-primary-container: '#fffdff'
  inverse-primary: '#bec2ff'
  secondary: '#006a67'
  on-secondary: '#ffffff'
  secondary-container: '#74f7f1'
  on-secondary-container: '#00706d'
  tertiary: '#005dac'
  on-tertiary: '#ffffff'
  tertiary-container: '#0076d7'
  on-tertiary-container: '#fffdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bec2ff'
  on-primary-fixed: '#000569'
  on-primary-fixed-variant: '#222fc2'
  secondary-fixed: '#74f7f1'
  secondary-fixed-dim: '#53dad5'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504d'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004786'
  background: '#f9f9ff'
  on-background: '#171c25'
  surface-variant: '#dee2ef'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.55'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built for **TalkiTier**, a platform focused on tiered communication and community engagement. The brand personality is professional yet approachable, combining the reliability of a SaaS tool with the vibrant energy of a modern social community. 

The visual style follows a **Modern Corporate** aesthetic with **Glassmorphic** accents. It utilizes ample whitespace, clean lines, and soft gradients to reflect the data-driven "tiers" and the fluid nature of "talk." The emotional response should be one of clarity, modern sophistication, and inclusivity.

## Colors

The palette is anchored by the deep indigo-violet (#5865F2), which provides a stable foundation for the interface. To mirror the logo’s dynamic energy, we transition through a vibrant Dodgers Blue (#1E90FF) to a bright Turquoise/Teal (#48D1CC). 

- **Primary:** Used for brand consistency and key action states.
- **Secondary/Tertiary:** Utilized for high-energy accents, progress indicators, and "Tier" level distinctions.
- **Backgrounds:** Use ultra-light tints of the primary blue to maintain a "cool" professional temperature across the UI.
- **Gradients:** Use the three-stop brand linear gradient for primary call-to-actions, hero illustrations, and active states in navigation.

## Typography

This design system utilizes **Inter** exclusively to ensure a clean, systematic feel across all platforms. 

- **Headlines:** Use tight letter-spacing and bold weights to create a strong visual hierarchy.
- **Body Text:** Optimized for legibility with a generous line height.
- **Labels:** Used for metadata and tiered badges, often in semi-bold to distinguish them from standard body copy.

## Layout & Spacing

The design system employs a **12-column fluid grid** for web applications and a **single-column flex model** for mobile views. 

The rhythm is based on an **8px base unit**, ensuring alignment with the rounded corner language. Consistent margins of 24px (md) should be used for standard containers to maintain a spacious, professional feel. Whitespace is used strategically to separate different "tiers" of content without needing heavy dividers.

## Elevation & Depth

Depth is created through **Tonal Layers** and **Ambient Shadows**. Instead of harsh blacks, shadows are tinted with the primary indigo (#5865F2) at very low opacities (5-10%) to keep the UI feeling integrated and modern.

- **Level 1 (Base):** Flat surfaces with subtle 1px strokes in a light-blue grey.
- **Level 2 (Cards/Menus):** Soft, diffused shadows with a 12px blur and 4px Y-offset.
- **Level 3 (Modals/Overlays):** High-diffusion shadows with a subtle backdrop blur (12px) to create a "glass" effect that references the translucent nature of the logo’s chat bubble.

## Shapes

To match the friendly, circular chat bubble and the rounded ends of the "tier bars" in the logo, this design system uses a **Rounded (Level 2)** shape language.

- **Standard Buttons & Inputs:** 8px radius.
- **Cards & Large Containers:** 12px - 16px radius.
- **Badges/Chips:** Fully rounded (pill-shaped) to distinguish them as interactive or status-based elements.

## Components

- **Buttons:** Primary buttons use the brand linear gradient with white text. Secondary buttons use a primary-colored border with a subtle light-blue tint on hover.
- **Tier Badges:** Use a color-coded system based on the logo's gradient—lower tiers use the indigo, while higher "VIP" tiers use the vibrant teal.
- **Input Fields:** Soft 8px rounded corners with a subtle 1px stroke. The stroke transitions to the Dodgers Blue (#1E90FF) on focus.
- **Cards:** White backgrounds with a subtle 1px border (#E0E7FF). On hover, cards should lift slightly using a tinted ambient shadow.
- **Chat Bubbles:** Directly reference the logo’s shape—a rounded rectangle with one corner slightly more pointed or utilizing a subtle "tail" to indicate the speaker.
- **Progress Bars:** Use the multi-stop gradient (Indigo to Teal) to represent completion or tier-climbing.