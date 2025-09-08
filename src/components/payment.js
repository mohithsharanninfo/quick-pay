import React, { useState, useEffect } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import Popup from './forgotmsno';
import Status from './status';
import './text.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import logoImage from '../images/bhimaboylogofinal.jpg';
import useRazorpay from "react-razorpay";
import PaymentSuccessPopup from '../components/paymentpopup'
import Background from '../images/Website-01.jpg'
import logo from '../images/revised.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { load } from '@cashfreepayments/cashfree-js';


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
  const [apiResponse, setApiResponse] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [tokenUrl, setTokenUrl] = useState("");
  const navigate = useNavigate();


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
  // useEffect(() => {
  //   console.log('Access token used for other API calls:', accessToken);
  //   // You can add additional logic here to check if accessToken is not empty and use it for other APIs
  // }, [accessToken]);

  // mobileno & msno validate api
  const validateMobileAndMS = async () => {
    if (!membershipNumber && !mobileNumber) {
      toast.error('Both Membership Number and Mobile Number are required', { autoClose: 3000 });
    } else if (!membershipNumber) {
      toast.error('Membership Number is required', { autoClose: 3000 });
    } else if (!mobileNumber) {
      toast.error('Mobile Number is required', { autoClose: 3000 });
    } else {
      setValidationError('');

      try {
        setIsLoading(true);
        //https://testapproval.bhima.info/api_db.js/api/ThirdPartyPayment/9380577096/018GDK356
        const apiUrl = `https://suvarnagopura.com/MagentoAPI/api_db.js/api/ThirdPartyPayment/${mobileNumber}/${membershipNumber}`;
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
              toast.info('No Installment Payment is Pending for this MembershipNo', {
                autoClose: 3000,
                hideProgressBar: false,
                closeButton: false,
                position: toast.POSITION.TOP_CENTER,
                bodyClassName: 'custom-toast',
                style: {
                  background: 'lavender',
                  color: 'black',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                },
              });
            } else {
              // Check if the MembershipNo matches the Mobile No
              setCustomerInfo(data);
              setDataVerified(true);// Set dataVerified to true when data is displayed
            }
          } else {
            toast.error('The MembershipNo does not match with the Mobile No', { autoClose: 3000 });
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
            Name:customerInfo[0].Name,
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
            GoldRate:0
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
    // <div className="background" style={sectionStyle}>

    <div className="App">
      <div className="header">
        <div className='logo logoimg'>
          <a href='https://bhimagold.com'>
            <img src={logoImage} alt='Logo alt' className='logo img-fluid' />
          </a>
        </div>
      </div>
      <h4 >Quick Pay</h4>
      <br />
      <div className="container">

        <div className='row'>
          <div className='col-md-6'>
            <div className="profile-card">
              <div className="card-border">
                {/* <img src={logo} alt="Bhima Boy Logo" className="small-logo img-fluid" /> */}
              </div>

              <div className="display">
                <input
                  type="text"
                  placeholder="Enter Your Mobile No"
                  onKeyPress={(e) => {
                    const onlyDigits = /^\d+$/;
                    if (!onlyDigits.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={dataVerified}
                  onFocus={handleInputFocus}

                />
                <input
                  type="text"
                  placeholder="Enter Your Membership No"
                  onKeyPress={(e) => {
                    const onlyDigitsAndLetters = /^[0-9a-zA-Z]+$/;
                    const inputValue = e.target.value + e.key;

                    if (!onlyDigitsAndLetters.test(inputValue) || inputValue.length > 15) {
                      e.preventDefault();
                    }
                  }}
                  value={membershipNumber}
                  onChange={(e) => {
                    const newValue = e.target.value.substring(0, 15); // Limit to 15 characters
                    setMembershipNumber(newValue);
                  }}
                  disabled={dataVerified}
                  onFocus={handleInputFocus} // Clear error message on input focus
                />

                <div className="col-sm-8 text-right">
                  {!dataVerified && ( // Conditionally render the "Forgot MS Number?" link if data is not verified
                    <a href="#" onClick={() => { togglePopup(); resetMobileAndMembershipNumbers(); }}>
                      Forgot Membership No?
                    </a>
                  )}
                </div>
              </div>
              <div className="col-sm-11 text-center">
                <button className="btn" style={{ backgroundColor: "brown", color: "whitesmoke" }} disabled={dataVerified} onClick={validateMobileAndMS} role="button">{isLoading ? "Loading..." : "Verify"}</button>
              </div>
              {validationError && (
                <div className="text-danger" >
                  {validationError}
                </div>
              )}
            </div>
          </div>
          <div className='col-md-6 terms' style={{ marginTop: "2%" }}>
            {dataVerified ? null : (
              <>
                <ol>
                  <li>Pay Your Installment in one single click</li>
                  <li>For any queries, please write to support@bhimagold.com or call us on 1800-121-9076 (All days 10 am to 7 pm IST).</li>
                  <li> The terms & conditions are subject to change any time, without any prior notice.</li>
                  <li> All disputes are subject to Bangalore jurisdiction only.</li>
                </ol>
              </>
            )}
          </div>
        </div>
      </div>

      {customerInfo && (
        <div className="container">
          {customerInfo.map((customer, index) => (
            <div className='card' key={index}>
              <div className="row">
                <div className="col-md-3">
                  <p>Subsriber Name: <span>{customer.Name}</span></p>
                  {/* <p>Maturity date: <span>{customer.MaturityDate}</span></p> */}
                  <p style={{ fontSize: "15px" }}>Scheme Name: <span>{customer.SchemeName}</span></p>
                </div>
                <div className="col-md-4 ">
                  <p>Membership no: <span>{customer.MembershipNo}</span></p>


                </div>
                <div className="col-md-5">
                  <p>Installment amount in Rs: <span>{Number(customer.EMIAmount).toLocaleString()}/-</span></p>

                  {customer.PaymentPending ? (
                    <button className="btn btn-success" style={{ width: '20%', marginTop: "2px" }} disabled={paymentGatewayOpen} onClick={openPaymentGateway}>Pay</button>
                  ) : (
                    <div className="text-danger" style={{ top: "10px", fontSize: "20px" }}>
                      No Installment Pending
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {apiResponse && (
        <div className="card" style={{ width: "30rem", backgroundColor: "lavender", padding: "40px", right: "2%" }}>
          <div className="card-body" style={{ alignItems: "center", fontSize: "25px" }}>

            <p className="card-text" style={{ alignItems: "center", fontSize: "22px" }} >{apiResponse}</p>
          </div>
        </div>
      )}
      <PaymentSuccessPopup
        show={showPaymentSuccessPopup}
        onClose={clearAndClosePopup}
        message={paymentSuccessMessage}
      />
      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        closeButton={false} // Set closeButton to false
        pauseOnHover
        bodyStyle={{
          background: "lavender",
          color: "black",
          fontFamily: "sans-serif",
          fontWeight: "bold",
        }}
        className="custom-toast"
      />


      <Popup show={showPopup} onClose={togglePopup} />
    </div>

  );
}

export default App;