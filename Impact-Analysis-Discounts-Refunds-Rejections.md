# Impact Analysis — Discounts, Refunds & Rejections (Parent-Level Financial Model)

**Prototype analyzed:** `CA Dashboard.dc.html` (Competent Authority Portal)
**Source:** AX_Discounts_Refunds_Rejections_User_Stories — E1–E9, US-001–US-054
**Date:** 16 Sep 2026
**Posture:** no redesign. Reuse existing card, drawer, modal, table and toast patterns. Every change below is additive or a removal of contradicting behavior.

> **Companion document:** `Impact-Analysis-Part-2-BRD-Review.md` adds the rules the source BRDs carry that this backlog doesn't — chiefly that Signature Discount is **paper-only**, and that **what composes the "State Processing Fee" pool** (base fee only, or base + expedited + shipping) is undefined, which sets every cap and refund limit named below. It also carries the worked use cases and the full open-question list.

---

## 0. The one structural idea behind all of it

Today the prototype treats the **child order** as the financial unit: the Refund modal lists child orders with per-child checkboxes and a per-child "Refund" column, and a refunded child gets a `Refunded` tag that rolls up to the parent row.

The addendum makes the **parent order the single authoritative financial record**. Children carry original retail fee values for display only and never drive a calculation. Every ripple effect in this document comes from that inversion.

Three behaviors in the current prototype **directly contradict** the new requirements and must be removed, not extended:

1. Per-child refund selection and per-child refund amounts in the Refund modal (US-017).
2. `Refunded` status/tag on child orders and its parent roll-up (US-014, US-053).
3. Any signature-count → discount derivation, and any per-child allocation of discounts or refunds (US-002, US-009).

---

## 1. Screens impacted

| Screen (existing `data-screen-label`) | Impact |
|---|---|
| Order Overview (parent order) | **High** |
| Refund Order modal (`omAct`, kind `refund`) | **High** — rebuild of contents |
| Cancel Order modal (`omAct`, kind `cancel`) | **Medium** |
| Rejection processing | **High** — new surface, no equivalent today |
| Payment Summary (`isCreatePay`, Discounts card) | **Medium–High** |
| Reports (`isReports`, Financial & Operational Activity) | **High** |
| Order Management list (`isOrdersScreen`) | **Low–Medium** |
| Child Order detail (`isChild`) | **Low–Medium** |
| Order Confirmation / Receipt & Invoice output | **Medium** |
| Site Configuration | **Low** |
| Dashboard widgets | **Low** |
| User Management / Profile | **None** |

### 1.1 Order Overview — **High**

**Why affected.** It becomes the home of the parent financial record: the balances every refund validates against, the refund/rejection event histories, the audit history, and the overall Stripe refund status. Nothing on the screen carries that today.

**New information required**
- **Financial Summary** (US-016): Total State Fees Collected, Total AX Service Fees Collected, Total Amount Collected, Net Amount Retained, Available State Refund, Available AX Service Fees for Refund, Maximum Refund Available.
- **Discounts Applied** (US-035): Signature Discount, General Discount + reason (+ explanation), Total Discounts Applied, with applying user and timestamp.
- **Overall Stripe refund status** badge — *Fully Refunded* / *Partially Refunded* / none (US-053). Replaces today's "one or more child orders refunded" affordance.
- **Refund Activity** list — one row per refund event: amount, State/AX split, notes, date/time, AFFIRM flag, user, Stripe status (US-024, US-036).
- **Rejection Indicator** + **Rejection Activity** list — child order(s), reason, user, date/time, linked refund (US-029, US-032, US-037).
- **Audit History** — append-only, per-event, no edit/delete affordance anywhere (US-034–US-037).

**How to do it without disruption.** These are five new **section cards in the existing left-teal-accent pattern**, appended below the current cards. Refund Activity / Rejection Activity / Audit History reuse the existing bordered-table-in-rounded-wrapper pattern. The Stripe status badge slots into the existing title-row badge cluster. The financial summary is a label/value grid — same rhythm as the existing detail cards. **No layout, header, action bar, or print menu changes.**

