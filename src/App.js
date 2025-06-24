import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./components/Login";
import TokenBalance from "./components/TokenBalance";
import TaskList from "./components/TaskList";
import ManageGoals from "./pages/ManageGoals";
import Shop from "./pages/Shop";

function Home({ user, chores, tokenBalance, completeChore }) {
  const styles = {
    container: { padding: 20, maxWidth: 600, margin: "auto" },
    header: { marginBottom: 20 },
    button: { marginTop: 20, padding: "10px 20px", cursor: "pointer" },
    logoutButton: { padding: "8px 16px", cursor: "pointer", marginBottom: 20 }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome, {user.email}</h1>
      <button style={styles.logoutButton} onClick={() => signOut(auth)}>
        Log Out
      </button>

      <TokenBalance balance={tokenBalance} />
      <TaskList tasks={chores} onComplete={completeChore} />

      <Link to="/goals">
        <button style={styles.button}>Manage Daily Goals</button>
      </Link>
      <Link to="/shop">
        <button style={{ marginTop: 20, marginLeft: 10 }}>Visit Shop</button>
      </Link>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Ensure user doc exists in Firestore
  async function ensureUserDocExists(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, { tokenBalance: 0 });
    }
  }

  // Load token balance
  async function loadTokenBalance(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      setTokenBalance(data.tokenBalance || 0);
    }
  }

  // Load chores/goals
  const loadChores = async (uid) => {
    setLoading(true);
    const choresRef = collection(db, "users", uid, "chores");
    const snapshot = await getDocs(choresRef);
    const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setChores(loaded);
    setLoading(false);
  };

  // Add a goal/chore
  const addChore = async (name, tokens) => {
    if (!user) return;
    const newChore = { name, tokens: Number(tokens), completed: false };
    const choresRef = collection(db, "users", user.uid, "chores");
    const docRef = await addDoc(choresRef, newChore);
    setChores((prev) => [...prev, { id: docRef.id, ...newChore }]);
  };

  // Delete a chore/goal
  const deleteChore = async (id) => {
    const choreRef = doc(db, "users", user.uid, "chores", id);
    await deleteDoc(choreRef);
    setChores((prev) => prev.filter((chore) => chore.id !== id));
  };

  // Complete a chore
  const completeChore = async (id) => {
    const chore = chores.find((c) => c.id === id);
    if (!chore || chore.completed) return;

    const choreRef = doc(db, "users", user.uid, "chores", id);
    const userDocRef = doc(db, "users", user.uid);

    await updateDoc(choreRef, { completed: true });
    await updateDoc(userDocRef, {
      tokenBalance: tokenBalance + chore.tokens,
    });

    setChores((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, completed: true } : ch))
    );
    setTokenBalance((prev) => prev + chore.tokens);
  };

  // Reset chores daily at midnight
  useEffect(() => {
    if (!user || chores.length === 0) return;

    const now = new Date();
    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();

    const timeout = setTimeout(async () => {
      const updatedChores = chores.map((ch) => ({ ...ch, completed: false }));
      for (const ch of updatedChores) {
        const choreRef = doc(db, "users", user.uid, "chores", ch.id);
        await updateDoc(choreRef, { completed: false });
      }
      setChores(updatedChores);
    }, millisTillMidnight);

    return () => clearTimeout(timeout);
  }, [chores, user]);

  // Load user & chores on auth change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await ensureUserDocExists(currentUser.uid);
        await loadChores(currentUser.uid);
        await loadTokenBalance(currentUser.uid);
      } else {
        setUser(null);
        setChores([]);
      }
    });
    return unsubscribe;
  }, []);

  if (!user) return <Login onLogin={() => {}} />;
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              user={user}
              chores={chores}
              tokenBalance={tokenBalance}
              completeChore={completeChore}
            />
          }
        />
        <Route
          path="/goals"
          element={
            <ManageGoals
              user={user}
              chores={chores}
              addChore={addChore}
              deleteChore={deleteChore}
            />
          }
        />
        <Route
          path="/shop"
          element={
            <Shop
              user={user}
              tokenBalance={tokenBalance}
              setTokenBalance={setTokenBalance}
          />
        }
      />
      </Routes>
    </Router>
  );
}

export default App;


