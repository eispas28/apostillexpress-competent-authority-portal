# Parent-Level Refund Modal — Design Specification

**Feature flag:** `parentLevelRefunds`
**Surface:** Refund Order modal, Competent Authority Portal
**Interactive design:** `Parent-Level Refund Modal.dc.html` — flag toggle plus all five user states, live
**Scope:** this modal only. Reports, Discounts, Rejections, Order Details and every other screen are out of scope.

> **Revision note — read §9 first.** Sections 2, 3 and 6 below describe an exploratory version carrying an allocation meter, a hero balance figure and banded layout. That direction was **rejected in favour of minimum UI change**. **Section 9 is the authoritative built design.** Sections 4, 5, 7 and 8 (interaction flow, field logic, outstanding decisions, traceability) apply unchanged to both.

---

## SECTION 1 — Feature Flag Behavior

### `parentLevelRefunds = OFF`

No UI changes. Users see the refund workflow exactly as built today:

- **Refund Order** modal at 720px, opened from the order row action menu
- Child Order table with per-row checkboxes
- **Select All** / **Clear All** controls
- Derived read-only **"Refund amount $X"** computed from the selected rows
- Required **Reason** select
- **Cancel** / **Process Refund** (danger) footer
- On confirm: selected children receive a `Refunded` tag; order status unchanged

Nothing about this path is modified, re-labelled or re-styled. It remains the live experience until the flag flips.

### `parentLevelRefunds = ON`

The same entry point opens the new Parent-Level Refund modal. What changes:

| Removed | Added |
|---|---|
| Child Order table | Refundable balance summary (three maxima) |
| Per-row checkboxes | Manually entered Refund Amount |
| Select All / Clear All | State/AX allocation preview |
| Derived refund amount | AFFIRM acknowledgment (conditional) |
| Per-child `Refunded` tag | Optional Notes field |
| — | View Invoice action |
| — | Previous-refund context |

Behavioral consequences: refunds are processed against the Parent Order only; Child Orders are not financial entities, are not selectable, and receive no allocation; the Parent Order is the authoritative financial record; the order remains refundable until its balance reaches $0.00.

Everything else about the surrounding order management experience is untouched.

---

## SECTION 2 — Final Parent-Level Refund Modal

Container: 560px max width (down from 720px — the table is gone), white, 1px `#E9ECEF` border, 12px radius, `0 24px 48px -12px rgba(10,13,18,.18)` shadow, on the existing midnight-blue 55% scrim with 2px blur. Identical shell to every other modal in the portal.

### Header

- **Title:** "Refund Order" — 18px / 600, unchanged from today
- **Lead:** "This refund is recorded against the Parent Order. Child Order statuses are unchanged." — 14px secondary. States the model change in one sentence at the point of use.
- **Meta:** "Order #307-600 · Paid Aug 10, 2026" — 13px tertiary
- **Close:** 32px ghost icon button, top right

### Body — action strip

Directly under the header, before any financial content:

- **View Invoice** — secondary button, `bi-receipt` + `bi-box-arrow-up-right`, opens the current invoice in a new tab. Placed here deliberately: the employee reviews actual charges *before* deciding an amount, not after.
- **Previous refunds pill** — "1 previous refund" / "3 previous refunds", shown only when history exists
- **Fully Refunded badge** — shown only in the exhausted state

### Financial Summary

A bordered 10px-radius block with a shaded uppercase eyebrow, "Refundable balance". Four rows, `tabular-nums` throughout so figures align:

| Row | Treatment |
|---|---|
| Maximum State Fee Refundable | 13.5px label / 14px semibold value |
| Maximum AX Fee Refundable | 13.5px label / 14px semibold value |
| Already refunded | conditional; muted, signals history without competing |
| **Total Maximum Refundable Amount** | shaded footer row, 19px semibold in sea-depths teal |

The total is the largest number in the modal and the only teal one — it is the constraint every other decision answers to.

### Refund Amount

- Label "Refund Amount *"
- 220px currency input: fixed `$` prefix cell, 1px divider, 42px height, 16px semibold tabular value
- Empty by default. Never pre-filled, never suggested, never recalculated by the system.
- **Helper:** "Up to $90.00. State Fees are refunded first." — names the ceiling and the allocation rule before the employee can get either wrong.

