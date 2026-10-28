# ApostilleXpress CA Portal — Remediation Review
Companion to *UX Audit — CA Portal.md*. I re-checked every earlier finding against the source of `CA Dashboard.dc.html`, looked for related edge cases, and wrote down the exact fix, what else it affects and the regression risk.

Status legend: **✔ Confirmed** · **◐ Partly confirmed / corrected** · **✖ Not an issue** · **🆕 New**

---

## 1. Confirmed Issues (re-check of the earlier audit)

| ID | Finding | Result | Correction / note |
|---|---|---|---|
| C1 | Refund caps hard-coded | **◐** | Correction: the **total** cap ($74.95 per child) happens to equal an e-Apostille order ($5 + $69.95). What's wrong is the **split** ($20 state / $54.95 AX instead of $5 / $69.95), plus paper walk-in ($89.95), service fees and shipping. Still Critical, because the AFFIRM threshold is wrong. |
| C2 | Refunds ignore discounts / NOBILL | **✔** | Seeded orders store `total: 74.95 * n`. Nothing stores a discount or the amount collected. |
| C3 | Approve → Issued too early | **✔** | `bpAdvance`: `status = 'Issued'` on approve. |
| C4 | Reissue leaves no revocation | **✔** | `rvContinue` → `openBulk(order, id)` with no event written. |
| H1 | Toast not announced | **◐** | Correction: the toast already has `role="status"` (polite). The real gap is that errors aren't announced assertively and toast text changes aren't re-announced. Downgraded to Medium. |
| H2 | No Esc / focus trap | **✔** | The only global key handler is the `O` toggle. |
| H3 | Single-key shortcut | **✔** | |
| H4 | Clickable rows | **✔** | 6 `<tr onClick>`, 0 with `tabIndex`. |
| H5 | Error toasts look like success | **✔ — worse than reported** | The toast always shows a **green check icon**, even for "Couldn't save" and "Cannot finalize yet". |
| H6 | Short auto-dismiss | **✔** | 2.2s / 3.6s / 9s (with action). |
| H7 | No `aria-describedby` | **✔** | 0 uses. |
| H8 | Generic required messages | **✔** | |
| H9 | Refund tiles miss service / shipping | **✔** | |
| M1–M4 | Status vocabulary / color / map copies / Partially Refunded | **✔** | See the matrix in §7. |
| M5 | Promo stacking | **✔** | `promoDisc` is taken from the full subtotal, and manual discounts are subtracted as well. |
| M6–M7 | ZIP / phone / email rules | **✔** | |
| M8 | Old revoke popup | **✔** | `childRevoke` + the dialog at line ~1806 are still in the file, but no entry point opens them now. Dead code. |
| M9 | Visible tooltips | **✔** | |
| M10 | Modals hand-built | **✔** | |
| M11 | Previous restores last batch only | **✔** | |
| M12–M13 | RadioGroupItem keyboard / role | **✔** | This is a DS component defect; fix it upstream. |
| M14 | h1 scale | **✔** | |
| L1–L9 | | **✔** | L8 confirmed: the toast fires before `window.print()`. |

---

## 2. Newly Discovered Issues

**N1 — Finalizing a Paid Draft deletes the order · Critical 🆕**
- Where: `dupFinalize`
- What happens: The paid draft is removed from `drafts`, but **no order is added to `orders`**. The success toast says "This order is now ready to be processed", yet the order is gone from every tab. That means lost data and paid money with no record.
- Fix: Build the order from `dup.items` (reuse the `buildOrderItems` / submit path). Keep the paid receipt details (payment method, amount, `placed`). Set status `New`. Open Order Overview for it.
- Regression risk: medium. Checkout's submit path needs to be shared, not copied.

**N2 — Paid Draft / Duplicate status labels are wrong · High 🆕**
- Where: `dupVals.items[].statusLabel`
- What happens:
  - Paid digital order with no upload shows **"Information missing"** (it should say "Upload missing").
  - Unpaid digital order that has its upload but is missing a country shows **"Upload missing"**.
  - The accordion header (`statusLabel`) and the document badge (`docBadgeLabel`) disagree.
- Fix: One rule for both labels:
  - `digital && !files.length` → "Upload missing"
  - else `!complete` → "Information missing"
  - else "Ready"
  - Use it for Duplicate and Paid Draft alike.

