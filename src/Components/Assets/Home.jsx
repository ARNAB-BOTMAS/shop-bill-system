import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import profile from '../image/profile.jpg'
import { collection, getDocs } from 'firebase/firestore';
import { orderBy } from 'lodash';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { currentUser, userData } = useContext(UserContext);
    // const [searchResults, setSearchResults] = useState([]);
    const [totalPrice,  setTotalPrice] = useState(0);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [totalOrders, setTotalOrders] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const navigate = useNavigate();

    // console.log(userData);
    useEffect(() => {
        const intervalID = setInterval(() => {
          setCurrentDateTime(new Date());
        }, 1000);
    
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalID);
      }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // setLoading(true);
                const ordersRef = collection(db, "orders");
                const userOrdersRef = collection(ordersRef, currentUser.uid, "order");
        
                const querySnapshot = await getDocs(userOrdersRef);
                const data = [];
                let total = 0;
    
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() });
                });
    
                const now = new Date();
                const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                const sortedOrders = orderBy(data, ['date', 'time'], ['desc', 'desc']);
                
                if(sortedOrders.length > 0 && sortedOrders[0].date === formattedDate){
                    setCurrentOrder(sortedOrders[0]);
                    setCurrentPrice(currentOrder.totalPrice);
                } else {
                    setCurrentOrder([]);
                }
    
                let counts = 0;
                sortedOrders.forEach((count) => {
                    if(formattedDate === count.date){
                        counts++;
                        total += Number(count.totalPrice);
                    }
                });
    
                setTotalOrders(counts);
                setTotalPrice(total);
            } catch (error) {
                console.error("Error fetching data:", error);
                // Handle error, maybe set an error state or display an error message.
            }
        };
    
        fetchData();
    }, [currentOrder.totalPrice, currentUser.uid]);

    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const seconds = currentDateTime.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    
    

    const dateNow = (date) =>{
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    const logOut = () =>{
        signOut(auth)
        navigate("/");
    };
    return (
        <div  className="home" id='dash'>
            <div className="innerHome">
                <div className="topText">
                    <din className="innerTopText">
                        <img src={userData.photoURL ? userData.photoURL : profile} alt="" />
                        <div className="texts">
                            <div className="nameText">{userData.displayName ? userData.displayName : "Loading..."}</div>
                            <div className="empText">{userData.empID ? userData.empID : "Loading..."}</div>
                            <div className="dateText">Date: {dateNow(currentDateTime)}</div>
                        </div>
                    </din>
                    <div className="logout" onClick={() => logOut()}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </div>
                </div>
                
                <div className="boxs">
                    <div className="innerBoxs">
                        <div className="box">
                            <div className="totalNumber">Total Orders</div>
                            <div className="prices">{totalOrders ? totalOrders : "0"}</div>
                        </div>
                        <div className="box">
                            <div className="totalNumber">Current Order</div>
                            <div className="prices">₹{currentPrice ? currentPrice : '0'}</div>
                        </div>
                        <div className="box">
                            <div className="totalNumber">Total Sells</div>
                            <div className="prices">₹{totalPrice ? totalPrice: "0"}</div>                           
                        </div>
                    </div>
                </div>

                <div className="headTimeDate">
                    <div className="timeText">{formattedHours < 10 ? '0' + formattedHours : formattedHours}:
                        {minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds} {ampm}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
