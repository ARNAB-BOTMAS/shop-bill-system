// import { collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Rdb } from '../../firebase';
import { get, ref, remove, set, update } from 'firebase/database';
import Swal from 'sweetalert2';
// import JsBarcode from 'jsbarcode';
import Barcode from 'react-barcode';
import logo from "../image/logoTo.svg";
// import ReactDOMServer from 'react-dom/server';
import JsBarcode from 'jsbarcode';


// import { AuthContext } from '../../AuthContext';

const List = ({ setLoading }) => {
    // const { currentUser } = useContext(AuthContext);
    const [searchValue, setSearchValue] = useState('');
    const [productName, setProductName] = useState('');
    const [productQnt, setProductQnt] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [products, setProductList] = useState([]);
    const [productsForPrint, setProductListForPrint] = useState([]);
    const [usedNumbers, setUsedNumbers] = useState(new Set());
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    // const [newNumbers, setNewNumbers] = useState('');
    // state = {
    //     productName: '',
    //     productQnt: '',
    //     price: '',
    //     barcode: ''
    // };
    useEffect(()=>{
        getProductList();
        return () => {

        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleSearchInputChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleProductName = (event) => {
        setProductName(event.target.value);
    };

    const handleProductPrice = (event) => {
        setProductPrice(event.target.value);
    };

    const handleProductQtn = (event) => {
        setProductQnt(event.target.value);
    };

    const handleProduct = (event) => {
        event.preventDefault();
        const formElement = event.target.closest('form');
        const formData = new FormData(formElement);

        const orderName = formData.get('productName');
        let orderQuantity = formData.get('productQnt');
        let orderPrice = formData.get('productPrice');

        let barcode = handleGenerateBarcode();

        handleProductList(orderName, orderQuantity, orderPrice, barcode);
    }

    const generateBarcodeNumber = (usedNumbers) => {
        const min = 1000000000; // Minimum 10-digit number
        const max = 9999999999; // Maximum 10-digit number
        let newNumber;
        do {
          newNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers.has(newNumber));
        return newNumber;
      }

    const handleGenerateBarcode = () => {
        const newNumber = generateBarcodeNumber(usedNumbers);
        setUsedNumbers(prevUsedNumbers => new Set(prevUsedNumbers).add(newNumber));
        // console.log(newNumber);
        // setNewNumbers(newNumber);
        return newNumber;
    }

    const handleProductList = async (productName, productQnt, price, barcode) => {
        // setLoading(true);
        await set(ref(Rdb, `product/${barcode}`), {
            productName: productName,
            quantity: productQnt,
            productPrice: price,
            barcode: barcode
          }).then(() =>{
            Swal.fire({
                icon: "success",
                title: "Product Update",
                // text: "Order is empty!",
            }).then(() =>{
                setLoading(false);
                getProductList();
                setProductName('');
                setProductQnt('');
                setProductPrice('');
            });
          }).catch((err) =>{
                // setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Product Update Failed",
                    // text: "Order is empty!",
                }).then(() =>{
                    setLoading(false);
                    getProductList();
                    setProductName('');
                    setProductQnt('');
                    setProductPrice('');
                });
          });
    }

    const handleRemoveProduct = async (barcode) => {
        setLoading(true);
        await remove(ref(Rdb, `product/${barcode}`)).then(() => {
            Swal.fire({
                icon: "success",
                title: "Product Removed",
            }).then(() => {
                setLoading(false);
                getProductList(); // Refresh the product list after removal
            });
        }).catch((error) => {
            setLoading(false);
            // console.error("Error removing product: ", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to remove product. Please try again later.",
            });
        });
    }

    const handleUpdateProduct = async (productName, productQnt, price, barcode) => {
        setLoading(true)
        Swal.fire({
            title: 'Add Product',
            html:
                `<input id="swal-input1" class="swal2-input" value="${productName}" placeholder="Product Name">` +
                `<input id="swal-input2" class="swal2-input" value="${productQnt}" placeholder="Quantity">` +
                `<input id="swal-input3" class="swal2-input" value="${price}" placeholder="Price">`,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    updatedProductName: document.getElementById('swal-input1').value,
                    updatedProductQnt: document.getElementById('swal-input2').value,
                    updatedPrice: document.getElementById('swal-input3').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { updatedProductName, updatedProductQnt, updatedPrice } = result.value;
                
                update(ref(Rdb, `product/${barcode}`), {
                    productName: updatedProductName,
                    quantity: updatedProductQnt,
                    productPrice: updatedPrice,
                    barcode: barcode
                }).then(() => {
                    setLoading(false);
                    Swal.fire({
                        icon: "success",
                        title: "Product Updated",
                    }).then(() => {
                        getProductList(); // Refresh the product list after update
                    });
                }).catch((error) => {
                    setLoading(false);
                    // console.error("Error updating product: ", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to update product. Please try again later.",
                    });
                });
            }
        });
    }
    
    
    const getProductList = async () => {
        try {
            setLoading(true);
            const productList = [];
            const snapshot = await get(ref(Rdb, 'product'));
            snapshot.forEach((childSnapshot) => {
                const product = childSnapshot.val();
                const { productName, quantity, productPrice, barcode } = product;
                if (productName && quantity && productPrice && barcode) {
                    productList.push({ productName, quantity, productPrice, barcode });
                }
            });
            // return productList;
            setProductList(productList);
            setProductListForPrint(productList);
            setLoading(false);
        } catch (error) {
            console.error("Error getting product list:", error);
            return [];
        }
    }

    const dateNow = (date) =>{
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    const timeNow = (date) =>{
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }

    const generateStock = () => {
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
                    width: 10%;
                    text-align: center;
                    border: 1px solid #aaa;
                }
                .productName{
                    width: 30%;
                    text-align: center;
                    border: 1px solid #aaa;
        
                }
                .productId{
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
                .thead{
                    background: #aaa;
                }
                .con{
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
                                productsForPrint.forEach((order, index) => {
                                    stockContent += `<div class="con">${index + 1}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="productId">
                                <div class="thead">
                                    Product Id
                                </div>
                                <div class="tbody">`;
                                productsForPrint.forEach((order, index) => {
                                    // Create a new <svg> element to render the barcode
                                    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                                
                                    // Set the barcode options
                                    JsBarcode(svg, order.barcode, {
                                        format: "CODE128", // or any other supported format
                                        width: 2,
                                        height: 20
                                    });
                                
                                    // Serialize the SVG element to a string
                                    const barcodeSVG = new XMLSerializer().serializeToString(svg);
                                
                                    // Append the SVG string to stockContent
                                    stockContent += `<div class="con">${barcodeSVG}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="productName">
                                <div class="thead">
                                    Product Name
                                </div>
                                <div class="tbody">`;
                                productsForPrint.forEach((order, index) => {
                                    stockContent += `<div class="con">${order.productName}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="qnt">
                                <div class="thead">
                                    Quantity
                                </div>
                                <div class="tbody">`;
                                productsForPrint.forEach((order, index) => {
                                    stockContent += `<div class="con">x${order.quantity}</div>`;
                                });
                                stockContent +=`
                                </div>
                            </div>
                            <div class="price">
                                <div class="thead">
                                    Price
                                </div>
                                <div class="tbody">`;
                                productsForPrint.forEach((order, index) => {
                                    stockContent += `<div class="con">₹${order.productPrice}</div>`;
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


    const printStock = () =>{
        const now = new Date();
        setCurrentDateTime(now);
        const stockContent = generateStock();
        const printWindow = window.open('', '_blank', 'width=1000,height=600');
        printWindow.document.write(stockContent)
        printWindow.document.close();
    }


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            // // setLoading(true);
            // handleSearch(); // Call handleOrders function
            // // handleGenerateBarcode();
            handleProduct(event);
            setLoading(true);
            // console.log(getProductList());
        }
    };

    const handleSearch = async () =>{
        try {
            const productList = [];
            const snapshot = await get(ref(Rdb, `product/${searchValue}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const { productName, quantity, productPrice, barcode } = data;
                if (productName && quantity && productPrice && barcode) {
                    productList.push({ productName, quantity, productPrice, barcode });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Ops..",
                    text: "No such product exists!"
                })
                // console.log("No such product exists!");
                // return null;
            }
            setProductList(productList);
            setLoading(false);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Ops..",
                text: "No such product exists!"
            })
            // console.error("Error getting product data:", error);
            // return null;
        }

        setSearchValue('')
    }
    const handleKeyPressSearch = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setLoading(true);
            handleSearch();
        }
    }

    // useEffect(() => {
    //     // Generate and set barcode image for each product after component render
    //     products.forEach((product, index) => {
    //         const barcodeElement = document.getElementById(`barcodeElement-${index}`);
    //         JsBarcode(barcodeElement, product.barcode, {
    //             format: "CODE128",
    //             displayValue: true,
    //             fontSize: 14,
    //             height: 40,
    //             width: 2
    //         });
    //     });
    // }, [products]);

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
        <div id='list' className='list'>
            <div className="innerList">
                <div className="headTimeDate">
                    <div className="dateText">Date: {dateNow(currentDateTime)}</div>
                    <div className="timeText">Time: {formattedHours < 10 ? '0' + formattedHours : formattedHours}:
                        {minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds} {ampm}
                    </div>
                </div>
                <form onSubmit={handleProduct}>
                    <input type="text" name="productName" id="productName" placeholder='Product Name' value={productName} onChange={handleProductName} onKeyPress={handleKeyPress}/>
                    <input type="text" name="productQnt" id="productQnt" placeholder='Product Qnt' value={productQnt} onChange={handleProductQtn} onKeyPress={handleKeyPress}/>
                    <input type="text" name="productPrice" id="productPrice" placeholder='Product Price' value={productPrice} onChange={handleProductPrice} onKeyPress={handleKeyPress}/>
                </form>
                <div className='searchInner'>
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
                            onKeyPress={handleKeyPressSearch}
                        />
                    </label>
                </div>
                <h2>Products</h2>
                <div className="displayField">
                    <table width="100%">
                        <thead>
                            <tr>
                                <th width="5%">SL No.</th>
                                <th>Product Id</th>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Price Per Items</th>
                                <th width="10%">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((order, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Barcode value={order.barcode} width={2} height={40}/>
                                        {/* {order.barcode} */}
                                    </td>
                                    <td>{order.productName}</td>
                                    <td>{order.quantity}</td>
                                    <td>₹{order.productPrice}</td>
                                    <td>
                                        <button className="buutonActionRemove" onClick={()=>handleRemoveProduct(order.barcode)}>Remove</button>
                                        <button className="buutonAction" onClick={()=>handleUpdateProduct(order.productName, order.quantity, order.productPrice, order.barcode)}>Edit Qnt</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="button">
                    <button onClick={() => printStock()}>Print Stock</button>
                </div>
            </div>
        </div>
    );
}

export default List;
