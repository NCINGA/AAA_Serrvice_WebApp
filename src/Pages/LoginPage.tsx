import React, { FC, useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import axios from "axios";
import { createApolloClient } from "../graphql/apploClient";
import "./login.css";

type Props = {
  state: (isAuth: boolean) => void;
  setClient?: (client: any) => void; // Optional prop for updating Apollo client
};

const LoginPage: FC<Props> = ({ state, setClient }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Input validation
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      // Login request
      const response = await axios.get("http://localhost:8080/auth/login", {
        params: {
          username: username,
          password: password,
        },
      });

      if (response.data) {
        // Store token
        await localStorage.setItem("jwtToken", response.data);

        // Create new Apollo client with updated token
        const newClient = createApolloClient();

        // Update Apollo client if setClient prop exists
        if (setClient) {
          setClient(newClient);
        }

        // Update auth state
        state(true);

        console.log("Login successful. Token:", response.data);
      } else {
        setError("Username or password is incorrect");
        state(false);
      }
    } catch (err: any) {
      console.error("Login failed:", err);

      // More specific error handling
      if (err.response) {
        // Server responded with an error
        setError(err.response.data?.message || "Invalid credentials");
      } else if (err.request) {
        // No response received
        setError("Unable to reach the server. Please check your connection.");
      } else {
        // Something else went wrong
        setError("An unexpected error occurred. Please try again.");
      }

      state(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" title="Welcome 3A Web Console">
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
          <div className="p-field">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              feedback={false}
            />
          </div>
          {error && (
            <div className="error-message">
              <i
                className="pi pi-exclamation-circle"
                style={{ marginRight: "8px" }}
              />
              <span>{error}</span>
            </div>
          )}
          <Button
            label={loading ? "Logging in..." : "Login"}
            className="p-button-rounded p-button-primary"
            onClick={handleLogin}
            disabled={loading}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            iconPos="right"
          />
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
