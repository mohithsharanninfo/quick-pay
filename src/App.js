import React from "react";
import { Routes, Route } from 'react-router-dom';
import Status from '../src/components/status';
import Payment from '../src/components/payment';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div style={{ background: "linear-gradient(to bottom, #fff8e1, #ffffff)" }}>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route exact path="/status" element={<Status />} />
        <Route exact path="/" element={
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





