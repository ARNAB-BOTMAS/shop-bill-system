import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Rdb, db } from "../../firebase";
import { addDoc, collection } from 'firebase/firestore';
import { get, ref, set, update } from 'firebase/database';
// import { set } from 'lodash';
import logo from "../image/logoTo.svg";
import { UserContext } from '../../UserContext';

const Order = ({ setLoading }) => {
    const { currentUser, userData } = useContext(UserContext);
    
    const [orders, setOrders] = useState([]);
    // const [searchResults, setSearchResults] = useState([]);
    // const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    // const [isInvoice, setInvoices] = useState('');
    const [products, setProducts] = useState([]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const addUserToDatabase =  async (name, phone) => {
        try {
            // const uid = uuidv4(); // Generate unique UID using uuidv4()
        
            await set(ref(Rdb, `customer/${phone}`), {
                name: name,
                phone: phone  
            })
            
            // console.log("Customer data successfully written to database");
          } catch (error) {
            Swal.fire({
                icon: 'error',
                title: "Ops...",
                text: error.message
            })
            // console.error("Error writing customer data to database:", error);
          }
    }
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productRef = ref(Rdb, 'product');
                const snapshot = await get(productRef);
                const productList = [];
                snapshot.forEach((childSnapshot) => {
                    const product = childSnapshot.val();
                    productList.push(product);
                });
                setProducts(productList);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    // console.log(products);

    const generateInvoice = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Adding leading zero if needed
        const day = String(now.getDate()).padStart(2, '0'); // Adding leading zero if needed
        const hours = String(now.getHours()).padStart(2, '0'); // Adding leading zero if needed
        const minutes = String(now.getMinutes()).padStart(2, '0'); // Adding leading zero if needed
        const seconds = String(now.getSeconds()).padStart(2, '0'); // Adding leading zero if needed
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); // Adding leading zeros if needed
        const invoice = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
        // console.log("Generated Invoice:", invoice); // Check if invoice is generated
        // console.clear();
        return invoice;
    };

    // const invoice = generateInvoice;
    

    const addOrderToDatabase = (order) => {
        // Reference to the "orders" collection in Firestore
        const ordersRef = collection(db, "orders");
        const userOrdersRef = collection(ordersRef, currentUser.uid, "order");
    
        // Add a new document with a generated id
        addDoc(userOrdersRef, order)
            .then((docRef) => {
                // console.log("Order added with ID: ", docRef.id);
                Swal.fire({
                    icon: "success",
                    title: "Thank You",
                    text: "Thank you for your purchase!\n visit again",
                })
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Ops..",
                    text: error.message
                })
                // console.error("Error adding order: ", error);
            });
    };
    

    const handleOrders = (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Find the form element within the event target
        const formElement = event.target.closest('form');

        // Check if formElement is null (i.e., if no form element is found)
        if (!formElement) {
            Swal.fire({
                icon: "error",
                title: "Ops..",
                text: 'from element not found'
            })
            return;
        }

        // Create a FormData object from the form element
        const formData = new FormData(formElement);

        // Get the input field values from the FormData object
        const orderName = formData.get('order');
        let orderQuantity = formData.get('orderQnt');

        const product = products.find(item => item.barcode === Number(orderName));
        if (!orderName) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Order is empty!",
            });
            return;
        }

        if (!product) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Enter a valid Name",
            });
            return;
        }


        // If quantity is not provided, set it to 1
        if (!orderQuantity) {
            orderQuantity = 1;
        } else {
            orderQuantity = parseInt(orderQuantity); // Parse quantity to integer
        }

        // Check if the same product already exists in orders
        const existingOrderIndex = orders.findIndex(order => order.barcode === product.barcode);

        if (existingOrderIndex !== -1) {
            // If the product already exists, update its quantity
            const updatedOrders = [...orders];
            updatedOrders[existingOrderIndex].quantity += orderQuantity;
            setOrders(updatedOrders);
        } else {
            // Otherwise, add a new order
            const newOrder = {
                barcode: product.barcode,
                name: product.productName,
                quantity: orderQuantity,
                price: product.productPrice
            };
            setOrders([...orders, newOrder]);
        }

        // Clear the input fields
        formElement.reset();
    };

    const calculateTotalPrice = () => {
        // Calculate the total price of all orders
        return orders.reduce((total, order) => total + order.quantity * order.price, 0);
    };

    const handleRemoveOrder = (index) => {
        Swal.fire({
            title: 'Are you want to delete the order?',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Sure',
            cancelButtonText: 'Cancel',
        }).then((result) =>{
            if(result.isConfirmed) {
                const updatedOrders = [...orders];
                updatedOrders.splice(index, 1);
                setOrders(updatedOrders);
            }
        });
    };

    const handleEditQuantity = (index) => {
        Swal.fire({
            title: 'Edit Quantity',
            icon:  'info',
            input: 'number',
            inputValue: orders[index].quantity,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter a quantity';
                }
                if (value < 0) {
                    return 'Quantity cannot be negative';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const newQuantity = parseInt(result.value);
                if (newQuantity !== orders[index].quantity) {
                    const updatedOrders = [...orders];
                    updatedOrders[index].quantity = newQuantity;
                    setOrders(updatedOrders);
                }
            }
        });
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            handleOrders(event); // Call handleOrders function
        }
    };

    const dateNow = (date) =>{
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    const timeNow = (date) =>{
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }

    const generateBill = (invoiceNumber, customerName) => {
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
                            <svg width="750" height="40">
                                <rect x="20" y="0" width="200" height="20" fill="#EB5353"/>
                                <rect x="200" y="0" width="50" height="20" fill="#EB5353" transform="skewX(-30)" />
            
                                <rect x="260" y="0" width="250" height="20" fill="#36AE7C" transform="skewX(-30)" />
            
                                <rect x="520" y="0" width="50" height="20" fill="#70A1D7" transform="skewX(-30)" />
                                <rect x="530" y="0" width="200" height="20" fill="#70A1D7"/>
            
                            </svg>
                            <div class="headerContent">
                                <div class="text">
                                    <div class="header1">AMAS'S HOTEL</div class="header1">
                                    <div class="header2">Invoice: ${invoiceNumber}</div class="header2">
                                    <div class="header3">Name: ${customerName}</div class="header3">
                                    <div class="header3">Phone: ${phoneNumber}</div class="header3">
                                    <div class="header3">Date: ${dateNow(currentDateTime)}</div class="header3">
                                    <div class="header3">Time: ${timeNow(currentDateTime)}</div class="header3">
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
                                orders.forEach((order) =>{
                                    billContent += `<div class="con">${count+=1}</div>`
                                })
                                billContent += `</div>
                            </div>
                            <div class="productName">
                                <div class="thead">
                                    Product Name
                                </div>
                                <div class="tbody">`;
                                orders.forEach((order) =>{
                                    billContent += `<div class="con">${order.name}</div>`
                                })
                                billContent += `</div>
                            </div>
                            <div class="price">
                                <div class="thead">
                                    Price
                                </div>
                                <div class="tbody">`;
                                orders.forEach((order) =>{
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
                                orders.forEach((order) =>{
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
                                orders.forEach((order) =>{
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
                                &nbsp;₹${calculateTotalPrice()}
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

    const printBill = (invoiceNumber, customerName, customer) => {
        const billContent = generateBill(invoiceNumber, customerName);
        const printWindow = window.open('', '_blank', 'width=1000,height=600');
        printWindow.document.write(billContent);
        printWindow.document.close();

        // Add event listener to close the window when the user closes it or finishes printing
        printWindow.addEventListener('afterprint', () => {
            setOrders([]);
            // setName('');
            setPhoneNumber('')
            printWindow.close();
        });

        
        setTimeout(() => {
            printWindow.print();
        }, 3000);
        addOrderToDatabase(customer);
    };

    const updateDatabase = async () => {
        try {
            const productRef = ref(Rdb, 'product');
            const snapshot = await get(productRef);
            const productList = [];
            
            // Convert snapshot to an array of products
            snapshot.forEach((childSnapshot) => {
                const product = childSnapshot.val();
                productList.push({
                    key: childSnapshot.key, // Add key for updating specific product
                    ...product
                });
            });
    
            // Update the product quantity based on orders
            const updatedProducts = productList.map(product => {
                const order = orders.find(order => order.barcode === product.barcode);
                if (order) {
                    // Reduce the quantity by the ordered amount
                    product.quantity -= order.quantity;
                }
                return product;
            });
    
            // Update the database with the updated products
            await update(productRef, updatedProducts.reduce((acc, product) => {
                acc[product.key] = {
                    productName: product.productName,
                    quantity: product.quantity,
                    productPrice: product.productPrice,
                    barcode: product.barcode
                };
                return acc;
            }, {}));
            
            // console.log('Database updated successfully');
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Ops...",
                text: error.message
            })
            // console.error('Error updating database:', error);
        }
    };
    

    const handleBills = async () => {
        setLoading(true);
        const invoiceNumber = generateInvoice(); // Call generateInvoice to get the invoice number
        // console.log("Generated Invoice Number:", invoiceNumber); // Log generated invoice number
        const now = new Date(); // Get the current date and time
        const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const productList = [];
        const snapshot = await get(ref(Rdb, `customer/${phoneNumber}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            const { name, phone } = data;
            if (name && phone) {
                productList.push({ name, phone });
            }
        }
    
        // Check if there are any existing orders for the given phone number
        let customerName = '';
        // Check if there are any existing orders for the given phone number
        if (productList.length === 0) {
            // If no existing orders found, prompt the user to enter the customer name
            setLoading(false);
            customerName = await promptCustomerName();
            addUserToDatabase(customerName, phoneNumber);
        } else {
            // Extract the customer name from the first order found
            setLoading(false);
            const firstOrder = productList[0];
            customerName = firstOrder.name;
        }

        // Set the customer name    
        // Display the confirmation dialog with the provided details
        Swal.fire({
            title: 'Are you sure?',
            icon: 'info',
            html: `
                Name: ${customerName}, <br>
                Phone: ${phoneNumber}, <br>
                Order of Bills: ₹${calculateTotalPrice()}<br>
                Date: ${formattedDate}<br>
                Time: ${formattedTime}<br>
            `,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                setLoading(true);
                // setName(customerName);
                const customer = {
                    invoiceNumber: invoiceNumber, // Use the generated invoice number
                    name: customerName,
                    phoneNumber: phoneNumber,
                    totalPrice: calculateTotalPrice(),
                    orders: orders,
                    date: formattedDate,
                    time: formattedTime
                };
                setCurrentDateTime(now); 
                updateDatabase();
                printBill(invoiceNumber, customerName, customer);
                setLoading(false);
            };
            // setName('');
        });
    };
    
    const promptCustomerName = async () => {
        const { value: customerName } = await Swal.fire({
            title: "Customer Name",
            input: "text",
            inputLabel: "Enter Customer Name",
            inputPlaceholder: "Customer Name"
        });
        return customerName;
    };

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
        <div className="order" id='order'>
            <div className="innerOrder">
                <div className="headTimeDate">
                    <div className="dateText">Date: {dateNow(currentDateTime)}</div>
                    <div className="timeText">Time: {formattedHours < 10 ? '0' + formattedHours : formattedHours}:
                        {minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds} {ampm}
                    </div>
                </div>
                <div className="inputField">
                    <form onSubmit={handleOrders}>
                        <input type="text" name="order" id="order" className="orderSearch" placeholder='Place Order' onKeyPress={handleKeyPress}/>
                        <input type="tel" name="orderQnt" id="orderQnt" className="orderQnt" placeholder='Qnt will Be 1' onKeyPress={handleKeyPress}/>
                        <button type="submit">Add order</button>
                    </form>
                </div>
                <h2>Orders</h2>
                <div className="displayField">
                    <table width="100%">
                        <thead>
                            <tr>
                                <th width="5%">SL No.</th>
                                <th>Order Name</th>
                                <th width="10%">Price Per Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th width="10%">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{order.name}</td>
                                    <td>₹{order.price}</td>
                                    <td>X{order.quantity}</td>
                                    <td>₹{order.quantity * order.price}</td>
                                    <td>
                                        <button className="buutonActionRemove" onClick={() => handleRemoveOrder(index)}>Remove</button>
                                        <button className="buutonAction" onClick={() => handleEditQuantity(index)}>Edit Qnt</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='footerText'>
                    <div className="inputTextField">
                        {/* <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" /> */}
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" />
                        <button onClick={() => handleBills()}>Place Order</button>
                    </div>
                    <div className="innerTotal">
                        Total: ₹{calculateTotalPrice()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Order;
