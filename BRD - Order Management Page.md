# BRD: Order Management Page — Tabs, Statuses and Flows

**Product:** Competent Authority (CA) Portal
**Page:** Order Management
**Status:** Draft for review
**Related feature flag:** `copyOrderExperience` (Copy Order workflow). All other changes in this document are not flagged.

---

## 1. Purpose

Reorganize Order Management so each tab answers one question for the CA user, and so every order carries one status that reflects what the CA must do next. This document defines:

- the tabs and sub-tabs on the page
- which orders appear in each, and why
- the statuses allowed in each, and how a status is derived
- the display rules (type badge, format badge, counts)

## 2. Scope

**In scope:** Order Management tabs (Orders, Pending, Drafts, Print Queue), sub-tabs, status vocabulary, order type and format badges, filter behavior, in-person order rules, dummy data.
**Out of scope:** Payment, fee calculation, the Create New Order form, and the Copy Order page layout (covered by the Copy Order spec).

## 3. Definitions

| Term | Meaning |
|---|---|
| **Parent order** | The order shown in the table (e.g. `#1788451-601808`). Holds one or more documents. |
| **Child order / document** | One apostille request inside a parent. Has its own status and format. |
| **Format** | Digital (e-Apostille) or Paper (Traditional Delivery). A parent can be Digital, Paper or Mixed. |
| **Order type** | How the order was placed: **Online** (customer, Universal Portal), **Mail-In**, **Walk-In**, **In-Person** (appointment, confirmed by QR code). |
| **CA-created order** | Order the CA creates in Create New Order. Its order type is the one the CA picks on that form. |

### 3.1 Tab definitions

| Tab / sub-tab | Definition | What belongs here | How an order gets here | How it leaves |
|---|---|---|---|---|
| **Orders** | The working list of every submitted order the CA can process. | Parent orders with a status other than Draft, plus online orders that are Incomplete because they are waiting for paper (shown under All Orders and the Online filter). | A customer submits an online order, or the CA creates and pays an order in full. | Never leaves. Its status moves from New to a terminal status. |
| Orders → All Orders | Every order in Orders, any status. | All statuses. | Same as Orders. | — |
| Orders → New | Orders nobody has started. | Status New. | Order is submitted and every document is New. | As soon as one document is worked, the status changes and it drops out. |
| Orders → In Review | Orders a CA is actively working or must look at. | Status In Process or Flagged only. | A document moves to In Process or Flagged. | Documents finish (Pending Print, Issued, Printed, Completed) or are cancelled or rejected. |
| Orders → Completed | Orders with nothing left to do. | Terminal statuses: Issued, Printed, Completed, Cancelled, Rejected, Revoked & Cancelled. | Every document reaches a terminal status. | Only by revocation. |
| **Pending** | Orders that are paid or placed but cannot be processed yet because information or physical documents are missing. | Status Incomplete (In-Person keeps its underlying Draft status). | See each sub-tab. | Once the missing items are provided and the order is finalized, it moves to Orders as New. |
| Pending → Drop-Off | Orders the CA created and paid for, with required information still missing (previously Paid). | CA-created paid orders, including Copy Order checkouts, with Incomplete status. | CA pays at checkout with information missing (skip to payment). | The CA opens it, completes the missing information and selects Finalize Order. |
| Pending → Mail-In | Orders waiting for physical documents to arrive (previously Awaiting Documents). | Online orders with at least one paper document, and CA-created Mail-In paper orders. All show Incomplete. | The order is submitted with a paper document, so the CA must wait for the mail. | The physical documents arrive and the CA finalizes the order. |
| Pending → In-Person | Appointment orders scanned in by QR code and not yet completed (moved from Drafts). | In-Person orders, shown as Incomplete. | The customer shows the confirmation QR code and the CA scans it. | The CA completes the order, collects payment and checks out. |
| **Drafts** | Work saved but not submitted. | Orders saved with Save Draft from Create New Order or Copy Order, shown as Draft under the Saved Drafts heading. | The CA selects Save Draft. | The CA resumes and submits it (it moves to Orders or Pending), or deletes it. |
| **Print Queue** | Paper apostilles that need printing, listed as child orders. | Paper child orders only. | A paper document is approved and reaches Pending Print. | Printing moves it from Pending Print to Printed. |
| Print Queue → Pending Print | Paper apostilles waiting to be printed. | Status Pending Print. | A paper document is approved. | The CA prints it. |
| Print Queue → Printed | Paper apostilles already printed. | Status Printed. | The CA prints the document. | Only by cancellation or revocation. |

### 3.2 Status definitions and how a status is assigned

**Two levels.** Each document (child order) has its own status. The parent order status is not typed in by anyone: the system works it out from its documents using the roll-up in section 5.1, then applies the Incomplete rules below.

