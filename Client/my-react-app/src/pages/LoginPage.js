const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:8000/api/login", formData);
  
      if (data.token) {
        setAuth({
          user: {
            name: data.user.name,
            email: data.user.email,
            role: data.user.role, // Store role
          },
          token: data.token,
        });
        localStorage.setItem("auth", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed");
    }
  };
  