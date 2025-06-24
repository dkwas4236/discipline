import React from "react";

function TaskList({ tasks, onComplete }) {
  const styles = {
    container: { marginBottom: 20 },
    listItem: { marginBottom: 10 },
    completeButton: { marginLeft: 10, cursor: "pointer" },
  };
  
  const handleComplete = (id, name) => {
    const confirmed = window.confirm(`Are you sure you have completed the task "${name}"?`);
    if (confirmed) {
      onComplete(id);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Tasks</h3>
      <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
        {tasks.map((task) => (
          <li key={task.id} style={styles.listItem}>
            {task.name} - {task.tokens} tokens
            {!task.completed ? (
              <button
                style={styles.completeButton}
                onClick={() => handleComplete(task.id, task.name)}
              >
                Complete
              </button>
            ) : (
              <span style={{ marginLeft: 10 }}>✅</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;