import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

const icons = {
  chevronDown: new URL("../assets/inbox-navigation/chevron-down.svg", import.meta.url).href,
  chevronUp: new URL("../assets/inbox-navigation/chevron-up.svg", import.meta.url).href,
  footerChevronUp: new URL("../assets/inbox-navigation/footer-chevron-up.svg", import.meta.url).href,
  footerChevronDown: new URL("../assets/inbox-navigation/footer-chevron-down.svg", import.meta.url).href,
  search: new URL("../assets/inbox-navigation/search.svg", import.meta.url).href,
  plus: new URL("../assets/inbox-navigation/plus.svg", import.meta.url).href,
  plusDisabled: new URL("../assets/inbox-navigation/plus-disabled.svg", import.meta.url).href,
  user: new URL("../assets/inbox-navigation/user-2.svg", import.meta.url).href,
  open: new URL("../assets/inbox-navigation/open.svg", import.meta.url).href,
  hourglass: new URL("../assets/inbox-navigation/hourglass.svg", import.meta.url).href,
  resolved: new URL("../assets/inbox-navigation/resolved.svg", import.meta.url).href,
  unassigned: new URL("../assets/inbox-navigation/user-round-x.svg", import.meta.url).href,
  assigned: new URL("../assets/inbox-navigation/user-check-2.svg", import.meta.url).href,
  spam: new URL("../assets/inbox-navigation/alert-octagon.svg", import.meta.url).href,
  available: new URL("../assets/inbox-navigation/status-check-circle.svg", import.meta.url).href,
  busy: new URL("../assets/inbox-navigation/status-minus-circle.svg", import.meta.url).href,
  unavailable: new URL("../assets/inbox-navigation/status-x-circle.svg", import.meta.url).href,
  selected: new URL("../assets/inbox-navigation/status-check.svg", import.meta.url).href,
} as const;

type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  count?: number;
};

type TeamSection = {
  id: string;
  name: string;
  dotClass: string;
  items: NavigationItem[];
};

const personalItems: NavigationItem[] = [
  { id: "open", label: "Open", icon: icons.open, count: 3 },
  { id: "waiting", label: "Waiting", icon: icons.hourglass, count: 5 },
  { id: "resolved", label: "Resolved", icon: icons.resolved, count: 0 },
];

function teamItems(counts: [number, number, number]): NavigationItem[] {
  return [
    { id: "unassigned", label: "Unassigned", icon: icons.unassigned, count: counts[0] },
    { id: "assigned", label: "Assigned", icon: icons.assigned, count: counts[1] },
    { id: "waiting", label: "Waiting", icon: icons.hourglass, count: counts[2] },
    { id: "resolved", label: "Resolved", icon: icons.resolved, count: 0 },
  ];
}

const teamSections: TeamSection[] = [
  {
    id: "guest-experience",
    name: "Guest Experience",
    dotClass: "bg-semantic-background-accent-teal-contrast",
    items: teamItems([2, 7, 12]),
  },
  {
    id: "reservation",
    name: "Reservation",
    dotClass: "bg-semantic-background-accent-lime-contrast",
    items: teamItems([1, 4, 5]),
  },
  {
    id: "sales",
    name: "Sales",
    dotClass: "bg-semantic-background-accent-pink-contrast",
    items: teamItems([2, 7, 92]),
  },
  {
    id: "frontdesk",
    name: "Frontdesk",
    dotClass: "bg-semantic-background-accent-sky-contrast",
    items: teamItems([1, 2, 2]),
  },
];

const agentStatuses = ["Available", "Busy", "Unavailable"] as const;
type AgentStatus = (typeof agentStatuses)[number];

export type InboxFolder = {
  primary: string;
  secondary: string;
};

type InboxNavigationProps = {
  searchActive: boolean;
  onSearchToggle: (active: boolean) => void;
  onFolderChange: (folder: InboxFolder) => void;
};

const statusPresentation: Record<AgentStatus, { badgeClass: string; icon: string }> = {
  Available: {
    badgeClass: "bg-semantic-background-accent-green-secondary text-component-text-accent-green-darker",
    icon: icons.available,
  },
  Busy: {
    badgeClass: "bg-semantic-background-accent-yellow-secondary text-component-text-accent-yellow-darker",
    icon: icons.busy,
  },
  Unavailable: {
    badgeClass: "bg-semantic-background-accent-red-secondary text-component-text-accent-red-darker",
    icon: icons.unavailable,
  },
};

function countLabel(count: number | undefined): string | undefined {
  if (count === undefined || count <= 0) return undefined;
  return count > 99 ? "+99" : String(count);
}

function countTotal(items: NavigationItem[]): number {
  return items.reduce((total, item) => total + (item.count ?? 0), 0);
}

