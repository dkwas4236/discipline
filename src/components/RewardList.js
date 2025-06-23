import React from 'react';

function RewardList({ rewards, onRedeem }) {
  return (
    <div>
      <h3>Rewards</h3>
      <ul>
        {rewards.map(reward => (
          <li key={reward.id}>
            {reward.name} - {reward.cost} tokens
            <button onClick={() => onRedeem(reward.cost)}>Redeem</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RewardList;
