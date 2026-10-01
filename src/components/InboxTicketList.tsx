import { useEffect, useRef, useState, type ReactNode } from "react";
import type { InboxFolder } from "./InboxNavigation";
import "./InboxTicketList.css";

const icons = {
  whatsapp: new URL("../assets/inbox-ticket-list/whatsapp.svg", import.meta.url).href,
  crown: new URL("../assets/inbox-ticket-list/crown.svg", import.meta.url).href,
  building: new URL("../assets/inbox-ticket-list/building.svg", import.meta.url).href,
  airbnb: new URL("../assets/inbox-ticket-list/airbnb.svg", import.meta.url).href,
  booking: new URL("../assets/inbox-ticket-list/booking-com.svg", import.meta.url).href,
  travel: new URL("../assets/inbox-ticket-list/travel-source.svg", import.meta.url).href,
  stickyNote: new URL("../assets/inbox-ticket-list/sticky-note.svg", import.meta.url).href,
  alertOctagon: new URL("../assets/inbox-ticket-list/alert-octagon.svg", import.meta.url).href,
  email: new URL("../assets/inbox-ticket-list/mail.svg", import.meta.url).href,
  assignee: new URL("../assets/inbox-ticket-list/user-check-2.svg", import.meta.url).href,
  search: new URL("../assets/inbox-ticket-list/search.svg", import.meta.url).href,
  clear: new URL("../assets/inbox-ticket-list/x.svg", import.meta.url).href,
  searchEmpty: new URL("../assets/inbox-ticket-list/search-empty.svg", import.meta.url).href,
  loader: new URL("../assets/inbox-ticket-list/loader.svg", import.meta.url).href,
  alertCircle: new URL("../assets/inbox-ticket-list/alert-circle.svg", import.meta.url).href,
  retry: new URL("../assets/inbox-ticket-list/retry.svg", import.meta.url).href,
} as const;

export type InboxChannel = "whatsapp" | "airbnb" | "booking" | "email" | "travel";
type SpecialPreview = "internal" | "failed";

type Ticket = {
  id: string;
  name: string;
  channel: InboxChannel;
  vip?: boolean;
  property?: boolean;
  preview: string;
  prefix?: string;
  special?: SpecialPreview;
  unread?: number;
  assignee?: string;
  timestamp?: string;
};

const queueTickets: Ticket[] = [
  {
    id: "john",
    name: "John Doe",
    channel: "whatsapp",
    vip: true,
    property: true,
    preview: "Lorem ipsum dolor sit amet",
    prefix: "Keith",
  },
  {
    id: "evelyn",
    name: "Evelyn Harper",
    channel: "airbnb",
    property: true,
    preview: "My booking for the downtown loft is ready for your arrival.",
    prefix: "Evelyn Harper",
  },
  {
    id: "jasper",
    name: "Jasper Langley",
    channel: "travel",
    vip: true,
    property: true,
    preview: "My reservation for the Beachfront Villa on March 22nd is confirmed. We look forward to hosting you!",
    prefix: "Jasper Langley",
    unread: 1,
  },
  {
    id: "miles",
    name: "Miles Thornton",
    channel: "booking",
    vip: true,
    preview: "Thanks for choosing Sunnyvale Apartments! Your rental is secured for Saturday starting at 3 PM.",
    special: "internal",
    prefix: "",
    unread: 2,
  },
  {
    id: "clara",
    name: "Clara Bennett",
    channel: "travel",
    preview: "Reminder: your stay at Mountain View Lodge starts tomorrow.",
    special: "failed",
    prefix: "",
  },
  {
    id: "nina-garden",
    name: "Nina Caldwell",
    channel: "whatsapp",
    property: true,
    preview: "Your booking for the Garden Suite this weekend is all set. Please plan to arrive by 2 PM.",
    prefix: "Keith",
  },
  {
    id: "owen-city",
    name: "Owen Fitzgerald",
    channel: "email",
    property: true,
    preview: "Reservation confirmed! See you at the City Center Apartment on Thursday afternoon.",
    prefix: "Keith",
  },
  {
    id: "nina-cabin",
    name: "Nina Caldwell",
    channel: "whatsapp",
    property: true,
    preview: "Looking forward to your stay! Your reservation at the Cozy Cabin is locked in for Monday evening.",
    prefix: "Keith",
  },
  {
    id: "owen-lakeside",
    name: "Owen Fitzgerald",
    channel: "email",
    vip: true,
    property: true,
    preview: "All set! Your rental for the Lakeside Retreat is confirmed for Friday starting at 5 PM.",
    prefix: "Keith",
  },
];

