# Release Blocker Fixes — Implementation Notes
All changes are in `CA Dashboard.dc.html`: the logic class plus targeted template edits. The UI was not redesigned; existing components and workflows were reused.

## 1. Files / components modified
| Area | Where (logic / template) |
|---|---|
| Fee ledger & refund engine | New `FEE_SCHEDULE`, `feeLine()`, `childLedger()`, `refundable()`, `refundSplit()`, `refundTag()`. Removed `PLR_STATE_PER_CHILD` / `PLR_AX_PER_CHILD`. |
| Payment storage | New `PAY_LABELS`, `paymentMethodOf()`, `paymentTypeLabel()`. `plrIsCashOrder()` now reads the stored method. |
| Order submission | `recordOrder()` stores `payment`, `history`, and per-child `fees` / `collected`, and returns the order. Checkout `payNow` passes the real method. |
| Refund screens | `plrVals` (Parent Refund), `omActVals` + `confirmOrderAct` (Cancel Order), `bpVals` + `bpAdvance` (Reject, single and bulk), `rvVals` (Revoke & Cancel), Order Overview menu, row actions. Each of these shows a "No customer payment was collected" note when nothing was collected. |
| Payment labels | Order Overview, Resend Receipt, Refund modal, Refund Activity, Receipt. |
| Status config | Class-level `STATUS_COLOR`, `STATUS_ACTIVE`, `STATUS_TERMINAL`, `STATUS_TRANSITIONS`. The 4 duplicated maps are removed. "Revoked and Cancelled" is renamed "Revoked & Cancelled". |
| Parent roll-up | `parentStatus()`: Flagged now takes precedence; Approved and Revoked roll up to In Process. |
| Approve / Issue | `bpAdvance` (Approve → Approved), `issueDoc` (Issued / Pending Print → Printed; stamps `issuedAt` / `issuedBy` and history), `bpIssueBack`, `openBulk` (resumes Approved children at the issue step). |
| Revoke & Reissue | Revoke page: required Revocation Reason for Reissue. `revokeRecord()`; `audit[]` entries; reissue banner in Review & Issue; `reissueOf` on the replacement apostille. |
| Paid Drafts | `dupFinalize` (creates the order through `recordOrder`, then removes the draft), `dupPaidSaveDraft` (saves `dupItems`), `openPaidDraft` (restores them). |
| Readiness labels | `dupVals`: one `readiness` rule drives the accordion badge and the document badge. |
| Toasts | `flash(msg, title, action, variant)`, `TOAST_STYLE`, pause/resume, persistent polite and assertive screen-reader regions, variant icon, colored left edge. |
| Accessibility | Global dialog manager (Esc, focus trap, focus return). Table rows: `tabIndex`, `data-row-link`, focus ring, Enter/Space. Shortcut changed to Alt+O. |

## 2. Business rules updated
- Refund availability = **collected − previous refunds**, per line, capped at order level. No constants.
- The non-AX side (state + service + shipping) is refunded first, then AX. **AFFIRM is required whenever AX > 0.**
- Collected = 0 for **NOBILL, State Paid and Company Paid**. Discounts and promo codes are spread across children in proportion to each child's fees.
- When collected = 0: Issue Refund is hidden and the note "No customer payment was collected for this order." is shown. Reject and cancel no longer require a refund amount.
- Approve never issues. Issued / Pending Print happen only through **Issue** / **Issue & Print**.
- Revoke & Reissue needs a reason. A revocation record is written **before** the reissue starts.
- Revoke & Cancel now sets **Revoked & Cancelled**, not Cancelled.
- Paid Draft finalize uses the Checkout submission path. The draft is removed only after the order has been created.
- Duplicate / Paid Draft readiness: `Upload Missing` → `Information Missing` → `Ready`.

## 3. Status transition matrix
| From | Allowed to |
|---|---|
| Draft | New |
| Paid Draft | New, Cancelled |
| New | In Process, Flagged, Approved, Rejected, Cancelled |
| In Process | Approved, Rejected, Flagged, Cancelled |
| Flagged | In Process, Rejected, Cancelled |
| Approved | Issued (digital), Pending Print (paper), In Process (Previous) |
| Pending Print | Printed |
| Issued / Printed | Revoked, Revoked & Cancelled |
| Revoked | Issued / Pending Print (reissue) |
| Rejected, Cancelled, Revoked & Cancelled | — (end state) |

Payment tags shown alongside the status: **Refunded** (gray), **Partially Refunded** (warning).

Colors: Draft / Paid Draft / Incomplete / Cancelled / Refunded = gray · New = info · In Process / Pending Print / Partially Refunded = warning · Flagged / Rejected / Revoked / Revoked & Cancelled = danger · Approved = brand · Issued / Printed / Completed = success.

Parent roll-up order: Incomplete → Flagged → New → In Process (any New, Approved or Revoked) → Pending Print → shared child status → Printed → Completed.