### Allocation preview

Appears as soon as a valid amount is entered, above Reason:

> This refund draws · **State $5.05** + **AX $24.95**

Two pills. The State pill is always neutral. The AX pill turns red-tinted (`rgba(227,59,50,.08)` / `#A32821`) the moment it carries a non-zero value. This is the modal's early-warning system: the employee sees AX exposure the instant it appears, not when a warning block interrupts them.

### Reason

Required select, full width, 42px, existing control styling. Options: Customer request · Duplicate payment · Service not delivered in SLA · Document ineligible · Rejected apostille request · Processing error · Other.

### Notes

Optional textarea, 3 rows, 250 characters, live counter. Placeholder: "Describe the reason for this refund. Appears on the receipt and in audit history." — the placeholder tells the employee who will read it, which is what drives whether they write anything useful.

### AFFIRM Area

Revealed only when the entered amount exceeds the Available State Refund. A red-tinted block with a 4px danger left border and `bi-exclamation-triangle-fill`, carrying the Addendum §9 warning **verbatim**:

> **Warning:** The requested refund exceeds the State Fees currently available for refund for this Parent Order and includes a portion of the AX Service Fees previously collected. By continuing, you acknowledge that some or all of the AX Service Fees will be refunded. To continue, type AFFIRM below.

Below it: a 220px text input, placeholder `AFFIRM`, letter-spaced semibold, autocomplete off.

- Before entry — "Changing the refund amount clears this acknowledgment." The reset rule is stated *before* it can surprise anyone.
- On exact match — green confirmation: "Acknowledgment recorded for $24.95 in AX Service Fees." Naming the amount makes the acknowledgment specific rather than ceremonial.

### Footer Actions

Left: a live status line — "Refunding $30.00 of $75.00 available." / "Type AFFIRM to enable this refund." / "Select a reason to continue." The employee never has to hunt for what's blocking them.

Right: **Cancel** (secondary) · the primary action, which **names its own amount** once one is valid — "Process Refund" with no amount entered, **"Refund $30.00"** once there is one. The button states the consequence rather than the mechanism.

It escalates by risk:

- **Primary teal** when the refund stays within State Fees — a routine financial action
- **Danger red** when the refund reaches into AX Service Fees — matching the AFFIRM block

Disabled until: a valid amount within the maximum, a reason selected, and AFFIRM entered where required.

### Validation Messages

Inline below the amount field, 13px `#E33B32` with `bi-exclamation-circle-fill`, replacing the helper text. The input border stays neutral — the existing portal pattern.

| Condition | Message |
|---|---|
| Non-numeric | "Enter a refund amount as a number, for example 25.00." |
| Zero or negative | "Enter a refund amount greater than $0.00." |
| More than 2 decimals | "Refund amounts can include no more than two decimal places." |
| Above maximum | "This amount exceeds the Total Maximum Refundable Amount of $45.00. Enter $45.00 or less." |

Every message names the current maximum or the correct format. None says only "invalid".

---

## SECTION 3 — User States

### State 1 — Refund available

Balance intact: State $20.05, AX $69.95, Maximum $90.00. No previous-refund pill. Amount empty, allocation preview hidden, no AFFIRM block. CTA primary teal, disabled until amount and reason are entered. The default, quietest state.

### State 2 — AX confirmation required

One $15.00 refund already processed; $30.00 entered against $5.05 remaining State Fees.

Allocation preview shows State $5.05 + **AX $24.95** with the AX pill red-tinted. AFFIRM block visible with the verbatim warning. CTA is danger red and disabled until AFFIRM is typed exactly. Footer reads "Type AFFIRM to enable this refund."

Editing the amount clears the acknowledgment and, if the new amount falls back within State Fees, retracts the whole block and returns the CTA to primary teal.

### State 3 — Partial refund after previous refund

One $15.00 refund processed. Every figure recalculated: State $5.05, AX $69.95, Maximum $75.00, Already refunded $15.00, "1 previous refund" pill present. The form is identical to State 1 — a second refund is entered exactly like the first. Nothing carries over from the previous refund; each is its own event.

### State 4 — Fully refunded

