# ApostilleXpress Design System

A design system for **ApostilleXpress** — a document-legalization (apostille) platform used by U.S. Competent Authorities (e.g. Secretary of State offices) to receive, review, and issue apostilles and e-Apostilles, and by customers/agents to create orders.

The look is **clean government-services SaaS**: a Bootstrap-5 structural foundation, Untitled-UI-style soft elevation, **Roboto** type, a **teal "sea-depths"** brand, and restrained **patriotic accents** (freedom blue, patriot red) that signal trust without leaning on flags.

## Sources
- **Figma:** "Design System 2.0 Design System.fig" (attached). Key pages: `Colors`, `Typography`, `Spacing`, `Radius`, `Shadow`, component pages (`Buttons`, `Inputs`, `Badge`, `Alerts`, `Table`, `Progress-steps`, …), and product flows `Process-an-Order`, `CA - Create an Order`, `Competent-Authority-Portal`.
- **Uploads:** Roboto + Roboto Condensed/SemiCondensed font files; AX logo set (monogram, ApostilleXpress wordmark, @Gov lockup) as SVG.
- Token values were extracted from Figma Variables (1,674 variables across 21 collections); the full raw export is kept at `tokens-raw/fig-tokens.css` for reference. The curated public token API lives in `tokens/`.

## Products represented
- **Competent Authority Portal** — authorities review order details and issue apostilles (the UI kit recreates this).
- **Create-an-Order flow** — customers/agents submit documents, recipients, mailing and payment.
- **ORX** — back-office platform between Utah County's ordering site and ApostilleXpress. Creates, delivers and verifies digital marriage certificates and prepares apostille requests. Internal only — customers never log into ORX, so ORX branding never appears in customer-facing screens.
- Supporting surfaces: document templates, email templates, profile.

---

## CONTENT FUNDAMENTALS

**Voice:** plain, official, and reassuring — the tone of a trustworthy government service desk, not a startup. Clear over clever.

- **Person:** Address the user as **you**; the authority/product speaks as **we** ("We emailed your receipt"). Applicant/customer data is shown in third person.
- **Casing:** **Title Case** for page titles, card section headers, and buttons that name a record action ("Order Details", "Add Recipient", "Process Order"). **Sentence case** for helper text, descriptions, table cells, and toasts.
- **Labels:** noun phrases for fields ("Destination Country", "Document Type", "Phone Number"); verb-first for actions ("Create New Order", "Process Order", "Add Recipient", "Delete (2)").
- **Status language:** a fixed vocabulary — *Draft, Submitted, In Process / In Review, Flagged, Issued / Apostilled, Rejected, Revoked, Cancelled.* Use these exact words; pair each with its status color (below).
- **Numbers & IDs:** orders are `#307-600` style; phones `(312) 867-5309`; addresses on one line; document counts spelled in headers ("Attached Documents: 2").
- **Microcopy:** short and literal — "ending with 9849", "Uploaded 20 min ago", "Select All Recipients". No marketing fluff inside the portal.
- **Emoji:** not used in product UI (one exception: the country flag glyph beside "United States" in the authority footer). Don't decorate with emoji.
- **Punctuation:** use real em dashes (—), curly quotes (’ ”), and "—" as the empty-value placeholder in records.

Example copy: *"Please process an apostille for the attached birth certificate. This document is required to acquire Spanish citizenship."* — direct, specific, courteous.

---

## VISUAL FOUNDATIONS

**Color.** Brand primary is **sea-depths teal `#0D5257`** with a lighter **aqua `#00B6BD`**; the logo is a top-to-bottom gradient between them (`#00B0BE → #0D5257`). Teal is used for primary actions, active nav, links, and the signature card accent. Neutrals are a Bootstrap-aligned gray ramp on **body text `#212529`**. Status colors: success `#1F945C`, warning `#EFA22F`, danger `#E33B32`, info/freedom-blue `#0074C2`. Patriot accents (freedom blue, integrity blue, patriot red, midnight blue) appear sparingly — stat-tile icons, illustrations, dark scrims — never as large fills.

**Type.** **Roboto** everywhere (variable font, weights 300/400/500/600/700). **Roboto Condensed** for the agency masthead and dense table/eyebrow labels. Heading scale is Bootstrap's (h1 40 → h6 16); display 40–80; body 16, secondary text 14, captions 12. Headings are Semibold; body Regular; labels Medium; uppercase eyebrows use Medium + `0.04em` tracking.

