import React, { useContext, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { orderBy } from 'lodash';
import Swal from 'sweetalert2';
// import { AuthContext } from '../../AuthContext';
import logo from "../image/logoTo.svg";
import { UserContext } from '../../UserContext';

const Search = ({ setLoading }) => {
    const { currentUser, userData } = useContext(UserContext);
    const [searchValue, setSearchValue] = useState('');
    const [phoneCheck, setPhoneCheck] = useState(false);
    const [invoiceCheck, setInvoiceCheck] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [productsForPrint, setProductListForPrint] = useState([]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());


useEffect(() => {
    const fetchData = async () => {

        setLoading(true);
        const ordersRef = collection(db, "orders");
        const userOrdersRef = collection(ordersRef, currentUser.uid, "order");

        const querySnapshot = await getDocs(userOrdersRef);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        setSearchResults(data);
        setProductListForPrint(data);
        setLoading(false); // Move setLoading here to ensure it runs after setSearchResults
    };

    fetchData();
    return () => {

    }
}, [currentUser, setLoading]); // Add setLoading to the dependency array


    console.log(searchResults);

    const handlePhoneCheck = () => {
        setPhoneCheck(!phoneCheck);
    };

    const handleInvoiceCheck = () => {
        setInvoiceCheck(!invoiceCheck);
    };

    const handleSearchInputChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handelPrint = async (invoice) =>{
        let searchResults = [];
        const ordersRef = collection(db, "orders");
        const userOrdersRef = collection(ordersRef, currentUser.uid, "order");
        const q = query(userOrdersRef, where("invoiceNumber", '==', invoice));
        await getDocs(q).then((querySnapshot)=>{
            querySnapshot.forEach((doc) => {
                searchResults.push({ id: doc.id, ...doc.data() });
            });
        });
        let name = "";
        let date = "";
        let time = "";
        let phone = "";
        let total = "";
        let printOrders = [];
        // console.log(searchResults);
        searchResults.forEach((data)=>{
            // console.log(data.name);
            name = data.name;
            date = data.date;
            time = data.time;
            phone = data.phoneNumber;
            total = data.totalPrice;
            printOrders = data.orders;
        });
        console.log(name);
        console.log(date);
        console.log(time);
        console.log(phone);
        console.log(total);
        console.log(printOrders);
        printOrders.forEach((order)=>{
            console.log(order.date);
        })
        printBill(invoice, name, date, time, phone, total, printOrders);
    }
    const generateBill = (invoice, name, date, time, phone, total, printOrders) => {
        let billContent = `
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: #2f2e2e;
                }
                .page {
                    padding: 0;
                    width: 21cm;
                    margin: 0 auto;
                    background-color: #fff;
                }
                .innerPage{
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                header, footer, main {
                    width: 100%;
                    background-color: #fff;
                }
                main{
                    width: 90%;
                    height: 18cm;
                    display: flex;
                    flex-direction: column;
                }
                .innerMain{
                    display: flex;
                    justify-content: center;
                    height: 19cm;
                }
                .totalFooter{
                    display: flex;
                    width: 100%;
                    border: 1px solid #aaa;
                }
                .innterFooterT{
                    text-align: right;
                    width: 79.5%;
                    color: red;
                    font-size: 1.5rem;
                }
                .innterFooterN{
                    width: 20%;
                    color: red;
                    font-size: 1.5rem;
                }
                .sl{
                    width: 10%;
                    text-align: center;
                    border: 1px solid #aaa;
                }
                .productName{
                    width: 40%;
                    text-align: center;
                    border: 1px solid #aaa;

                }
                .price{
                    width: 20%;
                    text-align: center;
                    border: 1px solid #aaa;

                }
                .qnt{
                    width: 10%;
                    text-align: center;
                    border: 1px solid #aaa;

                }
                .totalPrice{
                    width: 20%;
                    text-align: center;
                    border: 1px solid #aaa;

                }
                .thead{
                    background: #aaa;
                }
                header {
                    padding: 10px 0;
                    height: 6.5cm;
                    text-align: center;
                }
                footer {
                    height: 4.5cm;
                    text-align: center;
                }
                .innerHeader{
                    padding-top: 20px;
                    width: 100%;
                    flex-direction: column;
                    height: 4.5cm;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;

                }
                .innerFooter{
                    width: 100%;
                    height: 4.5cm;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    flex-direction: column;
                }
                svg{
                    display: block;
                    
                }
                .headerContent{
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                img{
                    width: 150px;
                }
                .text{
                    width: 100%;
                    text-align: left;
                    padding-left: 50px;
                    margin: 0;
                }
                .header1{
                    font-size: 2.5rem;
                }
                .header2{
                    font-size: 1.5rem;
                }
                
                
                
            </style>
        </head>
        <body>
            <div class="page">
                <div class="innerPage">
                    <header>
                        <div class="innerHeader">
                            <svg width="750" height="100">
                                <rect x="20" y="0" width="200" height="50" fill="#EB5353"/>
                                <rect x="200" y="0" width="50" height="50" fill="#EB5353" transform="skewX(-30)" />
            
                                <rect x="260" y="0" width="250" height="50" fill="#36AE7C" transform="skewX(-30)" />
            
                                <rect x="520" y="0" width="50" height="50" fill="#70A1D7" transform="skewX(-30)" />
                                <rect x="530" y="0" width="200" height="50" fill="#70A1D7"/>
            
                            </svg>
                            <div class="headerContent">
                                <div class="text">
                                    <div class="header1">AMAS SHOP</div class="header1">
                                    <div class="header2">Invoice: ${invoice}</div class="header2">
                                    <div class="header3">Name: ${name}</div class="header3">
                                    <div class="header3">Phone: ${phone}</div class="header3">
                                    <div class="header3">Date: ${date}</div class="header3">
                                    <div class="header3">Time: ${time}</div class="header3">
                                    <div class="header4">Emo. ID: ${userData.empID}</div>
                                </div>
                                <div class="logo">
                                    <svg>
                                        <image xlink:href="${logo}" height="200" x="20"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main>
                        <div class="innerMain">
                            <div class="sl">
                                <div class="thead">
                                    SL. No.
                                </div>
                                <div class="tbody">`;
                                let count = 0
                                printOrders.forEach((order) =>{
                                    billContent += `<div class="con">${count+=1}</div>`
                                })
                                billContent += `</div>
                            </div>
                            <div class="productName">
                                <div class="thead">
                                    Product Name
                                </div>
                                <div class="tbody">`;
                                printOrders.forEach((order) =>{
                                    billContent += `<div class="con">${order.name}</div>`
                                })
                                billContent += `</div>
                            </div>
                            <div class="price">
                                <div class="thead">
                                    Price
                                </div>
                                <div class="tbody">`;
                                printOrders.forEach((order) =>{
                                    billContent += `<div class="con">₹${order.price}</div>`
                                })
                                billContent += `
                                </div>
                            </div>
                            <div class="qnt">
                                <div class="thead">
                                    Quantity
                                </div>
                                <div class="tbody">`;
                                printOrders.forEach((order) =>{
                                    billContent += `<div class="con">x${order.quantity}</div>`
                                })
                                billContent += `
                                </div>
                            </div>
                            <div class="totalPrice">
                                <div class="thead">
                                    Total Price
                                </div>
                                <div class="tbody">`;
                                printOrders.forEach((order) =>{
                                    billContent += `<div class="con">₹${order.quantity * order.price}</div>`
                                })
                                billContent += `
                                </div>
                            </div>
                        </div>
                        <div class="totalFooter">
                            <div class="innterFooterT">
                                Grand Total 
                            </div>
                            <div class="innterFooterN">
                                &nbsp;₹${total}
                            </div>
                        </div>
                    </main>
                    <footer>
                        <div class="innerFooter">

                            <svg width="750" height="40">
                                <!-- Skewed rectangle -->
                                <rect x="20" y="0" width="200" height="20" fill="#EB5353"/>
                                <rect x="200" y="0" width="50" height="20" fill="#EB5353" transform="skewX(-30)" />
            
                                <rect x="260" y="0" width="250" height="20" fill="#36AE7C" transform="skewX(-30)" />
            
                                <rect x="520" y="0" width="50" height="20" fill="#70A1D7" transform="skewX(-30)" />
                                <rect x="530" y="0" width="200" height="20" fill="#70A1D7"/>
            
                            </svg>
                        </div>
                    </footer>
                </div>
            </div>

        </body>
        </html>
       
        `;

        return billContent;
    };

    const printBill = (invoice, name, date, time, phone, total, printOrders) => {
        const billContent = generateBill(invoice, name, date, time, phone, total, printOrders);
        const printWindow = window.open('', '_blank', 'width=1000,height=600');
        printWindow.document.write(billContent);
        printWindow.document.close();
        // printWindow.print();
    };

    const generateData = () =>{
        let stockContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>A4 Size Page</title>
            <style type="text/css">
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: #fff;
                }
                .page {
                    padding: 0;
                    width: 21cm;
                    margin: 0 auto;
                    background-color: #fff;
                }
                .innerPage{
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                header, footer, main {
                    width: 100%;
                    background-color: #fff;
                }
                main{
                    width: 95%;
                    display: flex;
                    flex-direction: column;
                }
                .innerMain{
                    display: flex;
                    justify-content: center;
                }
                .totalFooter{
                    display: flex;
                    width: 100%;
                    border: 1px solid #aaa;
                }
                .innterFooterT{
                    text-align: right;
                    width: 79.5%;
                    color: red;
                    font-size: 1.5rem;
                }
                .innterFooterN{
                    width: 20%;
                    color: red;
                    font-size: 1.5rem;
                }
                .sl{
                    text-align: center;
                    border: 1px solid #aaa;
                }
                .productName{
                    text-align: center;
                    border: 1px solid #aaa;
        
                }
                .productId{
                    text-align: center;
                    border: 1px solid #aaa;
        
                }
                .price{
                    text-align: center;
                    border: 1px solid #aaa;
        
                }
                .phone{
                    text-align: center;
                    border: 1px solid #aaa;
        
                }
                .date{
                    width: 15%;
                    text-align: center;
                    border: 1px solid #aaa;
        
                }
                .time{
                    text-align: center;
                    border: 1px solid #aaa;
                }
                .thead{
                    background: #aaa;
                }
                .con{
                    padding: 0 5px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap:5px;
                    font-size: 1rem;
                }
                header {
                    padding: 10px 0;
                    height: 4.5cm;
                    text-align: center;
                    
                }
                footer {
                    height: 4.5cm;
                    text-align: center;
                }
                .innerHeader{
                    width: 100%;
                    flex-direction: column;
                    height: 4.5cm;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
        
                }
                .innerFooter{
                    width: 100%;
                    height: 4.5cm;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    flex-direction: column;
                }
                svg{
                    display: block;
                    
                }
                .headerContent{
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .logo{
                    width: 40%;
                    padding-left: 50px;
                }
                img{
                    width: 150px;
                }
                .text{
                    width: 60%;
                    text-align: left;
                    padding-right: 50px;
                    margin: 0;
                }
                .header1{
                    font-size: 2.5rem;
                }
                .header2{
                    font-size: 1.5rem;
                }
        
        
        
                @media print{
                    body{
                        margin: 10px !important;
                    }
                    
                }
                
                
                
            </style>
        </head>
        <body>
            <div class="page">
                <div class="innerPage">
                    <header>
                        <div class="innerHeader">
                            <svg width="750" height="40">
                                <rect x="20" y="0" width="200" height="20" fill="#EB5353"/>
                                <rect x="200" y="0" width="50" height="20" fill="#EB5353" transform="skewX(-30)" />
            
                                <rect x="260" y="0" width="250" height="20" fill="#36AE7C" transform="skewX(-30)" />
            
                                <rect x="520" y="0" width="50" height="20" fill="#70A1D7" transform="skewX(-30)" />
                                <rect x="530" y="0" width="200" height="20" fill="#70A1D7"/>
            
                            </svg>
                            <div class="headerContent">
                                <div class="logo">
                                    <svg>
                                        <image xlink:href="${logo}" height="200" x="20"/>
                                    </svg>
                                </div>
                                <div class="text">
                                    <div class="header1">AMAS SHOP Stocks</div class="header1">
                                    <div class="header3">Date: ${dateNow(currentDateTime)}</div class="header3">
                                    <div class="header3">Time: ${timeNow(currentDateTime)}</div class="header3">
                                </div>
                            </div>
                        </div>
                    </header>
                    <main>
                        <div class="innerMain">
                            <div class="sl">
                                <div class="thead">
                                    SL. No.
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">${index + 1}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="productId">
                                <div class="thead">
                                    Order Id
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">${order.invoiceNumber}</div>`
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="productName">
                                <div class="thead">
                                    Name
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">${order.name}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="phone">
                                <div class="thead">
                                    Phone
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">${order.phoneNumber}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="price">
                                <div class="thead">
                                    Price
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">₹${order.totalPrice}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="date">
                                <div class="thead">
                                    Date
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">${order.date}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="time">
                                <div class="thead">
                                    Time
                                </div>
                                <div class="tbody">`;
                                orderBy(productsForPrint, ['date', 'time'], ['desc', 'desc']).forEach((order, index) => {
                                    stockContent += `<div class="con">${order.time}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                        </div>
                    </main>
                    <footer>
                        <div class="innerFooter">
        
                            <svg width="750" height="40">
                                <!-- Skewed rectangle -->
                                <rect x="20" y="0" width="200" height="20" fill="#EB5353"/>
                                <rect x="200" y="0" width="50" height="20" fill="#EB5353" transform="skewX(-30)" />
            
                                <rect x="260" y="0" width="250" height="20" fill="#36AE7C" transform="skewX(-30)" />
            
                                <rect x="520" y="0" width="50" height="20" fill="#70A1D7" transform="skewX(-30)" />
                                <rect x="530" y="0" width="200" height="20" fill="#70A1D7"/>
            
                            </svg>
                        </div>
                    </footer>
                </div>
            </div>
        
        </body>
        </html>
        
        `;

        return stockContent;
    }

    const printData = () =>{
        const now = new Date();
        setCurrentDateTime(now);
        const stockContent = generateData();
        const printWindow = window.open('', '_blank', 'width=1000,height=600');
        printWindow.document.write(stockContent)
        printWindow.document.close();
    }

    const handleSearch = async () => {
        const ordersRef = collection(db, "orders");
        const userOrdersRef = collection(ordersRef, currentUser.uid, "order");
    
        const searchCriteria = [];
        if (phoneCheck) {
            searchCriteria.push({ field: 'phoneNumber', value: searchValue });
        }
        if (invoiceCheck) {
            searchCriteria.push({ field: 'invoiceNumber', value: searchValue });
        }
    
        if (searchCriteria.length === 0) {
            // alert('Please select at least one search criteria.');
            Swal.fire({
                title: 'Opps...',
                icon:  'warning',
                text: 'Please select at least one search criteria.'
            })
            setLoading(false);
            return;
        }
    
        try {
            let searchResults = [];
            for (const criteria of searchCriteria) {
                const q = query(userOrdersRef, where(criteria.field, '==', criteria.value));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    searchResults.push({ id: doc.id, ...doc.data() });
                });
            }
            console.log(searchResults);
            setSearchResults(searchResults);
            setLoading(false);
        } catch (error) {
            console.error('Error searching orders:', error);
            alert('Error searching orders. Please try again.');
            setLoading(false);

        }
    };
    
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            setLoading(true);
            handleSearch(); // Call handleOrders function
        }
    };

    const currentDate = new Date(); // Get the current date and time

    // Find the current order based on the current date and time
    let currentOrder = null;
    let timeDifference = Number.POSITIVE_INFINITY;

    searchResults.forEach(order => {
        const orderDate = new Date(order.date); // Convert order date string to Date object
        const orderTime = order.time.split(':').map(Number); // Split time string and convert to array of numbers
        orderDate.setHours(orderTime[0]); // Set hours of order date
        orderDate.setMinutes(orderTime[1]); // Set minutes of order date
        orderDate.setSeconds(orderTime[2]); // Set seconds of order date

        // Calculate the time difference between the current date and order date
        const difference = Math.abs(currentDate - orderDate);

        // If the current order is closer to the current date and time, update the current order
        if (difference < timeDifference) {
            currentOrder = order;
            timeDifference = difference;
        }
    });

    if (currentOrder) {
        // Found the current order
        console.clear();
    } else {
        // No current order found
        console.log("No current order found.");
    }

    const dateNow = (date) =>{
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    const timeNow = (date) =>{
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }

    useEffect(() => {
        const intervalID = setInterval(() => {
          setCurrentDateTime(new Date());
        }, 1000);
    
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalID);
      }, []);

    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const seconds = currentDateTime.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    return (
        <div className='search' id='search'>
            <div className='innerSearch'>
                <div className="headTimeDate">
                    <div className="dateText">Date: {dateNow(currentDateTime)}</div>
                    <div className="timeText">Time: {formattedHours < 10 ? '0' + formattedHours : formattedHours}:
                        {minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds} {ampm}
                    </div>
                </div>
                <label htmlFor='searchText' className='searchText'>
                    <div className='icon'>
                        <i className='fa-solid fa-magnifying-glass'></i>
                    </div>
                    <input
                        type='text'
                        name='searchText'
                        id='searchText'
                        placeholder='Search'
                        value={searchValue}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleKeyPress}
                    />
                </label>
                <label htmlFor='checkphone'>
                    <input
                        type='checkbox'
                        name='phone'
                        id='checkphone'
                        checked={phoneCheck}
                        onChange={handlePhoneCheck}
                    />
                    <span className='phone'>Phone</span>
                </label>
                <label htmlFor='checkinvoice'>
                    <input
                        type='checkbox'
                        name='invoice'
                        id='checkinvoice'
                        checked={invoiceCheck}
                        onChange={handleInvoiceCheck}
                    />
                    <span className='invoice'>Invoice</span>
                </label>

                {/* <button onClick={handleSearch}>Search</button> */}

                <div className='displayField'>
                    <table width='100%'>
                        <thead>
                            <tr>
                                <th width='5%'>SL No.</th>
                                <th>Order Id</th>
                                <th>Customer Name</th>
                                <th>Customer Phone</th>
                                <th width='5%'>Price</th>
                                <th width='8%'>Date</th>
                                <th width='8%'>Time</th>
                                <th width='8%'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {orderBy(searchResults, ['date', 'time'], ['desc', 'desc']).map((order, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{order.invoiceNumber}</td>
                                <td>{order.name}</td>
                                <td>{order.phoneNumber}</td>
                                <td>₹{order.totalPrice}</td>
                                <td>{order.date}</td>
                                <td>{order.time}</td>
                                <td>
                                    <button className="buutonAction" onClick={() => handelPrint(order.invoiceNumber)}>View Bills</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="button">
                    <button onClick={() => printData()}>Print Stock</button>
                </div>
            </div>
        </div>
    );
};

export default Search;
