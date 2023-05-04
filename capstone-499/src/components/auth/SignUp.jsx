import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
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
        <div className="sign-in-container">
          <form onSubmit={signUp}>
            <h1>Create Account</h1>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button type="submit">Sign Up</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
