# ApostilleXpress CA Portal — UX / QA Audit
Scope: `CA Dashboard.dc.html` (all screens) reviewed against the ApostilleXpress Design System, WCAG 2.1 AA and the business rules agreed in this project. Findings come from source review plus the workflows built so far. Where something needs a live click-through to confirm, it's marked **(verify)**.

---

## 1. Executive Summary
The portal is complete and its workflows hang together, but it isn't production-ready yet. There are three kinds of blockers:

1. **Money.** Refund limits are hard-coded at $20.00 state + $54.95 AX for each child order. Orders are actually charged $5 or $20 state + $69.95 AX + service + shipping, so every refund cap, every "Maximum Refund Available" figure and every AFFIRM split is wrong.
2. **Status integrity.** Approving marks documents **Issued** before the issue step is finished. Revoke & Reissue doesn't record the revocation.
3. **Accessibility.** Toasts aren't announced to screen readers. Modals can't be closed with Esc. Clickable table rows can't be reached by keyboard. A single-letter shortcut (`O`) works anywhere on the page.

Design system adoption is partial. Many controls are hand-built with inline styles instead of design system components: 248 raw buttons vs 130 DS Buttons, 27 native checkboxes vs 7 DS Checkboxes, 30 native selects vs 17 DS Selects, and 0 DS Modal / Toast.

Counts: **4 Critical · 9 High · 14 Medium · 9 Low**

---

## 2. Critical

**C1 — Refund caps don't match what was charged**
- Screen: Parent-Level Refund modal, Reject (Review & Issue), Bulk Reject modal, Revoke & Cancel
- Component: `PLR_STATE_PER_CHILD = 20`, `PLR_AX_PER_CHILD = 54.95`
- Issue: Refund availability comes from fixed constants. Create Order charges e-Apostille $5 state + $69.95 AX, and paper $5 (mail-in) or $20 state + $69.95 AX, plus service fees (Rush $25, Expedited $50) and USPS shipping ($12).
  - Electronic orders: state refunds are over-allowed by $15 per child.
  - Every order: AX refunds are under-allowed by $15 per child.
  - Service fees and shipping can never be refunded.
- Expected: Available State Refund, Available AX Refund and Maximum Refund Available come from each order's actual fee lines, minus refunds already issued.
- Fix: Store the fee breakdown for each child when the order is paid (state, AX, service, shipping, discount). Point `plrVals`, `bpVals` and `rvVals` at that record.

**C2 — Refunds ignore discounts and promo codes**
- Screen: All refund surfaces
- Issue: If an order used FUNDELD (10%), a signature/general discount or NOBILL, the refund cap still assumes full price. On a NOBILL ($0) order, this can refund money that was never collected.
- Expected: Refund cap = amount actually collected − refunds already issued. NOBILL, state-paid and company-billed orders have no customer refund (or they follow a separate credit rule).
- Fix: Cap = `min(fee line, collected share)`. Hide or disable Issue Refund when the amount collected is $0.

**C3 — Approve sets "Issued" before the apostille is issued**
- Screen: Review & Issue → Apostille to Issue
- Component: `bpAdvance` (`status = dec === 'approve' ? 'Issued'`)
- Issue: Continuing on an Approve changes the child's status to **Issued** immediately. If the user then leaves the issue step (sidebar, breadcrumb, refresh), the documents show Issued even though nothing was issued or printed. Previous now undoes only the last batch.
- Expected: Approve → an interim state ("Approved" or "In Process"). Issued is set only by **Issue** / **Issue & Print**.
- Fix: Set the status in `bpFinishIssue` / `issueDoc` instead. Approve only records `done[id] = 'approve'`.

**C4 — Revoke & Reissue leaves no revocation record**
- Screen: Revoke Document → Revoke & Reissue
- Issue: Continue sends the user to single-order Review & Issue. The original apostille is never marked revoked, there's no audit entry, and the e-Register still treats the old certificate as valid until something new is issued.
- Expected: The old apostille is marked revoked with a reason, date and user. The new one links back to it ("Reissue of #…").
- Fix: Take a reason on the Revoke page for both options. Write the revocation event before sending the user to Review & Issue. Show a "Reissuing #…" banner on the Review & Issue page.

---

## 3. High

**H1 — Toasts aren't announced to screen readers**
- Screen: Global toast
- Issue: The toast region has no `aria-live` / `role="status"`, so screen reader users miss every confirmation and error.
- Fix: Put `role="status" aria-live="polite"` on the toast region, and `role="alert"` for errors.

