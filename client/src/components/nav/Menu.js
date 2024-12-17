import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useNavigate} from 'react-router-dom';

export default function Menu(){
  //hooks
  const [ auth, setAuth ] = useAuth();
  const navigate = useNavigate();

  const logout = () =>{
    setAuth({ ...auth, user: null, token: ""})
    localStorage.removeItem("auth");
    navigate('/login')
  }
    return <>

<ul className="nav d-flex justify-content-between shadow-lg mb-3">
  <li className="nav-item">
    <NavLink className="nav-link" aria-current="page" to="/">HOME</NavLink>
  </li>
  { !auth?.user ? ( // if you dont have user we show login links ? true: false
    <>
    <li className="nav-item">
      <NavLink className="nav-link" to="/login">LOGIN</NavLink>
    </li>
    <li className="nav-item">
      <NavLink className="nav-link" to="/register">REGISTER</NavLink>
    </li>
    </>
  ) : (
    <li className="nav-item pointer">
    <a onClick={logout} className="nav-link" >LOGOUT</a>
  </li>
  ) }
  
  
  
</ul>


    </>;
}