import React, { useState, useEffect } from 'react';
import Popup from './forgotmsno';
import './text.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import logoImage from '../images/bhimaboylogofinal.jpg';
import useRazorpay from "react-razorpay";
import PaymentSuccessPopup from '../components/paymentpopup'
import { toast } from 'react-toastify';
import { load } from '@cashfreepayments/cashfree-js';
import bhima_Boy from '../images/bhima_logo3.webp'
import { useForm } from 'react-hook-form';


const cashfree = await load({
  mode: "sandbox" //or production
});

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [dataVerified, setDataVerified] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState('')
  const [clearFields, setClearFields] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  const [showPaymentSuccessPopup, setShowPaymentSuccessPopup] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [refreshPage, setRefreshPage] = useState(false);
  const [cashfreeOptions, setCashfreeOptions] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenUrl, setTokenUrl] = useState("");
  const [hoverEmail, setHoverEmail] = useState(false);


  const resetMobileAndMembershipNumbers = () => {
    setMobileNumber('');
    setMembershipNumber('');
  };
  const [Razorpay] = useRazorpay();

  useEffect(() => {
    if (refreshPage) {
      window.location.reload();
    }
  }, [refreshPage]);


  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleInputFocus = () => {
    setValidationError('');
    toast.dismiss();  // Clear previous validation errors when input is focused
  };

  const renewAccessToken = async () => {
    try {
      // Load the existing token from the token.json file
      const tokenData = require('../token.json');
      const existingToken = tokenData.token;
      //const tokenURl = `http://suvarnagopura.com/MagentoAPI/api_db.js/users/renewAccessToken`;
      const tokenURl = `https://suvarnagopura.com/MagentoAPI/api_db.js/users/renewAccessToken`;
      const response = await fetch(tokenURl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include any additional headers if needed
        },
        // Pass the existing token in the request body
        body: JSON.stringify({
          token: existingToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;

        setAccessToken(newToken);
        console.log(accessToken)

        // Optionally, you can save the new token to localStorage or any other storage mechanism
        localStorage.setItem('accessToken', newToken);
      } else {
        console.error('Failed to renew access token:', response.status);
      }
    } catch (error) {
      console.error('Error renewing access token:', error);
    }
  };


  useEffect(() => {
    // Fetch a new access token before making other API calls
    renewAccessToken();
  }, []);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      //https://testapproval.bhima.info/api_db.js/api/ThirdPartyPayment/9380577096/018GDK356
      const apiUrl = `https://suvarnagopura.com/MagentoAPI/api_db.js/api/ThirdPartyPayment/${data?.mobileNumber}/${data?.membershipNumber}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,

        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Check if there are pending payments
          const hasPendingPayments = data.some(customer => customer.PaymentPending);
          if (!hasPendingPayments) {
            toast.info('No Installments Pending');
          } else {
            // Check if the MembershipNo matches the Mobile No
            setCustomerInfo(data);
            setDataVerified(true);// Set dataVerified to true when data is displayed
          }
        } else {
          toast.error('Account Not Found!', { autoClose: 3000 });
          setClearFields(true);
        }
      } else {
        toast.error('Invalid Membership Number or Mobile Number', { autoClose: 3000 });
      }
    } catch (error) {
      console.error('Error validating mobile and MS:', error);
    } finally {
      setIsLoading(false);
    }
  };



  if (clearFields) {
    setMembershipNumber('');
    setMobileNumber('');
    setClearFields(false); // Reset clearFields to false after clearing fields

  }

  // response get from razorpay and validate api 
  const handleRazorpayResponse = async (response, ReferenceNumber) => {
    try {
      console.log('handler called with response:', response);
      console.log('ReferenceNumber:', ReferenceNumber);

      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;

      const responseData = {
        PortalUserID: 'thridparty',
        MobileNo: mobileNumber,
        ReferenceNumber: ReferenceNumber,
        Provider: 'razorpay',
        ProviderTxnID: response.razorpay_payment_id,
        ProviderDate: formattedDate,
        TxnStatus: "Success",
        Type: 'EMIPayment',

      };

      console.log('response:', responseData)

      const apiUrl = 'https://suvarnagopura.com/MagentoAPI/api_db.js/api/ThridPartyPaymentConfirmation';

      // Send the response data to your API
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(responseData),
      });

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('API response:', apiData);

        // Display a message to the customer based on the API response
        if (apiData && apiData.message) {
          setPaymentSuccessMessage(apiData.message);
          setShowPaymentSuccessPopup(true);
          setClearData(true);
        }
      } else {
        console.error('Error sending response to API:', apiResponse.status);
      }
    } catch (error) {
      console.error('Error handling Razorpay response:', error);
    }
  };

  const clearAndClosePopup = () => {
    setShowPaymentSuccessPopup(false);
    setPaymentSuccessMessage('');
    if (clearData) {
      setMembershipNumber('');
      setMobileNumber('');
      setCustomerInfo(null);
      setClearData(false);
      setRefreshPage(true)
    }
  };
  // open payment gateway
  const openPaymentGateway = async () => {
    try {
      console.log('openPaymentGateway called');

      const requestData = {
        PortalUserID: 'thridparty',
        AmountPaid: customerInfo[0].EMIAmount,
        MobileNo: mobileNumber,
        Details: [
          {
            Name: customerInfo[0].Name,
            MembershipNo: membershipNumber,
            BranchCode: customerInfo[0].BranchCode,
            SchemeCode: customerInfo[0].SchemeCode,
            GroupCode: customerInfo[0].GroupCode,
            ChitMembershipNo: customerInfo[0].ChitMembershipNo,
            NoOfInst: 1,
            InstallmentAmt: customerInfo[0].EMIAmount,
            Rate: 0,
            GoldWt: 0,
            noOfInst: 1,
            GoldRate: 0
          },
        ],
      };

      const apiUrl = 'https://suvarnagopura.com/MagentoAPI/api_db.js/api/ThridPartyEMIPayment';
      const paymentInfoResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (paymentInfoResponse.ok) {
        const res = await paymentInfoResponse.json();

        /// Set the Phone tokenUrl 
        setTokenUrl(res?.payment_session_id);

        // Use setPaymentInfo with a callback to ensure the state is updated
        setPaymentInfo(prevPaymentInfo => {
          console.log('Payment API response:', res);
          // Return the new state based on the previous state
          return { ...prevPaymentInfo, ...res };
        });
      } else {
        console.error('Error fetching payment information:', paymentInfoResponse.status);
      }
    } catch (error) {
      console.error('Error opening payment gateway:', error);
    }
  };

  // Use useEffect to open the payment gateway after paymentInfo is updated
  useEffect(() => {
    if (paymentInfo.success === true) {
      console.log('razorpay:', paymentInfo);

      if (paymentInfo.pgtype === 'Cashfree') {
        openCashfreePayment();
      } else if (paymentInfo.pgtype === 'razorpay') {
        openRazorpayPayment();
      }
      else if (paymentInfo.pgtype === 'PhonePay') {
        window.PhonePeCheckout.transact({ tokenUrl });
      } else {
        console.error('Invalid pgtype:', paymentInfo.pgtype);
      }
    }
    else if (paymentInfo.success === false) {

      toast.error(paymentInfo.message, { autoClose: 3000 });

    } else {
      console.error('API response status is false.');
    }
  }, [paymentInfo]);


  // Function to open Razorpay payment gateway
  const openRazorpayPayment = async () => {
    try {
      console.log('openRazorpayPayment called');
      const options = {
        key: paymentInfo.pgkey,
        amount: paymentInfo.TxnAmt * 100,
        currency: 'INR',
        name: paymentInfo.rname,
        order_id: paymentInfo.PgOrderid,
        "prefill": {
          "name": customerInfo[0].Name, //your customer's name
          "email": customerInfo[0].EmailID,
          "contact": mobileNumber
        },
        handler: function (response) {
          console.log('Payment successful:', response);
          handleRazorpayResponse(response, paymentInfo.ReferenceNumber); // Pass the ReferenceNumber
        },

        // Handle payment failure
        modal: {
          ondismiss: function () {
            setPaymentSuccessMessage('Payment failed!'); // Set the failure message
          },
        },
      };
      console.log("sending to Razorpay:", options)
      const rzp1 = new Razorpay(options);
      rzp1.open();
      setPaymentGatewayOpen(true);
    } catch (error) {
      console.error('Error fetching payment information:', error);
    }
  };


  const openCashfreePayment = async () => {
    try {
      console.log('openCashfreePayment called');

      setCashfreeOptions({
        paymentSessionId: paymentInfo.payment_session_id,
        returnUrl: "",
      });
      setPaymentGatewayOpen(true);
      console.log('Payment API response:', cashfreeOptions);
    }
    catch (error) {
      console.error('Error opening Cashfree payment:', error);
    }
  };

  useEffect(() => {
    // This will be triggered after cashfreeOptions is updated
    console.log('Cashfree options:', cashfreeOptions);

    // Perform other operations that depend on the updated state here

    if (cashfreeOptions) {
      try {
        const result = cashfree.checkout(cashfreeOptions);
        console.log('Cashfree checkout result:', result);

        if (result.error) {
          console.error('Error during Cashfree checkout:', result.error.message);
        }
        if (result.redirect) {
          console.log("Opening status page in a popup...");

        } else {
          console.log('Payment not successful:', result);
          // Handle unsuccessful payment
        }
      } catch (error) {
        console.error('Error during Cashfree checkout:', error);
      }
    } else {
      console.error('Cashfree options are not set.');
    }
  }, [cashfreeOptions]);


  return (


    <div className="App">
      <div className="header-container">
        <a href="https://bhimagold.com" className="logo-link">
          <img src={logoImage} alt="Bhimagold Logo" className="logo-img" />
        </a>
      </div>
      <h1
        style={{
          fontSize: "1.875rem", // 3xl
          fontFamily: "serif",
          textAlign: "center",
          color: "#b8860b",
          paddingTop: "1rem",
        }}
      >
        Quick Pay
      </h1>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingInline: 10,
        }}
      >
        {/* Top Column */}

        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            border: "1px solid #d4af37",
            margin: "1rem",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Card border/logo placeholder */}
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
                style={{ maxWidth: "100px" }}
              />
            </div>

            {/* Input Fields */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <input
                  id="mobileNumber"
                  type="text"
                  disabled={dataVerified}
                  onFocus={handleInputFocus}
                  placeholder="Enter Your Mobile No"
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
                    opacity: dataVerified ? 0.7 : 1,
                  }}
                  {...register('mobileNumber', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Mobile number must be exactly 10 digits',
                    },
                  })}
                />
                {errors.mobileNumber && (
                  <small style={{ color: 'red' }}>{errors.mobileNumber.message}</small>
                )}
              </div>

              <div>
                <input
                  id="membershipNumber"
                  type="text"
                  disabled={dataVerified}
                  onFocus={handleInputFocus}
                  placeholder="Enter Your Membership No"
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
                    opacity: dataVerified ? 0.7 : 1,
                  }}
                  {...register('membershipNumber', {
                    required: 'Membership number is required',
                  })}
                />
                {errors.membershipNumber && (
                  <small style={{ color: 'red' }}>{errors.membershipNumber.message}</small>
                )}
              </div>
            </div>

            {/* Forgot Membership Link */}

            <div
              style={{ width: "100%", textAlign: "right", marginTop: "0.5rem" }}
            >
              <a
                href="#"
                onClick={() => {
                  togglePopup();
                  resetMobileAndMembershipNumbers();
                }}
                style={{
                  fontSize: "0.875rem",
                  color: "#b8860b",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#a07808")}
                onMouseLeave={(e) => (e.target.style.color = "#b8860b")}
              >
                Forgot Membership No?
              </a>
            </div>

            {/* Verify Button */}
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
                  cursor: dataVerified ? "not-allowed" : "pointer",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  transition: "all 0.2s",
                  width: "100%",
                  opacity: dataVerified ? 0.7 : 1,
                }}
                disabled={dataVerified}
                type='submit'
              // onClick={validateMobileAndMS}
              >
                {isLoading ? "Loading..." : "Verify"}
              </button>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {validationError}
              </div>
            )}
          </form>
        </div>



        {/* Middle Column (Terms) */}
        <div>
          {!dataVerified && (
            <div
              style={{
                marginTop: "2rem",
                color: "#4a4a4a",
                fontSize: "0.875rem",
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: "32rem",
              }}
            >
              <p>1. Pay your installment in one single click.</p>
              <p>
                2. For queries, email{" "}
                <span
                  style={{
                    color: hoverEmail ? "#a07808" : "#b8860b",
                    fontWeight: 500,
                    textDecoration: hoverEmail ? "underline" : "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoverEmail(true)}
                  onMouseLeave={() => setHoverEmail(false)}
                  onClick={() =>
                    (window.location.href = "mailto:support@bhimagold.com")
                  }
                >
                  support@bhimagold.com
                </span>{" "}
                or call 1800-121-9076.
              </p>
              <p> Timmings (10 AM – 7 PM IST).</p>
              <p>3. Terms & conditions may change without notice.</p>
              <p>4. All disputes are subject to Bangalore jurisdiction only.</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: "1rem", width: "100%", paddingInline: 10 }}>
        {customerInfo && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {customerInfo.map((customer, index) => (
              <div
                key={index}
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "#614119",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  border: "1px solid #d4af37",
                }}
              >
                {/* Subscriber Info */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    alignItems: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>
                    Subscriber Name:{" "}
                    <span style={{ fontWeight: "normal" }}>
                      {customer.Name}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    alignItems: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>
                    Scheme Name:{" "}
                    <span style={{ fontWeight: "normal" }}>
                      {customer.SchemeName}
                    </span>
                  </p>
                </div>

                {/* Membership Info */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    alignItems: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>
                    Membership No:{" "}
                    <span style={{ fontWeight: "normal" }}>
                      {customer.MembershipNo}
                    </span>
                  </p>
                </div>
                {
                  customer?.SchemeName == 'KUBERA' && 
                        <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    alignItems: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>
                    Gold Rate:{" "}
                    <span style={{ fontWeight: "normal" }}>
                      {customer?.GoldRate} Rs/Grams
                    </span>
                  </p>
                </div>
                }

                {/* Payment Info */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>
                    Installment Amount (Rs):{" "}
                    <span style={{ fontWeight: "normal" }}>
                      {Number(customer.EMIAmount).toLocaleString()}/-
                    </span>
                  </p>

                  {customer.PaymentPending ? (
                    <button
                      onClick={openPaymentGateway}
                      disabled={paymentGatewayOpen}
                      style={{
                        width: "100%",
                        background:
                          "linear-gradient(103.45deg, rgb(97,65,25) -11.68%, rgb(205,154,80) 48.54%, rgb(97,65,25) 108.76%)",
                        //backgroundColor: paymentGatewayOpen ? "#a9a9a9" : "#2e7d32",
                        color: "white",
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        border: "none",
                        borderRadius: "0.75rem",
                        cursor: paymentGatewayOpen ? "not-allowed" : "pointer",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        !paymentGatewayOpen &&
                        (e.target.style.backgroundColor = "#256628")
                      }
                      onMouseLeave={(e) =>
                        !paymentGatewayOpen &&
                        (e.target.style.backgroundColor = "#2e7d32")
                      }
                    >
                      Pay &nbsp;{Number(customer.EMIAmount).toLocaleString()}/-
                    </button>
                  ) : (
                    <div
                      style={{
                        color: "#ffcccb",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      No Pending Installment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <PaymentSuccessPopup
        show={showPaymentSuccessPopup}
        onClose={clearAndClosePopup}
        message={paymentSuccessMessage}
      />

      <Popup show={showPopup} onClose={togglePopup} />
    </div>
  );
}

export default App;

