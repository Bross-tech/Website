import React from "react";
import "./AgentInvoice.css";

type Agent = {
  business_name?: string;
  email?: string;
};

type BulkOrder = {
  details?: string;
  total?: number;
};

type AgentInvoiceProps = {
  agent?: Agent;
  bulkOrder?: BulkOrder;
};

export const AgentInvoice: React.FC<AgentInvoiceProps> = ({
  agent = {},
  bulkOrder = {},
}) => {
  const businessName = agent.business_name || agent.email || "N/A";
  const orderDetails = bulkOrder.details || "N/A";
  const total =
    typeof bulkOrder.total === "number"
      ? bulkOrder.total.toFixed(2)
      : "0.00";

  // Placeholder for advanced PDF download (e.g., html2pdf.js)
  // const downloadPDF = () => {
  //   // Implement html2pdf or jsPDF logic here
  // };

  return (
    <div className="invoice-container">
      <div className="invoice-box">
        <h3 className="invoice-title">Invoice</h3>
        <div className="invoice-row">
          <span className="invoice-label">Agent:</span>
          <span>{businessName}</span>
        </div>
        <div className="invoice-row">
          <span className="invoice-label">Order:</span>
          <span>{orderDetails}</span>
        </div>
        <div className="invoice-row total-row">
          <span className="invoice-label">Total:</span>
          <span className="invoice-total">GHS {total}</span>
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          Print/Download
        </button>
        {/* <button onClick={downloadPDF}>Download as PDF</button> */}
      </div>
    </div>
  );
};
