import { Fragment, useRef, useState } from "react";
import "./InboxConversation.css";
import type { InboxChannel } from "./InboxTicketList";

const composerIcons = {
  caseSensitive: new URL("../assets/inbox-composer/case-sensitive.svg", import.meta.url).href,
  smile: new URL("../assets/inbox-composer/smile.svg", import.meta.url).href,
  paperclip: new URL("../assets/inbox-composer/paperclip.svg", import.meta.url).href,
  whatsapp: new URL("../assets/inbox-composer/whatsapp.svg", import.meta.url).href,
  message: new URL("../assets/inbox-composer/message.svg", import.meta.url).href,
  internalNote: new URL("../assets/inbox-composer/internal-note.svg", import.meta.url).href,
  sendWaiting: new URL("../assets/inbox-composer/send-waiting.svg", import.meta.url).href,
  sendWaitingEmail: new URL("../assets/inbox-composer/send-waiting-email.svg", import.meta.url).href,
  chevronUp: new URL("../assets/inbox-composer/chevron-up.svg", import.meta.url).href,
  email: new URL("../assets/inbox-composer/email.svg", import.meta.url).href,
  clear: new URL("../assets/inbox-composer/x-clear.svg", import.meta.url).href,
} as const;

const emojiCategories = {
  Smileys: [["😀", "grinning"], ["😃", "smile"], ["😄", "happy"], ["😁", "grin"], ["😆", "laugh"], ["😅", "sweat"], ["😂", "joy"], ["🙂", "slight smile"], ["🙃", "upside down"], ["😉", "wink"], ["😊", "blush"], ["😍", "heart eyes"], ["🥰", "hearts"], ["😘", "kiss"], ["😎", "cool"], ["🤔", "thinking"], ["😢", "cry"], ["😭", "sob"], ["😴", "sleep"], ["🤗", "hug"], ["🤩", "star struck"], ["😇", "angel"], ["😬", "grimace"], ["😋", "yummy"]],
  Gestures: [["👋", "wave"], ["🤚", "raised hand"], ["👌", "ok"], ["✌️", "peace"], ["🤞", "fingers crossed"], ["🤟", "love you"], ["🤘", "rock"], ["🤙", "call me"], ["👈", "left"], ["👉", "right"], ["👆", "up"], ["👇", "down"], ["👍", "thumbs up"], ["👎", "thumbs down"], ["✊", "fist"], ["👏", "clap"], ["🙌", "celebrate"], ["🙏", "pray"], ["💪", "strong"], ["🫶", "heart hands"]],
  Travel: [["🏠", "house"], ["🏡", "home"], ["🏖️", "beach"], ["🏝️", "island"], ["🌅", "sunrise"], ["🌞", "sun"], ["🌤️", "sunny"], ["🌧️", "rain"], ["✈️", "plane"], ["🚗", "car"], ["🚕", "taxi"], ["🧳", "luggage"], ["🛏️", "bed"], ["🛁", "bath"], ["🗺️", "map"], ["📍", "pin"]],
  Objects: [["❤️", "red heart"], ["🧡", "orange heart"], ["💛", "yellow heart"], ["💚", "green heart"], ["💙", "blue heart"], ["💜", "purple heart"], ["🤍", "white heart"], ["✨", "sparkles"], ["⭐", "star"], ["🎉", "party"], ["🎁", "gift"], ["💐", "bouquet"], ["🌸", "flower"], ["☕", "coffee"], ["🍰", "cake"], ["🥂", "cheers"]],
} as const;

type TimelineItem = {
  id: number;
  author: string;
  time: string;
  body: string;
  side: "guest" | "agent" | "note";
  gapMinutes?: number;
};

type ComposerAttachment = {
  id: string;
  file: File;
  state: "uploading" | "uploaded" | "failed";
};

const initialItems: TimelineItem[] = [
  { id: 1, author: "John Doe", time: "Yesterday, 8:42 AM", body: "Hi, I wanted to check if early check-in is possible for our stay?", side: "guest" },
  { id: 2, author: "John Doe", time: "Yesterday, 8:44 AM", body: "Our flight lands around 10 in the morning.", side: "guest", gapMinutes: 2 },
  { id: 3, author: "Sarah Johnson", time: "Yesterday, 9:12 AM", body: "Hi John, thanks for letting us know. I'll check with the team and get back to you shortly.", side: "agent" },
  { id: 4, author: "Sarah Johnson", time: "Yesterday, 9:18 AM", body: "The apartment is ready from 1 PM. You're welcome to drop your bags earlier.", side: "agent", gapMinutes: 6 },
  { id: 5, author: "John Doe", time: "Today, 10:15 AM", body: "That would be great, thank you!", side: "guest" },
];

