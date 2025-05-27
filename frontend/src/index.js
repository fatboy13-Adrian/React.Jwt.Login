import React from 'react';                //Import React core
import ReactDOM from 'react-dom/client';  //Import ReactDOM for rendering
import './index.css';                     //Import global CSS
import App from './App';                  //Import root App component

const root = ReactDOM.createRoot(document.getElementById('root'));  //Get root DOM node and create React root
root.render(
  <React.StrictMode>                                                //Enable React strict mode for highlighting potential issues
    <App />                                                         //Render the App component
  </React.StrictMode>
);