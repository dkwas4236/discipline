import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // Notify parent of successful login
    } catch (err) {
      setError(err.message);
    }
  };

  const styles = {
    container: { maxWidth: 320, margin: "auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 },
    input: { width: "100%", marginBottom: 10, padding: 8, fontSize: 16 },
    button: { width: "100%", padding: 10, cursor: "pointer" },
    error: { color: "red", marginBottom: 10, textAlign: "center" },
    toggleText: { marginTop: 10, cursor: "pointer", color: "blue", textAlign: "center", userSelect: "none" }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        {isNewUser ? "Sign Up" : "Log In"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          {isNewUser ? "Sign Up" : "Log In"}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p
        style={styles.toggleText}
        onClick={() => setIsNewUser(!isNewUser)}
        role="button"
        tabIndex={0}
        onKeyPress={() => setIsNewUser(!isNewUser)}
      >
        {isNewUser ? "Already have an account? Log In" : "New user? Sign Up"}
      </p>
    </div>
  );
}

export default Login;

