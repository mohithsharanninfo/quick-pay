import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../images/bhimaboylogofinal.jpg';
import cross_img from '../images/red-crossmark-removebg-preview.png'
import success_img from '../images/success_icon.png'
import { API_PAYMENTCHECK, HTTP_API_RENEWACCESSTOKEN, SERVERDEFAULTPAGE, TOKEN } from '../constant';

const Status = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const renewAccessToken = async () => {
    try {
   
      const existingToken = TOKEN
      const tokenURl = `${HTTP_API_RENEWACCESSTOKEN}/renewAccessToken`;
      const response = await fetch(tokenURl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: existingToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        setAccessToken(newToken);
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

  useEffect(() => {
    setIsLoading(true)
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('order_id');

    if (orderId) {
      const apiUrl = `${API_PAYMENTCHECK}/Paymentcheck/${orderId}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };

      fetch(apiUrl, {
        method: 'GET',
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('API Response:', data);
          setApiResponse(data);
          setIsLoading(false)
          setShowCloseButton(true);
        })
        .catch((error) => {
          console.error('Error fetching API data:', error);
          setShowCloseButton(false);
        });
    }

    const handlePopstate = () => {
      const isLocalEnvironment = process.env.NODE_ENV === 'development';
      const defaultPage = isLocalEnvironment ? SERVERDEFAULTPAGE : SERVERDEFAULTPAGE;
      navigate(defaultPage);
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [location.search, navigate, accessToken]);


  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, []);

  if(isLoading && !apiResponse?.success){
    return <div style={{height:"100vh",display:'flex',justifyContent:'center',alignItems:'center'}}>Loading.....</div>
  }


  return (
    <div style={{ height: '100vh', }}>
      <div className="header-container">
        <a href="https://bhimagold.com" className="logo-link">
          <img src={logoImage} alt="Bhimagold Logo" className="logo-img" />
        </a>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingInline: 10,
          marginTop: "5%",
          
        }}
      >
        {apiResponse?.success == true ? (
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
            <div
              className="card-body"
              style={{ alignItems: "center", fontSize: "25px" }}
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
                  src={success_img}
                  alt="success Logo"
                  style={{ maxWidth: "100px" }}
                />
              </div>

              <p
                style={{
                  fontSize: "22px",
                  color: "#b8860b",
                  textAlign: "center",
                }}
              >
                Payment Successfull!
              </p>

              <div  style={{display:"flex", flexDirection:"column", gap:"1rem", marginTop:"1rem"}}>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  alignItems: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  Subscriber Name:{" "}
                  <span style={{ fontWeight: "600" }}>
                    {apiResponse?.Name}
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
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  Subscriber Mobile:{" "}
                  <span style={{ fontWeight: "600" }}>
                    {apiResponse?.MobileNo}
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
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  Membership No.:{" "}
                  <span style={{ fontWeight: "600" }}>
                    {apiResponse?.membershipno}
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
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  Amount Paid:{" "}
                  <span style={{ fontWeight: "600" }}>
                    {apiResponse?.TxnAmt}
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
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  Payment Status:{" "}
                  <span style={{ fontWeight: "600" }}>
                    {apiResponse?.Status}
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
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  Reference Number:{" "}
                  <span style={{ fontWeight: "600" }}>
                    {apiResponse?.ReferenceNumber}
                  </span>
                </p>
              </div>
            </div>
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginBlock: "1rem",
              }}
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
                  opacity: 1,
                }}
                onClick={() => navigate("/")}
              >
                Go to home page
              </button>
            </div>

          </div>
        ) : (
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
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={cross_img}
                alt="Bhima Boy Logo"
                style={{ maxWidth: "100px" }}
              />
            </div>
            <p
              style={{
                fontSize: "22px",
                color: "#b8860b",
                textAlign: "center",
              }}
            >
              Whoops!&nbsp;Payment Failed..
            </p>
            <p
              style={{
                fontSize: "16px",
                color: "#b8860b",
                textAlign: "center",
              }}
            >
            Something went wrong!&nbsp;Please try again
            </p>

            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginBlock: "1rem",
              }}
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
                  opacity: 1,
                }}
                onClick={() => navigate("/")}
              >
                Go to home page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Status;
