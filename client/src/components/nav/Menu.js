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

{/* <li className="nav-item">
    <NavLink className="nav-link" aria-current="page" to="/dashboard/secret">SECRET</NavLink>
  </li> */}

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
    <div className="dropdown">

         <li>
          <a 
            className="nav-link pointer dropdown-toggle" 
            data-bs-toggle="dropdown"
          >
              {auth?.user?.name}
          </a>

          <ul className="dropdown-menu">
            <li>
                <NavLink className="nav-link" to={`/dashboard/${
                  auth?.user?.role === 1 ? "admmin" : "user"
                  }`}
                >
                  Dashboard
                </NavLink>
            </li>
            <li className="nav-item pointer">
                <a onClick={logout} className="nav-link" >
                  Logout
                </a>
            </li>
          </ul>

          </li> 
        </div>
  ) }
  
  
  
</ul>


    </>;
}