**N3 — Resend Receipt always says "Credit Card (CC)" · High 🆕**
- Where: `omRrPayment` (line ~10237)
- What happens: Cash, check, ACH, NOBILL and state-paid orders are all shown as a credit card. The Order Overview fix earlier didn't reach this modal.
- Fix: Use one `payTypeLabel(order)` helper everywhere: Order Overview, Resend Receipt, Refund, Receipt.

**N4 — Pay type is only Cash or Card · High 🆕**
- Where: `plrIsCashOrder` / `ovPayType`
- What happens: Checkout records card, ACH, check, reader, NOBILL and state-paid, but saved orders only keep `payMethod: 'Cash' | 'Card'`.
  - Refunds to ACH / check can't be handled differently.
  - NOBILL orders offer refunds.
- Fix: Save `payment: { method, payType, collected }` at checkout, and read it in every place listed under N3.

**N5 — A parent with New + Flagged children shows "In Process" · Medium 🆕**
- Where: `parentStatus`
- What happens: `some('New') → 'In Process'` runs before any Flagged check, so a flag disappears at parent level.
- Fix: Check `some('Flagged') → 'Flagged'` (or show a "Flagged" chip next to the status) before the New / In Process rules.

**N6 — Dead button in the document preview · Medium 🆕**
- Where: line ~5639 (child document preview header)
- What happens: A styled button with no `onClick` (Download).
- Fix: Wire it to download the file, or remove it.

**N7 — Paid Draft "Save Draft" doesn't save · Medium 🆕**
- Where: `dupPaidSaveDraft`
- What happens: It only shows a toast. Leaving the page loses the edits, even though the toast says "Your progress is saved".
- Fix: Save `dup.items` back onto the draft record.

**N8 — Paper Paid Drafts pre-fill country for digital only · Low 🆕**
- Where: `openPaidDraft`
- What happens: Digital documents get `country: 'Spain'`; paper get blank. The seed mixes up "what's missing" with the delivery type.
- Fix: Take missing fields from the draft record, not from delivery type.

**N9 — Revoke & Cancel email names the agency in the code · Low 🆕**
- "Delmarva Secretary of State" is typed into the email text.
- Fix: Read the agency name from Site Configuration.

---

## 3. Critical Fixes (exact implementation)

### CF-1 · Fee ledger per child (fixes C1, C2, H9, N4)
When an order is submitted (Checkout, Skip to Payment, Paid Draft finalize), save on **each child**:
```
fees: { state, ax, service, shipping, discount }   // discount spread across lines in proportion
collected: state + ax + service + shipping − discount   // 0 for NOBILL / state-paid / company-billed
payment: { method: 'card'|'ach'|'check'|'cash'|'reader'|'nobill'|'state', payType }
```
Then one shared helper:
```
refundable(order, childIds?) →
  scope      = childIds ? those children : all children
  collected  = Σ scope.collected   (by line: state, ax, service, shipping)
  refunded   = Σ order.refunds filtered to scope (by line)
  available  = max(0, collected − refunded) per line
  max        = Σ available
```
- Split order for an amount: **state → service → shipping → AX**. AFFIRM is required only once the split reaches AX.
- `plrVals`, `bpVals` (single-child and bulk reject) and `rvVals` all call `refundable()`. Delete `PLR_STATE_PER_CHILD` / `PLR_AX_PER_CHILD`.
- If `collected === 0`: hide Issue Refund and show the note "No customer payment was collected for this order."
- Downstream: the refund tiles gain Service / Shipping lines (or a breakdown tooltip). Refund Activity rows store the split for each line. Financial reports read `fees` instead of `74.95`.
- Regression risk: **high**. Every refund screen changes, and seeded refund events need `service: 0, shipping: 0`.

### CF-2 · Issued only on issue (fixes C3, M11)
- `bpAdvance`: an approve records `done[id] = 'approve'` and sets the child to **`Approved`** (a new interim status). No `Issued`.
- `issueDoc(print)`: sets `Issued` (digital) or `Pending Print` → `Printed` (paper). Writes `issuedAt` and `issuedBy`.
- Leaving the issue step with approved-but-not-issued children keeps them `Approved`. They show up again in Review & Issue as ready to issue.
- `bpIssueBack`: steps back to the review screen with **every** approved child editable (drop the `preIssue` snapshot).
- Downstream: `parentStatus`, the status filters, the Order Management tabs and the dashboards all need `Approved`.
- Regression risk: medium.