**H2 — No Esc to close; no focus trap**
- Screen: All 30+ modals and drawers
- Issue: The only global key handler toggles a panel with the `O` key. Esc does nothing. Focus isn't kept inside dialogs and doesn't return to the button that opened them.
- Fix: Esc closes the top-most dialog. Keep Tab focus inside the open dialog. Return focus to the button that opened it. The DS `Modal` / `Drawer` handle all of this.

**H3 — Single-letter shortcut works anywhere (WCAG 2.1.4)**
- Component: the `keydown` handler for `O`
- Issue: Pressing `O` anywhere outside a text field toggles a panel. This clashes with screen reader and voice-control commands.
- Fix: Require a modifier key, or add a setting to turn the shortcut off.

**H4 — Clickable table rows can't be reached by keyboard**
- Screen: Order Management, Users, Reports tables (6 clickable rows) + 26 clickable `<div>`s with no role
- Issue: No `tabIndex`, no role and no Enter/Space handling, so keyboard users can't open orders.
- Fix: Put a real link or button in the first cell (or ID cell) and keep the row click as a mouse shortcut.

**H5 — Error toasts look identical to success toasts**
- Component: `flash(msg, title, action)`
- Issue: The toast has no type. "Couldn't save" appears in the same success style as "Information updated".
- Fix: Add a `variant` (success, error, warning, info) that maps to the DS Toast / Alert colors and icons.

**H6 — Untitled toasts auto-dismiss after 2.2s (WCAG 2.2.1)**
- Issue: Toasts without a title disappear after 2.2s; titled ones after 3.6s. That's too short to read, and they don't pause on hover or focus.
- Fix: Minimum 5s; pause while hovered or focused. Error toasts stay until dismissed.

**H7 — Field errors aren't linked to their fields**
- Screen: Create / Edit Order, Profile, Invite User, Refund, Revoke
- Issue: `aria-invalid` is used (35 times) but `aria-describedby` isn't used at all, so screen readers don't read the error message with the field.
- Fix: Give each error message an id and point the field's `aria-describedby` at it.

**H8 — Generic required-field messages**
- Screen: Profile, Invite, Create Order recipients (`'First Name is required.'`, `label + ' is required.'`)
- Issue: The messages say what's wrong but not what to do.
- Expected: "Enter the customer's first name." / "Select a destination country."
- Fix: Replace `mk(...).msg` with action-first copy for each field.

**H9 — Service fees and shipping never appear in refund tiles**
- Screen: Refund tiles on every refund surface
- Issue: The tiles show Original Price = $74.95 flat. A Rush + USPS paper order actually costs $126.95+, so the "Original Price" tile is wrong.
- Fix: Tie this to C1. Show state, AX, service and shipping as separate lines, or roll them up with a breakdown tooltip.

---

## 4. Medium

**M1 — Status vocabulary drifts**
- The design system guide lists *Revoked*. The portal uses **"Revoked and Cancelled"**.
- **Incomplete**, **Draft** and **Paid Draft** overlap.
- **Completed** and **Issued/Printed** both mean "done".
- Fix: Publish one status list (name → color → meaning → allowed next statuses) and use it everywhere.

**M2 — Different statuses share a color**
- *In Process*, *Flagged* and *Pending Print* are all warning.
- *Cancelled*, *Rejected* and *Revoked and Cancelled* are all danger.
- In Users, *Inactive* = *Expired* = *Revoked* = danger.
- Flagged needs its own treatment (it blocks the order), and Cancelled vs Rejected need telling apart.
- Fix: Flagged = orange with a flag icon. Cancelled = gray/neutral. Rejected = danger.

**M3 — `STATUS_COLOR` is defined 4 times**
- Line refs: 8564, 8780, 10109, 10262. The child-level copy is missing `Completed` and `Incomplete`, so those statuses would get no color there.
- Fix: One shared map.

**M4 — "Partially Refunded" badge only shows in one place**
- The orange badge renders on a single screen. The Order Management list, Child Order Details and the drawer don't show it. **(verify)**
- Fix: Work out the refund state from the refund total vs the amount collected, and show it next to the status everywhere.

**M5 — Promo codes stack with manual discounts**
- Component: `PROMOS`, `sigDisc`, `genDisc`
- Issue: The promo % is applied to the full subtotal, and manual discounts are subtracted too. The total is clamped at $0, but the "Discounts" line can be larger than the subtotal.
- Also:
  - No fixed-amount promo codes.
  - Expired and invalid codes share one message.
  - Promos also discount state fees and shipping.