const timingResults: Ticket[] = [
  {
    id: "search-john",
    name: "John Doe",
    channel: "whatsapp",
    vip: true,
    property: true,
    preview: "Whats the timing for the gym & pool?",
    unread: 2,
    assignee: "Keith Mbeep",
  },
  {
    id: "search-liam",
    name: "Liam Carter",
    channel: "airbnb",
    property: true,
    preview: "...eek can I get the gym & pool timing",
    unread: 2,
    assignee: "Iris Botsford",
  },
  {
    id: "search-timmy",
    name: "Timmy Johnson",
    channel: "whatsapp",
    property: true,
    preview: "Your booking for the Garden Suite this weekend is confirmed.",
    assignee: "Cameron Torphy",
  },
  {
    id: "search-ava-email",
    name: "Ava Morgan",
    channel: "email",
    property: true,
    preview: "Time of reservation confirmed! See you soon.",
    assignee: "Andrew Koch",
  },
  {
    id: "search-ava-vip",
    name: "Ava Morgan",
    channel: "email",
    vip: true,
    property: true,
    preview: "Time of reservation confirmed! See you soon.",
    assignee: "Andrew Koch",
  },
];

function Icon({ src, className = "" }: { src: string; className?: string }) {
  return <img className={`inbox-ticket-list__icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function ChannelIcon({ channel }: { channel: InboxChannel }) {
  return (
    <span className={`inbox-ticket-list__channel inbox-ticket-list__channel--${channel}`} aria-hidden="true">
      <Icon src={icons[channel]} />
    </span>
  );
}

function TicketBadges({ ticket }: { ticket: Ticket }) {
  return (
    <span className="inbox-ticket-list__badges" aria-label={[ticket.vip && "VIP guest", ticket.property && "Property guest"].filter(Boolean).join(", ")}>
      {ticket.vip && (
        <span className="inbox-ticket-list__badge inbox-ticket-list__badge--vip" title="VIP guest">
          <Icon src={icons.crown} />
        </span>
      )}
      {ticket.property && (
        <span className="inbox-ticket-list__badge inbox-ticket-list__badge--property" title="Property guest">
          <Icon src={icons.building} />
        </span>
      )}
    </span>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return <>{text}</>;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "ig"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part,
      )}
    </>
  );
}

function TicketRow({
  ticket,
  selected,
  searchQuery = "",
  onSelect,
}: {
  ticket: Ticket;
  selected: boolean;
  searchQuery?: string;
  onSelect: () => void;
}) {
  const unread = ticket.unread !== undefined && ticket.unread > 0;
  const previewPrefix = ticket.special === "internal" ? "Internal" : ticket.special === "failed" ? "Failed" : ticket.prefix;

  return (
    <button
      className={`inbox-ticket-list__ticket${selected ? " is-selected" : ""}${unread ? " is-unread" : ""}`}
      type="button"
      aria-current={selected ? "true" : undefined}
      aria-label={`${ticket.name}: ${ticket.preview}${ticket.unread ? `, ${ticket.unread} unread` : ""}`}
      onClick={onSelect}
    >
      <span className="inbox-ticket-list__overview">
        <span className="inbox-ticket-list__identity-row">
          <span className="inbox-ticket-list__identity">
            <ChannelIcon channel={ticket.channel} />
            <span className={`inbox-ticket-list__name text-sm font-medium leading-sm-medium${selected || unread ? " is-emphasized" : ""}`}>
              {ticket.name}
            </span>
            <TicketBadges ticket={ticket} />
          </span>
          <span className="inbox-ticket-list__timestamp text-xs font-normal leading-xs-normal">{ticket.timestamp ?? "5m"}</span>
        </span>
        <span className="inbox-ticket-list__message-row">
          <span className="inbox-ticket-list__preview text-sm font-normal leading-sm-normal">
            {ticket.special && (
              <span className={`inbox-ticket-list__special inbox-ticket-list__special--${ticket.special}`}>
                <Icon src={ticket.special === "internal" ? icons.stickyNote : icons.alertOctagon} />
                <span>{previewPrefix}:</span>
              </span>
            )}
            {!ticket.special && previewPrefix && <span className="inbox-ticket-list__prefix">{previewPrefix}:</span>}
            <span className="inbox-ticket-list__preview-text">
              <HighlightedText text={ticket.preview} query={searchQuery} />
            </span>
          </span>
          {ticket.unread && <span className="inbox-ticket-list__unread text-xxs font-bold leading-xxs-bold">{ticket.unread}</span>}
        </span>
      </span>
      <span className="inbox-ticket-list__assignee text-xs font-normal leading-xs-normal">
        <Icon src={icons.assignee} />
        <span>{ticket.assignee ?? "Keith Mbeep"}</span>
      </span>
    </button>
  );
}

function EmptyState({ icon, title, description, className = "" }: { icon: string; title: string; description: string; className?: string }) {
  return (
    <div className={`inbox-ticket-list__state ${className}`}>
      <Icon src={icon} className="inbox-ticket-list__state-icon" />
      <div className="inbox-ticket-list__state-copy">
        <h3 className="text-base font-medium leading-base-medium text-component-text-primary">{title}</h3>
        <p className="text-sm font-normal leading-sm-normal text-component-text-tertiary">{description}</p>
      </div>
    </div>
  );
}

function SearchResults({
  tickets,
  query,
  selectedId,
  onSelect,
}: {
  tickets: Ticket[];
  query: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (tickets.length === 0) {
    return <EmptyState icon={icons.searchEmpty} title="No results found" description="Try another name, message, or reservation number." className="inbox-ticket-list__no-results" />;
  }

  return (
    <div className="inbox-ticket-list__thread-list" aria-label="Search results">
      {tickets.map((ticket) => (
        <TicketRow
          key={ticket.id}
          ticket={ticket}
          selected={ticket.id === selectedId}
          searchQuery={query}
          onSelect={() => onSelect(ticket.id)}
        />
      ))}
    </div>
  );
}

function SearchBody({
  loading,
  error,
  query,
  tickets,
  selectedId,
  onSelect,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  query: string;
  tickets: Ticket[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRetry: () => void;
}): ReactNode {
  if (!query.trim()) {
    return <EmptyState icon={icons.searchEmpty} title="Search inbox" description="Search tickets and messages across the inbox." className="inbox-ticket-list__empty-search" />;
  }

  if (loading) {
    return (
      <div className="inbox-ticket-list__loading" role="status" aria-live="polite">
        <Icon src={icons.loader} className="inbox-ticket-list__loader" />
        <span className="text-sm font-normal leading-sm-normal text-component-text-tertiary">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inbox-ticket-list__error">
        <EmptyState
          icon={icons.alertCircle}
          title="Could not search tickets"
          description="Something went wrong. Try again, or refresh if the problem continues."
          className="inbox-ticket-list__error-copy"
        />
        <button className="inbox-ticket-list__retry bg-semantic-background-brand-contrast text-component-text-inverse text-base font-medium leading-base-medium" type="button" onClick={onRetry}>
          <Icon src={icons.retry} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return <SearchResults tickets={tickets} query={query} selectedId={selectedId} onSelect={onSelect} />;
}

export default function InboxTicketList({
  folder,
  searchActive,
  onCloseSearch,
  onActiveTicketChange,
}: {
  folder: InboxFolder;
  searchActive: boolean;
  onCloseSearch: () => void;
  onActiveTicketChange?: (ticket: Pick<Ticket, "channel" | "name">) => void;
}) {
  const [selectedQueueId, setSelectedQueueId] = useState("john");
  const [selectedSearchId, setSelectedSearchId] = useState("search-john");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchActive) {
      setQuery("");
      setLoading(false);
      setSearchError(false);
      const ticket = queueTickets.find((item) => item.id === selectedQueueId);
      if (ticket) onActiveTicketChange?.({ channel: ticket.channel, name: ticket.name });
      return;
    }

    inputRef.current?.focus();
    const ticket = [...queueTickets, ...timingResults].find((item) => item.id === selectedSearchId);
    if (ticket) onActiveTicketChange?.({ channel: ticket.channel, name: ticket.name });
  }, [searchActive, selectedSearchId, selectedQueueId, onActiveTicketChange]);

  useEffect(() => {
    const term = query.trim();
    if (!searchActive || !term) {
      setLoading(false);
      setSearchError(false);
      return;
    }

    setLoading(true);
    setSearchError(false);
    const timer = window.setTimeout(() => {
      setLoading(false);
      setSearchError(term.toLowerCase() === "xyz");
    }, 450);

    return () => window.clearTimeout(timer);
  }, [query, searchActive]);

  const lowerQuery = query.trim().toLowerCase();
  const searchTickets = lowerQuery.includes("tim")
    ? timingResults
    : /^\d+$/.test(lowerQuery)
      ? timingResults.slice(0, 2)
      : [...queueTickets, ...timingResults].filter((ticket, index, all) => {
          const searchable = `${ticket.name} ${ticket.preview} ${ticket.prefix ?? ""}`.toLowerCase();
          return searchable.includes(lowerQuery) && all.findIndex((item) => item.id === ticket.id) === index;
        });

  const handleRetry = () => {
    setLoading(true);
    setSearchError(false);
    window.setTimeout(() => {
      setLoading(false);
      setSearchError(true);
    }, 450);
  };

  return (
    <aside className="inbox-ticket-list bg-semantic-background-primary text-component-text-primary font-sans" aria-label={searchActive ? "Inbox search" : "Ticket queue"}>
      {searchActive ? (
        <>
          <div className="inbox-ticket-list__search-header border-semantic-stroke-lighter">
            <label className="inbox-ticket-list__search-field border-semantic-stroke-brand-quaternary rounded-lg">
              <Icon src={icons.search} />
              <input
                ref={inputRef}
                className="text-sm font-normal leading-sm-normal text-component-text-primary"
                type="text"
                value={query}
                placeholder="Search..."
                aria-label="Search tickets and messages"
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="inbox-ticket-list__clear" type="button" aria-label="Clear search and return to the previous queue" onClick={onCloseSearch}>
                <Icon src={icons.clear} />
              </button>
            </label>
          </div>
          <SearchBody
            loading={loading}
            error={searchError}
            query={query}
            tickets={searchTickets}
            selectedId={selectedSearchId}
            onSelect={(id) => {
              setSelectedSearchId(id);
              const ticket = searchTickets.find((item) => item.id === id);
              if (ticket) onActiveTicketChange?.({ channel: ticket.channel, name: ticket.name });
            }}
            onRetry={handleRetry}
          />
        </>
      ) : (
        <>
          <header className="inbox-ticket-list__header border-semantic-stroke-lighter">
            <h2 className="inbox-ticket-list__breadcrumb text-sm font-semibold leading-sm-semibold text-component-text-primary">
              <span>{folder.primary}</span>
              <span className="inbox-ticket-list__breadcrumb-divider text-component-text-quaternary">/</span>
              <span>{folder.secondary}</span>
            </h2>
          </header>
          <div className="inbox-ticket-list__thread-list" aria-label={`${folder.primary}, ${folder.secondary}`}>
            {queueTickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                selected={ticket.id === selectedQueueId}
                onSelect={() => {
                  setSelectedQueueId(ticket.id);
                  onActiveTicketChange?.({ channel: ticket.channel, name: ticket.name });
                }}
              />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