**Backgrounds.** Flat and calm: page `#F8F9FA`, surfaces white. **No decorative gradients** behind content (the only gradient is the 6px teal accent stripe on order-detail cards and within the logo). No photographic hero imagery in the portal; imagery, when present, is document/credential-oriented and neutral. Dark scrims use midnight-blue at ~55% with a slight blur.

**Cards.** White, `1px` `#E9ECEF` border, **12px** radius (lg/xl), soft **shadow-xs**. The order-detail "section card" adds a **vertical teal→aqua gradient bar on the left edge** + a header row (title + Edit pill) + divider — this left-accent card is an intentional brand signature here (used because it appears in the product, not as a generic trope).

**Elevation.** Soft, low-contrast `rgba(10,13,18,*)` shadows (Untitled-UI lineage): `xs` on cards/inputs/buttons, `md` on dropdowns, `lg` on toasts, `2xl` on modals. Avoid hard or colored drop shadows.

**Radius.** xs 4 · sm 6 · **md 8 (default control radius)** · lg 10 · xl 12 · 2xl 16 · full pill. Buttons, inputs and selects are 8px; cards 10–12; badges/pills full or 6.

**Borders.** Hairline `1px` in gray-200/300; inputs gray-300, strengthen to gray-400 on hover. Dividers are gray-200. Focus is a **4px teal ring** `rgba(0,182,189,.35)` (error: red ring).

**Spacing & layout.** 4px base scale (2→128). Portal is a fixed left sidebar (248px) + sticky agency top bar (72px) + scrolling content (max ~1180px). Card padding 16–20px; field gap 6px; section gap 18–24px. Tables are full-width inside a rounded bordered wrapper.

**Buttons.** Radius 8. Sizes — sm `8×12 / 14px`, md `10×14 / 14px`, lg `10×16 / 16px`. Primary = solid sea-depths; secondary = white + border + shadow-xs; outline = teal border/text; tertiary = ghost; link; danger = solid red. Hover darkens fill (teal-700 / danger-700) or tints ghost; **active nudges down 0.5px**; focus shows the teal ring.

**Interaction & motion.** Subtle and quick — `120–150ms ease` on background/border/color; switch knob and progress slide `.15s`; spinner `.7s` linear. No bounce, no large parallax, no infinite decorative loops. Hover states = darker fill or light gray tint; pressed = slight translate, not scale.

**Transparency / blur.** Reserved for the modal scrim (midnight-blue 55% + 2px blur) and subtle overlays. Content surfaces are opaque.

---

## ICONOGRAPHY

