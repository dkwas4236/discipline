// src/App.js
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./components/Login";
import TokenBalance from "./components/TokenBalance";
import TaskList from "./components/TaskList";
import RewardList from "./components/RewardList";

function App() {
  const [user, setUser] = useState(null);
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);

  async function ensureUserDocExists(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, { tokenBalance: 0 });
    }
  }

  async function loadTokenBalance(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      setTokenBalance(data.tokenBalance || 0);
    }
  }

  // Load user state
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
  console.log("User UID:", user?.uid);

  // 🔄 Load chores from Firestore
  const loadChores = async (uid) => {
    setLoading(true);
    const choresRef = collection(db, "users", uid, "chores");
    const snapshot = await getDocs(choresRef);
    const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setChores(loaded);
    setLoading(false);
  };

  // ✅ Add a new chore
  const addChore = async (name, tokens) => {
    if (!user) return;
    const newChore = { name, tokens: Number(tokens), completed: false };
    const choresRef = collection(db, "users", user.uid, "chores");
    const docRef = await addDoc(choresRef, newChore);
    setChores(prev => [...prev, { id: docRef.id, ...newChore }]);
  };

  // ☑️ Mark a chore complete
  const completeChore = async (id) => {
    // Find chore tokens
    const chore = chores.find(c => c.id === id);
    if (!chore || chore.completed) return;

    const choreRef = doc(db, "users", user.uid, "chores", id);
    const userDocRef = doc(db, "users", user.uid);

    // Update chore as completed
    await updateDoc(choreRef, { completed: true });

    // Increase user's token balance
    await updateDoc(userDocRef, {
      tokenBalance: tokenBalance + chore.tokens
    });

    // Update lo
  }
}
