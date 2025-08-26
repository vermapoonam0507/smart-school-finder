import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  //import after npm run dev 
import App from './App.jsx';
import './index.css';
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render( 
  <React.StrictMode>
    <BrowserRouter>   {/*//add this line */}
     <AuthProvider> {/* <-- Wrap your App */}
      <App />
      </AuthProvider>
    </BrowserRouter> {/*//add this line */}
  </React.StrictMode>,
);