Cumulative refunds equal the Total Amount Collected. Maximum $0.00, "Fully Refunded" badge, "3 previous refunds" pill.

The form is **withdrawn, not disabled** — amount, reason, notes, AFFIRM and the primary action are all absent. In their place a confirmation line with `bi-check-circle-fill`: "Nothing left to refund — The full $90.00 collected on this Parent Order has been refunded. The complete history remains on the order's audit history." Only Cancel remains. The hero figure greys out and carries a **Fully Refunded** badge; the meter is withdrawn with the form.

A row of greyed-out inputs invites an employee to try and fail. Removing them answers the question before it is asked, and the balance summary stays visible so the $0.00 is evidence rather than assertion.

### State 5 — Validation error

$45.01 entered against a $45.00 maximum. Helper text is replaced by the error naming the maximum twice — as a fact and as an instruction. Allocation preview is suppressed (there is no valid allocation to show). CTA disabled. All other entered values are retained.

---

## SECTION 4 — Interaction Flow

1. **Open.** Employee selects Refund from the Parent Order. Modal fetches current balances server-side and renders the three maxima. Amount is empty.
2. **Review charges** *(optional)*. View Invoice opens the current invoice in a new tab. Modal state is preserved — nothing is lost, nothing resets.
3. **Enter amount.** On each keystroke: validate format, validate against the current maximum, compute the State/AX split, render the allocation preview.
4. **Branch on allocation.**
   - *Within State Fees* → no acknowledgment. CTA primary teal.
   - *Reaches AX Service Fees* → AFFIRM block appears, AX pill turns red, CTA becomes danger.
5. **Select reason.** Required. Footer status updates.
6. **Add notes** *(optional)*. Counter updates live.
7. **AFFIRM if required.** Exact match enables the CTA and shows the green confirmation naming the AX amount. *Any* subsequent change to the amount clears it and step 7 repeats.
8. **Submit.** Client-side gate passes → request sent. Balances are revalidated **on the server** against current values, because they may have moved since the modal opened.
9. **Await confirmation.** Only a refund the payment processor confirms as succeeded updates balances. The successful refund date comes from that confirmation, not from submission.
10. **Success.** Modal closes. Toast with Dismiss: "$30.00 refunded — $5.05 State Fees and $24.95 AX Service Fees. $45.00 remains refundable." The split is echoed back because it is the number that will be reconciled and audited.
11. **Recalculated.** Available State Refund, Available AX Service Fees for Refund, Maximum Refund Available and Net Amount Retained are recalculated. The refund is appended as its own event. Child Order statuses are untouched. Reopening the modal shows State 3 — or State 4 if the balance reached $0.00.

**Failure paths.** A rejected server validation returns the current maxima and the blocking message, leaving every entered value in place. A failed processor refund surfaces an error and leaves all balances unchanged.

---

## SECTION 5 — Field Logic

**Available State Refund**
`Total State Fees Collected − Cumulative Successful State Fee Refunds`
Total State Fees Collected is the State Processing Fees remaining *after* all parent-level discounts. At payment this equals the discounted state total; it floors at $0.00.

**Available AX Refund**
`Total AX Service Fees Collected − Cumulative Successful AX Service Fee Refunds`
Untouched by discounts — discounts reduce State Processing Fees only. Refundable at the Parent Order level regardless of child order type.

**Maximum Refund Available**
`Available State Refund + Available AX Service Fees for Refund`
At payment this equals Total Amount Collected. Cumulative successful refunds can never exceed Total Amount Collected.

**State-first allocation**
```
State Fees Refunded = min(refund amount, Available State Refund)
AX Service Fees Refunded = refund amount − State Fees Refunded
```
Both portions are stored on the refund event. Worked: Available State $20.05, refund $15.00 → State $15.00 / AX $0.00. Available State $5.05, refund $30.00 → State $5.05 / AX $24.95.

**AFFIRM trigger**
Required when `refund amount > Available State Refund`. The boundary is inclusive — an amount *equal* to the Available State Refund requires no acknowledgment. Once Available State Refund reaches $0.00, every subsequent refund requires AFFIRM. Exact case-sensitive match on `AFFIRM`. Resets whenever the amount changes. AFFIRM required, AFFIRM entered, the user and the timestamp are all recorded.

