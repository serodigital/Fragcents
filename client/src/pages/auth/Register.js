import { useState } from "react";
import Jumbotron from "../../components/cards/Jumbotron";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
//state
  const[name, setName] = useState("Marolo");
  const[email, setEmail] = useState("Marolo@gmail.com");
  const[password, setPassword] = useState("Testing");
//hook
const [ auth, setAuth ] = useAuth();
const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
       const {data} = await axios.post(
        `${process.env.REACT_APP_API || "http://localhost:8000/api"}/register`, 
      {
        name,
        email,
        password
      });
      console.log(data);
      if(data?.error)
      {
          toast.error(data.error);
      }
      else{
        localStorage.setItem("auth",JSON.stringify(data)); // save auth in the local Storage
        setAuth({...auth,token: data.token, user: data.user});
        toast.success("Registration successful");
        navigate("/dashboard");
      }

    }
    catch(err){
        console.log(err);
        toast.error("Registration failed. Try again")
    }
  }
    return (
      <div>
        <Jumbotron title="Register"/>
        
        <div className="container mt-5">
          <div className="row">
              <div className="col-md-6 offset-md-3">
                <form onSubmit={handleSubmit}>
                <input type="text" 
                className="form-control mb-4 p-2" 
                placeholder="Enter you name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus/>

                <input type="email" 
                className="form-control mb-4 p-2" 
                placeholder="Enter you email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus/>

                <input type="password" 
                className="form-control mb-4 p-2" 
                placeholder="Enter you password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus/>

                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
                </form>
              </div>
          </div>
        </div>
      </div>
    );
  }
  