### CF-3 · Revocation record (fixes C4)
- Revoke page: **Reason** is required for both options.
- On Continue:
  - Add to `child.history`: `{ type: 'revoked', reason, by, at, apostilleNo }`.
  - Set `child.revokedApostille = apostilleNo`.
  - **Reissue**: status → `Revoked`, then open single Review & Issue with a banner "Reissuing apostille #… (revoked <date>)". Issuing sets `Issued` with `reissueOf`.
  - **Cancel**: status → `Revoked & Cancelled`.
- Regression risk: low.

### CF-4 · Finalize Paid Draft creates the order (fixes N1, N7)
See N1. Share the submit function with Checkout.

---

## 4. Design System Violations

| Component | Current | DS target | Screens affected |
|---|---|---|---|
| Button | 248 raw `<button>` (130 DS) | `Button`, `IconButton` | Order Overview print/resend, Create Order add links, dashboard toolbar, doc viewer, drawers |
| Checkbox | 27 native | `Checkbox` | Refund cash confirm, Revoke cash confirm, Bulk modal rows, table select-all, Apply-all |
| Radio | 5 native | `Radio` / `RadioGroupItem` | Edit Order Information (Order Type), Edit Requestor (Order Type) |
| Select | 30 native | `Select` | Revoke Reason, Refund Reason, Edit drawers, filters |
| Input / Textarea | many raw | `Input`, `Textarea`, `FormField` | Refund amount, AFFIRM, CANCEL, Revoke note, drawers |
| Modal / Drawer | 30+ custom | `Modal`, `Drawer` | Every dialog |
| Toast | custom, one variant | `Toast` | Global |
| Tooltip | 7 DS / 12 `title` | `Tooltip` | Icon-only actions (§9) |
| Badge | 32 DS + custom pills (NO-BILL purple, radius `624.9375rem`) | `Badge` | Receipt, Order Overview |
| Table | 14 tables, 3 different styles (`ca-rt`, `ca-utbl`, inline) | `Table` | Order Management, Users, Reports, Refund Activity |

Duplicate implementations:
- `STATUS_COLOR` is copied 4 times.
- The fee schedule is copied twice (Payment and Edit Order Info).
- There are 4 different email checks.
- The refund-tile markup is repeated in 3 places (PLR, Bulk, Revoke).

---

## 5. Accessibility Violations (WCAG 2.1 AA)

| # | Criterion | Violation | Fix |
|---|---|---|---|
| A1 | 2.1.1 Keyboard | `<tr onClick>` ×6 and `<div onClick>` ×26 without a role or `tabIndex` | Put a link/button in the ID cell; give divs `role="button"`, `tabIndex=0` and Enter/Space |
| A2 | 2.1.2 / 2.4.3 | No focus trap; focus doesn't return to the opening button | DS Modal/Drawer, or a shared `useDialog` (trap, restore, Esc) |
| A3 | 2.1.1 | Esc doesn't close dialogs | Global Esc closes the top-most dialog |
| A4 | 2.1.4 | The `O` single-key shortcut | Require Alt+O, or add an off switch |
| A5 | 1.3.1 / 3.3.1 | Errors not linked to fields (no `aria-describedby`) | Link each error by id |
| A6 | 4.1.3 | Error toasts announced politely; inline form errors not announced | `role="alert"` for errors; live region per form summary |
| A7 | 2.2.1 | Toasts dismiss after 2.2–3.6s | Minimum 5s; pause on hover/focus; errors stay until dismissed |
| A8 | 1.4.1 | Flagged uses the same warning color as In Process / Pending Print | Distinct color + flag icon |
| A9 | 1.4.10 | Drawers with `min-width:520–560px` scroll sideways at 320px | `width:min(100vw, …)` with no min-width |
| A10 | 4.1.2 | RadioGroupItem: no `tabIndex`; `role="radio"` on checkbox type | Fix upstream in the DS |
| A11 | 2.4.7 | Up to 37 focus styles with `outline:none` and no ring **(verify each)** | 4px teal ring token |

Contrast: the token pairs pass. Check the gray-500 helper text on `#F8F9FA` panels (about 4.3:1), which would fall below 4.5:1 **(verify)**.

---

## 6. Refund Calculation Fixes

