import React from 'react';
import './App.css';
import Dictionary from './components/auth/Dictionary';
import Home from './components/auth/Home';
import SignIn from './components/auth/Sign';
import SignUp from './components/auth/SignUp';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dictionary" element={<Dictionary />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
