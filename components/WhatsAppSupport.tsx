export default function WhatsAppSupport() {
  return (
    <div style={{
      position: "fixed",
      left: 16,
      bottom: 16,
      width: 60,
      height: 60,
      borderRadius: 30,
      background: "#25D366",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
    }}>
      <a href="https://wa.me/233247918766" target="_blank" rel="noreferrer" style={{ color: "white", fontSize: 12, textDecoration: "none" }}>
        Help
      </a>
    </div>
  );
}
