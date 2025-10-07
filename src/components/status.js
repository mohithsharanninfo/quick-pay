import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../images/bhimaboylogofinal.jpg';
import cross_img from '../images/red-crossmark-removebg-preview.png'

const Status = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [showCloseButton, setShowCloseButton] = useState(false);

  const renewAccessToken = async () => {
    try {
      // Load the existing token from the token.json file
      const tokenData = require('../token.json');
      const existingToken = tokenData.token;
      const tokenURl = `http://suvarnagopura.com/MagentoAPI/api_db.js/users/renewAccessToken`;
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
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('order_id');

    if (orderId) {
      const apiUrl = `https://suvarnagopura.com/MagentoAPI/api_db.js/api/Paymentcheck/${orderId}`;
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
          setApiResponse(data.message);
          setShowCloseButton(true);
        })
        .catch((error) => {
          console.error('Error fetching API data:', error);
        });
    }

    const handlePopstate = () => {
      const isLocalEnvironment = process.env.NODE_ENV === 'development';
      const localDefaultPage = 'http://localhost:3000'; // Replace with your local default route
      const serverDefaultPage = 'http://localhost:3000'; // Replace with your server default URL
      const defaultPage = isLocalEnvironment ? localDefaultPage : serverDefaultPage;
      navigate(defaultPage);
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [location.search, navigate, accessToken]);

  const handleButtonClick = () => {
    const isLocalEnvironment = process.env.NODE_ENV === 'development';
    const localDefaultPage = 'http://localhost:3000'; // Replace with your local default route
    const serverDefaultPage = 'http://localhost:3000'; // Replace with your server default URL
    const defaultPage = isLocalEnvironment ? localDefaultPage : serverDefaultPage;
    window.location.href = defaultPage;
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, []);



  // const refMatch = apiResponse?.match(/Payment Reference Number:\s*(\d+)/);
  // const amountMatch = apiResponse?.match(/Amount\s*:\s*([\d,]+)/);

  // const paymentRef = refMatch ? refMatch[1] : null;
  // const amount = amountMatch ? amountMatch[1] : null;

  return (
    <div className="App">
      <div className="header">
        <div className="logo logoimg">
          <a href="https://bhimagold.com">
            <img src={logoImage} alt="Logo alt" className="logo img-fluid" />
          </a>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingInline: 10,
          height:'500px',
          maxHeight:'500px'
        }}
      >
        {apiResponse ? (
          <div
            className="card"
            style={{
              width: "25rem",
              backgroundColor: "lavender",
              padding: "30px",
              left: "0%",
              marginTop: "5%",
            }}
          >
            <div
              className="card-body"
              style={{ alignItems: "center", fontSize: "25px" }}
            >
              <p
                className="card-text"
                style={{ alignItems: "center", fontSize: "22px" }}
              >
                {apiResponse}
              </p>

              {showCloseButton && (
                <button
                  className="close-button"
                  style={{
                    width: "65%",
                    padding: "0px",
                    backgroundColor: "brown",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontFamily: "sans-serif",
                    fontSize: "17px",
                  }}
                  onClick={handleButtonClick}
                >
                  Make another Payment
                </button>
              )}
            </div>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Go to Bhima Home
            </a>
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
              Please try again
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
