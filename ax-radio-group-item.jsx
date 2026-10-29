/* Ported from ApostilleXpress DS components/forms/RadioGroupItem.jsx (not yet in ds-bundle.js). */

/* RadioGroupItem — selectable card row from the "Radio group item" Figma set.
   Axes: type (radio | checkbox | icon | card | payment | avatar) × size (sm | md)
   × selected × state (default | hover | focused | disabled). */

const SZ = {
  sm: { control: 16, media: 32, contentGap: 12, textGap: 0, subGap: 4, title: 14, body: 14 },
  md: { control: 16, media: 40, contentGap: 12, textGap: 2, subGap: 6, title: 14, body: 14 },
};

function Control({ kind, selected, disabled, size = "sm" }) {
  const d = size === "md" && kind === "checkboxBase" ? 20 : 16;
  const on = !!selected;
  const accent = disabled ? "var(--ax-border-strong)" : "var(--ax-sea-depths)";
  const shell = {
    width: d, height: d, flexShrink: 0, boxSizing: "border-box",
    borderRadius: kind === "radio" ? "50%" : d >= 20 ? 6 : 4,
    border: `1px solid ${on ? accent : "var(--ax-border-strong)"}`,
    background: on ? accent : disabled ? "var(--ax-surface-disabled)" : "var(--ax-surface-card)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "background .12s ease, border-color .12s ease",
  };
  return (
    <span aria-hidden="true" style={shell}>
      {on && kind === "radio" ? <span style={{ width: d * 0.375, height: d * 0.375, borderRadius: "50%", background: "var(--ax-white)" }} /> : null}
      {on && kind !== "radio" ? (
        <svg width={d * 0.7} height={d * 0.7} viewBox="0 0 12 12" fill="none"><path d="M10 3.5 4.75 8.75 2 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : null}
    </span>
  );
}

function Media({ type, size, icon, avatarSrc, paymentIcon }) {
  const s = SZ[size];
  if (type === "avatar") {
    return <span style={{ width: s.media, height: s.media, borderRadius: "50%", flexShrink: 0, background: avatarSrc ? `url(${avatarSrc}) center/cover no-repeat` : "var(--ax-gray-200)" }} />;
  }
  if (type === "payment") {
    return (
      <span style={{ width: 46, height: 32, flexShrink: 0, borderRadius: 4, background: "var(--ax-surface-card)", boxShadow: "inset 0 0 0 1px var(--ax-border), var(--ax-shadow-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, letterSpacing: ".02em", color: "var(--ax-text-secondary)", fontFamily: "var(--ax-font-base)" }}>{paymentIcon || "VISA"}</span>
    );
  }
  return (
    <span style={{ width: s.media, height: s.media, flexShrink: 0, borderRadius: 8, background: "var(--ax-white)", boxShadow: "inset 0 0 0 1px var(--ax-border-strong), var(--ax-shadow-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size === "md" ? 20 : 16, color: "var(--ax-text-secondary)" }}>{icon}</span>
  );
}

function RadioGroupItem({
  type = "radio", size = "sm", selected = false, disabled = false, focused = false,
  title = "Basic plan", subtext, supportingText, icon, avatarSrc, paymentIcon, badge,
  price, period, actions, name, value, onSelect, className = "", style = {}, ...props
}) {
  const [hover, setHover] = React.useState(false);
  const s = SZ[size];
  const isCard = type === "card";
  const trailing = type === "radio" ? "radio" : "checkbox";
  const textColor = disabled ? "var(--ax-text-disabled)" : "var(--ax-text-secondary)";
  const ring = focused ? ", 0 0 0 2px var(--ax-white), var(--ax-focus-ring-control)" : "";
  const container = {
    position: "relative", boxSizing: "border-box", width: "100%", textAlign: "left",
    fontFamily: "var(--ax-font-base)", border: "none", appearance: "none",
    borderRadius: 12,
    background: disabled ? "var(--ax-surface-hover)" : hover && !isCard ? "var(--ax-surface-hover)" : "var(--ax-surface-card)",
    boxShadow: `0px 0px 0px 1px #CED4DA${ring}`,
    display: "flex", flexDirection: isCard ? "column" : "row", gap: isCard ? 0 : 4,
    padding: isCard ? 0 : 16, alignItems: isCard ? "stretch" : "flex-start",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background .12s ease, box-shadow .12s ease",
    ...style,
  };
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: disabled ? undefined : () => onSelect && onSelect(value),
  };
  const titleStyle = { fontSize: s.title, fontWeight: "var(--ax-fw-semibold, 600)", lineHeight: 1, color: disabled ? "var(--ax-text-disabled)" : "var(--ax-text-secondary)", whiteSpace: "nowrap" };
  const bodyStyle = { fontSize: s.body, lineHeight: 1.35, color: textColor };

  if (isCard) {
    return (
      <div role="radio" aria-checked={selected} aria-disabled={disabled || undefined} className={`ax-radio-item ${className}`} style={container} {...handlers} {...props}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "var(--ax-space-3) var(--ax-space-5) var(--ax-space-3) var(--ax-space-3)", borderRadius: "0.75rem 0.75rem 0 0", boxShadow: "inset 0 0 0 1px var(--ax-border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexGrow: 1, minWidth: 0 }}>
            <Media type="icon" size="md" icon={icon} />
            <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1, color: disabled ? "var(--ax-text-disabled)" : "var(--ax-text-primary)" }}>{title}</span>
          </div>
          <Control kind="checkboxBase" size="md" selected={selected} disabled={disabled} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4, padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: disabled ? "var(--ax-text-disabled)" : "var(--ax-text-primary)" }}>{price || "$10"}</span>
              <span style={{ fontSize: 14, lineHeight: 1, paddingBottom: 3, color: textColor }}>{period || "per month"}</span>
            </div>
            {supportingText ? <span style={bodyStyle}>{supportingText}</span> : null}
          </div>
          {badge ? <span style={{ flexShrink: 0 }}>{badge}</span> : null}
        </div>
      </div>
    );
  }

  const showMedia = type === "icon" || type === "avatar" || type === "payment";
  const leadingControl = type === "radio" || type === "checkbox";
  return (
    <div role="radio" aria-checked={selected} aria-disabled={disabled || undefined} className={`ax-radio-item ${className}`} style={container} {...handlers} {...props}>
      <div style={{ display: "flex", flexDirection: "row", gap: type === "payment" ? 16 : leadingControl ? (size === "md" ? 12 : 8) : s.contentGap, alignItems: "flex-start", flexGrow: 1, minWidth: 0 }}>
        {leadingControl ? <span style={{ display: "inline-flex", padding: "1px 0", flexShrink: 0 }}><Control kind={type} size={size} selected={selected} disabled={disabled} /></span> : null}
        {showMedia ? <Media type={type} size={size} icon={icon} avatarSrc={avatarSrc} paymentIcon={paymentIcon} /> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: type === "payment" ? 12 : s.textGap, flexGrow: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: type === "payment" ? 2 : s.textGap }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: s.subGap, flexWrap: "wrap" }}>
              <span style={type === "payment" ? { fontSize: 16, fontWeight: 500, lineHeight: "1.5rem", color: disabled ? "var(--ax-text-disabled)" : "var(--ax-gray-700)" } : titleStyle}>{title}</span>
              {subtext ? <span style={type === "payment" ? { fontSize: 16, lineHeight: "1.5rem", color: textColor } : { ...bodyStyle, lineHeight: 1, whiteSpace: "nowrap" }}>{subtext}</span> : null}
            </div>
            {supportingText ? <span style={type === "payment" ? { fontSize: 16, lineHeight: "1.5rem", color: textColor } : bodyStyle}>{supportingText}</span> : null}
          </div>
          {actions ? <div style={{ display: "flex", gap: 12, alignItems: "center" }}>{actions}</div> : null}
        </div>
      </div>
      {!leadingControl ? <Control kind="checkboxBase" size={size} selected={selected} disabled={disabled} /> : null}
    </div>
  );
}

/* RadioGroupItemGroup — manages single-select across a list of items. */
function RadioGroupItemGroup({ options = [], value, onChange, type = "radio", size = "sm", gap = 12, className = "", style = {} }) {
  return (
    <div role="radiogroup" className={`ax-radio-item-group ${className}`} style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {options.map((o) => (
        <RadioGroupItem key={o.value} {...o} type={o.type || type} size={o.size || size} value={o.value} selected={value === o.value} onSelect={onChange} />
      ))}
    </div>
  );
}

module.exports = { RadioGroupItem, RadioGroupItemGroup };
