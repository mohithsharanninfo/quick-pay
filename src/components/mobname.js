// import React, { useEffect, useState } from 'react';

// const YourComponent = () => {
//   const [paymentInfo, setPaymentInfo] = useState({});
//   // ... (other state variables)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         console.log('Fetching payment information...');

//         const requestData = {
//           PortalUserID: 'thridparty',
//           AmountPaid: customerInfo[0].EMIAmount,
//           MobileNo: mobileNumber,
//           Details: [
//             {
//               Name: customerInfo[0].Name,
//               MembershipNo: membershipNumber,
//               BranchCode: customerInfo[0].BranchCode,
//               SchemeCode: customerInfo[0].SchemeCode,
//               GroupCode: customerInfo[0].GroupCode,
//               ChitMembershipNo: customerInfo[0].ChitMembershipNo,
//               NoOfInst: 1,
//               InstallmentAmt: customerInfo[0].EMIAmount,
//               Rate: 0,
//               GoldWt: 0,
//               noOfInst: 1,
//             },
//           ],
//         };

//         const apiUrl = 'https://testapproval.bhima.info/api_db.js/api/ThridPartyEMIPayment';
//         const paymentInfoResponse = await fetch(apiUrl, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`,
//           },
//           body: JSON.stringify(requestData),
//         });

//         if (paymentInfoResponse.ok) {
//           const res = await paymentInfoResponse.json();
//           console.log('Payment API response:', res);

//           if (res.success === true) {
//             setPaymentInfo(res);
//             console.log('razorpay:', paymentInfo);
//           } else {
//             console.error('API response status is false.');
//           }
//         } else {
//           console.error('Error fetching payment information:', paymentInfoResponse.status);
//         }
//       } catch (error) {
//         console.error('Error opening payment gateway:', error);
//       }
//     };

//     fetchData();
//   }, []); // useEffect will run once on component mount

//   useEffect(() => {
//     // This useEffect will run every time paymentInfo changes
//     console.log('PaymentInfo updated:', paymentInfo);

//     // Check if paymentInfo contains necessary information
//     if (paymentInfo && paymentInfo.pgtype) {
//       // Check the pgtype and open the corresponding payment gateway
//       if (paymentInfo.pgtype === 'Cashfree') {
//         openCashfreePayment();
//       } else if (paymentInfo.pgtype === 'Razorpay') {
//         openRazorpayPayment();
//       } else {
//         console.error('Invalid pgtype:', paymentInfo.pgtype);
//       }
//     }
//   }, [paymentInfo]); // useEffect will run whenever paymentInfo changes

//   const openRazorpayPayment = async () => {
//     try {
//       console.log('openRazorpayPayment called');
//       console.log('PaymentInfo in openRazorpayPayment:', paymentInfo);

//       // Check if paymentInfo contains necessary information
//       if (paymentInfo && paymentInfo.pgkey) {
//         const options = {
//           key: paymentInfo.pgkey,
//           amount: paymentInfo.TxnAmt,
//           currency: 'INR',
//           name: paymentInfo.rname,
//           order_id: paymentInfo.cf_order_id,
//           handler: function (response) {
//             console.log('Payment successful:', response);
//             handleRazorpayResponse(response, paymentInfo.ReferenceNumber);
//           },
//           modal: {
//             ondismiss: function () {
//               setPaymentSuccessMessage('Payment failed!');
//             },
//           },
//         };
//         console.log(options);
//         const rzp1 = new Razorpay(options);
//         rzp1.open();
//       } else {
//         console.error('PaymentInfo or pgkey is missing.');
//       }
//     } catch (error) {
//       console.error('Error fetching payment information:', error);
//     }
//   };

//   const openCashfreePayment = async () => {
//     // Implement your logic for Cashfree payment
//   };

//   // ... (other code)

//   return (
//     <div>
//       {/* Your component JSX */}
//     </div>
//   );
// };

// export default YourComponent;
