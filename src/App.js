import Welcome from "./Components/Pages/Welcome";
import Login from "./Components/Pages/Login";
import Registration from "./Components/Pages/Registration";
import Dashboard from "./Components/Pages/Dashboard"; // Assuming Dashboard is located in Main.js
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

function App() {
  const {currentUser} = useContext(AuthContext);
  
  const ProtectedRoute = ({children}) => {
    if (!currentUser) {
      return <Navigate to="/"/>;
    }
    return children;
  };
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Welcome />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Registration />} />
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
