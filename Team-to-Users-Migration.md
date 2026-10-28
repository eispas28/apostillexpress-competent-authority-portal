# Team / User Management → Competent Authority Portal

Port of the Customer Portal "Team" feature into `CA Dashboard.dc.html`.

## 1. Inventory of Project A (what was found)

| Project A file | Contents | Disposition |
| --- | --- | --- |
| `teamData.js` | `window.AXTeam`: `ORG`, `MEMBERS`, `INVITES`, `PERMS`, `PERM_SUMMARY`, `CAPS` + `can()`, `PROFILES`/`profileOf()`, `MAX_ADMIN_SEATS`, `OTHER_ORG_DOMAINS`, `adminSeatsUsed()`, `seatLabel()`, `statusClass()`, `permClass()`, `relTime()` | Ported into the logic class as `U_SEED`, `U_LEVELS`, `U_LEVEL_DESC`, `U_CAPS`, `U_STATUS_COLOR`, `U_ROLE_BADGE`, `uCan()`, `uPatch()`, `uActivity()`. `ORG` / `OTHER_ORG_DOMAINS` / join codes **dropped** (no organization concept). |
| `TeamManagement.html` | `App`, `MyTeam`, `TeamMembers`, `Invitations`, `SortTh`, `Pager`, `Kebab`, `SkeletonRows`, `TableState`, `Restricted`, `Modal`, `PermissionSelect`, `InviteModal`, `UserModal`, `RoleModal`, `ConfirmModal`, `Toasts`, `TopBar`, `ProfileMenu` | Re-authored as CA screens/values (below). `TopBar`/`ProfileMenu`/`Toasts` **not ported** — the CA Portal already has its own chrome and `flash()` toast. `MyTeam` **dropped** (org-level tab). `SkeletonRows`/`TableState` loading + error states **dropped** — the CA Portal renders from local state with no fetch phase. |
| `team-profile.jsx` | `Avatar`, `RemoveUserModal`, `DField`, `UpdateProfileDrawer`, `ProfileField`, `UserProfile` | Ported as the `userDetail` screen, the Update Profile drawer, and the type-to-confirm remove modal. |
| `team-member-preview.jsx` | Invited-member experience: `InvitationBanner`, `JoinCodePage`, `ConfirmPage`, `WelcomePage`, `MemberTeamPage`, `DeclineModal`, `PreviewControls` | **Not ported.** The CA Portal already ships an equivalent invitee flow (the `onboarding` journey: welcome → password → MFA → success). Join codes are an organization concept and were dropped. |

## 2. Where it landed

Everything lives in `CA Dashboard.dc.html` (single Design Component, matching the portal's existing architecture).

**Routes / screens** (`state.screen`)
- `users` — Users screen, three tabs in `state.usersTab`: `roster` · `invites` · `roles`
- `userDetail` — user profile (new); added to the side-nav active mapping and to the non-stub screen list

**Logic**
- `usersVals(s)` — one method returning every template value, spread into `renderVals()` (same pattern as `profileVals` / `coVals` / `rpVals`)
- Helpers: `uCan`, `uFull`, `uInitials`, `uPatch`, `openUser`, `toggleSel`, `askSuspend`, `askReactivate`, `uNames`, `editSeed`, `uActivity`

**State added**: `users`, `usersTab`, `userStatus`, `userSort`, `userPage`, `userPerPage`, `userSel`, `userOpen`, `editUser`, `roleTarget`, `rolePick`, `removeTarget`, `removeText`, `uConfirm`. Reused as-is: `userQuery`, `roleFilter`, `invites`, `inviteOpen`/`inv*` (invite modal), `confirm` (invitation resend/revoke), `toast`.

**Surfaces**
- Roster: search, permission + status filters, sortable columns, 10-per-page pager, row actions (view · update · change permission · suspend/reactivate · remove)
- Bulk actions: select-all-on-page, change permission, suspend, remove
- Invitations: the portal's existing pending-invitations table, now a tab
- Roles & Permissions: level cards with administrator seat count + the capability matrix rendered straight from `U_CAPS`
- User profile: general info, permissions & preferences (permission + time zone), recent activity, danger zone
- Modals: Update Profile drawer, Change Permission, Remove (type-to-confirm), generic suspend/reactivate confirm

## 3. Terminology changes

| Project A | Competent Authority Portal |
| --- | --- |
| Organization / team / "Rodriguez Global Services LLC" | this office (no org entity; copy says "this office") |
| Team Members / My Team | Users |
| Team Invitations | Invitations |
| Member `role` (Owner/Member) | dropped — `perm` is the only role axis |
| `perm` | Permission level: Administrator · Manager · Standard · Viewer (unchanged) |
| Deactivate / Inactive | Suspend / Suspended (the portal's existing status vocabulary: Active · Suspended · Invited) |
| Pending (member) | Invited |
| "Remove from organization" | "Remove user access" |
| Join code / Join Team | dropped |

## 4. Tweaks (props) added

- `myRole` — Administrator · Manager · Standard · Viewer. Drives the whole RBAC matrix; Standard/Viewer see a restricted state instead of the directory.
- `maxAdminSeats` — administrator seat cap (default 3); gates the Administrator option in invite + change-permission.

## 5. Dependencies & configuration

**No new dependencies.** The feature uses only what the portal already loads: React (via the DC runtime), the ApostilleXpress design-system bundle (`Button`, `Badge`, `FormField`, `Select`), and Bootstrap Icons from the design system. No new fonts, no new CSS files, no npm packages.

**Configuration / integration changes**
1. Six new CSS utility rules in the existing `<helmet><style>` block: `.ca-udetail`, `.ca-utbl`, `.ca-uth`, `.ca-utd`, `.ca-mgrid` (+ two media queries).
2. `data-props` extended with `myRole` and `maxAdminSeats` (section "User management").
3. Side-nav active state maps `userDetail` → the Users item; `isStub` allow-list extended with `userDetail`.
4. `localStorage` key `ca-dash-v2` is unchanged — user-management state is intentionally not persisted.

**Left as mock data (API surface to wire up)**

| Needed call | Currently |
| --- | --- |
| `GET /users` | `U_SEED` (12 records) |
| `PATCH /users/:id` (details, time zone) | `uPatch` |
| `PATCH /users/:id/permission` | Change Permission modal |
| `PATCH /users/:id/status` (suspend/reactivate) | confirm modal → `uPatch` |
| `DELETE /users/:id` (+ bulk) | `rmGo` |
| `GET /users/:id/activity` | `uActivity()` derives a plausible trail from the record |
| `GET/POST /invitations`, `POST /invitations/:id/resend`, `DELETE /invitations/:id` | existing `state.invites` + `doResend` / `doRevoke` |
| `GET /permissions` (capability matrix) | `U_CAPS` — keep server-side as the source of truth and render from the response |

Duplicate email checking in the invite modal validates against local records only; move to a server check when the API exists. Project A's "email belongs to another organization" rule was dropped with the org concept.
