import React, { Component } from "react";
import { Routes, Route, Link} from 'react-router-dom';
import Status from '../src/components/status';
import Payment from '../src/components/payment';
import Mob from '../src/components/mobname'

function App() {
  return (
    <div className="app">
        {/* <Link to="/status">Status</Link> */}
      <Routes>
    
        <Route exact path="/status" element={<Status />} />
        <Route
        exact  path="/"
          element={
            <div className="content">
              <Payment />
              {/* <Mob/> */}
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;



// const apiUrl = `https://testapproval.bhima.info/api_db.js/api/ThirdPartyPayment/${mobileNumber}/${membershipNumber}`;
// const headers = {
//   'Content-Type': 'application/json',
//   'Authorization': `Bearer ${accessToken}`,
// };

// console.log('Request Headers:', headers);

// const response = await fetch(apiUrl, {
//   method: 'GET',
//   headers: headers,
// });


