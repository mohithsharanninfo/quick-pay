// PaymentSuccessPopup.js
import React from 'react';
import '../components/paymentpopup.css'

function PaymentSuccessPopup({ show, onClose, message,TxnAmt,ReferenceNumber}) {
  if (!show) return null;


  return (
    <div className="payment-success-popup" >
      <div className="popup-content">
      <div className="col-sm-11 text-center" >
        <p style={{fontSize:"22px"}}>{message}</p>
        </div>
        
        <div className="col-sm-11 text-center">
     <button className="btn" style={{ backgroundColor: "brown", color: "whitesmoke", width:"20%"}} onClick={onClose} role="button">OK</button>
    </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPopup;
