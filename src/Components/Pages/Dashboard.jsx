import React, { useEffect, useState } from 'react';
import '../sass/dashboard.scss';
import '../sass/main.scss';

import Home from '../Assets/Home';
import Order from '../Assets/Order';
import Search from '../Assets/Search';
import List from '../Assets/List';
import { ClipLoader } from 'react-spinners';
import { css } from '@emotion/react';
// import { useNavigate } from 'react-router-dom';

const override = css`
  display:block;
  margin: 0 auto;
  height: '5px';
  border-color: red;
`;

const Main = () => {
    const [isActive, setIsActive] = useState(false);
    const [isDash, setDash] = useState(true);
    const [isOrder, setOrder] = useState(false);
    const [isSearch, setSeache] = useState(false);
    const [isList, setList] = useState(false);
    const [loading, setLoading] = useState(false);
    /* const [reload, setReload] = useState(true) */
    // const navigate = useNavigate();
    /* window.location.reload(); */
    console.clear();
    const [shouldReload, setShouldReload] = useState(false);

    useEffect(() => {
        // Check if the flag is set in localStorage
        if (localStorage.getItem('reloadDashboard')) {
            // Remove the flag from localStorage
            localStorage.removeItem('reloadDashboard');
            // Set shouldReload to true to trigger a reload
            setShouldReload(true);
        }
    }, []);

    useEffect(() => {
        // Reload the dashboard if shouldReload is true
        if (shouldReload) {
            window.location.reload();
        }
    }, [shouldReload]);

    const handelSet = (id) => {
        // navigate(`/dashboard#${id}`)
        setDash(id === "dash");
        setOrder(id === "order");
        setSeache(id === "search");
        setList(id === "list");
    };
    

    const handleHamburgerClick = () => {
        setIsActive(!isActive);
    };
    return (
        <div className='dashboardContainer'>
            <div className="innerDashboard">
                <div className={`navbar  ${isActive ? 'show' : ''}`}>
                    {/* <div className='button' onClick={handleHamburgerClick}>{isActive ? ("") : (<i class="fa-solid fa-bars"></i>)}</div> */}
                    <div className="openClose">
                        <div className={`open ${isActive ? "closeopen" : ""}`} onClick={handleHamburgerClick}><i className="fa-solid fa-bars"></i></div>
                        <div className={`close ${isActive ? "" : "openclose"}`} onClick={handleHamburgerClick}><i className="fa-solid fa-xmark"></i></div>
                    </div>
                    {/* <h1>navbar</h1> */}
                    {/* <li><i class="fa-solid fa-house"></i>Dashboard</li>
                    <li><i class="fa-solid fa-cart-shopping"></i></li> */}
                    <div className='contentDash'>
                        <div className="innerContentDash">
                            <div className={`li ${isDash ? 'active' : '' }`} onClick={() => handelSet('dash')}><span className="icon"><i className="fa-solid fa-house"></i></span> <span className="text">Dashboard</span></div>
                            <div className={`li ${isOrder ? 'active' : '' }`} onClick={() => handelSet('order')}><span className="icon"><i className="fa-solid fa-cart-plus"></i></span> <span className="text">Orders</span></div>
                            <div className={`li ${isSearch ? 'active' : '' }`} onClick={() => handelSet('search')}><span className="icon"><i className="fa-solid fa-magnifying-glass"></i></span> <span className="text">Search</span></div>
                            <div className={`li ${isList ? 'active' : '' }`} onClick={() => handelSet('list')}><span className="icon"><i className="fa-solid fa-arrow-down-short-wide"></i></span> <span className="text">List</span></div>
                        </div>
                        
                    </div>
                </div>
                <div className="functionWindow">
                    {isDash ? (<Home setLoading={setLoading} />) : ('')}
                    {isOrder ? (<Order setLoading={setLoading} />) : ('')}
                    {isSearch ? (<Search setLoading={setLoading} />) : ('')}
                    {isList ? (<List setLoading={setLoading} />) : ('')}
                </div>
            </div>
            {loading && ( // Display loading indicator if loading is true
                <div className='loading'>
                    <ClipLoader css={override} size={88} color={'#FFBB5C'} loading={loading} />
                </div>
            )}
        </div>
    );
}

export default Main;