**Refund remaining balance**
After each successful refund all four values recalculate and become the current position used for the next refund's validation, invoice presentation, audit and reporting. Each refund is a separate event; later refunds never overwrite earlier ones. The Parent Order stays refundable while Maximum Refund Available is greater than $0.00 — including after the order has been cancelled or revoked.

---

## SECTION 6 — Implementation Notes

### UNCHANGED

- Modal shell: scrim, blur, container, border, radius, shadow, 20px padding rhythm
- Header composition: title / lead / meta / ghost close button
- `FormField` label, required asterisk, hint and error treatments
- Select and textarea control styling — 42px, 8px radius, gray-300 border, shadow-xs
- `Button` secondary / primary / danger variants and the Cancel-then-action footer order
- Inline error pattern: neutral input border, red message with `bi-exclamation-circle-fill`
- `Badge` component for refund status
- Toast with Dismiss
- Entry point: the order row action menu is not touched
- Cancel Order modal — separate surface, out of scope
- All tokens: sea-depths teal, status colors, Roboto, 8px control / 12px card radius, 4px spacing

### NEW

- **Refundable balance summary** — bordered block, eyebrow header, label/value rows, emphasised total footer. Built from existing money-row rhythm; reusable on the Rejection surface, which needs the same three maxima.
- **Currency input with fixed `$` prefix** — lifted verbatim from the Payment Summary discount fields.
- **Allocation preview** — two pills, AX tinting on non-zero.
- **AFFIRM acknowledgment block** — warning + input + reset notice + confirmation. Its own component; the Rejection surface uses it unchanged.
- **View Invoice action** — secondary button with external-link affordance.
- **Previous-refunds pill** and **Already refunded** row.
- **Exhausted-balance panel** for State 4.
- **Live footer status line.**

### REMOVED

- Child Order table inside the Refund modal
- Per-child selection checkboxes
- Select All / Clear All
- Derived read-only refund amount
- Per-child `Refunded` tag rendered in the modal's status column
- Any code path allocating a refund across children

### MODIFIED

- **Container width** 720px → 560px. No table, so the wider container would leave the form stranded.
- **Reason select** — options extended with "Rejected apostille request"; control unchanged.
- **Notes** — promoted from conditional to always present, relabelled "Notes (optional)", hint rewritten from email-facing to receipt-and-audit-facing.
- **Confirmation text input** — repurposed as the AFFIRM input: conditionally revealed, resettable, with its own warning block.
- **Primary action** — fixed danger → conditional primary/danger by allocation, and the label now carries the amount ("Refund $30.00").
- **Container** — nested cards replaced by tinted bands separated by hairlines; 14px radius, deeper shadow, 540px.
- **Lead copy** — child-selection instruction → parent-level statement.

### Engineering notes

- All balances are **server-calculated**. The modal displays them and revalidates on submit; it never derives a maximum from what's on screen.
- Refund submissions on one Parent Order must be **serialized or version-checked**. If the balance moved after the modal opened, the second submission is revalidated against current values and blocked with the current figures shown.
- **Only processor-confirmed successes** update balances. Pending refunds are visible and cannot be duplicated; failures leave balances untouched.
- The Maximum Refund Available ceiling is an **application-level rule**, enforced across cash, state-billed and card — not a processor side-effect.
- Each refund is an **append-only event** recording amount, State/AX split, the Available State Refund at the time, all four post-refund balances, notes, reason, processor status, user, confirmed date/time, and the AFFIRM quartet. No child references, no per-child amounts.

---

## SECTION 7 — Outstanding Decisions

Unresolved items found during analysis. **None of them shaped the design above**, and each has a defined fallback that the current design already honors.