| Scenario | Current | Correct |
|---|---|---|
| e-Apostille, $74.95 paid, refund $30 | State $20 + AX $10 → AFFIRM | State $5 + AX $25 → AFFIRM |
| e-Apostille, refund $10 | State $10, no AFFIRM | State $5 + AX $5 → **AFFIRM required** |
| Paper walk-in ($20 + $69.95) | Max $74.95 | Max $89.95 |
| Rush + USPS paper ($5 + $69.95 + $25 + $12) | Max $74.95 | Max $111.95 |
| FUNDELD 10% on $74.95 | Max $74.95 | Max $67.46 (collected) |
| NOBILL / state-paid / company-billed | Max $74.95 | Refund hidden; $0 collected |
| Refund after rejection, then Revoke & Cancel on another child | Per-child cap from the constant, limited by the order balance | Per-child cap from that child's `collected − refunded` |
| Full refund | Status stays Cancelled | Badge **Refunded**; partial → **Partially Refunded** |

- Refund Activity: each event should store `{ state, ax, service, shipping, total, method, by, at, reason, affirm }`.
- Remaining balance: `Σ collected − Σ refunded`, shown in the Order Overview payment card.

---

## 7. Status Standardization Matrix (single source of truth)

### Child (sub-order) status
| Status | Color (DS Badge) | Meaning | Allowed next statuses |
|---|---|---|---|
| Draft | gray | Created, unpaid | New (paid), Deleted |
| Paid Draft | gray + "Paid" tag | Paid, information missing | New (finalized), Cancelled |
| New | info (blue) | Submitted, not started | In Process, Flagged, Approved, Rejected, Cancelled |
| In Process | warning | Being reviewed | Approved, Rejected, Flagged, Cancelled |
| Flagged | **orange + flag icon** | Blocked for supervisor | In Process (resolved), Rejected, Cancelled |
| Approved 🆕 | brand (teal) | Decision made, not yet issued | Issued, Pending Print, back to In Process |
| Pending Print | warning | Paper issued, waiting to print | Printed |
| Issued | success | e-Apostille issued | Revoked |
| Printed | success | Paper apostille printed | Revoked |
| Rejected | danger | Denied | *(end)* |
| Cancelled | **gray / neutral** | Withdrawn before issue | *(end)* |
| Revoked | danger | Revoked, reissue pending | Issued (reissue) |
| Revoked & Cancelled | danger | Revoked, no reissue | *(end)* |

Payment tags appear **alongside** the status, never instead of it:
- **Refunded** (gray): refunded = collected.
- **Partially Refunded** (orange): 0 < refunded < collected.

### Parent roll-up (order of precedence)
1. `Incomplete` if any required order information is missing
2. **`Flagged`** if any child is Flagged *(new: comes first)*
3. `New` if all children are New
4. `In Process` if any child is New, In Process or Approved
5. `Pending Print` if paper children are Pending Print and all digital children are finished
6. The shared status, if every child has the same finished status
7. `Printed` if paper children are Printed and digital children are Issued
8. `Completed` for any other all-finished mix

Retire: `Completed` as a child status, `Ready` / `Ready for Processing` (these are document-readiness labels, not order statuses) and `Incomplete` vs `Draft` duplication (use `Draft` for unsubmitted orders).

---

## 8. Validation Improvements

| Form | Field | Current | Replace with |
|---|---|---|---|
| Create / Edit / Duplicate | First / Last Name | "First Name is required." | "Enter the recipient's first name." |
| | Email | "Email is required." / "Please enter a valid email address." | "Enter an email address." / "Enter an email in the format name@example.com." |
| | Country | *(inconsistent)* | "Select a destination country." |
| | ZIP | none | "Enter a 5-digit ZIP code." (only when country is US) |
| | Phone | none | "Enter a 10-digit phone number." |
| | Upload (digital) | badge only | "Upload the document before continuing." (inline, next to the upload area) |
| Refund | Amount | ✔ specific | Keep; append the cap breakdown |
| | Reason | disabled button only | "Select a refund reason." |
| Revoke | Reason | disabled button only | "Select a reason for revoking this apostille." |
| | CANCEL | disabled button only | "Type CANCEL to confirm." once the field is touched |
| Review & Issue | Signed by / Capacity / Seal | disabled Continue | Inline error for each missing field |
| User Mgmt | Invite email | ✔ | Keep; add a duplicate-invite check message |
| Profile | All | "X is required." | Action-first copy |

Every field gets:
- A `<label for>`.
- `*` + `aria-required`.
- An error with an id, linked through `aria-describedby`.
- A red border and ring.
- An error summary at the top of long forms, with `role="alert"`.