function Icon({ src, className = "" }: { src: string; className?: string }) {
  return <img className={`inbox-nav__icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function Count({ value }: { value: number | undefined }) {
  const label = countLabel(value);
  if (!label) return null;

  return <span className="inbox-nav__count text-xs font-normal leading-xs-normal text-component-text-tertiary">{label}</span>;
}

function SectionTrigger({
  id,
  label,
  icon,
  count,
  expanded,
  hasCurrentItem,
  onToggle,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  count: number | undefined;
  expanded: boolean;
  hasCurrentItem: boolean;
  onToggle: () => void;
}) {
  const stateClass = expanded
    ? "bg-semantic-background-tertiary is-expanded"
    : hasCurrentItem
      ? "bg-semantic-background-brand-secondary is-current-container"
      : "bg-semantic-background-secondary";

  return (
    <button
      className={`inbox-nav__button inbox-nav__section-trigger text-xs font-medium leading-xs-medium ${stateClass}`}
      type="button"
      aria-expanded={expanded}
      aria-controls={id}
      onClick={onToggle}
    >
      <Icon src={expanded ? icons.chevronUp : icons.chevronDown} />
      <span className="inbox-nav__row-content">
        {icon}
        <span className="inbox-nav__item-label text-component-text-primary">{label}</span>
      </span>
      {!expanded && <Count value={count} />}
    </button>
  );
}

function NavigationTab({
  item,
  active,
  onActivate,
  spam = false,
}: {
  item: NavigationItem;
  active: boolean;
  onActivate: () => void;
  spam?: boolean;
}) {
  return (
    <button
      className={`inbox-nav__button inbox-nav__subtab text-xs font-medium leading-xs-medium ${
        spam ? "inbox-nav__spam-tab" : ""
      } ${active ? "bg-semantic-background-brand-secondary" : "bg-semantic-background-secondary"}`}
      type="button"
      aria-current={active ? "page" : undefined}
      disabled={active}
      onClick={onActivate}
    >
      <span className="inbox-nav__row-content">
        <Icon src={item.icon} />
        <span className="inbox-nav__item-label text-component-text-primary">{item.label}</span>
      </span>
      {!spam && <Count value={item.count} />}
    </button>
  );
}

export default function InboxNavigation({ searchActive, onSearchToggle, onFolderChange }: InboxNavigationProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    personal: true,
    "guest-experience": false,
    reservation: false,
    sales: false,
    frontdesk: false,
  });
  const [activeTab, setActiveTab] = useState("personal:waiting");
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("Available");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const statusTriggerRef = useRef<HTMLButtonElement>(null);
  const currentStatusOptionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (statusMenuOpen) currentStatusOptionRef.current?.focus();
  }, [statusMenuOpen]);

  const toggleSection = (sectionId: string) => {
    setExpanded((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  };

  const activateTab = (tabId: string, folder: InboxFolder) => {
    setActiveTab(tabId);
    onFolderChange(folder);
  };

  const closeStatusMenu = () => {
    setStatusMenuOpen(false);
    window.requestAnimationFrame(() => statusTriggerRef.current?.focus());
  };

  const selectStatus = (status: AgentStatus) => {
    setAgentStatus(status);
    closeStatusMenu();
  };

  const handleStatusMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeStatusMenu();
      return;
    }

    if (event.key !== "Tab") return;
    const options = Array.from(
      statusMenuRef.current?.querySelectorAll<HTMLButtonElement>("button[role='menuitemradio']") ?? [],
    );
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);

    if (event.shiftKey && currentIndex === 0) {
      event.preventDefault();
      options.at(-1)?.focus();
    } else if (!event.shiftKey && currentIndex === options.length - 1) {
      event.preventDefault();
      options[0]?.focus();
    }
  };

  const activePersonalItem = activeTab.startsWith("personal:");
  const personalCount = countTotal(personalItems);

  return (
    <>
      <aside className="inbox-nav bg-semantic-background-secondary text-component-text-primary font-sans" aria-label="Inbox navigation">
        <div className="inbox-nav__layout" inert={statusMenuOpen || undefined} aria-hidden={statusMenuOpen || undefined}>
          <header className="inbox-nav__header border-semantic-stroke-lighter">
            <h1 className="inbox-nav__title text-sm font-semibold leading-sm-semibold text-component-text-primary">Inbox</h1>
            <div className="inbox-nav__header-actions">
              <button
                className={`inbox-nav__icon-button border-semantic-stroke-primary ${searchActive ? "bg-semantic-background-brand-secondary" : "bg-semantic-background-secondary"}`}
                type="button"
                aria-label={searchActive ? "Close inbox search" : "Search inbox"}
                aria-pressed={searchActive}
                onClick={() => onSearchToggle(!searchActive)}
              >
                <Icon src={icons.search} />
              </button>
              <button
                className={`inbox-nav__icon-button inbox-nav__create-button ${
                  agentStatus === "Unavailable"
                    ? "bg-semantic-background-tertiary border-semantic-stroke-lighter"
                    : "bg-semantic-background-brand-contrast border-semantic-stroke-brand-contrast"
                }`}
                type="button"
                aria-label="Start a new conversation"
                title={agentStatus === "Unavailable" ? "Unavailable agents can't start conversations" : undefined}
                disabled={agentStatus === "Unavailable"}
              >
                <Icon src={agentStatus === "Unavailable" ? icons.plusDisabled : icons.plus} />
              </button>
            </div>
          </header>

          <nav className="inbox-nav__scroll" aria-label="Inbox folders">
            <section className="inbox-nav__section" aria-labelledby="personal-nav-label">
              <div className="inbox-nav__section-label text-xxs font-semibold leading-xxs-semibold text-component-text-tertiary" id="personal-nav-label">
                Personal
              </div>
              <SectionTrigger
                id="personal-submenu"
                label="Assigned to me"
                icon={<Icon src={icons.user} />}
                count={personalCount}
                expanded={expanded.personal}
                hasCurrentItem={activePersonalItem}
                onToggle={() => toggleSection("personal")}
              />
              <div className="inbox-nav__sub-menu" id="personal-submenu" hidden={!expanded.personal}>
                {personalItems.map((item) => {
                  const tabId = `personal:${item.id}`;
                  const active = activeTab === tabId;
                  return (
                    <NavigationTab
                      key={item.id}
                      item={item}
                      active={active}
                      onActivate={() => activateTab(tabId, { primary: "Assigned to me", secondary: item.label })}
                    />
                  );
                })}
              </div>
            </section>

            <section className="inbox-nav__section" aria-labelledby="teams-nav-label">
              <div className="inbox-nav__section-label text-xxs font-semibold leading-xxs-semibold text-component-text-tertiary" id="teams-nav-label">
                Teams
              </div>
              {teamSections.map((team) => {
                const sectionExpanded = expanded[team.id] ?? false;
                const selectedInTeam = activeTab.startsWith(`team:${team.id}:`);
                const subtotal = countTotal(team.items);

                return (
                  <div className="inbox-nav__team" key={team.id}>
                    <SectionTrigger
                      id={`${team.id}-submenu`}
                      label={team.name}
                      icon={<span className={`inbox-nav__team-dot ${team.dotClass}`} aria-hidden="true" />}
                      count={subtotal}
                      expanded={sectionExpanded}
                      hasCurrentItem={selectedInTeam}
                      onToggle={() => toggleSection(team.id)}
                    />
                    <div className="inbox-nav__sub-menu" id={`${team.id}-submenu`} hidden={!sectionExpanded}>
                      {team.items.map((item) => {
                        const tabId = `team:${team.id}:${item.id}`;
                        const active = activeTab === tabId;
                        return (
                          <NavigationTab
                            key={item.id}
                            item={item}
                            active={active}
                          onActivate={() => activateTab(tabId, { primary: team.name, secondary: item.label })}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="inbox-nav__section" aria-labelledby="other-nav-label">
              <div className="inbox-nav__section-label text-xxs font-semibold leading-xxs-semibold text-component-text-tertiary" id="other-nav-label">
                Other
              </div>
              <NavigationTab
                item={{ id: "spam", label: "Spam", icon: icons.spam }}
                active={activeTab === "other:spam"}
                onActivate={() => activateTab("other:spam", { primary: "Other", secondary: "Spam" })}
                spam
              />
            </section>
          </nav>

          <footer className="inbox-nav__footer bg-semantic-background-secondary">
            <button
              className={`inbox-nav__agent-button ${
                statusMenuOpen ? "bg-semantic-background-brand-secondary" : "bg-semantic-background-secondary"
              }`}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={statusMenuOpen}
              aria-controls="agent-status-menu"
              aria-label={`Keith Mbeep, ${agentStatus}. Change agent status`}
              onClick={() => setStatusMenuOpen(true)}
              ref={statusTriggerRef}
            >
              <span className="inbox-nav__avatar bg-semantic-background-contrast text-component-text-inverse text-sm font-medium leading-sm-medium" aria-hidden="true">
                KM
              </span>
              <span className="inbox-nav__agent-details">
                <span className="inbox-nav__agent-name text-xs font-semibold leading-xs-semibold text-component-text-primary">Keith Mbeep</span>
                <span className={`inbox-nav__status-pill text-xxs font-medium leading-xxs-medium ${statusPresentation[agentStatus].badgeClass}`}>
                  {agentStatus}
                </span>
              </span>
              <Icon src={statusMenuOpen ? icons.footerChevronDown : icons.footerChevronUp} />
            </button>
          </footer>
        </div>
      </aside>

      {statusMenuOpen && (
        <div className="inbox-nav__status-layer">
          <div
            className="inbox-nav__status-menu bg-semantic-background-primary border-semantic-stroke-lighter rounded-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Change agent status"
            id="agent-status-menu"
            ref={statusMenuRef}
            onKeyDown={handleStatusMenuKeyDown}
          >
            <div className="inbox-nav__status-options" role="menu" aria-label="Status options">
              {agentStatuses.map((status) => {
                const selected = agentStatus === status;
                return (
                  <button
                    className={`inbox-nav__status-option text-xs font-normal leading-xs-normal text-component-text-primary ${
                      selected ? "bg-semantic-background-brand-primary" : "bg-semantic-background-primary"
                    }`}
                    key={status}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => selectStatus(status)}
                    ref={selected ? currentStatusOptionRef : undefined}
                  >
                    <Icon src={statusPresentation[status].icon} />
                    <span>{status}</span>
                    {selected && <Icon className="inbox-nav__status-check" src={icons.selected} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
