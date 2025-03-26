import React from 'react';

/*
 * =============================================================================
 * TypeScript Interfaces
 * =============================================================================
 * Defines the shape of the data and component props.
 */

interface Todo {
	id: number | string; // Unique identifier
	description: string; // Task description
	isDone: boolean;     // Task completion status
}

// Props for the individual TodoItem component
interface TodoItemProps {
	todo: Todo;
}

// Props for the main TodoList component
interface TodoListProps {
	// Array of todo items to display
	todos: Todo[];
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
	// Inline styles for demonstration
	const itemStyle: React.CSSProperties = {
		textDecoration: todo.isDone ? 'line-through' : 'none',
		color: todo.isDone ? 'grey' : 'black',
		fontStyle: 'italic',
	};

	return (
		<li style={itemStyle}>
			{todo.description}
			<span> ({todo.isDone ? 'Done' : 'Pending'})</span>
		</li>
	);
};

const TodoList: React.FC<TodoListProps> = ({ todos }) => {

	// Basic check for empty list
	if (!todos || todos.length === 0) {
		return null;
	}

	return (
		<div>
			<h2>My TODO List</h2>
			<ul>
				{todos.map((todo, index) => (
					<TodoItem key={index} todo={todo} />
				))}
			</ul>
		</div>
	);
};

export default TodoList;