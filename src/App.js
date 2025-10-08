import React, { Component } from "react";
import { Routes, Route, Link} from 'react-router-dom';
import Status from '../src/components/status';
import Payment from '../src/components/payment';
import Mob from '../src/components/mobname'

function App() {
  return (
    <div  style={{background: "linear-gradient(to bottom, #fff8e1, #ffffff)"}}>
    
      <Routes>
        <Route exact path="/status" element={<Status />} />
        <Route exact  path="/" element={
            <div className="content">
              <Payment />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;





