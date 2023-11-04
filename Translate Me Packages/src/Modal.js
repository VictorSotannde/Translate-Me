import React from 'react';
import './App.css';

const Modal = ({ children, onClose }) => (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={onClose}>
        &times;
      </span>
      {children}
    </div>
  </div>
);

export default Modal;