## 4. Refund calculation logic
```
childLedger(k):
  fees     = k.fees || feeLine(delivery, service, fulfillment, orderType)
  gross    = state + ax + service + shipping
  collected= NO_COLLECT(method) ? 0 : gross − discount
  nonAx    = (state + service + shipping) × collected/gross
  ax       = collected − nonAx

refundable(order, ids?):
  orderNonAx = Σ nonAx − Σ refunds.state      orderAx = Σ ax − Σ refunds.ax
  availState = min(Σ scope.nonAx, orderNonAx)  availAX = min(Σ scope.ax, orderAx)
  max        = availState + availAX
refundSplit(amt) → { state: min(amt, availState), ax: amt − state }   // AFFIRM if ax > 0
```
Fee schedule:
- e-Apostille: $5 state + $69.95 AX
- Paper: $5 state (mail-in) or $20 state (walk-in) + $69.95 AX
- Service: Rush +$25, Expedited +$50
- Shipping: USPS $12

## 5. Payment data model
```
order.payment = { method: 'card'|'ach'|'check'|'cash'|'reader'|'nobill'|'state'|'company',
                  label, collected, paidAt, promo }
order.history = [{ type, text, by, at }]
child.fees    = { state, ax, service, shipping, discount }
child.collected, child.issuedAt, child.issuedBy, child.revoked, child.revocations[], child.reissueOf
state.audit   = [{ action: 'apostille.revoked', order, child, no, at, by, reason, next }]
```
`paymentTypeLabel(order)` returns Credit Card · ACH · Check · Cash · Card Reader · NOBILL · State Paid · Company Paid.

## 6. Regression risks
- **Seeded refund events** were booked against the old $20 state split. On those orders the state side can now show as over-refunded; it floors at $0, and the remaining balance moves to AX.
- The tile label changed to "Available State & Service Refund", because service fees and shipping are now included.
- **Approved** is a new status. Custom filters or dashboards that list statuses explicitly won't show it until they're updated. Order Management uses the shared lists.
- The Esc handler clicks the dialog's `aria-label="Close"` button, or its Cancel / Close button. A dialog with neither doesn't close on Esc. Every current dialog has one.
- The focus-return observer watches every `role="dialog"`. Nested dialogs return focus in last-in, first-out order.
- Toast variant is detected from the wording when a caller doesn't pass one. New error messages should pass `'error'` explicitly.

## 7. Test scenarios
**Paid Drafts**
1. Open a Paid Draft, fill in every field and click Finalize. Expected: the order appears in Order Management with status New, the draft is gone from Paid Drafts, and the toast reads "Order Completed Successfully".
2. Click Finalize with a document missing. Expected: a red error toast, and nothing is removed.
3. Edit a field, Save Draft, leave, then reopen the draft. Expected: the edit is restored.
4. Digital document with no upload → "Upload Missing". Upload the file but leave the country blank → "Information Missing". Both badges always match.
5. Paper document: no upload section. Complete the fields → "Ready".

**Refunds**
1. e-Apostille ($74.95), refund $10. Expected: State & Service $5, AX $5, AFFIRM required.
2. Paper walk-in: max refund is $89.95.
3. Rush + USPS paper: max refund is $111.95.
4. Order paid with the FUNDELD promo: max refund equals the amount collected.
5. NOBILL / State Paid / Company Paid: Issue Refund is hidden and the note appears; Reject and Cancel still work without a refund.
6. Two partial refunds: the remaining balance is correct, the tag shows Partially Refunded, then Refunded once the balance reaches $0.
7. Revoke & Cancel with a refund: the order ends in Revoked & Cancelled and the refund appears in Refund Activity.

**Revoke & Reissue**
1. Choose Reissue and click Continue without a reason. Expected: an inline error and no navigation.
2. With a reason: the child becomes Revoked, and history and audit entries are written. Review & Issue shows the banner "Reissuing Apostille #… / revoked on …".
3. Approve → Approved; Issue → Issued. The new apostille number carries `reissueOf` pointing to the original.

**Status transitions**
1. Approve a digital child. Expected: Approved, not Issued. Leave the page: it stays Approved. Reopen: it resumes at the issue step.
2. Issue digital → Issued. Issue paper → Pending Print. Issue & Print on paper → Printed.
3. Previous on the issue step: every approved-but-unissued child is editable again, with the decision fields restored.
4. Parent with one New child and one Flagged child → Flagged.

**Accessibility**
1. Open any modal or drawer, then press Esc. Expected: it closes and focus returns to the button that opened it.
2. Tab past the last control in a modal. Expected: focus wraps to the first control; Shift+Tab wraps backwards.
3. Tab to a row in the Order Management, Users or Reports tables and press Enter or Space. Expected: it opens.
4. Pressing `O` does nothing; Alt+O toggles the prototype panel.
5. Trigger an error toast. Expected: announced assertively, stays until dismissed, red icon. A success toast is announced politely, dismisses after 6s, and pauses on hover.

**Payment methods**
1. Checkout with Card, ACH, Check, Cash, Card Reader, NOBILL promo, State-paid and Company-billed. Expected: Order Overview, Resend Receipt, the Refund modal ("Paid by …") and the Receipt all show the same label.