### 1.2 Refund modal — **High** (contents replaced, shell unchanged)

**Why affected.** Its entire premise — pick children, amount is derived — is removed. It becomes a single-amount parent-level form.

**New information required**
- Maximum State Fee Refundable / Maximum AX Fee Refundable / **Total Maximum Refundable Amount** at the top (US-018).
- One refund **amount** input, currency, two decimals, never pre-filled (US-020, US-031).
- Optional free-text **Notes** (US-020) — replaces today's required Reason select, or sits alongside it if Reason is retained for reporting (see §5 open item).
- **AFFIRM** acknowledgment block, conditionally revealed when amount > Available State Refund, with the Section 9 warning text (US-023).
- **View Invoice / View Receipt** link, opens new tab, disabled with explanation when no invoice exists (US-015).
- Live State/AX split preview of the entered amount (US-022) — recommended, not required by the stories; it is what makes AFFIRM feel non-arbitrary.

**Removed:** child table, Select All / Clear All, per-child Refund column, derived "Refund amount $X" readout.

**How to do it without disruption.** Keep the modal shell, header, footer and Cancel/confirm button pair exactly as-is. The existing confirm-word text input pattern (already used for the danger confirmation) becomes the AFFIRM input — same component, different label and conditional visibility. The max-refundable trio uses the same label/value row rhythm as the current amount readout.

### 1.3 Cancel Order modal — **Medium**

**Why affected.** It keeps its child list (US-019) but that list must stop meaning anything financial.

**New information required**
- Child selection is explicitly **status-only** — lead copy must say so.
- The per-child **Refund column is removed** (it exists today only in the cancel variant).
- A clear path from cancellation to the Refund modal, since cancellation no longer refunds anything.

**How to do it without disruption.** Delete one column, change two strings, add one secondary action. The two modal variants stop sharing the child table — they diverge cleanly rather than staying one parameterized component.

### 1.4 Rejection processing — **High** (new surface)

**Why affected.** The prototype has no parent-level rejection flow. Today `rejected` appears only as a count in Reports and as a child status.

**New information required**
- Child order (Apostille Request) selection — one or more, at least one required.
- **Rejection Reason** — required (free text vs configured list is open).
- The same **max-refundable trio** and **View Invoice / View Receipt** link as the Refund modal (US-031).
- Explicit statement that saving the rejection **issues no refund**, plus the handoff into the Refund modal (US-030).

**How to do it without disruption.** Build it as a **variant of the existing `omAct` modal** — it is structurally the Cancel modal (child selection + required reason) plus the refundable header. No new screen archetype, no new navigation.

### 1.5 Payment Summary (Discounts card) — **Medium–High**

**Why affected.** The card already has Signature Discount and General Discount inputs, so the shape is right — but the rules around them are all new, and eligibility gating doesn't exist.

**New information required**
- **General Discount Reason** select (CA-configured, includes non-removable "Other"), plus an explanation field when "Other" (US-004, US-005).
- **Combined-cap validation** against total State Processing Fees, with an inline message stating the maximum combined discount allowed (US-006).
- A visible **maximum discountable** value so the cap isn't discovered only on failure (recommended).
- Explicit line-item presentation on the Checkout Summary: each State fee line, each AX fee line, Subtotal, Signature Discount, General Discount (**both shown even at $0.00**), Total Discounts Applied, Grand Total (US-011).
- Eligibility gating: discount controls shown only for eligible Counter/Walk-In parent orders; hidden or disabled otherwise (US-010).
- Signature Recording card stays, with copy confirming counts do not affect any amount (US-001).

**How to do it without disruption.** The two amount inputs stay exactly where they are. The reason select is one added field row inside the existing card. Validation uses the existing inline-error treatment. The Checkout Summary already itemizes — it gains rows, not a new structure.

> ⚠️ **Conflict to resolve, not design around:** the card currently also offers a **Promotion Discount / promo code**. The addendum recognizes only two discount types and caps their sum against State fees. Confirm whether promo codes survive, and if so whether they count toward the cap and which reporting category they land in. Flagged, not changed.

