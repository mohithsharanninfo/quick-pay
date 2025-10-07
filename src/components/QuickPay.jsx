import React, { useState } from "react";

const QuickPay = () => {
  const [hoverButton, setHoverButton] = useState(false);
  const [hoverLink, setHoverLink] = useState(false);
  const [hoverEmail, setHoverEmail] = useState(false);

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      background: "linear-gradient(to bottom, #fff8e1, #ffffff)",
      fontFamily: "sans-serif",
    },
    card: {
      maxWidth: "28rem",
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(8px)",
      borderRadius: "1.5rem",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      padding: "2rem",
      border: "1px solid #d4af37",
    },
    title: {
      fontSize: "1.875rem", // 3xl
      fontFamily: "serif",
      textAlign: "center",
      color: "#b8860b",
      marginBottom: "1.5rem",
    },
    formGroup: {
      marginBottom: "1.25rem",
      display: "flex",
      flexDirection: "column",
    },
    label: {
      color: "#4a4a4a",
      fontWeight: 500,
      marginBottom: "0.25rem",
    },
    input: {
      width: "100%",
      borderRadius: "1rem",
      border: "1px solid #d1d5db",
      padding: "0.5rem 1rem",
      outline: "none",
      transition: "all 0.2s",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#d4af37",
      boxShadow: "0 0 0 2px rgba(212,175,55,0.5)",
    },
    bottomRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    forgotLink: {
      fontSize: "0.875rem",
      color: hoverLink ? "#a07808" : "#b8860b",
      textDecoration: hoverLink ? "underline" : "none",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    button: {
      backgroundColor: hoverButton ? "#a07808" : "#b8860b",
      color: "#fff",
      fontWeight: 600,
      padding: "0.5rem 1.5rem",
      borderRadius: "1rem",
      border: "none",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      cursor: "pointer",
      transition: "all 0.2s",
      transform: hoverButton ? "scale(1.05)" : "scale(1)",
    },
    footer: {
      marginTop: "2rem",
      color: "#4a4a4a",
      fontSize: "0.875rem",
      textAlign: "center",
      lineHeight: 1.6,
      maxWidth: "32rem",
    },
    emailLink: {
      color: hoverEmail ? "#a07808" : "#b8860b",
      fontWeight: 500,
      textDecoration: hoverEmail ? "underline" : "none",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      {/* Card */}
      <div style={styles.card}>
        <h1 style={styles.title}>Quick Pay</h1>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Mobile Number */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input
              type="text"
              placeholder="Enter your mobile number"
              style={styles.input}
              onFocus={(e) => (e.target.style = { ...styles.input, ...styles.inputFocus })}
              onBlur={(e) => (e.target.style = { ...styles.input })}
            />
          </div>

          {/* Membership Number */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Membership Number</label>
            <input
              type="text"
              placeholder="Enter your membership number"
              style={styles.input}
              onFocus={(e) => (e.target.style = { ...styles.input, ...styles.inputFocus })}
              onBlur={(e) => (e.target.style = { ...styles.input })}
            />
          </div>

          {/* Bottom row */}
          <div style={styles.bottomRow}>
            <span
              style={styles.forgotLink}
              onMouseEnter={() => setHoverLink(true)}
              onMouseLeave={() => setHoverLink(false)}
            >
              Forgot Membership No?
            </span>
            <button
              type="submit"
              style={styles.button}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
            >
              Verify
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>1. Pay your installment in one single click.</p>
        <p>
          2. For queries, email{" "}
          <span
            style={styles.emailLink}
            onMouseEnter={() => setHoverEmail(true)}
            onMouseLeave={() => setHoverEmail(false)}
            onClick={() => window.location.href = "mailto:support@bhimagold.com"}
          >
            support@bhimagold.com
          </span>{" "}
          or call 1800-121-9076 (10 AM – 7 PM IST).
        </p>
        <p>3. Terms & conditions may change without notice.</p>
        <p>4. All disputes are subject to Bangalore jurisdiction only.</p>
      </div>
    </div>
  );
};

export default QuickPay;
