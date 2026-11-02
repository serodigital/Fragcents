import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/Auth";

const UserDatabaseTest = () => {
  const { auth, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [role, setRole] = useState("");

  useEffect(() => {
    const loadUserFromDatabase = async () => {
      try {
        if (authLoading) {
          return;
        }

        setLoading(true);
        setError("");

        console.log("=================================");
        console.log("USER DATABASE TEST");
        console.log("AUTH OBJECT:");
        console.log(auth);
        console.log("USER OBJECT:");
        console.log(auth?.user);
        console.log("=================================");

        /*
         * MongoDB normally uses _id.
         *
         * We also check id in case your login code
         * stored the ID under that name.
         */
        const userId =
          auth?.user?._id ||
          auth?.user?.id;

        console.log("USER ID FOUND:", userId);

        if (!auth?.token) {
          setError("Authentication token is missing.");
          setLoading(false);
          return;
        }

        if (!userId) {
          setError(
            "User is logged in, but the user ID is missing from the authentication data."
          );
          setLoading(false);
          return;
        }

        console.log("=================================");
        console.log("LOADING USER FROM DATABASE");
        console.log("USER ID:", userId);
        console.log("=================================");

        const response = await axios.get(
          `http://localhost:8000/api/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        console.log("=================================");
        console.log("DATABASE USER RESPONSE");
        console.log(response.data);
        console.log("=================================");

        const databaseUser = response.data?.user;

        if (!databaseUser) {
          setError("User was not returned from the database.");
          setLoading(false);
          return;
        }

        // -----------------------------
        // USER INFORMATION
        // -----------------------------

        setName(databaseUser.name || "");
        setEmail(databaseUser.email || "");
        setPhone(databaseUser.phone || "");

        setRole(
          databaseUser.role !== undefined
            ? databaseUser.role
            : ""
        );

        // -----------------------------
        // ADDRESS INFORMATION
        // -----------------------------

        if (typeof databaseUser.address === "string") {
          setStreet(databaseUser.address);
          setCity("");
          setProvince("");
          setPostalCode("");
          setCountry("");
        } else {
          const savedAddress = databaseUser.address || {};

          setStreet(savedAddress.street || "");
          setCity(savedAddress.city || "");
          setProvince(savedAddress.province || "");
          setPostalCode(savedAddress.postalCode || "");
          setCountry(savedAddress.country || "");
        }

        setLoading(false);

      } catch (err) {
        console.error("=================================");
        console.error("ERROR LOADING USER");
        console.error(err);
        console.error("SERVER RESPONSE:");
        console.error(err.response?.data);
        console.error("=================================");

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not load user information."
        );

        setLoading(false);
      }
    };

    loadUserFromDatabase();

  }, [auth, authLoading]);

  // -----------------------------
  // AUTHENTICATION LOADING
  // -----------------------------

  if (authLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          Checking logged-in user...
        </div>
      </div>
    );
  }

  // -----------------------------
  // DATABASE LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          Loading user information from the database...
        </div>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (error) {
    return (
      <div className="container py-5">

        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>

        <div className="card mt-3">
          <div className="card-body">

            <h5>Authentication Debug Information</h5>

            <p>
              <strong>Token:</strong>{" "}
              {auth?.token ? "Found" : "Missing"}
            </p>

            <p>
              <strong>User:</strong>{" "}
              {auth?.user ? "Found" : "Missing"}
            </p>

            <p>
              <strong>_id:</strong>{" "}
              {auth?.user?._id || "Missing"}
            </p>

            <p>
              <strong>id:</strong>{" "}
              {auth?.user?.id || "Missing"}
            </p>

          </div>
        </div>

      </div>
    );
  }

  // -----------------------------
  // DISPLAY DATABASE USER
  // -----------------------------

  return (
    <div className="container py-5">

      <div className="mb-4">

        <h2 className="fw-bold">
          User Database Test
        </h2>

        <p className="text-muted">
          These fields are populated directly from
          the logged-in user's MongoDB document.
        </p>

      </div>

      {/* USER INFORMATION */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h5 className="mb-0">
            Customer Information
          </h5>
        </div>

        <div className="card-body">

          <div className="mb-3">
            <label className="form-label fw-bold">
              Name
            </label>

            <input
              type="text"
              className="form-control"
              value={name}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              value={email}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Phone
            </label>

            <input
              type="text"
              className="form-control"
              value={phone}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Role
            </label>

            <input
              type="text"
              className="form-control"
              value={role}
              readOnly
            />
          </div>

        </div>
      </div>

      {/* ADDRESS INFORMATION */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h5 className="mb-0">
            Address Information
          </h5>
        </div>

        <div className="card-body">

          <div className="mb-3">
            <label className="form-label fw-bold">
              Street
            </label>

            <input
              type="text"
              className="form-control"
              value={street}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              City
            </label>

            <input
              type="text"
              className="form-control"
              value={city}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Province
            </label>

            <input
              type="text"
              className="form-control"
              value={province}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Postal Code
            </label>

            <input
              type="text"
              className="form-control"
              value={postalCode}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Country
            </label>

            <input
              type="text"
              className="form-control"
              value={country}
              readOnly
            />
          </div>

        </div>
      </div>

      {/* SUCCESS */}

      <div className="alert alert-success">

        <strong>
          Database connection successful.
        </strong>

        <br />

        The information above was retrieved from
        your MongoDB user document.

      </div>

    </div>
  );
};

export default UserDatabaseTest;