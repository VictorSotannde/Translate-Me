import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { useNavigate} from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async(e) => {
    
    e.preventDefault();
    
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
       
      })
      .catch((error) => {
        console.log(error);
      
      });
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
        <button onClick={()=>navigate("/sign")}>Sign Up</button>
        
      </form>

     

     
      

                    

    </div>
    </section>
    </main> 
    
  );
};

export default SignUp;