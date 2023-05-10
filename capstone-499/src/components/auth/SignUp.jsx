import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../App.css';

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  const signUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Update the user profile with additional information
      await updateProfile(userCredential.user, {
        displayName: name,
        // Add any other custom properties here
      });
      // Store date of birth in Firestore
      await setDoc(doc(collection(db, "users"), userCredential.user.uid), {
        dob: dob,
      });
      console.log(userCredential);
      alert("Account created successfully. You can now log in.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      alert("An error occurred while creating your account. Please try again.");
    }
  };

  return (
    <main>
      <section>
        <div className="sign-up-container">
          <form className="sign-up-form" onSubmit={signUp}>
            <h1>Create Account</h1>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="date-input-container">
              <input
                type="date"
                id="dob-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Sign Up</button>
            <div className="log-in">
              <p>Already have an account?</p>
              <Link to="/login">
                <button type="button">Log In</button>
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};
export default SignUp;
