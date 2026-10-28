# Impact Analysis Part 2 — BRD Source Review

**Documents analyzed**
1. `Addendum - Parent-Level Discounts, Refunds, Rejections, and Financial Reporting` (16 sections, FR-A01–FR-A27) — **the governing document**
2. `Business Rules Summary` — the plain-language rule set
3. `BA Analysis & Recommendation` — engineering/BA response, 16 answered questions, 5 use cases
4. `Discounts Meeting Action Items` — 15 Sep 2026 call, confirmed decisions + open follow-ups
5. `User Stories backlog v2` — **no new stories**; same 54 (US-001–US-054), formatting-only differences from v1

**Relationship to Part 1.** Part 1 was derived from the story backlog. This document adds what the source BRDs contribute on top of it: rules absent from the backlog, the worked use cases, and the open questions that block design. Part 1's screen-by-screen breakdown stands.

**Settled by product decision (16 Sep):** the Refund modal shows **no child orders and no checkboxes** — it is purely parent-level, per US-017.

---

## 1. Rules the BRDs add that the backlog doesn't carry

### 1.1 Signature Discount is paper-only

> "Signature Discounts apply only to **Paper, Counter/Walk-In Child Orders** — Digital Child Orders are never eligible." — BA Analysis

This appears in **none of the 54 stories**, though the existing prototype already knows it (the Payment Summary's Signature Discount row reads *"Paper documents only"*).

**Rule:** Signature Discount is available only when the parent contains ≥1 paper Counter/Walk-In line item; otherwise hidden or disabled with a reason. Confirmed by **Use Case 2** — "Signature Discount isn't available here either — it's paper-only, regardless of Walk-In/Mail-In."

**Consequence:** the eligibility gate is **two rules, not one**. Signature Discount requires Counter/Walk-In *and* paper. General Discount is broader — the BA states it should remain available on Mail-In orders, unchanged from today, and **Use Case 1** applies a General Discount to ten Mail-In children.

### 1.2 The "State Processing Fee" pool composition

> "Today, the amount available for discounts and refunds includes the **base state fee, plus any expedited-processing fee, plus shipping** — the system treats all three as one combined 'state' bucket."

The Addendum's worked examples only ever show a plain $20.00 state fee. The BA recommends all three in one pool, consistent with current behavior, and says it must be confirmed.

**Design consequence:** every "Maximum Combined Discount Permitted" and "Maximum State Fee Refundable" figure depends on this. It also needs a **breakdown affordance** — an employee told the state maximum is $63.00 on a $20.00 apostille won't trust the number without seeing base + expedited + shipping.

### 1.3 Refund split is state-first, authoritative for accounting

The Addendum (§9, §11) mandates state-first attribution. The BA notes finance currently splits refunds **proportionally** and recommends state-first govern both CA-facing numbers and downstream accounting.

**Design consequence:** the State/AX split of every refund must be displayed at entry and permanently audited — it's the number two systems will be reconciled against.

**Live QA item:** "verify in QA that the AFFIRM prompt appears only once State Fees are fully exhausted… if the current build triggers AFFIRM at a different point, that needs to be corrected." The AFFIRM trigger point may already be wrong in the build.

### 1.4 Refund ceiling applies across all payment types

> "Card refunds are automatically capped by the payment processor. **Cash and state-billed refunds currently have no equivalent built-in cap.**"

Maximum Refund Available must be enforced consistently across cash, state-billed and card. The cap becomes an application-level rule rather than a processor side-effect, and **cash refunds need the same blocking validation** card refunds get for free today.

### 1.5 Payment-success timestamp doesn't exist

> "The system doesn't currently store an exact payment-completion timestamp… When Stripe comes back we can capture it **but not Cash — we cannot track back cash**."

Order submission date is the stand-in. Time zone is also unsettled: stored UTC, wanted in local preference.

**Design consequence:** Transaction Reporting is built on "successful payment date," which is **unreliable for exactly the cash counter orders discounts apply to**. Reports need a stated basis and probably a distinction between captured and inferred payment dates.

### 1.6 An activity report already exists

> "An earlier version of activity-level reporting already exists behind a setting that's switched off everywhere except our development environment."

Whether the new requirements replace or extend it is **unanswered** — "we need more info on this." This may substantially change the Reports build.

### 1.7 Rejection-related refund attribution must be explicit

A refund counts as rejection-related **only when a staff member explicitly ties it to a specific Rejection** — not because the order happens to contain a rejected item. "Child is agnostic to refund — we have an order, one child is rejected, we cannot state how much is refund."

**Design consequence:** with no child selection in the Refund modal, the tie must come from the **entry point** (launched from a specific Rejection event) or an explicit picker naming the Rejection. It cannot be inferred. Without this control the Rejection-Related Refunds reporting category isn't trustworthy.

Also: when multiple children are rejected together for one reason, that reason applies to all of them, but **each remains its own Rejection event**.

### 1.8 Refunds may require a recorded reason

The Addendum's audit list asks for "reason or transaction status associated with the refund, where applicable." US-020 specifies an *optional* Notes field; the BA recommends refunds require a recorded reason the same way Rejections do. The prototype currently has a *required* Reason select.

**Open:** one optional Notes field, a required reason select plus optional notes, or a reason required only when AFFIRM triggers.

### 1.9 Child status transitions need a home

Today Cancel / Reject / Revoke run through the refund modal's checkboxes. With the Refund modal parent-only, every transition must be reachable from the **Cancel modal** (keeps its child list, US-019), the **Rejection surface** (requires identifying children, US-029), or the child order itself. Worth verifying nothing is left stranded.

### 1.10 Promotion codes

Promo codes currently reduce the AX Service Fee, and CA supports them for complimentary orders. Three sub-decisions: do they count toward Total Discounts Applied, do they keep their AX-fee treatment, and which reporting category they land in. The prototype's Payment Summary has a live Promotion Discount row today.

### 1.11 Refund status vocabulary

The BA recommends **"Partially Refunded"** shown until Maximum Refund Available is exhausted, becoming **"Refunded"** after. US-053 says "Fully Refunded or Partially Refunded." Pick one label — the design system defines a fixed status set and *Refunded* vs *Fully Refunded* can't both exist.

### 1.12 Refund amount has no per-line anchor

The BA flags that a refund can be entered up to the parent's full Maximum Refund Available (e.g. $179.95) even where the relevant child order's original charge was $5.00. US-031 requires nothing be pre-filled. With no child selection in the modal there is no per-child anchor available either.

**Recommendation:** show the parent's original line-item composition as **reference context** beside the amount input. It gives the employee the anchor without the system appearing to decide — the principle the Addendum protects throughout ("The system shall not determine the appropriate… amount on behalf of the CA").

### 1.13 Other confirmed items

- **No-Bill under the parent model** — "works the same way as regular order, refunds are adjusted and billed at the end of the month."
- **Three historical pricing models coexist.** Not one cutover — a three-way decision: fully migrated / best-effort reconstruction (clearly labelled) / left unchanged. A 60-day cutoff is proposed as a *starting point, not a decision*. **If best-effort reconstruction ships, the UI must label those orders as such.**
- **Multi-state tension.** "If we do not capture per child, we will not know how much money each state can claim." The Addendum's per-state-parent-record assumption was requested for confirmation and left unresolved on the call. This is a model-level question, not a filtering one.
- **Rejection blocked by payment failure.** Today a payment-system issue can block a rejection being recorded at all. Since rejection is now decoupled from refund it arguably should never be blocked, but the Addendum doesn't address it.
- **Signature matching.** Possibly expected as real matching logic rather than a discretionary discount with manual counts — "a significant scope addition beyond what's currently documented." Must be confirmed before assuming it's out of scope.
- **Rollout scope.** Utah only or all onboarded states? Maryland must review and confirm it fits their rules. CFO review recommended, flagging two changes that "could otherwise land as a surprise": rejections no longer auto-refund, and refund amounts no longer correspond to what was paid for a line item.

---

## 2. Use cases — the test matrix the documents hand you

Five worked scenarios from the BA. These should drive design review, not invented examples.

| # | Composition | Discounts | Notes |
|---|---|---|---|
| **UC1** | 10 Mail-In children @ $5.00 state | General $10.00 → paid $40.00 | No Signature Discount. Refund 3 children, amount $10.00. **Confirms General Discount on Mail-In.** |
| **UC2** | 3 digital @ $5.00 state + $69.95 AX each | General $10.00 | Signature Discount unavailable — digital. |
| **UC3** | 4 Walk-In: 3 paper @ $20.00 + 1 digital ($5.00 state + $69.95 AX) | Signature (paper only) + General (both) | **The sharp one — see below.** |
| **UC4** | 2 paper Walk-In @ $20.00 + 2 digital Walk-In ($5.00 + $69.95 each) | — | Mixed, two AX fees. |
| **UC5** | Ch1/Ch2/Ch3 @ $5.00 = $15.00, one Stripe transaction | — | Refund $5.00. Smallest end-to-end case. |

### The arithmetic question UC3 exposes

If Signature Discount is paper-only, is its cap the **paper** state fees ($60.00) or **all** state fees ($65.00, including the digital $5.00)?

- Addendum §7: the combined cap is "the total State Processing Fees associated with the **Parent Order**" — $65.00, no per-type sub-cap.
- BA: Signature Discount applies only to paper children.

So a paper-only discount, capped against a pool including digital state fees, could consume the digital child's state fee entirely. **No document resolves this.** Two candidate rules:

- **(a)** One combined cap of $65.00 — literal Addendum reading; a $65.00 Signature Discount is legal on UC3.
- **(b)** Signature Discount capped at paper state fees ($60.00), General Discount capped at the remaining pool, combined never above $65.00 — matches the paper-only intent.

**(b) is almost certainly intended; (a) is what the Addendum literally says.** Either way the Payment Summary must show *which* maximum applies to *which* field, because they are no longer the same number.

---

## 3. What the BRDs confirm about Part 1

- **Parent-order-as-financial-record** is the central rule across all four documents. The Business Rules Summary states it cleanest: *"Child Orders preserve original fees. Parent Orders own the money. Discounts reduce State Fees only. Refunds hit State Fees first, then AX with AFFIRM. Rejections may identify Children, but all financial consequences stay on the Parent."*
- **Removing the child `Refunded` tag** — confirmed, with the reason stated plainly: the system "can no longer confirm which specific child was fully refunded once tracking is at the parent level."
- **The five new Order Overview cards** map to Addendum §8 (financial summary), §12 (audit), §13 (Refund Activity / Rejection Activity). Part 1's field lists match §8 and §12 item-for-item.
- **Two reporting views with different date semantics** and the twelve aggregate categories are confirmed verbatim in §13, including Net Amount Retained being Transaction-view-only and Rejection-Related Refunds being a non-additive subset.
- **AFFIRM behavior** confirmed in §9 and §11, including the zero-balance case. The Addendum supplies the exact warning wording — **use it verbatim**:
  > *"Warning: The requested refund exceeds the State Fees currently available for refund for this Parent Order and includes a portion of the AX Service Fees previously collected. By continuing, you acknowledge that some or all of the AX Service Fees will be refunded. To continue, type AFFIRM below."*
- **Invoice versioning**, immutable original, and the post-refund breakdown confirmed in §6, with Marketing owning the template and Engineering owning the values.
- **The worked example** ($109.95 subtotal → −$19.95 → $90.00; State collected $20.05; Max refund $90.00) is consistent across Addendum §5/§6/§8 and the Business Rules Summary. Design against it.
- **Part 1's reconciliation identity** matches Addendum §14: `Net Amount Retained = Gross Transaction Amount − Total Discounts Applied − Cumulative Successful Refunds`.

---

## 4. Open questions, by blocking severity

**🔴 Blocks the financial model — nothing can be drawn accurately without these**
1. What composes the "State Processing Fee" pool — base only, or base + expedited + shipping? (§1.2)
2. On mixed paper/digital orders, is Signature Discount capped at paper state fees or all state fees? (§2, UC3)
3. Is state-first authoritative for finance, replacing the proportional split? (§1.3)
4. Multi-state: is each state's portion its own Parent Order, and how is each state's claim tracked without per-child amounts? (§1.13)

**🟠 Blocks the UI**
5. Is General Discount available on Mail-In? (§1.1)
6. Refund reason: required, optional, or conditional on AFFIRM? (§1.8)
7. How does a user explicitly mark a refund rejection-related? (§1.7 — must be explicit, so it needs a control)
8. Do promo codes count toward the cap, and what happens to their AX-fee treatment? (§1.10)
9. Does every child status transition still have a path via Cancel / Rejection / child detail? (§1.9)
10. Reference context beside the refund amount, or nothing at all? (§1.12)
11. Which roles may apply discounts / enter AFFIRM / refund / reject / view reports? (undefined across all four documents)
12. `Refunded` or `Fully Refunded` as the status label? (§1.11)

**🟡 Blocks scope and schedule**
13. Is signature **matching** in scope? (§1.13 — potentially major)
14. Replace or extend the existing disabled activity report? (§1.6 — "we need more info")
15. Historical migration: which orders migrate, which are labelled best-effort, which stay? Cutover date? (§1.13)
16. Cash-collected-by-state netting vs. FR-A13. (carried from Part 1)
17. No-Bill full-cancellation refundable amount. (carried from Part 1)
18. Can a rejection be blocked by a payment failure? (§1.13)
19. Utah-only or all states? Maryland confirmation? CFO review? (§1.13)
20. Build the CA-billback switch now, off at launch? (Addendum calls FR-A13 "current business policy")

---

## 5. Recommendation

**The Payment Summary is the hard UI problem**, not the Refund modal. Its discount caps depend on four unresolved questions — fee pool composition, the paper-only sub-cap, Mail-In eligibility, and promo codes — and the screen has to display a maximum it cannot currently compute. Settle §4 items 1, 2 and 5 before designing it.

**Don't design the Reports screen yet.** Between the undisclosed existing activity report (§1.6) and the unrecoverable cash payment timestamp (§1.5), both report views rest on foundations nobody has described. One engineering conversation is worth more than any amount of layout work here.

**The Refund modal is clear to design now** — parent-level, no child list, with the max-refundable trio, single amount, AFFIRM, notes and the invoice link. Its only external dependency is confirming that Cancel and Rejection absorb the child status transitions it used to carry (§1.9).

**One escalation worth making now.** The CFO flag names two changes that will surprise people: rejections no longer auto-refund, and refund amounts no longer correspond to what was paid for a line item. Both change how CA staff and customers experience the product. Getting them acknowledged before build is cheaper than after.