| # | Decision | How the design proceeds regardless |
|---|---|---|
| 1 | Is a refund **reason required or optional**? US-020 specifies optional Notes; the BA recommends a required reason; the prototype has a required select today. | Reason required, Notes optional — the stricter reading. Relaxing it later removes one asterisk. |
| 2 | Composition of the **State Processing Fee** pool: base fee only, or base + expedited + shipping? | The modal displays server-supplied maxima and never computes them. Whatever the pool resolves to, the UI is correct. |
| 3 | Is **AFFIRM case-sensitive**? | Exact case-sensitive match on `AFFIRM`. Loosening it is a one-line change with no UI consequence. |
| 4 | Which **roles** may process refunds or enter AFFIRM? | Not modelled. Role gating applies at the entry point, outside this modal. |
| 5 | How is a refund marked **rejection-related**? | "Rejected apostille request" exists as a reason, but the authoritative tie must be explicit. Owned by the Rejection surface, out of scope here. |
| 6 | Status vocabulary: **`Refunded` or `Fully Refunded`**? | `Fully Refunded` used. A label swap. |
| 7 | Does a **reference anchor** belong beside the amount field? The parent cap permits a refund far larger than any single line item's original charge. | No anchor shown. The design satisfies "entered manually, nothing pre-filled" as written. |
| 8 | **Notes character limit** — the source sets none. | 250, matching the existing notes field in the portal. |
| 9 | How are **pending and failed** processor refunds displayed? | Success path only. Pending/failed presentation is an Order Overview concern. |
| 10 | Refund behavior for **pre-cutover** orders. | Gated by the flag. Pre-cutover orders stay on the OFF experience. |

---

## SECTION 8 — Story Traceability

Every element of this design traced to its source story. Epics: **E4** Parent-Level Refunds & AFFIRM Controls · **E3** Checkout, Invoice & Receipt Presentation · **E6** Audit History · **E9** Stripe & BC Integration · **E8** Migration & Cutover.

### Primary — these stories are what the modal *is*

| Story | Pri | What it produced |
|---|---|---|
| **US-017** Redesign the Refund modal with no Child Order list | P0 | The whole premise. No child table, no per-child checkboxes, no per-child Amount Paid, single parent-level transaction, no child status changes. Drove the 720px → 560px width. |
| **US-018** Show the maximum refundable breakdown at the top of the modal | P0 | The **Refundable balance** block — Maximum State Fee Refundable, Maximum AX Fee Refundable, Total Maximum Refundable Amount, positioned above the amount field and reflecting all prior refunds. |
| **US-020** Enter the refund amount and optional Notes | P0 | The currency amount field (two decimals) and the optional Notes textarea. Submittable without notes. Notes shown on receipt and audit history. |
| **US-021** Validate the refund amount against Maximum Refund Available | P0 | All four validation messages, the error naming the current maximum, rejection of zero/negative/non-numeric, and the disabled CTA. |
| **US-022** Attribute refunds to State fees first, then AX Service Fees | P0 | The **allocation preview** pills and the `min(amount, availableState)` logic. Both portions stored on the event. |
| **US-023** Require AFFIRM for refunds that reach into AX Service Fees | P0 | The AFFIRM block, the verbatim §9 warning, exact-match gating, the reset-on-amount-change rule and its advance notice, the green acknowledgment naming the AX amount. Also the inclusive boundary and the zero-balance case. |
| **US-024** Support partial and multiple refunds with recalculation | P0 | The **partial refund after previous refund** state, "Already refunded" row, previous-refunds pill, post-submit recalculation, each refund as its own event. |
| **US-016** Maintain the Parent Order financial summary | P0 | The balance figures themselves and the rule that all values are server-calculated, not derived on screen. |
| **US-015** Add a View Invoice / View Receipt link | P1 | The **View Invoice** action, new tab, no state reset, disabled-with-reason when no invoice exists. |

### Supporting — shaped behavior without adding visible elements

| Story | Pri | Contribution |
|---|---|---|
| **US-053** Show the overall Stripe refund status | P1 | The **Fully Refunded** badge and the State 4 exhausted treatment. |
| **US-052** Update the Stripe integration for parent-level refunds | P0 | Only processor-confirmed successes update balances; one refund per parent payment; no child references. |
| **US-026** Handle pending and failed refunds | P1 | Failure path leaving balances unchanged; successful refund date taken from confirmation, not submission. |
| **US-036** Audit refund activity, post-refund balances and AFFIRM | P0 | The full append-only event payload in Implementation Notes — split, prior Available State Refund, all four post-refund balances, notes, status, user, timestamp, AFFIRM quartet. |
| **US-028** Prevent over-refunds when two users refund at once | P2 | Server revalidation on submit and the serialization / version-check requirement. |
| **US-021 + US-027** Refund after revoke or cancel | P0 / P2 | The rule that the action stays available while Maximum Refund Available > $0.00 — and therefore that State 4 is the *only* unavailable state. |
| **US-009** Retail Child Order values never drive calculations | P0 | Why no child figures appear anywhere in the modal, including as reference. |
| **US-046** Apply the parent-level model from a cutover date forward | P0 | The flag itself, and pre-cutover orders remaining on the OFF experience. |

