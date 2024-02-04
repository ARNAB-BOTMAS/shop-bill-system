import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import Swal from 'sweetalert2';
import { PuffLoader } from 'react-spinners';
import { css } from '@emotion/react';

const override = css`
  display:block;
  margin: 0 auto;
  height: '5px';
  border-color: red;
`;

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegistration = async (e) =>{
        e.preventDefault();
        setLoading(true);

        const { email, password } = formData;

        await signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                setLoading(false);

                localStorage.setItem('reloadDashboard', 'true');
                navigate("/dashboard");
            })
            .catch((err) =>{
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Ops..",
                    text: "Fail to login"
            })
        })
    }
    

    return (
        <div className="container">
            <div className="innerContainer">
                <h1>Registration</h1>
                <form onSubmit={handleRegistration}>
                    
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder='Email'/>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password"/>
                    <button type="submit">Log In</button>
                </form>
                <div>
                    <span onClick={() => navigate('/register')}>You are not an Employee?</span><span onClick={() => navigate(-1)}> Go Back</span>
                </div>
            </div>
            {loading && ( // Display loading indicator if loading is true
                <div className='loading'>
                    <PuffLoader css={override} size={88} color={'#fff'} loading={loading} />
                </div>
            )}
        </div>
    );
}

export default Login;
