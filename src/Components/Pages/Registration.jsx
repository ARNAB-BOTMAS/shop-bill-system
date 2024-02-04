import React, { useState } from 'react';
import '../sass/register.scss';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../firebase'; // Import the Firebase auth instance
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { PuffLoader } from 'react-spinners';
import { css } from '@emotion/react';

const override = css`
  display:block;
  margin: 0 auto;
  height: '5px';
  border-color: red;
`;

const Registration = () => {
    const navigate = useNavigate();
    /* const [employeeID, setEmployeeID] = useState(''); */
    const [loading, setLoading] = useState(false);
    /* setLoading(true); */
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        conPassword: '',
        image: null
    });

    const generateEmployeeID = () => {
        const prefix = 'EMP';
        const randomNumber = Math.floor(Math.random() * 900000) + 100000; // Generate a random 6-digit number
        const newEmployeeID = `${prefix}${randomNumber}`;
        /* setEmployeeID(newEmployeeID); */
        return newEmployeeID;
      };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);
        const employeeID = generateEmployeeID();
        const { displayName, email, password, conPassword, image } = formData;

        if (password !== conPassword) {
            Swal.fire({
                icon: 'error',
                title: "Ops...",
                text: "Password not match"
            })
            return;
        }

        try {

            // Create user with email and password
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const storageRef = ref(storage, res.user.uid);

            // Optionally, update the user profile with additional information like displayName
            await uploadBytesResumable(storageRef, image).then(() => {
                getDownloadURL(storageRef).then(async (downloadURL) => {
                    await updateProfile(res.user, {
                        displayName,
                        photoURL: downloadURL,
                      });
          
                      // Create user on firestore
                      await setDoc(doc(db, 'users', res.user.uid), {
                        uid: res.user.uid,
                        displayName,
                        email,
                        photoURL: downloadURL,
                        empID: employeeID,
                      });
                      await setDoc(doc(db, 'orders', res.user.uid), {}).then(()=>{
                        setLoading(false);
                        localStorage.setItem('reloadDashboard', 'true');
                        navigate('/dashboard');
                      });
                })
            })
        } catch (error) {
            setLoading(false);
            // console.error('Error registering user:', error.message);
            Swal.fire({
                icon: 'error',
                title: "Ops...",
                text: `Failed to sign up`
            })
            // Handle error (e.g., display error message to user)
        }
    };

    return (
        <div className="container">
            <div className="innerContainer">
                <h1>Registration</h1>
                <form onSubmit={handleRegistration}>
                    <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="Username"/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder='Email'/>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password"/>
                    <input type="password" name="conPassword" value={formData.conPassword} onChange={handleChange} placeholder="Confirm Password"/>
                    <label htmlFor="image">
                        <div className="imageFile">
                            <div className='addImage'><i className="fa-solid fa-file-circle-plus"></i></div>
                            <div className='addText'>Add Image</div>
                        </div>
                        <input type="file" accept="image/*" name="image" id="image" style={{display: 'none'}} onChange={handleImageChange}/>
                    </label>
                    <button type="submit">login</button>
                </form>
                <div>
                    <span onClick={() => navigate('/login')}>You are an Employee?</span><span onClick={() => navigate(-1)}> Go Back</span>
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

export default Registration;