#### Document (child order) statuses

| Status | Definition | Assigned when | Set by | Next |
|---|---|---|---|---|
| **New** | Received, not started. | The order is submitted or finalized. | System | In Process, Flagged |
| **In Process** | A CA has started working the document. | The CA opens the document and starts processing. | CA action | Approved, Flagged, Rejected, Pending Print, Issued |
| **Flagged** | The document needs attention (for example a question or an issue). | The CA flags it. | CA action | In Process |
| **Approved** | Reviewed and cleared, waiting to be issued. | The CA approves it. | CA action | Issued, Pending Print |
| **Issued** | The digital apostille (e-Apostille) has been issued and delivered. | The CA issues a digital document. | CA action | Revoked |
| **Pending Print** | Paper apostille approved and queued to print. | The CA approves a paper document. | System, on approval | Printed |
| **Printed** | Paper apostille printed. | The CA prints it from the Print Queue. | CA action | Revoked |
| **Rejected** | The document cannot be apostilled (reason recorded, refund optional). | The CA rejects it with a reason. | CA action | Terminal |
| **Cancelled** | The document was withdrawn before issuing. | The customer or CA cancels. | CA action | Terminal |
| **Revoked / Revoked & Cancelled** | An issued apostille was withdrawn. | The CA revokes an issued or printed document. | CA action | Terminal |

#### Parent order statuses

| Status | Definition | How the order gets it |
|---|---|---|
| **New** | No document has been started. | All documents are New. Applies to digital-only online orders and to CA-created orders paid in full. |
| **In Process** | Work is under way. | All documents are In Process, or documents are mixed between New, In Process and Approved, or any document is not yet finished. |
| **Flagged** | Something needs attention. | At least one document is Flagged. This always wins over every other status, except Incomplete. |
| **Pending Print** | Only printing is left. | Paper documents are Pending Print, every digital document is finished, and nothing is still pre-issue. |
| **Issued / Printed / Cancelled / Rejected / Revoked & Cancelled** | Every document shares one terminal status. | All documents have the same terminal status. |
| **Printed** (mixed) | All paper printed and all digital issued. | Paper all Printed and digital all Issued. |
| **Completed** | Everything is finished, with a mix of terminal results. | All documents are terminal but not one shared status. |
| **Incomplete** | The order cannot be processed until something is provided. | Set by rule, not by roll-up (see below). |
| **Draft** | Saved, not submitted. | The CA selects Save Draft. Shown only in Drafts, and underneath In-Person orders. |

#### How an order becomes Incomplete

| Flow | Rule | Cleared when |
|---|---|---|
| Online order, paper only or mixed (paper and digital) | Always Incomplete while it has a paper document and is not terminal. | The CA receives the physical documents and finalizes the order. |
| Every order in Pending → Mail-In | Incomplete. | Finalized. |
| CA pays at checkout (skip to payment or Copy Order) with information missing | Incomplete, listed in Pending → Drop-Off. | The CA completes every missing item and selects Finalize Order. |
| In-Person order scanned by QR code | Incomplete, listed in Pending → In-Person. | The CA completes it and checks out. |

When an Incomplete order is finalized, its documents become New and the parent status is recalculated by the roll-up. If a digital document on an Incomplete order has no uploaded file, that document is Upload missing and the order cannot be finalized.

#### Print Queue statuses

The Print Queue uses document statuses only: Pending Print and Printed. They apply to paper child orders and follow the same rules as in the document table.

## 4. Page structure

Top-level tabs, in order:

1. **Orders**
2. **Pending** — sub-tabs: **Drop-Off**, **Mail-In**, **In-Person**
3. **Drafts** — no sub-tabs; heading **Saved Drafts** with a count badge
4. **Print Queue** — sub-tabs: **Pending Print**, **Printed**

### 4.1 Renames from the previous page

| Before | After |
|---|---|
| Pending → Paid | Pending → **Drop-Off** |
| Pending → Awaiting Documents | Pending → **Mail-In** |
| Drafts → In-Person (Walk-In) sub-tab | Moved to Pending → **In-Person** |
| Drafts → Saved sub-tab | Drafts (no sub-tab bar), heading **Saved Drafts** |
| Column "Delivery Method" | Column **Format** |
| Badge "In-Person (Appointment)" | Badge **In-Person** |

## 5. Status vocabulary

| Status | Meaning |
|---|---|
| **New** | Received, nothing started. |
| **In Process** | At least one document is being worked. |
| **Flagged** | At least one document needs attention. Never hidden by roll-up. |
| **Approved** | Reviewed and cleared, not yet issued. |
| **Pending Print** | Digital documents are done; paper documents wait to be printed. |
| **Issued** | Digital apostille issued. |
| **Printed** | Paper apostille printed. |
| **Completed** | Mixed terminal result (all documents finished, not one shared status). |
| **Incomplete** | Information or documents are still missing. The order cannot be processed. |
| **Rejected / Cancelled / Revoked / Revoked & Cancelled** | Terminal, not issued. |
| **Draft** | Saved, not submitted (Drafts tab only). |

