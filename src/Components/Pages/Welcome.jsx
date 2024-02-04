import React, { useContext, useEffect } from 'react';
import '../sass/welcome.scss';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const Welcome = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    useEffect(() =>{
        if (currentUser) {
            navigate('/dashboard');
        }
        return () =>{
            
        }
    },[currentUser, navigate])

    return (
        <div className='welcome'>
            <div className="innerWelcome">
                <div className="headertext">Welcome</div>
                <div className="buttonContainer">
                    <button onClick={() => navigate("/login")}>Login</button>
                    <button onClick={() => navigate("/register")}>Registration</button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
