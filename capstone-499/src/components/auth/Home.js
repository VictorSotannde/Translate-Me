import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

const Home = () => {
    // Add your event handling and state management logic here

    return (
        <div>
            <div id="border-top">
                <h1> Translate Me </h1>
                <p style={{ fontStyle: "italic", fontSize: "small" }}> "in your own way"</p>
                <div id="border-border">
                    <div id="navmenu">
                        <ul className="navbar-nav ms-auto">
                            <button style={{ border: "radius 25%" }}><Link to="/signup">Sign Up</Link></button>
                            <button><Link to="/login">Log In</Link></button>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="main-holder">
                <h1> Translate for FREE </h1>
                <p style={{ color: "navy", fontFamily: "Copperplate" }}> The world has such a diverse language, the information may be hard to interpret in another region that may have similar language.
                    To allow every language and slang to be accepted.
                    Translate Me allows you to translate into your own unique language with just one click !
                </p>
                <div id="center" className="column">
                    <h5>College Education</h5>
                    <h5>University of Albany</h5>
                    <p>May 2019-May 2023</p>
                    <p>Bachelor Of Science</p>
                    <p> Computer Science</p>
                </div>

                <div id="left" className="column">
                    <p style={{ color: "red", fontFamily: "Copperplate" }}> This document contains a sample resume, with my previous education experience. These qualifications make me eligible to get a job as a mobile developer, software engineer, IT technician, or many more opportunities that are tech-related. </p>
                </div>

                <div id="right" className="column">
                    <h5>High School Education</h5>
                    <h5>Benjamin N. Cardozo</h5>
                    <p>May 2015-May 2019</p>
                    <p>Honor Roll Student</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
