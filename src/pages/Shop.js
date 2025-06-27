// src/pages/Shop.js
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { where } from "firebase/firestore"

function Shop({ user, tokenBalance, setTokenBalance }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardCost, setNewRewardCost] = useState("");
  const [newRewardDesc, setNewRewardDesc] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [archivedNotifications, setArchivedNotifications] = useState([]);

  // Load rewards and listen for updates
  useEffect(() => {
    const rewardsRef = collection(db, "rewards");
    const q = query(rewardsRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRewards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("[Rewards] Loaded:", loadedRewards);
      setRewards(loadedRewards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load notifications for this user (both uncompleted and completed)
  useEffect(() => {
    if (!user) {
      console.log("[Notifications] No user logged in yet.");
      return;
    }

    console.log("[Notifications] Listening for user:", user.uid);

    const notificationsRef = collection(db, "notifications");
    const q = query(
        notificationsRef,
        where("recipientId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(50)
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((n) => n.recipientId === user.uid);

      console.log(
        `[Notifications] Total for user (${user.uid}):`,
        allNotifs.length,
        allNotifs
      );

      setNotifications(allNotifs.filter((n) => !n.completed));
      setArchivedNotifications(allNotifs.filter((n) => n.completed));
    });

    return () => unsubscribe();
  }, [user]);

  // Redeem reward
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
      console.log("[Redeem] Redeeming reward:", reward);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        tokenBalance: tokenBalance - reward.cost,
      });
      setTokenBalance(tokenBalance - reward.cost);

      alert(`You redeemed: ${reward.name}`);

      await addDoc(collection(db, "notifications"), {
        recipientId: reward.creatorId,
        message: `${user.email} redeemed your reward: ${reward.name}`,
        timestamp: new Date(),
        completed: false,
      });
      console.log("[Redeem] Notification created for reward creator");
    } catch (e) {
      setError("Failed to redeem reward.");
      console.error("[Redeem] Error:", e);
    }
  };

  // Add reward
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
      console.log("[AddReward] Adding reward:", newRewardName, costNum);
      await addDoc(collection(db, "rewards"), {
        name: newRewardName.trim(),
        cost: costNum,
        description: newRewardDesc.trim() || "",
        creatorId: user.uid,
      });
      setNewRewardName("");
      setNewRewardCost("");
      setNewRewardDesc("");
      console.log("[AddReward] Reward added successfully");
    } catch (e) {
      setError("Failed to add reward.");
      console.error("[AddReward] Error:", e);
    }
  };

  // Delete reward
  const deleteReward = async (id) => {
    if (!window.confirm("Delete this reward?")) return;
    try {
      console.log("[DeleteReward] Deleting reward:", id);
      await deleteDoc(doc(db, "rewards", id));
      console.log("[DeleteReward] Reward deleted");
    } catch (e) {
      setError("Failed to delete reward.");
      console.error("[DeleteReward] Error:", e);
    }
  };

  // Complete (mark notification completed)
  const completeNotification = async (id) => {
    try {
      console.log("[CompleteNotification] Completing notification:", id);
      const notifRef = doc(db, "notifications", id);

      await updateDoc(notifRef, { completed: true });
      console.log("[CompleteNotification] Notification marked as completed");
    } catch (e) {
      console.error("[CompleteNotification] Failed:", e);
      alert("Could not complete notification.");
    }
  };

  // Optional: Unarchive notification (mark completed false)
  const unarchiveNotification = async (id) => {
    try {
      console.log("[UnarchiveNotification] Unarchiving notification:", id);
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, { completed: false });
      console.log("[UnarchiveNotification] Notification unarchived");
    } catch (e) {
      console.error("[UnarchiveNotification] Failed:", e);
      alert("Could not unarchive notification.");
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
          <li
            key={notif.id}
            style={{
              marginBottom: 10,
              padding: 8,
              backgroundColor: "#e6ffe6",
              borderRadius: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{notif.message}</span>
            <button
              style={{
                marginLeft: 10,
                fontSize: 12,
                padding: "4px 10px",
                cursor: "pointer",
              }}
              onClick={() => completeNotification(notif.id)}
            >
              Complete
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Archived Notifications</h3>
      {archivedNotifications.length === 0 && <p>No archived notifications</p>}
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {archivedNotifications.map((notif) => (
          <li
            key={notif.id}
            style={{
              marginBottom: 10,
              padding: 8,
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#777",
            }}
          >
            <span>{notif.message}</span>
            <button
              style={{
                marginLeft: 10,
                fontSize: 12,
                padding: "4px 10px",
                cursor: "pointer",
              }}
              onClick={() => unarchiveNotification(notif.id)}
            >
              Unarchive
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Shop;



