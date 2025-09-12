import React, { useEffect, useRef } from "react";
import "./WhatsAppChatWidget.css"; // We'll put the CSS for typing bubble & animations here

export const WhatsAppWidget = () => {
  const popupRef = useRef<HTMLDivElement>(null);
  const typingBubbleRef = useRef<HTMLDivElement>(null);
  const notifBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isOpen = false;
    const popup = popupRef.current!;
    const typingBubble = typingBubbleRef.current!;
    const notifBadge = notifBadgeRef.current!;

    // Typing bubble animation will run via CSS
    typingBubble.style.display = "flex";

    // Auto-hide notification badge after 10 seconds
    const notifTimeout = setTimeout(() => {
      notifBadge.style.display = "none";
    }, 10000);

    // Toggle popup
    window.togglePopup = () => {
      if (!isOpen) {
        popup.style.bottom = "80px";
        isOpen = true;
        notifBadge.style.display = "none";
        typingBubble.style.display = "none";
      } else {
        popup.style.bottom = "-400px";
        isOpen = false;
        document.getElementById("supportForm")!.style.display = "none";
        typingBubble.style.display = "flex";
      }
    };

    window.openWhatsApp = (link: string) => {
      window.open(link, "_blank");
      window.togglePopup();
    };

    window.showSupportForm = () => {
      document.getElementById("supportForm")!.style.display = "block";
    };

    window.hideSupportForm = () => {
      document.getElementById("supportForm")!.style.display = "none";
    };

    window.sendSupportWhatsApp = () => {
      const recipientNumber = (document.getElementById("recipientNumber") as HTMLInputElement).value.trim();
      const network = (document.getElementById("network") as HTMLInputElement).value.trim();
      const bundle = (document.getElementById("bundle") as HTMLInputElement).value.trim();
      const orderDate = (document.getElementById("orderDate") as HTMLInputElement).value.trim();

      if (!recipientNumber || !network || !bundle || !orderDate) {
        alert("Please fill in all fields.");
        return;
      }

      const message = `Hello! I need support regarding:
Recipient Number: ${recipientNumber}
#Network: ${network}
#Bundle Size: ${bundle}
#Order Date: ${orderDate}`;

      const link = `https://wa.me/${recipientNumber}?text=${encodeURIComponent(message)}`;
      window.open(link, "_blank");
      window.togglePopup();
    };

    return () => {
      clearTimeout(notifTimeout);
    };
  }, []);

  return (
    <>
      {/* Typing Bubble */}
      <div className="typing-bubble" ref={typingBubbleRef}>
        <span></span><span></span><span></span>
      </div>

      {/* Chat Widget Button */}
      <button className="chat-widget-btn" onClick={() => window.togglePopup()}>
        <i className="fab fa-whatsapp"></i>
        <div className="notification-badge" ref={notifBadgeRef}>1</div>
      </button>

      {/* Popup */}
      <div className="chat-popup" ref={popupRef} style={{ bottom: "-400px" }}>
        <div className="chat-popup-header">
          Contact Us
          <i className="fas fa-times" onClick={() => window.togglePopup()}></i>
        </div>
        <div className="chat-popup-content">
          <button onClick={() =>
            window.openWhatsApp(
              "https://wa.me/233247918766?text=" +
              encodeURIComponent("Hello! I want to chat with Admin.")
            )
          }>
            <i className="fas fa-user-tie"></i> Admin
          </button>
          <button onClick={() => window.showSupportForm()}>
            <i className="fas fa-headset"></i> Support (Data/Order)
          </button>
          <div className="support-form" id="supportForm" style={{ display: "none" }}>
            <div className="input-group">
              <i className="fas fa-phone"></i>
              <input type="text" id="recipientNumber" placeholder="#Recipient Number" />
            </div>
            <div className="input-group">
              <i className="fas fa-signal"></i>
              <input type="text" id="network" placeholder="#Network" />
            </div>
            <div className="input-group">
              <i className="fas fa-box"></i>
              <input type="text" id="bundle" placeholder="#Bundle Size" />
            </div>
            <div className="input-group">
              <i className="fas fa-calendar-alt"></i>
              <input type="text" id="orderDate" placeholder="#Order Date" />
            </div>
            <button type="button" onClick={() => window.sendSupportWhatsApp()}>
              Send on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

declare global {
  interface Window {
    togglePopup: () => void;
    openWhatsApp: (link: string) => void;
    showSupportForm: () => void;
    hideSupportForm: () => void;
    sendSupportWhatsApp: () => void;
  }
}