**Terminal statuses:** Issued, Printed, Completed, Cancelled, Rejected, Revoked & Cancelled.

### 5.1 Parent status roll-up

The parent status is derived from its documents, in this priority:

1. Order marked incomplete → **Incomplete**
2. Any document **Flagged** → **Flagged**
3. All documents New → **New**
4. All In Process → **In Process**
5. Mix of New, Approved or Revoked with others → **In Process**
6. Paper documents Pending Print, digital documents all finished, nothing pre-issue → **Pending Print**
7. Any document not yet finished → **In Process**
8. All documents share one terminal status → that status
9. All paper Printed and all digital Issued → **Printed**
10. Otherwise → **Completed**

### 5.2 Incomplete override for online paper orders (new)

An **Online** order that contains **at least one paper document** (paper-only or mixed) shows **Incomplete** until it is finalized, unless it is already in a terminal status. This applies wherever the order is listed.

- Reason: the CA cannot process it until the physical documents arrive.
- Digital-only online orders are **not** affected and follow the roll-up above (they start as **New**).
- CA-created orders are **not** affected.

## 6. Tab specifications

### 6.1 Orders

**Contains:** all submitted parent orders except those still Incomplete or Draft, plus online mixed orders (see 6.2.2).
**Sub-tabs and the statuses they show:**

| Sub-tab | Statuses |
|---|---|
| All Orders | Every status in the list |
| New | New |
| In Review | **In Process, Flagged only** (changed; previously also included New and Pending Print) |
| Completed | Terminal statuses |

**Order Type filter, "Online" (new):** choosing **Online** also lists online orders that sit in Pending → Mail-In (including those with status Incomplete). They show **Incomplete**, appear under All Orders, and do not appear under Completed.

**Filters:** Order ID, Docs #, Requester, Order Type, **Format** (Digital / Paper), Service Type, Issued, Submitted, Processor, Status. Format "Digital" or "Paper" also matches Mixed orders.

### 6.2 Pending

Pending holds orders that were paid or placed but cannot be processed yet.

#### 6.2.1 Drop-Off (formerly Paid)
- **Contains:** paid orders created by the CA (Skip to Payment / Copy Order checkout) that still have required information missing.
- **Status shown:** **Incomplete**.
- **Opens:** the paid Order Overview so the CA can complete the missing information, then finalize.

#### 6.2.2 Mail-In (formerly Awaiting Documents)
- **Contains:** orders waiting for physical documents to arrive.
- **Status shown:** **Incomplete** for every order. (Previously an online mixed order showed New.)
- **Mixed online orders (paper + digital):** appear in **both** Orders and Mail-In. In Orders they show Incomplete under the override in 5.2.
- **Badge:** orders the customer placed online show **Online**. Orders the CA created show **Mail-In**.

#### 6.2.3 In-Person
- **Contains:** In-Person (appointment) orders scanned in by QR code and not yet completed. Moved here from Drafts.
- **Status shown:** **Incomplete**. The underlying status stays Draft so the CA can still edit Order Info.
- **Opens:** the paid Order Overview in in-person mode (see section 8).

### 6.3 Drafts

- **Contains:** drafts saved from Create New Order and from the Copy Order page (**Save Draft**).
- **Status shown:** **Draft**.
- **Layout:** no sub-tab bar. A heading reads **Saved Drafts** with a count of saved drafts. The count excludes In-Person orders.

### 6.4 Print Queue

- **Contains:** child orders (paper apostilles) ready to print.
- **Sub-tabs and statuses:**

| Sub-tab | Status |
|---|---|
| Pending Print | Pending Print |
| Printed | Printed |

- Columns show the child order ID, requester, document, service, issued date and processor. The Format column is hidden here.

## 7. Order type and format display

### 7.1 Order Type badge

| Order type | Badge style |
|---|---|
| Online | Gray, **one color everywhere** (previously Online could appear purple in some tabs) |
| Mail-In | Purple |
| Walk-In | Teal |
| In-Person | Blue |

**Rules**
- A CA-created order shows the type chosen on Create New Order (Mail-In, Walk-In or In-Person). If none is chosen, the default is **Mail-In**. It never defaults to Online.
- Orders placed by customers show **Online**.
- A CA-created Mail-In order shows **Mail-In** in every tab, including Pending → Mail-In.

### 7.2 Format badge

