import React from "react";

function RewardList({ rewards, onRedeem }) {
  const styles = {
    listItem: { marginBottom: 10 },
    redeemButton: { marginLeft: 10, cursor: "pointer" },
  };

  return (
    <div>
      <h3>Rewards</h3>
      <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
        {rewards.map((reward) => (
          <li key={reward.id} style={styles.listItem}>
            {reward.name} - {reward.cost} tokens
            <button
              style={styles.redeemButton}
              onClick={() => onRedeem(reward.cost)}
            >
              Redeem
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RewardList;