---

## 9. Tooltip Coverage Gaps
All 83 icon-only buttons have `aria-label` ✔. Visible DS `Tooltip` is missing on:
- **Document viewers** (Review, Issue, Child preview): Zoom in, Zoom out, Previous page, Next page, Rotate, Download, Print
- **Order Management / Drafts / Issued tables**: ⋯ "More Actions", select-all
- **Refund Activity**: expand/collapse "Show details" / "Hide details"
- **Accordions** (Create, Duplicate, Paid Draft): chevron "Expand" / "Collapse", trash "Delete document"
- **Drawers and modals**: ✕ "Close"
- **Dashboard widgets**: menu, expand, drag handle "Reorder"
- **Users**: row actions

Keyboard: tooltips must also open on focus and close on Esc (the DS Tooltip does both).

---

## 10. Toast Standardization Recommendations
Signature: `flash({ variant: 'success'|'error'|'warning'|'info', title, message, action? })`

| Variant | Icon | Role | Timing |
|---|---|---|---|
| success | `check-circle-fill` green | status | 6s, pause on hover/focus |
| info | `info-circle-fill` blue | status | 6s |
| warning | `exclamation-triangle-fill` amber | status | 8s |
| error | `x-circle-fill` red | **alert** | stays until dismissed |
| with action (Undo) | as variant | status | 10s minimum |

Workflow copy (Title · Message):
- **Save Draft**: "Draft saved" · "Draft #… saved to Drafts."
- **Save Changes**: "Changes saved" · "Your updates to #… have been saved."
- **Save & New / Save & Duplicate**: "Order saved" · "#… saved. Start your next order below."
- **Checkout / Payment**: no toast; the receipt page confirms.
- **Skip to Payment**: info · "Order information can be completed after payment."
- **Issue Apostille**: "Apostille issued" · "#… has been issued." (paper: "…queued for printing.")
- **Refund**: "Refund issued" · "$… refunded to the customer's <method>."
- **Cancellation**: "Order #… cancelled" · "The order has been cancelled." *(fix the spelling)*
- **Revoke & Reissue**: "Apostille revoked" · "Reissue #… from the review page."
- **Paid Draft Completion**: "Order submitted" · "#… is now ready to be processed." *(after N1)*
- **Resend Receipt**: "Receipt sent" · "Sent to name@…"
- **Print actions**: fire **after** `window.print()` returns, as info · "Print dialog opened."
- **Errors**: say what happened and what to do next, e.g. "Couldn't save · Fix the 2 highlighted fields and try again."

---

## 11. Component Migration Recommendations (order)
1. **Toast**: one component, used everywhere. Lowest risk, biggest a11y gain.
2. **Modal / Drawer**: gives Esc, focus trap and focus return in one go. Migrate in this order: Refund → Revoke → Bulk → Edit drawers → the rest.
3. **Form controls** (Input, Select, Checkbox, Radio, Textarea, FormField): with the validation copy from §8. Do this one form at a time.
4. **Table**: give Order Management / Users / Reports a single table with a keyboard-reachable row link.
5. **Tooltip + IconButton**: wrap all 83 icon-only actions.
6. **Badge**: one `statusBadge(status)` + `paymentTag(order)` helper backed by the §7 matrix.
7. Shared helpers (not UI): `refundable()`, `payTypeLabel()`, `isEmail()`, `FEE_SCHEDULE`.

Regression guard: after each step, compare screenshots of Order Management, Order Overview, Review & Issue, Refund and Create Order.

---

## 12. Release Blockers
| # | Blocker | Fix |
|---|---|---|
| 1 | Refund caps / AFFIRM split don't match what was collected (C1, C2, H9) | CF-1 |
| 2 | Finalizing a Paid Draft deletes the order (N1) | CF-4 |
| 3 | Approve marks Issued before issuance (C3) | CF-2 |
| 4 | Revoke & Reissue leaves no revocation record (C4) | CF-3 |
| 5 | Payment method misreported; NOBILL offers refunds (N3, N4) | CF-1 payment record |
| 6 | Error toasts show a success icon (H5) | §10 |
| 7 | Dialogs without Esc / focus trap; rows not reachable by keyboard (A1–A3) | §11 steps 2 and 4 |

Suggested order of work: CF-4 → CF-2 → CF-3 → CF-1 → Toast → Dialogs → Forms → Tables/Tooltips.
