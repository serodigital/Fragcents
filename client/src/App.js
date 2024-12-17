import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import Menu from './components/nav/Menu';
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/user/dashboard";

export default function App() {
  return (
    <BrowserRouter>
    <Menu/>
    <Toaster/>
      <Routes>
        <Route path ="/" element={<Home />}/>
        <Route path ="/login" element={<Login />}/>
        <Route path ="/register" element={<Register />}/>
        <Route path = "/dashboard" element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
  );
}
