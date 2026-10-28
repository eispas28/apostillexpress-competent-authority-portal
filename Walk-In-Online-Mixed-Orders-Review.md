# Walk-In (Online) and Mixed Orders — Review

Principle: the QR → existing draft → review → upload → pay → process flow, the page, and its sections stay as they are. The flag only adds information to existing elements. Flag off = today's page.

## 1. Current workflow (reviewed)
Customer submits → arrives → staff scans QR → existing draft opens (Order Overview, Draft) → review → upload/scan → collect payment → process.
The page assumes one thing for the whole order: **nothing has been paid** ("Payment has not been collected", "Estimated Fees") and **everything is Walk-In (Appointment)** ("Order Type").

## 2. Gaps
**Walk-In (Online):** none structurally. The same draft is created online, so QR lookup is unchanged. The only gap is the unpaid assumption above.

**Mixed orders**
1. Order Type shows one value; documents can differ.
2. Banner says nothing has been collected, which is wrong once any document is paid.
3. Estimated Fees shows the order total, so staff could charge again for documents already paid online.
4. Document headers show readiness only, not fulfillment or payment.
5. Staff cannot see what to collect before opening the payment step.

## 3. Minimal UI updates (all on existing elements)
| Existing element | Update (flag on, mixed order only) |
|---|---|
| Summary strip › Order Type | Keep "Walk-In (Appointment)"; add a small "Mixed order" pill below it |
| Summary strip › Estimated Fees | Relabel **Due at Appointment**; value is the unpaid total; one-line sub text "$74.95 + … already paid online" |
| Info banner | Text changes with payment state (see §4); same component and color |
| Document header (accordion) | Two chips after the readiness badge: fulfillment and payment |
| Order Management / Drafts rows | No change needed; the type pill stays Walk-In (Appointment) |

## 4. Payment status
| State | Banner text | Due at Appointment | Doc chips |
|---|---|---|---|
| Fully unpaid | Existing text: "Payment has not been collected…" | Order total | all "Due at appointment" |
| Mixed | "Part of this order was paid online ($X). Collect the remaining $Y for the Walk-In (Appointment) documents…" | $Y, sub "$X already paid online" | per document |
| Fully paid | "Payment was collected online. Review the documents in person, then continue to processing." | $0.00, sub "Paid in full online" | all "Paid online" |

Chip colors reuse existing status colors: green (paid), amber (due).

## 5. Fulfillment display
Document chip, one per document: **Walk-In (Appointment)** (blue, existing order-type pill style) or **Standard Order · Digital / Mail-In** (gray, same style as the Online/Mail-In pills). Fulfillment is per document, not per order.

## 6. Preserved
QR scan, draft lookup, Draft status, document upload, payment step, Cancel / Save Draft, Walk-In Drafts tab. No new pages, drafts or statuses.

## 7. Risks to watch
- Payment step must charge only the "Due at Appointment" amount; the order total would double-charge. Needs engineering confirmation.
- Refunds on a mixed order must route to the original payment method for online-paid documents and to counter for the rest.
- Turning the flag off while mixed drafts exist hides them; recommend blocking the switch-off or keeping them visible.
- Reports: "Paid on" is per payment event on mixed orders, not per order.
