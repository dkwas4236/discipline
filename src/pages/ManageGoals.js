import React, { useState } from "react";

function ManageGoals({ user, chores, addChore, deleteChore }) {
  const [name, setName] = useState("");
  const [tokens, setTokens] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (name.trim() === "" || tokens === "") return;
    addChore(name.trim(), tokens);
    setName("");
    setTokens("");
  };

  const styles = {
    container: { padding: 20, maxWidth: 400, margin: "auto" },
    heading: { marginBottom: 20, textAlign: "center" },
    form: { marginBottom: 20, display: "flex", gap: 10 },
    input: { flex: 1, padding: 8, fontSize: 16 },
    button: { padding: "8px 16px", cursor: "pointer" },
    listItem: { marginBottom: 10, display: "flex", justifyContent: "space-between" },
    deleteButton: {
      marginLeft: 10,
      backgroundColor: "#e53e3e",
      color: "white",
      border: "none",
      padding: "4px 8px",
      cursor: "pointer",
    },
    backLink: {
      display: "block",
      marginTop: 30,
      textAlign: "center",
      color: "blue",
      textDecoration: "underline",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Manage Daily Goals</h1>

      <form onSubmit={handleAdd} style={styles.form}>
        <input
          type="text"
          placeholder="Goal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Tokens"
          value={tokens}
          onChange={(e) => setTokens(e.target.value)}
          required
          min={0}
          style={{ ...styles.input, maxWidth: 80 }}
        />
        <button type="submit" style={styles.button}>
          Add Goal
        </button>
      </form>

      <ul>
        {chores.length === 0 && <p>No goals yet.</p>}
        {chores.map((chore) => (
          <li key={chore.id} style={styles.listItem}>
            <span>
              {chore.name} — {chore.tokens} tokens
            </span>
            <button
              onClick={() => deleteChore(chore.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <a href="/" style={styles.backLink}>
        ← Back to Home
      </a>
    </div>
  );
}

export default ManageGoals;


