
/**
 * SideNav — the Competent Authority Portal's primary left navigation rail.
 * Two forms: expanded (257px, logo wordmark + labels) and collapsed
 * (80px, logo mark + icons only). Groups are separated by rules and may
 * carry an uppercase caption. Items support an icon, a notification
 * badge, and an expandable list of subsections.
 *
 * groups: [{ label?, items: [{ id, label, icon, href, active, badge, children? }] }]
 * children: [{ id, label, href, active, badge }]
 */

const W_OPEN = 257;
const W_STRIP = 80;

/* One shared easing/duration so width, padding, label fade and logo crossfade
   all travel together instead of arriving in visible stages. */
const EASE = "cubic-bezier(.4,0,.2,1)";
const DUR = 280;
const tr = (...props) => props.map((p) => `${p} ${DUR}ms ${EASE}`).join(", ");

/* Portal nav glyphs drawn from the Figma kit. currentColor so items tint on
   hover/active. Any other `icon` string falls through to Bootstrap Icons. */
const NAV_ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <g clipPath="url(#ax-nav-dashboard-clip)">
        <path d="M7.72857 1.66797L12.274 1.66797C14.3954 1.66797 15.4561 1.66797 16.2664 2.08082C16.9792 2.44398 17.5586 3.02345 17.9218 3.73619C18.3346 4.54646 18.3346 5.60716 18.3346 7.72857V12.274C18.3346 14.3954 18.3346 15.4561 17.9218 16.2664C17.5586 16.9792 16.9792 17.5586 16.2664 17.9218C15.4561 18.3346 14.3954 18.3346 12.274 18.3346H7.72858M7.72857 1.66797C5.60716 1.66797 4.54646 1.66797 3.73619 2.08082C3.02345 2.44398 2.44398 3.02345 2.08082 3.73619C1.66797 4.54646 1.66797 5.60716 1.66797 7.72858L1.66797 12.274C1.66797 14.3954 1.66797 15.4561 2.08082 16.2664C2.44398 16.9792 3.02345 17.5586 3.73619 17.9218C4.54646 18.3346 5.60716 18.3346 7.72858 18.3346M7.72857 1.66797L7.72858 18.3346M7.72857 10.0013H18.3346" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <defs><clipPath id="ax-nav-dashboard-clip"><rect width="20" height="20" fill="white" /></clipPath></defs>
    </svg>
  ),
  "order-management": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <g clipPath="url(#ax-nav-orders-clip)">
        <mask id="ax-nav-orders-mask" fill="white">
          <path d="M0.832031 7.4987C0.832031 5.16515 0.832031 3.99837 1.28617 3.10707C1.68564 2.32306 2.32306 1.68564 3.10707 1.28617C3.99837 0.832031 5.16515 0.832031 7.4987 0.832031H12.4987C14.8323 0.832031 15.999 0.832031 16.8903 1.28617C17.6743 1.68564 18.3118 2.32306 18.7112 3.10707C19.1654 3.99837 19.1654 5.16515 19.1654 7.4987V12.4987C19.1654 14.8323 19.1654 15.999 18.7112 16.8903C18.3118 17.6743 17.6743 18.3118 16.8903 18.7112C15.999 19.1654 14.8323 19.1654 12.4987 19.1654H7.4987C5.16515 19.1654 3.99837 19.1654 3.10707 18.7112C2.32306 18.3118 1.68564 17.6743 1.28617 16.8903C0.832031 15.999 0.832031 14.8323 0.832031 12.4987V7.4987Z" />
        </mask>
        <path d="M6.66536 5.91536C6.25115 5.91536 5.91536 6.25115 5.91536 6.66536C5.91536 7.07958 6.25115 7.41536 6.66536 7.41536V6.66536V5.91536ZM13.332 7.41536C13.7462 7.41536 14.082 7.07958 14.082 6.66536C14.082 6.25115 13.7462 5.91536 13.332 5.91536V6.66536V7.41536ZM6.66536 9.2487C6.25115 9.2487 5.91536 9.58449 5.91536 9.9987C5.91536 10.4129 6.25115 10.7487 6.66536 10.7487V9.9987V9.2487ZM13.332 10.7487C13.7462 10.7487 14.082 10.4129 14.082 9.9987C14.082 9.58449 13.7462 9.2487 13.332 9.2487V9.9987V10.7487ZM6.66536 12.582C6.25115 12.582 5.91536 12.9178 5.91536 13.332C5.91536 13.7462 6.25115 14.082 6.66536 14.082V13.332V12.582ZM13.332 14.082C13.7462 14.082 14.082 13.7462 14.082 13.332C14.082 12.9178 13.7462 12.582 13.332 12.582V13.332V14.082ZM6.66536 6.66536V7.41536H13.332V6.66536V5.91536H6.66536V6.66536ZM6.66536 9.9987V10.7487H13.332V9.9987V9.2487H6.66536V9.9987ZM6.66536 13.332V14.082H13.332V13.332V12.582H6.66536V13.332ZM3.10707 18.7112L3.78806 17.3747L3.10707 18.7112ZM1.28617 16.8903L2.62268 16.2093L1.28617 16.8903ZM18.7112 16.8903L17.3747 16.2093L18.7112 16.8903ZM16.8903 18.7112L16.2093 17.3747L16.8903 18.7112ZM16.8903 1.28617L16.2093 2.62268L16.8903 1.28617ZM18.7112 3.10707L17.3747 3.78806L18.7112 3.10707ZM3.10707 1.28617L3.78806 2.62268L3.10707 1.28617ZM1.28617 3.10707L2.62268 3.78806L1.28617 3.10707ZM7.4987 0.832031V2.33203H12.4987V0.832031V-0.667969H7.4987V0.832031ZM19.1654 7.4987H17.6654V12.4987H19.1654H20.6654V7.4987H19.1654ZM12.4987 19.1654V17.6654H7.4987V19.1654V20.6654H12.4987V19.1654ZM0.832031 12.4987H2.33203V7.4987H0.832031H-0.667969V12.4987H0.832031ZM7.4987 19.1654V17.6654C6.30717 17.6654 5.50374 17.6642 4.88419 17.6136C4.28215 17.5644 3.987 17.4761 3.78806 17.3747L3.10707 18.7112L2.42609 20.0477C3.11844 20.4005 3.85233 20.5393 4.63989 20.6036C5.40994 20.6665 6.35667 20.6654 7.4987 20.6654V19.1654ZM0.832031 12.4987H-0.667969C-0.667969 13.6407 -0.669135 14.5875 -0.60622 15.3575C-0.541873 16.1451 -0.40311 16.879 -0.050339 17.5713L1.28617 16.8903L2.62268 16.2093C2.52131 16.0104 2.43301 15.7152 2.38382 15.1132C2.3332 14.4937 2.33203 13.6902 2.33203 12.4987H0.832031ZM3.10707 18.7112L3.78806 17.3747C3.28629 17.1191 2.87834 16.7111 2.62268 16.2093L1.28617 16.8903L-0.050339 17.5713C0.492944 18.6376 1.35983 19.5045 2.42609 20.0477L3.10707 18.7112ZM19.1654 12.4987H17.6654C17.6654 13.6902 17.6642 14.4937 17.6136 15.1132C17.5644 15.7152 17.4761 16.0104 17.3747 16.2093L18.7112 16.8903L20.0477 17.5713C20.4005 16.879 20.5393 16.1451 20.6036 15.3575C20.6665 14.5875 20.6654 13.6407 20.6654 12.4987H19.1654ZM12.4987 19.1654V20.6654C13.6407 20.6654 14.5875 20.6665 15.3575 20.6036C16.1451 20.5393 16.879 20.4005 17.5713 20.0477L16.8903 18.7112L16.2093 17.3747C16.0104 17.4761 15.7152 17.5644 15.1132 17.6136C14.4937 17.6642 13.6902 17.6654 12.4987 17.6654V19.1654ZM18.7112 16.8903L17.3747 16.2093C17.1191 16.7111 16.7111 17.1191 16.2093 17.3747L16.8903 18.7112L17.5713 20.0477C18.6376 19.5045 19.5045 18.6376 20.0477 17.5713L18.7112 16.8903ZM12.4987 0.832031V2.33203C13.6902 2.33203 14.4937 2.3332 15.1132 2.38382C15.7152 2.43301 16.0104 2.52131 16.2093 2.62268L16.8903 1.28617L17.5713 -0.050339C16.879 -0.40311 16.1451 -0.541873 15.3575 -0.60622C14.5875 -0.669135 13.6407 -0.667969 12.4987 -0.667969V0.832031ZM19.1654 7.4987H20.6654C20.6654 6.35667 20.6665 5.40994 20.6036 4.63989C20.5393 3.85233 20.4005 3.11844 20.0477 2.42609L18.7112 3.10707L17.3747 3.78806C17.4761 3.987 17.5644 4.28215 17.6136 4.88419C17.6642 5.50374 17.6654 6.30717 17.6654 7.4987H19.1654ZM16.8903 1.28617L16.2093 2.62268C16.7111 2.87834 17.1191 3.28629 17.3747 3.78806L18.7112 3.10707L20.0477 2.42609C19.5045 1.35983 18.6376 0.492944 17.5713 -0.050339L16.8903 1.28617ZM7.4987 0.832031V-0.667969C6.35667 -0.667969 5.40994 -0.669135 4.63989 -0.60622C3.85233 -0.541873 3.11844 -0.40311 2.42609 -0.050339L3.10707 1.28617L3.78806 2.62268C3.987 2.52131 4.28215 2.43301 4.88419 2.38382C5.50374 2.3332 6.30717 2.33203 7.4987 2.33203V0.832031ZM0.832031 7.4987H2.33203C2.33203 6.30717 2.3332 5.50374 2.38382 4.88419C2.43301 4.28215 2.52131 3.987 2.62268 3.78806L1.28617 3.10707L-0.050339 2.42609C-0.40311 3.11844 -0.541873 3.85233 -0.60622 4.63989C-0.669135 5.40994 -0.667969 6.35667 -0.667969 7.4987H0.832031ZM3.10707 1.28617L2.42609 -0.050339C1.35983 0.492943 0.492943 1.35983 -0.050339 2.42609L1.28617 3.10707L2.62268 3.78806C2.87834 3.28629 3.28629 2.87834 3.78806 2.62268L3.10707 1.28617Z" fill="currentColor" mask="url(#ax-nav-orders-mask)" />
      </g>
      <defs><clipPath id="ax-nav-orders-clip"><rect width="20" height="20" fill="white" /></clipPath></defs>
    </svg>
  ),
};