- Fix: Decide the business rule (which fee lines a promo applies to; whether promos stack). Apply the discount after manual discounts. Cap the Discounts line at the subtotal. Give expired and invalid codes separate messages.

**M6 — ZIP and phone aren't validated**
- Screen: Edit Requestor drawer (`ovFZip`), Create Order recipient / customer
- Issue: The fields accept any text.
- Fix: US ZIP `^\d{5}(-\d{4})?$` when Country = US. Phone formatted as `(xxx) xxx-xxxx`, 10 digits.

**M7 — Four different email checks**
- Four slightly different regexes are used (lines 6210, 6860, 7606, 10229, 11763).
- Fix: One shared `isEmail()` helper.

**M8 — Revoke & Cancel overlaps the older revoke popup**
- `childRevoke` still flashes "Document revoked" and there's a "Revoke document" dialog at line 1806. **(verify)** whether any entry point still opens it.
- Fix: Remove the old path.

**M9 — Too few visible tooltips**
- All 83 icon-only buttons have `aria-label` (good). Only 12 show a `title` and only 7 use the DS Tooltip, so sighted mouse users see no hint on about 64 of them.
- Fix: Wrap icon-only buttons in DS `Tooltip` (see §8).

**M10 — Modals and drawers are hand-built**
- 0 uses of DS `Modal` / `Drawer`.
- Close buttons, header padding and footer placement vary; for example, the Recipient and Edit Order Information drawers use `42vw` / `50vw` widths.
- Fix: Move to the DS components; standardize the header (title + close), a fixed footer (secondary left, primary right) and a scrolling body.

**M11 — Review & Issue "Previous" only restores the last batch**
- Sub-orders approved one at a time before the last Continue can't be reopened from the issue step.
- Fix: Let Previous step back through every decided sub-order (this depends on C3).

**M12 — Clicking the Revoke option card body does nothing**
- The RadioGroupItem card selects on click, but it isn't a native radio: arrow keys don't move between options and it can't be reached with Tab. The RadioGroupItem component itself is the problem.
- Fix: Add `tabIndex=0`, Space/Enter to select and arrow-key roving to the RadioGroupItem group (fix upstream in the DS).

**M13 — The "Issue Refund" checkbox card uses `role="radio"`**
- The DS RadioGroupItem announces `role="radio"` even when it's the checkbox type.
- Fix: Use `role="checkbox"` for `type="checkbox"` (DS fix).

**M14 — Heading scale isn't consistent**
- Page `h1` sizes are 22, 24, 26, 28 and 30px across screens. The design system uses h1 40 and h2 32; the portal convention is 26.
- Fix: One page-title style (26px / 600) on every screen.

---

## 5. Low

- **L1** — Spelling mix: status "Cancelled", but the cancellation email and toast say "canceled". Choose one; the portal convention is "Cancelled".
- **L2** — Button casing: "Save changes" and "Save Changes" both appear. The design system says Title Case for record actions.
- **L3** — Off-scale type sizes: 13.5px (222 uses) and 14.5px (81 uses). The type scale is 12 / 14 / 16.
- **L4** — Red drift: `#E33B32` is the token, but `#D92D20` (5 uses) and `#B42318` (1 use) are also used.
- **L5** — Up to 37 focus styles set `outline:none` with no visible ring in the same rule. **(verify)** Each needs the 4px teal ring.
- **L6** — Toast wording: "Successfully updated information." has a trailing period; similar titles elsewhere don't.
- **L7** — Some toasts put the title in the message slot and the message in the title slot (e.g. assignment toast: title = "3 orders assigned to…", body = "They will appear in the queue momentarily."). Fine, but apply the pattern consistently.
- **L8** — The "Print Receipt" toast appears before the print dialog opens and says it was "sent to the printer" even if the user cancels printing.
- **L9** — Dashboard toasts ("Dashboard exported", "Share link copied") confirm actions that are only simulated. Make sure they're wired to real actions before launch.

---

