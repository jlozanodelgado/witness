---
name: Civic Guard System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#434652'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#747683'
  outline-variant: '#c4c6d4'
  surface-tint: '#335ab4'
  primary: '#002465'
  on-primary: '#ffffff'
  primary-container: '#003893'
  on-primary-container: '#88a7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#bb001e'
  on-secondary: '#ffffff'
  secondary-container: '#e12531'
  on-secondary-container: '#fffbff'
  tertiary: '#715c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cca800'
  on-tertiary-container: '#4d3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#12419b'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930015'
  tertiary-fixed: '#ffe17b'
  tertiary-fixed-dim: '#ecc300'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 16px
---

## Brand & Style
The design system is engineered for high-stakes, high-pressure environments where speed and accuracy are paramount. The target audience includes electoral witnesses and volunteers across diverse demographics in Colombia, requiring a UI that feels authoritative, official, and intensely functional.

The style is **Corporate / Modern** with a lean toward **High-Contrast Functionalism**. It prioritizes readability and cognitive ease over decorative elements. The interface should evoke a sense of civic duty and security, utilizing whitespace to prevent information overload during rapid data entry and verification tasks.

## Colors
This design system uses a palette inspired by the Colombian national colors, re-engineered for digital accessibility and professional trust.

- **Primary (Deep Blue):** Used for headers, primary actions, and institutional branding to establish authority and security.
- **Secondary (Red):** Reserved strictly for urgent actions, critical alerts, and "Stop" signals.
- **Tertiary (Gold):** Used sparingly as a highlight or badge accent to denote "Important" or "Verified" status without the urgency of red.
- **Neutral:** A range of light grays (`#F8F9FA` to `#E9ECEF`) provides a clean canvas that minimizes glare during outdoor use at polling stations.
- **Contrast:** Maintain a minimum 4.5:1 ratio for all functional text against background surfaces.

## Typography
**Inter** is selected for its exceptional legibility and systematic structure. In a high-pressure electoral environment, the typeface must not "disappear" but rather present data with absolute clarity.

- **Scale:** Larger base sizes (16px minimum for body) ensure readability in various lighting conditions.
- **Hierarchy:** Use bold weights (600-700) for data headers to distinguish labels from user-inputted values.
- **Numerical Data:** Given the nature of electoral results, ensure tabular figures (monospaced numbers) are utilized in tables and E-14 result summaries.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first field use, transitioning to a constrained **Fixed Grid** on tablets.

- **Mobile (Default):** 4-column grid with 16px side margins. Elements are typically full-width to provide large tap targets.
- **Tablet/Desktop:** 12-column grid with a max-width of 1024px to prevent eye fatigue across long data rows.
- **Touch Targets:** All interactive elements (buttons, checkboxes) must maintain a minimum hit area of 48x48px to accommodate use in fast-paced environments.

## Elevation & Depth
To maintain an authoritative and "official" feel, this design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** The base neutral surface.
- **Level 1 (Cards):** White background with a 1px border (#DEE2E6). No shadow. This represents standard information units.
- **Level 2 (Active/Floating):** Used for primary action buttons or sticky footers. A soft, subtle shadow (0px 4px 12px rgba(0,0,0,0.08)) is permitted here to indicate interactability.
- **Focus States:** High-visibility 2px solid outlines in Primary Blue to ensure accessibility for keyboard or assistive navigation.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a balance between the modern approachability of rounded corners and the professional, serious nature of electoral software.

- **Standard Elements:** 4px (0.25rem) radius for input fields, cards, and buttons.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish status indicators from actionable buttons.

## Components

### Buttons
- **Primary:** Solid Primary Blue background with White text. Bold weight. Used for 'Upload E-14' or 'Submit'.
- **Secondary:** Outlined Primary Blue with Blue text. Used for 'Edit' or 'Go Back'.
- **Urgent Action:** Solid Secondary Red background. Used for 'Report Irregularity' or 'Delete'.

### Card Layouts
- Statistics cards should use large `headline-lg` numbers for quick scanning.
- Cards must have a subtle `label-sm` header to categorize the data (e.g., "ZONE 4 - TABLE 12").

### Status Indicators
- **Completed:** Green background tint with dark green text + check icon.
- **Pending:** Light Gray background with dark gray text + clock icon.
- **Alert:** Red background tint with dark red text + exclamation icon.
- Indicators should always combine a label and an icon for accessibility (color-blindness safety).

### Input Fields
- Labels must be persistently visible above the field (no floating labels that disappear).
- Use `background: #FFFFFF` and a `1px` border. For electoral data, the font size within inputs should be `body-lg` (18px) to minimize entry errors.

### Additional Components
- **Progress Bar:** High-contrast bar at the top of the screen during multi-step E-14 uploads.
- **Photo Preview Card:** A dedicated component for verifying captured E-14 images, featuring "Retake" and "Confirm" as clear, high-contrast actions.