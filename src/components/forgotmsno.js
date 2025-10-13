import React, { useState, useEffect, useRef } from "react";
import _debounce from "lodash/debounce";
import "./popup.css";
import bhima_Boy from "../images/bhima_boy5.png";

function Popup(props) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [msNumbers, setMsNumbers] = useState([]); // To store multiple MS numbers
  const [mobileError, setMobileError] = useState("");
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isResendOtpDisabled, setIsResendOtpDisabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Track whether OTP has been sent
  const [isVerifyOtpPopupOpen, setIsVerifyOtpPopupOpen] = useState(false);
  const [accountCheck, setAccountCheck] = useState("");

  const handleKeyPress = async (event) => {
    if (!otpVerified) {
      // Allow only digits in the mobile number field
      if (event.target.id === "mobileNumber") {
        const onlyDigits = /^\d+$/;
        if (!onlyDigits.test(event.key)) {
          event.preventDefault();
        }
      }

      // Handle 'Enter' key press
      if (
        event.key === "Enter" ||
        event.key === "Go" ||
        event.key === "Search"
      ) {
        event.preventDefault();

        if (mobileNumber.trim() !== "") {
          if (!otpVerified) {
            await sendOTP();
            document.getElementById("mobileNumber").blur(); // Blur the input field after sending OTP
          } else {
            await verifyOTP();
          }
        }
      }

      // Handle 'Enter' key press in OTP input
      if (
        event.target.id === "otp" &&
        (event.key === "Enter" || event.key === "Go" || event.key === "Search")
      ) {
        event.preventDefault();

        if (otp.trim() !== "") {
          await verifyOTP();
        }
      }
    }
  };

  // Function to reset state values
  const resetState = () => {
    setMobileNumber("");
    setOtp("");
    setMsNumbers([]); // Clear the MS numbers array
    setMobileError("");
    setIsVerificationPopupOpen(false);
    setOtpVerified(false);
    setOtpError("");
    setAccountCheck("");
  };

  useEffect(() => {
    if (!props.show) {
      resetState();
    }
  }, [props.show]);

  const handleMobileChange = (event) => {
    setMobileNumber(event.target.value);
    setMobileError("");
    setAccountCheck("");
  };

  const renewAccessToken = async () => {
    try {
      // Load the existing token from the token.json file
      const tokenData = require("../token.json");
      const existingToken = tokenData.token;

      const tokenURl = `http://suvarnagopura.com/MagentoAPI/api_db.js/users/renewAccessToken`;
      const response = await fetch(tokenURl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token: existingToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;

        setAccessToken(newToken);
        // console.log(accessToken);

        // Optionally, you can save the new token to localStorage or any other storage mechanism
        localStorage.setItem("accessToken", newToken);
      } else {
        //console.error('Failed to renew access token:', response.status);
      }
    } catch (error) {
      console.error("Error renewing access token:", error);
    }
  };

  useEffect(() => {
    // Fetch a new access token before making other API calls
    renewAccessToken();
  }, []);

  const sendOTP = async () => {
    console.log("Sending OTP...");
    if (mobileNumber.trim() === "") {
      setMobileError("Mobile number is required");
      setMobileNumber(""); // Clear the field value
      return;
    }
    if (mobileNumber.trim().length !== 10) {
      setMobileError("Please enter a valid MobileNo");
      setMobileNumber(""); // Clear the field value
      return;
    }

    setMobileError("");
    try {
      const apiUrl = `https://jppapi.bhimagold.com/api_db.js/api/Sendotpforquickpay/${mobileNumber}`;
      //const apiUrl = `https://bgapis.bhimagold.com/api_db.js/api/Sendotp/${mobileNumber}`
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Assuming your API response has a property named 'success' and 'message'
      const responseData = await response.json();
      const isSuccess = responseData.success;

      if (isSuccess) {
        setIsVerificationPopupOpen(true);
        setIsVerifyOtpPopupOpen(true);
        // Disable the Resend OTP button for 1 minute
        setIsResendOtpDisabled(false);
        setTimeout(() => {
          setIsResendOtpDisabled(true);
        }, 60000); // 60,000 milliseconds = 1 minute
      } else {
        // Handle the case when success is not true
        // Display the API response message to the customer
        setAccountCheck("No JPP account found for this Mobile No.");

        console.error("Failed to send OTP:", responseData.message);
        // You can also set a state variable to display the message to the user in the UI
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const debouncedSendOTP = _debounce(sendOTP, 1000);

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const verifyOTP = async () => {
    if (otp.trim() === "") {
      setOtpError("OTP is required");
      setOtp(""); // Clear the field value
      return;
    }
    setOtpError("");

    try {
      // Verify the OTP
      const verificationUrl = `https://jppapi.bhimagold.com/api_db.js/api/Validateotp/${mobileNumber}/${otp}`;
      const response = await fetch(verificationUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // console.log('OTP verification successful');
        setOtpVerified(true);
        setIsVerificationPopupOpen(false);

        // Proceed with fetching MS numbers
        // const msNumberUrl = `https://jppapi.bhimagold.com/api_db.js/api/forgetmsno/${mobileNumber}`;
        const msNumberUrl = `https://testapproval.bhima.info/api_db.js/api/forgetmsno/${mobileNumber}`;
        const msNumberResponse = await fetch(msNumberUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application.json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (msNumberResponse.ok) {
          const res = await msNumberResponse.json();
          // console.log('MS Numbers fetched successfully:', res);

          // Filter and set the MS numbers with PaymentPending as true
          const paymentPendingMsNumbers = res.filter(
            (ms) => ms.PaymentPending === true
          );
          //console.log('Response:', paymentPendingMsNumbers);
          setMsNumbers(paymentPendingMsNumbers);
        } else {
          // console.log('Failed to fetch MS Numbers');
        }
      } else {
        // console.log('Invalid OTP');
        setOtpError("Invalid OTP. Please try again.");
        setOtp(""); // Clear the field value
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <>
      <div className={`popup ${props.show ? "active" : ""}`}>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            border: "1px solid #d4af37",
            margin: "1rem",
            width: "100%",
            maxWidth: "400px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={bhima_Boy}
              alt="Bhima Boy Logo"
              style={{ maxWidth: "100px", maxHeight: "80px" }}
            />
          </div>
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "end",
              color: "#614119",
              fontSize: "30px",
              position: "absolute",
              right: "5px",
              top: "-10px",
              cursor: "pointer",
            }}
            onClick={props.onClose}
          >
            &times;
          </span>
          <div style={{ width: "100%" }}>
            <input
              style={{
                color: "#614119",
                width: "100%",
                padding: "0.5rem 1rem",
                borderRadius: "0.7rem",
                border: "1px solid #d4af37",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
                background: "transparent",
              }}
              type="text"
              id="mobileNumber"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={handleMobileChange}
              onFocus={() => {
                setMobileNumber("");
                setMobileError("");
                setAccountCheck("");
              }}
              disabled={otpVerified}
              onKeyPress={handleKeyPress}
            />
          </div>
          {mobileError && <small style={{ color: "red" }}>{mobileError}</small>}
          <div style={{ margin: "10px" }}>
            {accountCheck && (
              <div className="error-card ">
                <div
                  className="card-body "
                  style={{ fontFamily: "calibri", fontSize: "15px", color: "#614119" }}
                >
                  {accountCheck}
                  <br />
                  <br />{" "}
                  <a
                    href="https://www.bhimagold.com/bhima-my-choice"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to Subscriber for JPP
                  </a>
                </div>
              </div>
            )}
          </div>

          <div
            style={{ width: "100%", textAlign: "center", marginTop: "1rem" }}
          >
            <button
              style={{
                background:
                  "linear-gradient(103.45deg, rgb(97,65,25) -11.68%, rgb(205,154,80) 48.54%, rgb(97,65,25) 108.76%)",
                color: "whitesmoke",
                padding: "0.5rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                transition: "all 0.2s",
                width: "100%",
              }}
              hidden={otpVerified || accountCheck}
              onClick={debouncedSendOTP}
            >
              Send OTP
            </button>
          </div>

          <div>
            {otpVerified && msNumbers.length > 0
              ? msNumbers.map((ms, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    padding: "1rem",
                    borderRadius: "1rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    border: "1px solid #d4af37",
                    marginTop: "1rem",
                    width: "100%",
                    maxWidth: "500px",
                  }} >
                  <p>MS Number: {ms.MembershipNo}</p>
                  <p>Name: {ms.Name}</p>
                  <p>Start Date: {ms.StartDate}</p>
                </div>
              ))
              : null}
          </div>
        </div>
      </div>

      {isVerificationPopupOpen && !otpVerified && (
        <div className={`popup ${isVerificationPopupOpen ? "active" : ""}`}>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            border: "1px solid #d4af37",
            margin: "1rem",
            width: "100%",
            maxWidth: "400px",
            position: "relative",
          }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={bhima_Boy}
                alt="Bhima Boy Logo"
                style={{ maxWidth: "100px", maxHeight: "80px" }}
              />
            </div>
            <span className="popup-close" onClick={props.onClose}>
              &times;
            </span>
            <div >
              <input
                style={{
                  color: "#614119",
                  width: "100%",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #d4af37",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  background: "transparent",
                }}
                type="text"
                id="otp"
                placeholder="OTP"
                value={otp}
                onChange={handleOtpChange}
                onFocus={() => {
                  setOtp("");
                  setOtpError("");
                }}
                onKeyPress={handleKeyPress}
              />
              {otpError && (
                <div
                  className="text-danger inside-input"
                  style={{ top: "-10px" }}
                >
                  {otpError}
                </div>
              )}
            </div>

            <div className="popup-row" style={{ display: "flex", gap: "10px" }}>
              <button style={{
                background:
                  "linear-gradient(103.45deg, rgb(97,65,25) -11.68%, rgb(205,154,80) 48.54%, rgb(97,65,25) 108.76%)",
                color: "whitesmoke",
                padding: "0.3rem ",
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                transition: "all 0.2s",
                width: "100%",
              }} onClick={verifyOTP}>
                Verify OTP
              </button>
              {isResendOtpDisabled && (
                <button
                  onClick={sendOTP}
                  style={{
                    background:
                      "linear-gradient(103.45deg, rgb(97,65,25) -11.68%, rgb(205,154,80) 48.54%, rgb(97,65,25) 108.76%)",
                    color: "whitesmoke",
                    padding: "0.3rem ",
                    borderRadius: "0.75rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                    transition: "all 0.2s",
                    width: "100%",
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Popup;
