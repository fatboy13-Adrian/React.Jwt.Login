import {BrowserRouter as Router} from "react-router-dom";   //Routing
import {AuthProvider} from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";                 //App routes

export default function App() 
{
  return (
    <AuthProvider>                                                              {/*Auth context wrapper*/}
      <Router future={{v7_startTransition: true, v7_relativeSplatPath: true}}>  {/*Router setup*/}
        <AppRoutes />                                                           {/*Render routes*/}
      </Router>
    </AuthProvider>
  );
}