### Referenced but deliberately *not* designed here

| Story | Why out of scope |
|---|---|
| **US-019** Select Child Orders in the Cancel Order modal | Separate surface. It keeps its child list; this modal has none. Named only as the destination for child status changes. |
| **US-031** Rejection-related refund via the standard workflow | The Rejection screen reuses this modal's balance block and AFFIRM block unchanged. The rejection-related *attribution* control belongs there, not here. |
| **US-014** Parent-level refund status on the receipt | Receipt output, blocked on the Marketing template. |
| **US-013 / US-012** Invoice versions | The modal only *links* to the current invoice. |
| **US-038–US-045** Reporting | Out of scope by instruction. |
| **US-003–US-011** Discounts | Out of scope by instruction. The balances shown are post-discount inputs to this modal. |

### Confirmed decisions applied

From the 15 Sep stakeholder call, beyond the stories: refunds tracked at parent level only · refund priority state-then-AX with an explicit AFFIRM step · "Amount Paid" per child removed from the modal · maximum refundable amounts displayed at the top · free-text Notes · View Invoice on refund and rejection screens · up to 100% of AX fees refundable after the fact.


---

## SECTION 9 — Built Design (authoritative)

Implemented with the **minimum UI change** necessary. Existing modal structure, spacing, typography, form fields, footer actions and design-system components are preserved. No visualizations, meters, charts, timelines, hero graphics, or new interaction patterns.

Container: **560px**, white, 1px `--ax-gray-200` border, 12px radius, existing modal shadow, existing midnight-blue scrim. Identical shell to every other modal in the portal. All colors reference `--ax-*` tokens.

### 9.1 Components, and why each exists

| Component | Purpose | Requirement |
|---|---|---|
| **Title** — "Refund Order" | Unchanged label. The action has not changed name, only scope. | — |
| **Lead** — "Recorded against the Parent Order. Child Order statuses are unchanged." | States the model change at the point of use. Staff previously selected children here; the absence of that table needs one sentence of explanation, or its removal reads as a defect. | US-017 |
| **Metadata row** — `#307-600 \| Paid Aug 10, 2026 \| View Invoice` | Identifies the record being refunded and gives access to actual charges before an amount is decided. Pipe-separated inline row, existing tertiary type. | US-015 |
| **Maximum State Fee Refundable** | The threshold below which no acknowledgment is required. Exact value, no graphic. | US-018 |
| **Maximum AX Fee Refundable** | The protected pool. Exact value. | US-018 |
| **Previously refunded** *(conditional)* | Explains why the maxima are lower than the amount collected. Shown only when refunds exist. | US-024 |
| **Total Maximum Refundable Amount** | The validation ceiling. Shaded footer row, 16px semibold — emphasised by weight and background, not by scale. | US-018, US-021 |
| **View Refund Activity (n)** *(conditional)* | Text disclosure revealing prior refund events. Collapsed by default so the decision surface stays above the fold. | US-024, US-036 |
| **Refund Activity list** *(conditional)* | Per event: amount, date/time, State/AX split, AFFIRM acknowledgment, reason, user, status, notes. Plain rows in the existing bordered-block language. | US-036, Addendum §13 |
| **Refund Amount \*** | Manual entry. Existing 40px currency field with `$` prefix cell, as used on Payment Summary. Empty on open, never pre-filled. | US-020, US-031 |
| **Reason \*** | Required select, existing control. Retains the current modal's required-reason behavior. | US-020, Addendum §12 |
| **Notes (Optional)** | Free-text, 250 characters. Helper: "Appears on receipt and audit history." — tells the employee who reads it. | US-020, US-014 |
| **AFFIRM block** *(conditional)* | Appears only when Refund Amount > Available State Refund. Carries the statement, both portions as label/value rows, the AFFIRM input, and the reset notice. | US-023 |
| **Cancel** | Unchanged secondary action. | — |
| **Process Refund** | Unchanged label, unchanged danger variant, unchanged footer position. Disabled until valid amount + reason + AFFIRM where required. Withdrawn entirely at a $0.00 balance. | US-021, US-023 |
| **Validation messages** | Inline below the amount field, neutral input border + red message with `bi-exclamation-circle-fill` — the existing portal pattern. Each message names the current maximum or correct format. | US-021 |
| **Success toast** | Existing toast with Dismiss, reporting the amount and its State/AX split. | US-022 |