export default function InboxConversation({ channel, contactName }: { channel: InboxChannel; contactName: string }) {
  const [items, setItems] = useState(initialItems);
  const [mode, setMode] = useState<"message" | "note">("message");
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<TimelineItem | null>(null);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [popover, setPopover] = useState<"format" | "emoji" | "template" | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof emojiCategories>("Smileys");
  const [emojiQuery, setEmojiQuery] = useState("");
  const [composerError, setComposerError] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showSubject, setShowSubject] = useState(false);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("jonathan.d@gmail.com");
  const [sendAsOpen, setSendAsOpen] = useState(false);
  const draftRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const isEmailChannel = channel === "email";
  const isEmail = isEmailChannel && mode === "message";
  const maxAttachments = mode === "note" || channel === "email" ? 10 : 1;
  const sendDisabled = (!draft.trim() && attachments.length === 0) || attachments.some((attachment) => attachment.state !== "uploaded") || (isEmail && !emailRecipient.trim());

  function send(status: string) {
    const message = draftRef.current?.innerText.trim() ?? draft.trim();
    if (!message && attachments.length === 0) return;
    setItems((current) => [...current, {
      id: Date.now(),
      author: mode === "note" ? "Sarah Johnson" : "You",
      time: "Now",
      body: [message, ...attachments.map(({ file }) => `Attachment: ${file.name}`)].filter(Boolean).join("\n"),
      side: mode === "note" ? "note" : "agent",
    }]);
    setDraft("");
    if (draftRef.current) draftRef.current.innerHTML = "";
    setAttachments([]);
    setReplyTo(null);
    setMenuOpen(false);
    setComposerError("");
    if (status) setItems((current) => [...current, { id: Date.now() + 1, author: "", time: "Now", body: `Ticket moved to ${status}`, side: "note" }]);
  }

  function addAttachments(fileList: FileList | null) {
    if (!fileList?.length) return;
    const available = Math.max(0, maxAttachments - attachments.length);
    const selected = Array.from(fileList).slice(0, available);
    if (selected.length === 0) return;
    const next = selected.map((file) => ({ id: `${file.name}-${Date.now()}-${Math.random()}`, file, state: "uploading" as const }));
    setAttachments((current) => [...current, ...next]);
    next.forEach((attachment) => {
      window.setTimeout(() => setAttachments((current) => current.map((item) => item.id === attachment.id ? { ...item, state: "uploaded" } : item)), 650);
    });
    if (fileList.length > selected.length) setComposerError(`You can attach up to ${maxAttachments} file${maxAttachments === 1 ? "" : "s"} here.`);
    else setComposerError("");
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  }

  function insertEmoji(emoji: string) {
    draftRef.current?.focus();
    document.execCommand("insertText", false, emoji);
    setDraft(draftRef.current?.innerText ?? "");
    setEmojiQuery("");
    setPopover(null);
  }

  function insertTemplate(text: string) {
    draftRef.current?.focus();
    document.execCommand("insertText", false, `${draftRef.current?.innerText.trim() ? " " : ""}${text}`);
    setDraft(draftRef.current?.innerText ?? "");
    setPopover(null);
  }

  function applyFormat(command: "bold" | "italic" | "underline" | "insertUnorderedList") {
    draftRef.current?.focus();
    document.execCommand(command);
    setDraft(draftRef.current?.innerText ?? "");
  }

  return (
    <section className="inbox-conversation bg-semantic-background-primary text-component-text-primary font-sans" aria-label="Conversation">
      <header className="inbox-conversation__header border-semantic-stroke-lighter">
        <div className="inbox-conversation__identity">
          <div className="inbox-conversation__avatar bg-semantic-background-tertiary text-component-text-secondary text-sm font-semibold">{initials(contactName)}</div>
          <div className="inbox-conversation__heading">
            <h2 className="text-base font-semibold leading-base-semibold">{contactName}</h2>
            <div className="inbox-conversation__metadata text-xs font-normal leading-xs-normal text-component-text-tertiary">
              <span>{channelName(channel)}</span><span aria-hidden="true">·</span><span>May 24 - 28, 2025</span><span aria-hidden="true">·</span><span>2 guests</span>
            </div>
          </div>
        </div>
        <div className="inbox-conversation__header-actions">
          <button className="inbox-conversation__icon-button text-component-text-secondary" type="button" aria-label="Open guest details" title="Guest details"><PersonIcon /></button>
          <button className="inbox-conversation__icon-button text-component-text-secondary" type="button" aria-label="More conversation actions" title="More actions"><MoreIcon /></button>
        </div>
      </header>

      <div className="inbox-conversation__timeline" aria-label="Message history" role="log" aria-live="polite">
        <div className="inbox-conversation__history text-xs font-medium leading-xs-medium text-component-text-tertiary">You're viewing the full conversation</div>
        <div className="inbox-conversation__date text-xs font-medium leading-xs-medium text-component-text-tertiary"><span>Yesterday</span></div>
        {items.map((item, index) => {
          if (item.side === "note") return <div className={`inbox-conversation__event text-xs font-normal leading-xs-normal text-component-text-secondary${item.author ? " is-note" : ""}`} key={item.id}><span>{item.body}</span><time>{item.time}</time></div>;
          const grouped = index > 0 && items[index - 1].author === item.author && items[index - 1].side === item.side && (item.gapMinutes ?? 0) < 5;
          return (
            <Fragment key={item.id}>
              {item.id === 5 && <div className="inbox-conversation__date text-xs font-medium leading-xs-medium text-component-text-tertiary"><span>Today</span></div>}
              {item.id === 5 && <div className="inbox-conversation__new-marker text-xs font-semibold leading-xs-semibold"><span>New</span></div>}
              <article className={`inbox-conversation__message is-${item.side}${grouped ? " is-grouped" : ""}`}>
                {item.side === "agent" && !grouped && <div className="inbox-conversation__message-meta text-xs font-medium leading-xs-medium text-component-text-tertiary">{item.author}</div>}
                <div className="inbox-conversation__message-row">
                  <div className="inbox-conversation__bubble text-sm font-normal leading-sm-normal">{item.body}</div>
                  <time className="inbox-conversation__time text-xxs font-normal leading-xxs-normal text-component-text-tertiary" title={item.time}>{item.time.includes(",") ? item.time.split(", ").at(-1) : item.time}</time>
                  <button className="inbox-conversation__reply text-component-text-tertiary" type="button" title="Reply to message" aria-label={`Reply to ${item.side === "guest" ? contactName : item.author}`} onClick={() => { setMode("message"); setReplyTo({ ...item, author: item.side === "guest" ? contactName : item.author }); }}><ReplyIcon /></button>
                </div>
                {item.side === "agent" && <div className="inbox-conversation__delivery text-xxs font-normal leading-xxs-normal text-component-text-tertiary">Sent</div>}
              </article>
            </Fragment>
          );
        })}
      </div>

      <div className="inbox-conversation__composer">
        <form className="inbox-composer__field" onSubmit={(event) => { event.preventDefault(); send(""); }}>
          <div className="inbox-composer__section">
            <div className="inbox-composer__top-row">
              <div className={`inbox-composer__mode-switch${isEmail ? " is-email" : ""}`} role="tablist" aria-label="Composer mode">
                <button type="button" role="tab" aria-selected={mode === "message"} className={`inbox-composer__mode-option text-xs font-medium leading-xs-medium${mode === "message" ? " is-active" : ""}`} onClick={() => setMode("message")}>
                  <img src={isEmailChannel ? composerIcons.email : composerIcons.message} alt="" /><span>{isEmailChannel ? "Email" : "Message"}</span>
                </button>
                <button type="button" role="tab" aria-selected={mode === "note"} className={`inbox-composer__mode-option text-xs font-normal leading-xs-normal${mode === "note" ? " is-active is-note" : ""}`} onClick={() => setMode("note")}>
                  <img src={composerIcons.internalNote} alt="" /><span>Internal note</span>
                </button>
              </div>
              {isEmail && <div className="inbox-composer__email-options">
                <button type="button" className={`text-xs font-semibold leading-xs-semibold${showCc ? " is-active" : ""}`} aria-pressed={showCc} onClick={() => setShowCc((visible) => !visible)}>Cc</button>
                <button type="button" className={`text-xs font-semibold leading-xs-semibold${showSubject ? " is-active" : ""}`} aria-pressed={showSubject} onClick={() => setShowSubject((visible) => !visible)}>Subject</button>
                <span aria-hidden="true" />
                <button className="inbox-composer__email-clear" type="button" aria-label="Clear Cc and Subject fields" onClick={() => { setShowCc(false); setShowSubject(false); setCc(""); setSubject(""); }}><img src={composerIcons.clear} alt="" /></button>
              </div>}
            </div>

            {isEmail && <div className="inbox-composer__email-fields">
              <div className="inbox-composer__email-row inbox-composer__send-as-row text-xs font-normal leading-xs-normal"><span>Send as</span><button type="button" className="inbox-composer__email-chip is-sender text-xs font-medium leading-xs-medium" aria-expanded={sendAsOpen} onClick={() => setSendAsOpen((open) => !open)}>frontdesk@stellastays.com <ChevronDownIcon /></button>{sendAsOpen && <div className="inbox-composer__email-sendas-menu bg-semantic-background-primary border-semantic-stroke-lighter"><button type="button" className="text-xs font-normal leading-xs-normal" onClick={() => setSendAsOpen(false)}>frontdesk@stellastays.com</button></div>}</div>
              <div className="inbox-composer__email-row text-xs font-normal leading-xs-normal"><span>To</span>{emailRecipient ? <span className="inbox-composer__email-chip text-xs font-medium leading-xs-medium">{emailRecipient}<button type="button" aria-label="Remove recipient" onClick={() => setEmailRecipient("")}><img src={composerIcons.clear} alt="" /></button></span> : <input aria-label="To" value={emailRecipient} onChange={(event) => setEmailRecipient(event.target.value)} placeholder="Add recipients" />}</div>
              {showCc && <label className="inbox-composer__email-row text-xs font-normal leading-xs-normal"><span>Cc</span><input value={cc} onChange={(event) => setCc(event.target.value)} placeholder="Add email addresses" /></label>}
              {showSubject && <label className="inbox-composer__email-row text-xs font-normal leading-xs-normal"><span>Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Add a subject" /></label>}
            </div>}

            {replyTo && <div className="inbox-composer__replying text-xs font-normal leading-xs-normal text-component-text-secondary">
              <span className="inbox-composer__reply-icon"><ReplyIcon /></span>
              <div className="inbox-composer__reply-content"><strong>{replyTo.author}</strong><span>{replyTo.body}</span></div>
              <button className="inbox-composer__reply-close" type="button" aria-label="Close replying to container" onClick={() => setReplyTo(null)}>×</button>
            </div>}

            {attachments.length > 0 && <div className="inbox-composer__attachments" aria-label="Attachments">
              {attachments.map((attachment) => <div className="inbox-composer__attachment text-xs font-normal leading-xs-normal" key={attachment.id}>
                <span className="inbox-composer__file-icon"><FileIcon /></span>
                <span className="inbox-composer__file-name">{attachment.file.name}</span>
                <span className={`inbox-composer__file-state is-${attachment.state}`} role="status">{attachment.state === "uploading" ? "Uploading" : attachment.state === "failed" ? "Failed" : "Ready"}</span>
                <button type="button" aria-label={`Remove ${attachment.file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}>×</button>
              </div>)}
            </div>}

            <div className="inbox-composer__input-wrap">
              <div
                ref={draftRef}
                className="inbox-composer__draft text-sm font-normal leading-sm-normal text-component-text-primary"
                contentEditable
                role="textbox"
                aria-label={mode === "note" ? "Write an internal note" : "Write a message"}
                aria-multiline="true"
                data-placeholder={mode === "note" ? "Write an internal note..." : isEmail ? "Write an email..." : "Write a message..."}
                onInput={(event) => { setDraft(event.currentTarget.innerText); setComposerError(""); }}
                onPaste={(event) => { event.preventDefault(); document.execCommand("insertText", false, event.clipboardData.getData("text/plain")); }}
              />
            </div>

            <div className="inbox-composer__tools-container">
              {popover === "format" && <div className="inbox-composer__popover inbox-composer__format-menu bg-semantic-background-primary border-semantic-stroke-lighter" role="toolbar" aria-label="Text formatting">
                <button type="button" aria-label="Bold" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("bold")}><strong>B</strong></button>
                <button type="button" aria-label="Italic" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("italic")}><em>I</em></button>
                <button type="button" aria-label="Underline" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("underline")}><u>U</u></button>
                <button type="button" aria-label="Bulleted list" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("insertUnorderedList")}><ListIcon /></button>
              </div>}
              {popover === "emoji" && <div className="inbox-composer__popover inbox-composer__emoji-menu bg-semantic-background-primary border-semantic-stroke-lighter" aria-label="Emoji picker">
                <input className="inbox-composer__emoji-search text-sm font-normal leading-sm-normal" value={emojiQuery} onChange={(event) => setEmojiQuery(event.target.value)} placeholder="Search emoji" aria-label="Search emoji" />
                <div className="inbox-composer__emoji-categories" role="tablist" aria-label="Emoji categories">
                  {(Object.keys(emojiCategories) as Array<keyof typeof emojiCategories>).map((category) => <button type="button" role="tab" aria-selected={emojiCategory === category} className={emojiCategory === category ? "is-active" : ""} key={category} onClick={() => setEmojiCategory(category)}>{category}</button>)}
                </div>
                <div className="inbox-composer__emoji-grid" role="listbox" aria-label={`${emojiCategory} emoji`}>
                  {emojiCategories[emojiCategory].filter(([, name]) => name.includes(emojiQuery.toLowerCase())).map(([emoji, name]) => <button type="button" role="option" aria-label={name} title={name} key={name} onClick={() => insertEmoji(emoji)}>{emoji}</button>)}
                </div>
              </div>}
              {popover === "template" && <div className="inbox-composer__popover inbox-composer__template-menu bg-semantic-background-primary border-semantic-stroke-lighter" role="menu">
                <strong className="text-xs font-semibold leading-xs-semibold">WhatsApp templates</strong>
                <button type="button" role="menuitem" onClick={() => insertTemplate("Thanks for reaching out!")}>Guest welcome</button>
                <button type="button" role="menuitem" onClick={() => insertTemplate("Your check-in details are ready.")}>Check-in details</button>
              </div>}
              <div className="inbox-composer__tools-row">
                <div className="inbox-composer__tool-buttons">
                  <button className="inbox-composer__tool-button" type="button" title="Text formatting" aria-label="Text formatting" aria-expanded={popover === "format"} onClick={() => setPopover((current) => current === "format" ? null : "format")}><img src={composerIcons.caseSensitive} alt="" /></button>
                  <button className="inbox-composer__tool-button" type="button" title="Emoji" aria-label="Emoji" aria-expanded={popover === "emoji"} onClick={() => setPopover((current) => current === "emoji" ? null : "emoji")}><img src={composerIcons.smile} alt="" /></button>
                  <button className="inbox-composer__tool-button" type="button" title="Attach file" aria-label="Attach file" disabled={attachments.length >= maxAttachments} onClick={() => attachmentInputRef.current?.click()}><img src={composerIcons.paperclip} alt="" /></button>
                  <input ref={attachmentInputRef} className="inbox-composer__file-input" type="file" multiple={maxAttachments > 1} onChange={(event) => addAttachments(event.currentTarget.files)} aria-label="Choose attachments" />
                  {channel === "whatsapp" && <button className="inbox-composer__tool-button" type="button" title="WhatsApp templates" aria-label="WhatsApp templates" aria-expanded={popover === "template"} onClick={() => setPopover((current) => current === "template" ? null : "template")}><img src={composerIcons.whatsapp} alt="" /></button>}
                </div>
                <div className="inbox-composer__send-group">
                  <button className="inbox-composer__send text-xs font-semibold leading-xs-semibold" type="submit" disabled={sendDisabled}>
                    <img src={sendDisabled ? composerIcons.sendWaiting : composerIcons.sendWaitingEmail} alt="" /><span>{mode === "note" ? "Add note" : "Send as Waiting"}</span>
                  </button>
                  {mode === "message" && <div className="inbox-composer__send-menu-wrap">
                    <button className="inbox-composer__send-menu" type="button" aria-label="Choose send status" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><img src={composerIcons.chevronUp} alt="" /></button>
                    {menuOpen && <div className="inbox-composer__send-menu-list bg-semantic-background-primary border-semantic-stroke-lighter" role="menu">{["Open", "Waiting", "Resolved"].map((status) => <button type="button" role="menuitem" key={status} onClick={() => send(status)}>Send as {status}</button>)}</div>}
                  </div>}
                </div>
              </div>
            </div>
            {composerError && <p className="inbox-composer__error text-xs font-normal leading-xs-normal" role="alert">{composerError}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}

function PersonIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.5-3.5 2.8-5.2 7-5.2s6.5 1.7 7 5.2"/></svg>; }
function initials(name: string) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function channelName(channel: InboxChannel) {
  return { whatsapp: "WhatsApp", airbnb: "Airbnb", booking: "Booking.com", email: "Email", travel: "OTA" }[channel];
}
function MoreIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>; }
function ReplyIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 17-5-5 5-5M4 12h9a6 6 0 0 1 6 6"/></svg>; }
function ChevronDownIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>; }
function FileIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 15h8M8 18h5"/></svg>; }
function ListIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>; }
