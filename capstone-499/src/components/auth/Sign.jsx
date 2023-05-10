import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../App.css';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const signIn = (e) => {
    e.preventDefault();
    console.log("Attempting to sign in...");
    setIsSubmitting(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/dictionary");
      })
      .catch((error) => {
        console.log(error);
        if (error.code === "auth/user-not-found") {
          alert("There is no user record corresponding to this email address. Please check your email or sign up for a new account.");
        } else {
          alert("An error occurred while signing in. Please try again.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="sign-in-container">
      <form className="sign-in-form" onSubmit={signIn}>
        <h1>Log In to your Account</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
        <div className="create-account">
          <p>Don't have an account?</p>
          <Link to="/signup">
            <button type="button">Create Account</button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