### 9.2 AFFIRM block content

    ⚠ This refund includes AX Service Fees.

       State Fee Portion          $5.05
       AX Fee Portion            $24.95

       Type AFFIRM to continue. *
       [ AFFIRM            ]
       Changing the refund amount clears this acknowledgment.

Stating both portions is what makes the acknowledgment specific rather than ceremonial — the employee confirms a number, not a concept.

> **Outstanding:** Addendum §9 prescribes a longer warning ("substantially similar" wording). This block uses the shorter approved copy. Confirm the abbreviated form satisfies §9.

### 9.3 New · Modified · Unchanged

**NEW**
- Refundable balance block — three label/value rows plus shaded total. Reuses the existing bordered-block pattern; no new pattern introduced. Reusable as-is on the Rejection screen, which needs the same three values.
- AFFIRM block — statement, two portion rows, input, reset notice. Assembled from existing alert, label/value and input patterns.
- Refund Activity disclosure and list — existing text-button disclosure plus existing bordered list rows.
- Metadata row — existing tertiary text line, pipe-separated, with View Invoice as a standard link.

**MODIFIED**
- **Container width** 720px → 560px. The child table is gone; the wider container would leave the form stranded.
- **Lead copy** — child-selection instruction → parent-level statement.
- **Reason** — options extended with "Rejected apostille request". Control unchanged.
- **Notes** — promoted from conditional to always present; relabelled "Notes (Optional)"; helper rewritten from email-facing to receipt-and-audit-facing.
- **Confirmation text input** — repurposed as the AFFIRM input: conditionally revealed and resettable.
- **Process Refund** — same label, variant and position; disabled logic extended to cover AFFIRM, and the button is withdrawn at a $0.00 balance.

**UNCHANGED**
- Modal shell, scrim, blur, border, radius, shadow, 20px padding rhythm
- Header composition and ghost close button
- Label, required asterisk, helper and error treatments
- Input, select and textarea styling — 40–42px, 8px radius, gray-300 border
- `Button` secondary/danger variants and Cancel-then-action footer order
- Inline error pattern
- Toast with Dismiss
- Entry point — the order row action menu is untouched
- Cancel Order modal — separate surface, keeps its child list
- All tokens: sea-depths teal, status colors, Roboto, 8px/12px radius, 4px spacing

**REMOVED from the existing modal**
- Child Order table, per-child checkboxes, Select All / Clear All
- Derived read-only refund amount
- Per-child `Refunded` tag
- Any refund-allocation-across-children code path

### 9.4 States

| State | Balances | Amount | What renders |
|---|---|---|---|
| **Empty** | $20.05 / $69.95 / **$90.00** | — | Balance block, empty form. No AFFIRM. Process Refund disabled. |
| **Valid refund** | $20.05 / $69.95 / **$90.00** | $15.00 | Within state fees — no AFFIRM. Enabled once a reason is selected. |
| **Partial refund** | $5.05 / $69.95 / **$75.00** | — | Recalculated maxima, "Previously refunded $15.00", View Refund Activity (1). Form identical to Empty. |
| **AFFIRM required** | $5.05 / $69.95 / **$75.00** | $30.00 | AFFIRM block with State $5.05 / AX $24.95. Disabled until AFFIRM typed exactly. |
| **Fully refunded** | $0.00 / $0.00 / **$0.00** | — | Balance block at zero, explanatory panel, View Refund Activity (3). Form and Process Refund withdrawn; Cancel only. |
| **Validation error** | $0.00 / $45.00 / **$45.00** | $45.01 | Inline error naming the $45.00 maximum. Disabled. Entered values retained. |
