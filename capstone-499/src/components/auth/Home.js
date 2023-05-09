import React from 'react';
import { Link } from 'react-router-dom';
import '../../Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="frame-parent5">
        <div className="image-2-group">
          <img className="image-2-icon1" alt="" src="/image-21@2x.png" />
          <div className="translate-me1">Translate Me!</div>
        </div>
        <div className="login-into-the-dictionary-data-wrapper">
          <button className="login-into-the">
          <Link to="/login">
            Login into the Dictionary Database
            </Link>
          </button>
        </div>
      </div>
      <div className="frame-parent6">
        <div className="frame-child2" />
        <div className="darklight-option1">
          <div className="darklight-option-inner" />
          <div className="dark1">Dark</div>
          <img className="group-icon" alt="" src="/group-31.svg" />
        </div>
      </div>
      <div className="home-inner">
        <div className="this-is-our-translate-me-webpa-group">
          <div className="this-is-our1">This is our Translate Me Webpage!</div>
          <div className="this-is-our1"> Terms of Use</div>
          <div className="this-is-our1">Privacy Policy</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
