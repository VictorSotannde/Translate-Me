import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from '../../firebase';
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import '../../Profile.css';
import { Link } from "react-router-dom";

function Profile() {
    const user = auth.currentUser;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Inside the Profile component
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [dob, setDob] = useState("");
    const navigate = useNavigate();


    // Add this function inside the Profile component
    const handleChangePassword = async () => {
        if (newPassword === confirmPassword) {
            try {
                await user.updatePassword(newPassword);
                alert('Password changed successfully');
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        } else {
            alert('New password and confirmation do not match');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDob(docSnap.data().dob);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.log("Error fetching date of birth:", error);
            }
        };

        fetchData();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (error) {
            console.log("Error signing out:", error);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1 className="profile-title"><p>{user?.displayName}</p></h1>
                <p className="profile-info">Email: {user?.email}</p>
                <p>Date of Birth: {dob}</p>
                <p className="profile-info">Password: ******</p>
                <button
                    className="change-password-button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                    Change Password
                </button>
                {showPasswordForm && (
                    <div className="password-form">
                        <input
                            className="password-input"
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            className="password-input"
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            className="submit-password-button"
                            onClick={handleChangePassword}
                        >
                            Submit
                        </button>
                    </div>
                )}
                {/* <Link to="/dictionary">
                    <button type="button">Go back to Dictionary Page</button>
                </Link> */}
                <Link to="/dictionary">
                    <button type="button" className="dictionary-button">
                        Go back to Dictionary Page
                    </button>
                </Link>
                <button className="sign-out-button" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>
        </div>
    );


}

export default Profile;