## 6. Design System Inconsistencies
| Area | Finding |
|---|---|
| Buttons | 248 raw `<button>` vs 130 DS `Button`; secondary buttons are rebuilt with inline border and shadow at 34–40px heights. |
| Destructive | Delete Recipient uses an outlined red (`#F3C0BD` border); other destructive actions use solid danger. Pick one. |
| Checkbox / Radio | 27 native checkboxes, 5 native radios (Edit Order Info, Edit Requestor) vs DS `Checkbox` / `Radio` elsewhere. |
| Select / Input | 30 native `<select>` vs 17 DS `Select`; 17 DS `Input` vs many raw inputs with repeated inline styles. |
| Modal / Drawer / Toast | No DS components used. |
| Badges | Status colors come from four local maps (M3); the paid badges use their own purple (`#6941C6`) for NO-BILL. |
| Typography | h1 size drift (M14); off-scale 13.5 / 14.5px (L3). |
| Radius | Pills mix `999px` and `624.9375rem`; use the DS `full` token. |

## 7. Missing Validation Rules
- Postal: ZIP format per country (M6).
- Phone: 10-digit US format with optional extension (M6).
- Email: one shared rule (M7).
- Refund amount: cap must use actual collected fees (C1, C2).
- Promo: expired vs invalid, and which fee lines a promo applies to (M5).
- Revoke & Reissue: reason required (C4).
- Upload: file type (PDF), size cap and page count are not enforced before Review & Issue. **(verify)**
- Signature / seal on Approve: needs a clear inline error next to the missing field, not only a disabled Continue.

## 8. Missing Tooltips
Visible tooltips are needed on icon-only actions in these areas (all already have `aria-label`):
- Table row ⋯ menus ("More Actions")
- Drawer / modal close ✕ ("Close")
- Document viewer zoom / rotate / page arrows / download / print
- Refund Activity expand ("Show details")
- Accordion chevrons ("Open" / "Close")
- Dashboard widget menu / expand / drag handle
- Users table actions
- Recipient delete (trash)

## 9. Toast Notification Issues
H1, H5, H6, L1, L6, L7, L8, L9. Also:
- Upload Document and Replace Document have no success toast. **(verify)**
- Checkout / Finalize Order have no toast because they land on a receipt page. That's acceptable; keep it consistent.
- The Revoke & Cancel toast uses the required title + one Dismiss button. ✔

## 10. Fee Calculation Issues
- The order-total formula is implemented correctly: `state + AX + service + shipping − discounts`, clamped at $0.
- Fee logic is copied: `FEE`, `SVC` and `SHIP` in the payment view are hard-coded again in Edit Order Info (line ~11644). Changing the schedule in one place won't update the other.
- A promo applies to state fees and shipping (M5). Confirm the business rule.
- The paper state fee depends on `orderType === 'mail'` ($5) vs walk-in ($20). If the order type is edited after payment, the recalculated fee no longer matches what was paid. **(verify)**

## 11. Refund Calculation Issues
C1, C2, H9. Also:
- The State-then-AX split order is correct: the state amount is used up first, then AX, and AFFIRM is required when AX > 0. ✔
- The cash confirmation checkbox is required. ✔
- After a refund, the per-child available amount is capped by the order-level remaining total, which is correct. But because the base is wrong (C1), the balances shown after the refund are also wrong.

## 12. Cancellation Issues
- A child cancelled via Revoke & Cancel shows "Revoked and Cancelled". A draft cancelled via the ⋯ menu shows "Cancelled". Confirm these are meant to be two different statuses (M1).
- The cancellation email body says "canceled" (L1) and hard-codes "Delmarva Secretary of State". Pull the agency name from Site Configuration.
- Audit trail: the cancellation isn't recorded in an activity log beyond the refund entry. Add "Cancelled by · reason · date".
- Bulk / parent cancellation: when every child is cancelled, the parent status rolls up correctly through `parentStatus`. **(verify)** the mixed case of cancelled + issued children.

## 13. Accessibility Issues
H1–H4, H7, M12, M13, L5. Also:
- `aria-live` is used nowhere; errors inside modals also need live regions.
- Color alone signals status in places; badges should always include text (they do) and, for Flagged, an icon.
- Fixed-width drawers (`42vw` with `min-width:520px`) cause horizontal scroll at 400% zoom (WCAG 1.4.10).

## 14. Recommended Fixes by Priority
1. **Sprint 1 (release blockers):**
   - C1 + C2 + H9 — store fees per child and derive refund caps from them.
   - C3 — set Issued only on issue.
   - C4 — record the revocation.
   - H1, H2 — live region; Esc + focus trap via DS Modal / Drawer.
2. **Sprint 2:**
   - H3, H4, H5, H6, H7, H8 — keyboard access, toast variants and timing, error linking, copy.
   - M1–M4 — one status list and color map.
3. **Sprint 3:**
   - M5–M14 — promo rules, validation, tooltips, DS migration of modals and forms, heading scale.
4. **Polish:** L1–L9.
