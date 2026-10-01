import { useState } from "react";
import InboxNavigation, { type InboxFolder } from "./components/InboxNavigation";
import InboxTicketList, { type InboxChannel } from "./components/InboxTicketList";
import InboxConversation from "./components/InboxConversation";

export default function App() {
  const [searchActive, setSearchActive] = useState(false);
  const [folder, setFolder] = useState<InboxFolder>({ primary: "Assigned to me", secondary: "Waiting" });
  const [activeTicket, setActiveTicket] = useState<{ channel: InboxChannel; name: string }>({ channel: "whatsapp", name: "John Doe" });

  return (
    <main className="inbox-test-page bg-base-black">
      <InboxNavigation
        searchActive={searchActive}
        onSearchToggle={setSearchActive}
        onFolderChange={setFolder}
      />
      <InboxTicketList folder={folder} searchActive={searchActive} onCloseSearch={() => setSearchActive(false)} onActiveTicketChange={setActiveTicket} />
      <InboxConversation channel={activeTicket.channel} contactName={activeTicket.name} />
    </main>
  );
}