| Format | Display |
|---|---|
| Digital only | **Digital** (teal) |
| Paper only | **Paper** (amber) |
| Mixed | **{n} Digital  {n} Paper**, count first, no dot, with a space between count and word |

## 8. In-Person order rules

| Area | Rule |
|---|---|
| Document Information, paper documents | Always complete. Document type, description and country are never reported missing. |
| Document Information, digital documents | Not ready until the CA uploads the file. Shows **Upload missing**, even if the document was paid online. |
| Order Info | **Editable** while the order is an In-Person draft. **Read-only** once paid and finalized. |
| Mailing Information and Return Address | **Not shown and not required** on the paid overview, in the Edit slide-in, or on Order Details after completion. Only digital recipients are collected. |
| Checkout | Always available (skip to payment). A note shows how many documents still need information. |
| Bottom bar | Order Confirmation Form button; Add additional copies; Checkout. No "Process paid documents" button. |
| Order Confirmation Form | Print button on the overview header and in the row kebab menu for In-Person orders. Opens a print-ready form. |
| Copy and delete | In-Person drafts can be copied and deleted. Paid orders cannot. |

## 9. Copy Order workflow (behind `copyOrderExperience`)

- **Copy Order** is enabled once Requestor and Order Info are complete.
- Copies duplicate the selected document exactly, including its format (digital stays digital, paper stays paper). Uploaded files are not copied.
- **Add additional copies** copies the last document. The newest order opens automatically and the bar stays fixed. Maximum **35** orders; the user can type a number; a message shows at the limit.
- The **Orders being added** card shows the ready count, **Digital** and **Paper** counts and the total as **n/35**.
- Users can select orders with checkboxes and delete them from a second floating bar (cannot delete all).
- **Save Draft** (top right) saves all orders as one draft in Drafts.
- Checkout is never blocked. After payment, copied orders appear in **Pending → Drop-Off** as **Incomplete**.
- Readiness per document: **Ready**, **Upload missing** (digital, no file) or **Missing information**. A digital copy with no file is never Ready.
- The Edit slide-in shows red warning icons on tabs with missing information and banners on the other tabs. Mailing Info offers a "Fill from" dropdown: Requestor, Customer or a different address.

## 10. Status by flow

| Flow | Order type | Lands in | Status |
|---|---|---|---|
| Customer places online order, digital only | Online | Orders → New | New |
| Customer places online order, paper only | Online | Orders and Pending → Mail-In | Incomplete |
| Customer places online order, mixed | Online | Orders and Pending → Mail-In | Incomplete |
| CA creates order, pays in full | Per CA choice | Orders | New |
| CA creates order, skips payment or copies with missing info, then pays | Per CA choice | Pending → Drop-Off | Incomplete |
| Customer books appointment, scans QR | In-Person | Pending → In-Person | Incomplete |
| CA saves draft | Per CA choice | Drafts | Draft |
| Paper apostille ready to print | Any | Print Queue → Pending Print | Pending Print |
| Paper apostille printed | Any | Print Queue → Printed | Printed |
| Any order finished | Any | Orders → Completed | Issued / Printed / Completed |

## 11. Dummy data

- Online digital-only orders for New: 5.
- In Review (In Process or Flagged): 6, across Online, Walk-In and Mail-In.
- Completed (5 Issued, 1 Cancelled): 6, across Online, Walk-In and Mail-In.
- Added once to existing saved data, not duplicated on reload.

## 12. Acceptance criteria

1. Tabs appear as Orders, Pending (Drop-Off, Mail-In, In-Person), Drafts, Print Queue, with the labels in 4.1.
2. In Review lists only In Process and Flagged orders.
3. Every online order with a paper document shows Incomplete in every tab where it appears.
4. Every order in Pending → Mail-In shows Incomplete.
5. Filtering Order Type = Online on Orders includes online orders from Mail-In.
6. The Online badge is gray in every tab. CA-created orders never show Online.
7. In-Person rows in Pending show Incomplete and open the in-person overview.
8. In-Person orders show no mailing or return address anywhere, and no missing-document-info warning for paper documents.
9. A digital document on an In-Person order is Not Ready until a file is uploaded.
10. Drafts shows no sub-tabs and displays **Saved Drafts** with a count.
11. Column header reads **Format**; mixed orders read "2 Digital  1 Paper".
12. With `copyOrderExperience` off, existing behavior is unchanged.

## 13. Open questions

1. Should **New** and **In Review** counts exclude orders now shown as Incomplete? (Currently they do, since status drives the count.)
2. Should the Print Queue show orders from Mail-In once their paper is printed, or only after they reach Pending Print?
3. Should Drop-Off orders created by In-Person checkout use the same Incomplete status, or a dedicated "Awaiting information" status?
4. Which in-person orders, if any, should still allow Mailing Information (for example, when the customer later requests mail delivery)?
