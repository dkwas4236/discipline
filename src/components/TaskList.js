import React from 'react';

function TaskList({ tasks, onComplete }) {
  return (
    <div>
      <h3>Tasks</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.name} - {task.tokens} tokens
            {!task.completed ? (
              <button onClick={() => onComplete(task.id)}>Complete</button>
            ) : (
              <span> ✅</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
