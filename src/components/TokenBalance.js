import React from "react";

function TokenBalance({ balance }) {
  return (
    <h2 style={{ marginBottom: 20 }}>
      Tokens: {balance}
    </h2>
  );
}

export default TokenBalance;