The system uses **[Bootstrap Icons](https://icons.getbootstrap.com/)** — confirmed by the Figma icon inventory (glyphs named `GeoAlt`, `CaretDownFill`, `FilePdf`, `ThreeDots`, `ExclamationCircleFill`, `XCircleFill`, `CheckCircleFill`, `Envelope`, `Telephone`, `Gear`, `Flag`, `Globe`, `Star`, `Trash`…). They are line/solid icons at a 16px optical size, two-tone only for status (`*-fill` variants).

- **Loaded from CDN:** `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css`, used as `<i class="bi bi-search" />`. ⚠️ **Substitution flag:** the original glyphs were not exported from Figma as a local font/sprite, so cards and UI kits link the public Bootstrap Icons font instead. If you need offline/self-hosted icons, drop the Bootstrap Icons web-font files into `assets/icons/` and swap the link.
- **Usage:** info/help → `info-circle` / `info-circle-fill`; success → `check-circle-fill`; warning → `exclamation-triangle-fill`; error → `x-circle-fill`; documents → `file-earmark-pdf-fill`; nav uses outline glyphs (`grid-1x2`, `clipboard-check`, `gear`, `person`, `plus-square`).
- **Status dots** in badges are CSS, not icons. **Country flags** use the unicode flag emoji (the only emoji used). Don't hand-draw icons as inline SVG — use the Bootstrap Icons font.

Brand logos live in `assets/logos/` (do not redraw): `ax-mark-*` (monogram), `ax-wordmark-*` (ApostilleXpress), `ax-gov-*` (@Gov lockup), each in `color / dark / white / light`. ORX logos: `orx-mark-color` / `orx-mark-color-tm` / `orx-mark-white-tm` (block mark) and `orx-wordmark-color` / `orx-wordmark-color-tm` / `orx-wordmark-white-tm`. Use the ™ versions on first/primary placement; white versions only on teal or midnight backgrounds.

---

## INDEX (manifest)

**Foundations / global CSS**
- `styles.css` — entry point (imports only). Link this one file.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `shadows.css`, `fonts.css` (@font-face), `base.css`.
- `components.css` — hover/focus/active states for `.ax-*` classes.
- `tokens-raw/fig-tokens.css` — full raw Figma-variable export (reference only).

**Components** (`components/`, namespace `window.ApostilleXpressDesignSystem_141fbe`)

Naming note — **every component name below is confirmed intentional and is not to be renamed.** Figma kits are attached to this project one at a time and each covers only a slice of the system, so a coverage check run against any single kit will report most names as "not in the kit" — that is expected, not a defect. Names follow ApostilleXpress product vocabulary, not kit layer names. Known kit mappings, where one exists: `Radio group item` → `RadioGroupItem`, `Featured icon` → `FeaturedIcon`, `Payment method icon` → `PaymentMethod`, `checkbox-input` → `Checkbox`, `radio-input` → `Radio`, `Side Menu` / `.Side menu section` / `.Side menu dropdown` / `Stack` / `Item / Subsection variants` / `Notification Counter` → `SideNav` (one component absorbs the whole side-menu family: themes, icon strip, captions, counters, subsections), `Avatar` and `Badge` as named.

Complete component index (all 53 exports, all confirmed): Accordion, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, Button, ButtonGroup, ButtonSpinner, Card, CardBody, CardFooter, CardHeader, Carousel, Checkbox, CloseButton, Datepicker, Divider, Drawer, Dropdown, EmptyState, FeaturedIcon, FileUpload, FormField, IconButton, Input, ListGroup, ListItem, Logo, Modal, Navbar, NotificationItem, Pagination, PaymentMethod, ProgressBar, Radio, RadioGroup, RadioGroupItem, RadioGroupItemGroup, SearchBox, Select, SideNav, Skeleton, Spinner, Stepper, Switch, Table, Tabs, Tag, Textarea, Toast, Tooltip, UtilityButton.

- `buttons/` — Button (+ ButtonSpinner), IconButton, UtilityButton, CloseButton, ButtonGroup. Source: Buttons.fig — `Buttons/Button` & `Buttons/Button danger` → Button (`variant` + `destructive`), `Buttons/Button utility` → UtilityButton, `Buttons/Button close X` → CloseButton, `Buttons/Button loading icon` → ButtonSpinner, `_Button group base` → ButtonGroup segments, `Dropdown` / `_Dropdown list item` / `_Dropdown list header` → overlays/Dropdown.
- `forms/` — Input, Textarea, Select, FormField, Checkbox, Radio, RadioGroup, RadioGroupItem, RadioGroupItemGroup, Switch, FileUpload, Datepicker, SearchBox
- `feedback/` — Badge, Tag, Alert, Stepper, Toast, Tooltip, Spinner, ProgressBar, NotificationItem
- `data-display/` — Card (+Header/Body/Footer), Avatar, AvatarGroup, Table, Accordion, ListGroup/ListItem, Skeleton, EmptyState, Carousel
- `navigation/` — Tabs, Breadcrumb, Pagination, Navbar, SideNav (Competent Authority Portal rail; kit family `Side Menu` / `.Side menu section`)
- `overlays/` — Modal, Dropdown, Drawer (Offcanvas)
- `layout/` — Divider, FeaturedIcon
- `commerce/` — PaymentMethod
- `brand/` — Logo

**UI kit** (`ui_kits/`)
- `competent-authority-portal/` — interactive Order Management → Order Details → Process flow.

**Templates** (`templates/`, copy or follow as starting points)
- `customer-auth/` — Login, registration (Individual / Agent / Organization), Google sign-in & MFA; split-screen, mobile responsive.

**Guideline cards** (`guidelines/`) — Colors, Type, Spacing, Radius, Elevation specimens (Design System tab).

**Assets** (`assets/`) — `fonts/`, `logos/`.

**Skill** — `SKILL.md` (Agent-Skills compatible).