### 1.6 Reports — **High**

**Why affected.** Today it is one activity table, "one row per charge or refund." The addendum requires **two distinct report views** with different date semantics, twelve aggregate categories, drill-down, and export.

**New information required**
- **Transaction Reporting** (included by successful payment date, shows current position including later events) vs **Activity Reporting** (included by each event's own date) — same table shell, a view toggle in the existing header control strip.
- **Period selector**: Daily / Weekly / Monthly / Custom, with start ≤ end, echoed on screen and in exports (US-041).
- **Aggregate tiles**: Gross Transaction Amount, Signature Discounts Applied, General Discounts Applied, Total Discounts Applied, Total Amount Collected, State Fees Collected, AX Service Fees Collected, Refunds Issued, State Fees Refunded, AX Service Fees Refunded, Net Amount Retained (**Transaction view only**), Rejection-Related Refunds (**a subset of Refunds Issued, never re-added**) (US-040).
- **Drill-down** from any total → parent orders → child orders, with no child-level refund detail (US-042).
- Child financial columns explicitly labeled **Original State Fee / Original AX Service Fee / Original Child Transaction Value** (US-043).
- **CSV + XLSX export**, numeric currency columns, with report type / period / generation timestamp (US-044).
- **Refund summary: exactly one row per parent order** (US-045).

**How to do it without disruption.** Reuse the existing Reports header, filter strip and table wrapper. Aggregates reuse the dashboard stat-tile pattern. Drill-down reuses the existing row→detail navigation rather than introducing a new pattern.

### 1.7 Order Management list — **Low–Medium**

**Why affected.** The parent row shows a `Refunded` tag whose tooltip reads "One or more child orders have been refunded" — a per-child claim the system will no longer be able to make.

**New information:** the tag becomes the parent-level Stripe refund status (*Fully Refunded* / *Partially Refunded*), and a **Rejection Indicator** appears in the same badge cluster. Same badge component, same position, corrected semantics.

### 1.8 Child Order detail — **Low–Medium**

**Why affected.** It shows a child-level `Refunded` tag which must be removed; child status narrows to operational states only (Cancelled, Rejected, and the existing pipeline states).

**New information:** fee values relabeled as **Original** values, with copy making clear they are pre-discount retail figures that don't reflect collections. A **Rejected** status and reason display where applicable. No refund affordance on this screen.

### 1.9 Receipt / Invoice output — **Medium**

**Why affected.** Refund information must appear at the parent level only, and invoice versioning becomes a hard requirement.

**New information:** Original Amount Paid, State Fees Refunded, AX Service Fees Refunded, Total Refunded, Net Amount Retained; refund Notes text; cumulative refund total and overall Stripe status; per-child refund indicators removed; child lines show original fee values only; pending/failed refunds excluded. Every invoice version retained and retrievable from the parent's audit history, each later version linked to the refund that triggered it.

> The Marketing invoice/receipt template is an **external dependency** and the updated receipt mockup is still outstanding (US-013, US-014). Treat the prototype's receipt as blocked on that.

### 1.10 Site Configuration — **Low**

Gains the **General Discount Reasons** list: add / rename / deactivate, "Other" always present and non-deactivatable, deactivated reasons still shown on historical orders and in reports, changes audited. This is a new row in the existing configuration pattern. (US-005 may shrink to verification if such a screen already exists server-side.)

### 1.11 Dashboard — **Low**

Any widget quoting refunded amounts must read from parent totals. Optionally a Rejections widget. Defer until Reports is settled; the widgets are user-arrangeable and shouldn't lead the model change.

---

## 2. Components impacted

**Rebuilt internals, shell preserved**
- `omAct` modal — currently one parameterized component serving refund + cancel. Splits into **three variants**: Refund (no child list), Cancel (child list, status only), Rejection (child list + reason + refundable header). The shared child table stops being shared.

**Extended**
- Section card (left teal accent) — new instances for financial summary, discounts applied, refund activity, rejection activity, audit history.
- Badge — new parent-level values (*Fully Refunded*, *Partially Refunded*, *Rejection*), new child value (*Rejected*).
- Inline validation / FormField error state — combined discount cap, refund maximum, AFFIRM mismatch.
- Confirm-word text input — becomes the AFFIRM input, conditionally revealed and **reset when the amount changes**.
- Table-in-rounded-wrapper — refund/rejection/audit event histories and both report views.
- Stat tile — the twelve reporting aggregates.
- Toast — refund succeeded / failed / blocked messaging.
- Date range control — needs Daily/Weekly/Monthly/Custom presets.
- Select — General Discount Reason (configured, with "Other").

**New, small**
- **Money summary row** (label + value, emphasis variant) — used by the financial summary, the max-refundable trio and the report aggregates. One primitive, three placements.
- **AFFIRM acknowledgment block** — warning text + input, resettable.
- **View Invoice / View Receipt** link-with-disabled-reason.

**Removed**
- Per-child refund checkbox column.
- Child `Refunded` tag.
- Derived refund-amount readout.

**Untouched:** SideNav, Navbar/masthead, Drawer, user management tables, dashboard drag-reorder, Print Queue, Create-Order steppers, Modify modal, Assign modal, Resend Receipt modal.

---

## 3. User flows impacted

| Flow | Change |
|---|---|
| **Refund** | Was: open modal → pick children → confirm. Becomes: open modal → read refundable maxima → enter one amount → optional notes → AFFIRM if the amount crosses into AX fees → submit → Stripe confirms → balances recalculate → event appended. No child status changes at all. |
| **Cancel** | Splits in two. Cancel changes child statuses only; any money movement is a **separate, deliberate trip** through the Refund modal. This is the biggest behavioral change for CA staff — cancellation no longer implies a refund. |
| **Rejection** | Was: reject → automatic refund. Becomes: record rejection (children + reason) → **no refund** → optionally launch the standard Refund flow, which must then be attributable as rejection-related. |
| **Discount at checkout** | Gains a required reason for General Discount and a hard combined cap against State fees; only appears on eligible Counter/Walk-In parent orders; never available against the AX intake fee at order creation. |
| **Multiple / partial refunds** | New flow: repeat refunds against a shrinking balance, each its own event, each revalidated against current values. |
| **Reporting & reconciliation** | New flow: choose view → choose period → read aggregates → drill to parent → drill to child → export. |
| **Post-cancel / post-revoke refund** | New: refund remains available while Maximum Refund Available > $0.00. |
| **Invoice review mid-refund** | New: open the invoice in a new tab without losing modal state. |
| **Multi-state** | Users see and act on **only their own state's** children and refundable amounts — a filter that cuts across refund, cancel, reject, reports and receipts. |
| Complimentary / No-Bill | Must behave **exactly as today**. Regression-only. |

---

## 4. Data changes required

**Parent order — new fields**
- Discounts: `signatureDiscount`, `generalDiscount`, `generalDiscountReason`, `generalDiscountExplanation`, `totalDiscountsApplied`, plus applying user + timestamp per discount type.
- Collections: `totalStateFeesCollected`, `totalAXFeesCollected`, `totalAmountCollected`, `netAmountRetained`.
- Refundable: `availableStateRefund`, `availableAXFeesForRefund`, `maximumRefundAvailable` — **server-calculated and stored on the parent**.
- Status: `overallStripeRefundStatus`, `rejectionIndicator`.
- Model marker: which financial model (pre- or post-cutover) governs this order.

**Refund event — new entity (append-only, one row per refund)**
`parentOrderId`, `amount`, `stateFeesRefunded`, `axFeesRefunded`, `availableStateRefundAtTime`, post-refund balances (available state / available AX / max available / net retained), `notes`, `stripeStatus` (succeeded | pending | failed), `successfulRefundDate` (**from Stripe's confirmation, not submission time**), `processingUser`, `affirmRequired`, `affirmEntered`, `affirmUser`, `affirmTimestamp`, optional `relatedRejectionId`, `isRejectionRelated`. **No child references, no per-child amounts.**

**Rejection event — new entity (append-only)**
`parentOrderId`, `childOrderIds[]`, `reason`, `user`, `enteredDate`, optional linked refund.

**Invoice — new**
Versioned records; original immutable; each later version links to the refund(s) that triggered it; all versions retrievable.

**Child order — changed**
- Fees stored at **retail, pre-discount**, relabeled `originalStateFee` / `originalAXServiceFee` / `originalChildTransactionValue`.
- `Refunded` removed from the status vocabulary; `Rejected` added.
- **All per-child allocation of discounts and refunds deleted.**

**Configuration — new**
General Discount Reason list (per CA), cutover date, the AX-billable policy for refunded AX fees (isolated so it can change), and the eligibility rule for discountable submission methods.

**Audit — new**
Append-only records across transaction, signature, discount, refund and rejection activity, including before/after values for discounts. No edit or delete path in UI or API.

---

## 5. Validation changes required

| Rule | Where | Notes |
|---|---|---|
| Discount amounts: numeric, non-negative, ≤ 2 decimals | Payment Summary | inline |
| `signatureDiscount + generalDiscount ≤ total State Processing Fees` | Payment Summary | **server-enforced too**; error states the maximum allowed; State balance never < $0.00 |
| General Discount requires a reason; "Other" requires an explanation | Payment Summary | |
| Discounts permitted only on eligible Counter/Walk-In parent orders | UI + API | API must reject regardless of UI |
| No discount/refund control against the AX intake fee at creation | Create Order | absence, not validation |
| Refund amount > 0, numeric, ≤ 2 decimals | Refund modal | |
| `refundAmount ≤ maximumRefundAvailable` (current, at submit) | Refund modal | **server-revalidated**; error states the current maximum |
| Cumulative successful refunds ≤ Total Amount Collected | Server | absolute cap |
| AFFIRM required when `amount > availableStateRefund`; exact match assumed case-sensitive; **resets on amount change** | Refund + Rejection-refund | |
| Rejection requires ≥ 1 child order and a reason | Rejection | |
| Custom report range: start ≤ end | Reports | |
| Cross-state action blocked in UI **and** API | Everywhere | |
| Concurrent refunds on one parent serialized / version-checked | Server | second submitter is revalidated and shown current values |

**Nothing is pre-filled anywhere** — not the discount fields, not the refund amount, not the rejection refund.

---

## 6. Edge cases

**Money**
- Available State Refund is already $0.00 → **every** subsequent refund requires AFFIRM.
- Refund exactly equals Available State Refund → **no** AFFIRM (boundary is inclusive).
- Amount edited after AFFIRM typed → acknowledgment resets.
- Combined discount equals State fees exactly → allowed; one cent more → blocked.
- Orders with **no AX Service Fee** (paper-only) → AX refundable is $0.00; AFFIRM can never trigger.
- Refund of the full amount → Fully Refunded; subsequent Maximum Refund Available is $0.00 and the action should be unavailable, not merely failing.
- Multiple partial refunds in sequence → each recalculates; earlier events never overwritten.

**Payment processor**
- Pending refund → visible on the parent, balances unchanged, **not duplicable**.
- Failed refund → error surfaced, logged, balances untouched.
- Refund submitted, Stripe times out → pending; success date must come from confirmation.
- Two users refunding the same parent simultaneously → second blocked with current values, retry offered.

**Rejections**
- Rejection with no refund at all → valid and common.
- Second rejection on the same parent → new event, first preserved.
- Rejection-related refund that also covers non-rejected work → attribution ambiguity (see open questions).
- All children rejected → parent still holds funds unless refunded.

**Status & lifecycle**
- Refund on a revoked or cancelled parent → permitted while funds remain.
- Cancel children without refunding → expected state; nothing should nag or auto-refund.
- Child cancelled and later rejected → both events recorded; fee values unchanged throughout.

**Multi-state**
- Multi-state parent where the user's state has no children → nothing visible, no action.
- Reports and receipts must never leak another state's amounts.

**Cutover**
- Pre-cutover order opened in the new UI → must render under the old per-child model without recalculating.
- Refund attempted on a pre-cutover order → behavior **undefined and blocked** pending IT.

**Reporting**
- Order paid in-period, refunded after the report date → Transaction view shows current position; the refund keeps its own date.
- Rejection-Related Refunds double-count risk → must be a subset, never re-added.
- Export ≠ screen totals → reconciliation defect, not a formatting one.
- Zero-activity period → empty state, not a blank table.

**Configuration**
- A General Discount Reason deactivated after use → still displays on historical orders and in reports.
- Attempt to deactivate "Other" → blocked.

---

## 7. Potential technical dependencies

**Hard, external**
1. **Cutover date** — pending IT (Benilda/David). **US-046 and US-047 are blocked**, and US-054 depends on the date. This is the critical path.
2. **Marketing invoice/receipt template** — external; US-013 and US-014 can only deliver the data behind it.
3. **Updated receipt mockup** — outstanding; blocks US-014 UI.
4. **Stripe integration rework** — parent-level refunds, stored refund result, succeeded-only balance updates (US-052). Everything refund-facing depends on it.
5. **Business Central integration** (US-054) — parent totals, one summary row per parent, split State/AX values, pre-cutover orders on the old path.
6. **Cash-collected-by-state netting spike** (US-049) — may contradict FR-A13 and change the AX-billable policy; keep that policy isolated.
7. **No-Bill full-cancellation refundable amount** (US-050) — separate No-Bill work already in QA; coordinate to avoid collision.
8. **Jane's existing ticket** for refund-after-revoke (US-027) — merge, don't duplicate.

**Internal**
- Server-side calculation service for parent balances — the single source of truth for both UI display and validation.
- Append-only audit store with no UI/API mutation path.
- Invoice versioning and retrieval.
- Concurrency control (locking or record versioning) on parent refunds.
- Role/permission model: "authorized CA personnel" for discounts, AFFIRM, refunds, rejections and reporting are **four or five distinct authorities** and none are defined yet.
- State-scoping enforcement across every read and write.
- Export pipeline (CSV + XLSX, numeric currency).
- Removal of legacy code: signature→discount derivation, per-child allocation, automatic-refund-on-rejection.
- QA: retire automatic-refund-on-rejection tests; add rejection-without-refund, state-only refund, AFFIRM refund, over-maximum blocked, multiple rejections, Complimentary/No-Bill regression (US-033, US-051).

---

## 8. What should NOT change

**Layout & navigation**
- Sidebar structure, agency masthead, page-header rhythm, 1180px content width.
- The left-teal-accent section-card pattern and its header-plus-Edit-pill treatment.
- Order Management tabs (Orders / Drafts / Print Queue), filters, sorting, selection, pagination, drawer.
- Breadcrumbs and parent↔child navigation.
- Create-Order stepper: Add Order Information → Payment Summary → Order Confirmation.
- Modal shell, header, scrim, footer button pair.

**Interaction patterns**
- Edit-drawer pattern for record edits.
- Expand-on-edit inline editing for notes.
- Toast with Dismiss for every successful change.
- Edits restricted to New / Incomplete / Pending Print, with disabled-plus-tooltip elsewhere.
- Document-preview modal on Attached Documents.
- Dashboard widget drag-reorder.

**Visual language**
- Sea-depths teal primary, the status color vocabulary, Roboto, 8px control radius / 12px card radius, soft shadows, 4px spacing scale, Bootstrap Icons. No new colors, no new type, no gradients behind content.

**Functional areas out of scope**
- User Management, User Profile, invitations, roles UI.
- Login and auth.
- Print Queue and print history.
- Assign, Modify and Resend Receipt modals.
- Document upload, recipients, addresses, destination country.
- Complimentary Order and No-Bill flows — **regression-protected, untouched**.
- Signature Recording — stays exactly as built; only its *decoupling* from money is enforced.
- Historical (pre-cutover) orders — never recalculated, never re-rendered under the new model.

---

## 9. Ripple effects worth naming

1. **"Refunded" disappearing from child orders** is the most visible change to daily users and touches five surfaces at once: order list badges, child detail, refund modal, receipt, reports. It must land as one coordinated change or the system will contradict itself screen to screen.
2. **Cancel and Refund becoming independent** means a CA employee who cancels an order and walks away has left money uncollected-but-unrefunded. Whether that warrants a nudge on the parent order is a **product decision**, not a UI one — and the stories don't cover it.
3. **Server-authoritative balances** mean the UI can no longer compute a maximum from what's on screen. Every modal must fetch current values on open and revalidate on submit — a race the current prototype has no concept of.
4. **AFFIRM resetting on amount change** will feel punitive if the reset is silent. It needs a visible reason.
5. **Two report views with different date semantics** is the single easiest thing to get wrong in this release. Net Amount Retained appearing in Transaction aggregates but *not* Activity aggregates is a rule users will trip over; the view toggle needs a one-line explanation of what each view counts.
6. **Rejection-related refund attribution** determines whether a reporting category is trustworthy. If it's inferred from "launched from the Rejection screen," a refund processed five minutes later from the order page is miscategorized forever.
7. **State isolation** is not a filter to add at the end. It changes what "Maximum Refund Available" *means* on a multi-state parent and must be designed into the balance model, not layered on top.
8. **Promotion codes** in the existing Payment Summary have no home in the new discount model. Unresolved, they will either break the cap or silently escape reporting.
9. **The cutover date gates the release.** Two stories are blocked on it, the Business Central work depends on it, and until it exists the prototype cannot honestly show pre- vs post-cutover behavior.

---

## 10. Open questions that change the UI (not just the code)

These have to be answered before any screen is drawn:

1. **Can discounts be edited or removed before payment?** Decides whether the Discounts card needs an edit/remove affordance and whether multiple audit records exist per order (US-003, US-004, US-035).
2. **Is Rejection Reason free text or a configured list?** Decides whether Site Configuration gains a second reason list (US-029).
3. **Refund Reason/Transaction Status vs Notes** — one field or two? The prototype's Refund modal currently has a *required* Reason select; the new story specifies an *optional* Notes field. Keeping both without deciding gives users two overlapping boxes (US-020, US-036).
4. **How is a refund marked rejection-related?** Inferred from entry point, or chosen by the user? A user-chosen flag needs a control (US-031).
5. **Which roles may apply discounts, enter AFFIRM, process refunds, record rejections, and view reports?** Five potentially different permissions, all currently undefined — and all of which produce disabled states and tooltips (US-003, US-004, US-023, US-038).
6. **Are Mail-In orders excluded from discounts?** Currently an assumption. Decides the eligibility gate (US-010).
7. **Are the receipt and the Invoice the same document?** Decides whether one output or two (US-013, US-014).
8. **How are pending and failed Stripe refunds displayed?** Decides a status treatment on the parent order (US-026).
9. **Is AFFIRM case-sensitive?** Decides helper copy (US-023).
10. **Do promotion codes survive, and do they count toward the discount cap?** Not in the source document at all.

---

## 11. Suggested sequencing (build order, not sprint plan)

1. **Parent financial summary on Order Overview** — everything else validates against it, and it's purely additive.
2. **Refund modal rebuild + AFFIRM** — the core behavioral change.
3. **Remove child `Refunded` / add parent Stripe status** — the coordinated five-surface change.
4. **Cancel/Refund separation.**
5. **Rejection surface** (as an `omAct` variant) **+ rejection-related refund.**
6. **Discount reason + cap on Payment Summary** + Site Configuration reason list.
7. **Refund / Rejection / Audit history lists** on Order Overview.
8. **Reports: two views, aggregates, drill-down, export.**
9. **Invoice/receipt output** — gated on the Marketing template.
10. **Cutover, multi-state isolation, Business Central** — gated on the cutover date.

Steps 1–5 are where the UX risk lives. Steps 9–10 are where the schedule risk lives.
