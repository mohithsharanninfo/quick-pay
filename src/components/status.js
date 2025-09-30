import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../images/bhimaboylogofinal.jpg';

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
    <div className='App'>
      <div className="header">
        <div className='logo logoimg'>
          <a href='https://bhimagold.com'>
            <img src={logoImage} alt='Logo alt' className='logo img-fluid' />
          </a>
        </div>
      </div>
      <div className="container-fluid d-flex justify-content-center align-items-center">
        {apiResponse && (
          <div className="card" style={{ width: "25rem", backgroundColor: "lavender", padding: "30px", left: "0%", marginTop: "5%" }}>
            <div className="card-body" style={{ alignItems: "center", fontSize: "25px" }}>
              <p className="card-text" style={{ alignItems: "center", fontSize: "22px" }}>{apiResponse}</p>

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
                    fontSize: "17px"
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
        )}

        {
          !apiResponse &&
          <div>
            <p style={{ fontSize: "22px", color: "red", marginTop: "20px" }}>
              Payment not success !
            </p>
            <span onClick={() => navigate('/')} style={{ cursor: "pointer", color: "blue", textDecoration: "underline", marginTop: "10px" }}>Go to Home</span>
          </div>
        }
      </div>
    </div>
  );
};

export default Status;