function Icon({ name, size = 20 }) {
  if (!name) return null;
  if (typeof name !== "string") return name;
  if (NAV_ICONS[name]) return NAV_ICONS[name];
  return <i className={`bi bi-${name}`} style={{ fontSize: size, lineHeight: 1, display: "block" }} />;
}

function Counter({ value }) {
  return (
    <span style={{
      minWidth: 20, height: 20, padding: "0 5px", borderRadius: "var(--ax-radius-full)",
      background: "var(--ax-sea-depths)", color: "#fff", fontSize: 12,
      fontWeight: "var(--ax-fw-semibold)", display: "inline-flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>{value}</span>
  );
}

function Rule() {
  return <div style={{ height: 1, alignSelf: "stretch", background: "var(--ax-border-subtle)", flexShrink: 0 }} />;
}

function Caption({ children, collapsed }) {
  return (
    <div style={{
      height: collapsed ? 12 : 38, display: "flex", alignItems: "center", padding: "0 28px",
      fontSize: 14, fontWeight: "var(--ax-fw-medium)", color: "var(--ax-text-tertiary)",
      letterSpacing: "var(--ax-tracking-wide)", flexShrink: 0, overflow: "hidden",
      whiteSpace: "nowrap", opacity: collapsed ? 0 : 1,
      transition: tr("height", "opacity"),
    }}>{children}</div>
  );
}

function Item({ item, collapsed, open, onActivate }) {
  const [hover, setHover] = React.useState(false);
  const on = item.active;
  const tinted = on || hover;
  return (
    <a
      href={item.href || "#"}
      className="ax-sidenav-item"
      aria-current={on ? "page" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => { if (!item.href) e.preventDefault(); onActivate && onActivate(item, e); }}
      style={{
        display: "flex", alignItems: "center", gap: 8, height: 44, flexShrink: 0,
        padding: collapsed ? "12px 27px 12px 27px" : "12px 28px 12px 25px",
        justifyContent: "flex-start", overflow: "hidden",
        boxSizing: "border-box",
        borderLeft: `3px solid ${on ? "var(--ax-sea-depths)" : "transparent"}`,
        background: on ? "var(--ax-teal-50)" : "transparent",
        color: tinted ? "var(--ax-sea-depths)" : "var(--ax-text-secondary)",
        fontSize: 14, fontWeight: "var(--ax-fw-medium)", textDecoration: "none",
        whiteSpace: "nowrap", cursor: "pointer",
        transition: `background .15s ease, color .15s ease, ${tr("padding", "border-color")}`,
      }}
      title={collapsed ? item.label : undefined}
    >
      <span style={{ width: 20, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={item.icon} />
      </span>
      <span style={{
        flex: collapsed ? "0 1 auto" : 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
        maxWidth: collapsed ? 0 : 180, opacity: collapsed ? 0 : 1,
        transition: tr("max-width", "opacity"),
      }}>{item.label}</span>
      {item.badge != null && (
        <span style={{
          display: "inline-flex", overflow: "hidden", flexShrink: 0,
          maxWidth: collapsed ? 0 : 48, opacity: collapsed ? 0 : 1,
          transition: tr("max-width", "opacity"),
        }}><Counter value={item.badge} /></span>
      )}
      {item.children && (
        <i className="bi bi-chevron-down" style={{
          fontSize: 16, flexShrink: 0, display: "block",
          maxWidth: collapsed ? 0 : 16, opacity: collapsed ? 0 : 1, overflow: "hidden",
          transition: `transform .18s ease, ${tr("max-width", "opacity")}`,
          transform: open ? "rotate(180deg)" : "none",
        }} />
      )}
    </a>
  );
}

function SubItem({ item, onActivate }) {
  const [hover, setHover] = React.useState(false);
  const tinted = item.active || hover;
  return (
    <a
      href={item.href || "#"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => { if (!item.href) e.preventDefault(); onActivate && onActivate(item, e); }}
      style={{
        display: "flex", alignItems: "center", gap: 12, height: 38, flexShrink: 0,
        padding: "0 28px 0 56px", textDecoration: "none", fontSize: 16,
        fontWeight: "var(--ax-fw-medium)", whiteSpace: "nowrap", cursor: "pointer",
        color: tinted ? "var(--ax-sea-depths)" : "var(--ax-text-secondary)",
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: 1, flexShrink: 0,
        background: tinted ? "var(--ax-sea-depths)" : "var(--ax-gray-400)",
      }} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
      {item.badge != null && <Counter value={item.badge} />}
    </a>
  );
}

function SideNav({
  groups = [],
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  logo = "assets/ax-wordmark-color.svg",
  logoMark = "assets/ax-mark-color.svg",
  authority = "COMPETENT AUTHORITY",
  country = "United States",
  flag = "assets/us.png",
  height = 913,
  className = "",
  style = {},
}) {
  const [openId, setOpenId] = React.useState(() => {
    for (const g of groups) for (const it of g.items || []) if (it.children && (it.active || it.children.some((c) => c.active))) return it.id;
    return null;
  });
  const activate = (item, e) => {
    if (item.children) { setOpenId((v) => (v === item.id ? null : item.id)); e.preventDefault(); return; }
    onNavigate && onNavigate(item, e);
  };

  return (
    <nav className={`ax-sidenav ${className}`} aria-label="Portal navigation" style={{
      width: collapsed ? W_STRIP : W_OPEN, height, boxSizing: "border-box",
      display: "flex", flexDirection: "column", gap: 16, padding: "24px 0",
      background: "var(--ax-surface-card)", borderRight: "1px solid var(--ax-border-subtle)",
      fontFamily: "var(--ax-font-base)", overflowY: "visible", position: "relative", flexShrink: 0, boxSizing: "border-box",
      transition: tr("width"), willChange: "width", ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0,
        justifyContent: "space-between", padding: collapsed ? "0 27px" : "0 28px",
        height: 26, transition: tr("padding"),
      }}>
        <span style={{ position: "relative", display: "block", height: 26, width: collapsed ? 26 : 160, flexShrink: 0, transition: tr("width") }}>
          <img src={logoMark} alt="ApostilleXpress" style={{
            width: 26, height: 26, display: "block", position: "absolute", left: 0, top: 0,
            opacity: collapsed ? 1 : 0, transition: tr("opacity"),
          }} />
          <img src={logo} alt="ApostilleXpress" style={{
            height: 26, display: "block", position: "absolute", left: 0, top: 0,
            opacity: collapsed ? 0 : 1, transition: tr("opacity"),
          }} />
        </span>
        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            style={{
              ...toggleStyle,
              position: collapsed ? "absolute" : "static", left: collapsed ? 58 : undefined, top: collapsed ? 29 : undefined,
            }}>
            <i className="bi bi-chevron-double-left" style={{
              fontSize: 16, display: "block",
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: `transform ${DUR}ms ${EASE}`,
            }} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        {groups.map((g, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <Rule />}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: "stretch" }}>
              {g.label && <Caption collapsed={collapsed}>{g.label}</Caption>}
              {(g.items || []).map((it) => (
                <React.Fragment key={it.id || it.label}>
                  <Item item={it} collapsed={collapsed} open={openId === it.id} onActivate={activate} />
                  {!collapsed && it.children && openId === it.id && it.children.map((c) => (
                    <SubItem key={c.id || c.label} item={c} onActivate={onNavigate} />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{
        flexShrink: 0, boxSizing: "border-box",
        borderTop: "1px solid var(--ax-border-subtle)", borderBottom: "1px solid var(--ax-border-subtle)",
        display: "flex", flexDirection: "column", gap: 8, justifyContent: "center",
        alignItems: collapsed ? "center" : "flex-start", overflow: "hidden",
        padding: collapsed ? "22px 16px" : "10px 28px",
        transition: tr("padding"),
      }}>
        <span style={{
          fontSize: 14, color: "var(--ax-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden",
          height: collapsed ? 0 : 20, opacity: collapsed ? 0 : 1, transition: tr("height", "opacity"),
        }}>{authority}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={flag} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 }} />
          <span style={{
            fontSize: 14, color: "var(--ax-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden",
            maxWidth: collapsed ? 0 : 140, opacity: collapsed ? 0 : 1, transition: tr("max-width", "opacity"),
          }}>{country}</span>
        </div>
      </div>
    </nav>
  );
}

const toggleStyle = {
  width: 16, height: 16, padding: 0, border: "none", background: "transparent",
  color: "var(--ax-sea-depths)", cursor: "pointer", display: "inline-flex",
  alignItems: "center", justifyContent: "center", flexShrink: 0,
};


window.AXSideNav = SideNav;
if (typeof module !== "undefined") module.exports = { SideNav, AXSideNav: SideNav };
