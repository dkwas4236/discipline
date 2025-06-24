// src/pages/Shop.js
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

function Shop({ user, tokenBalance, setTokenBalance }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardCost, setNewRewardCost] = useState("");
  const [newRewardDesc, setNewRewardDesc] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Load rewards and listen for updates in real-time
  useEffect(() => {
    const rewardsRef = collection(db, "rewards");
    const q = query(rewardsRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRewards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRewards(loadedRewards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load notifications addressed to current user (optional)
  useEffect(() => {
    if (!user) return;
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, 
                    // only last 10 notifications or similar
                    orderBy("timestamp", "desc"), 
                    limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(n => n.recipientId === user.uid);
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  // Redeem a reward
  const redeemReward = async (reward) => {
    setError("");
    if (tokenBalance < reward.cost) {
      setError("Not enough tokens to redeem this reward.");
      return;
    }
    if (reward.creatorId === user.uid) {
      setError("You cannot redeem your own reward.");
      return;
    }

    try {
      // Deduct tokens from user doc
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        tokenBalance: tokenBalance - reward.cost,
      });
      setTokenBalance(tokenBalance - reward.cost);

      alert(`You redeemed: ${reward.name}`);

      // Notify the reward creator
      const notificationsRef = collection(db, "notifications");
      await addDoc(notificationsRef, {
        recipientId: reward.creatorId,
        message: `${user.email} redeemed your reward: ${reward.name}`,
        timestamp: new Date(),
      });
    } catch (e) {
      setError("Failed to redeem reward.");
      console.error(e);
    }
  };

  // Add new reward
  const addReward = async (e) => {
    e.preventDefault();
    setError("");
    if (newRewardName.trim() === "" || newRewardCost === "") return;

    const costNum = Number(newRewardCost);
    if (isNaN(costNum) || costNum <= 0) {
      setError("Cost must be a positive number.");
      return;
    }

    try {
      const rewardsRef = collection(db, "rewards");
      await addDoc(rewardsRef, {
        name: newRewardName.trim(),
        cost: costNum,
        description: newRewardDesc.trim() || "",
        creatorId: user.uid,
      });
      setNewRewardName("");
      setNewRewardCost("");
      setNewRewardDesc("");
    } catch (e) {
      setError("Failed to add reward.");
      console.error(e);
    }
  };

  // Delete a reward (only creator can delete)
  const deleteReward = async (id) => {
    if (!window.confirm("Delete this reward?")) return;
    try {
      const rewardDocRef = doc(db, "rewards", id);
      await deleteDoc(rewardDocRef);
    } catch (e) {
      setError("Failed to delete reward.");
      console.error(e);
    }
  };

  if (loading) return <p>Loading rewards...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Shop</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={addReward} style={{ marginBottom: 30 }}>
        <h3>Add New Reward</h3>
        <input
          type="text"
          placeholder="Reward name"
          value={newRewardName}
          onChange={(e) => setNewRewardName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="number"
          placeholder="Cost (tokens)"
          value={newRewardCost}
          onChange={(e) => setNewRewardCost(e.target.value)}
          required
          min={1}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <textarea
          placeholder="Description (optional)"
          value={newRewardDesc}
          onChange={(e) => setNewRewardDesc(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Add Reward
        </button>
      </form>

      <h3>Available Rewards</h3>
      {rewards.length === 0 && <p>No rewards available.</p>}
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {rewards.map((reward) => (
          <li
            key={reward.id}
            style={{
              marginBottom: 15,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            <strong>{reward.name}</strong> — {reward.cost} tokens
            {reward.description && <p>{reward.description}</p>}

            {reward.creatorId === user.uid ? (
              <>
                <button
                  style={{ marginRight: 10, cursor: "pointer" }}
                  onClick={() => deleteReward(reward.id)}
                >
                  Delete
                </button>
                <span style={{ fontStyle: "italic", color: "gray" }}>
                  (Your reward — you can’t redeem it)
                </span>
              </>
            ) : (
              <button
                style={{ marginLeft: 10, cursor: "pointer" }}
                onClick={() => redeemReward(reward)}
              >
                Redeem
              </button>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Your Notifications</h3>
      {notifications.length === 0 && <p>No notifications</p>}
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {notifications.map((notif) => (
          <li key={notif.id} style={{ marginBottom: 6, color: "green" }}>
            {notif.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Shop;

