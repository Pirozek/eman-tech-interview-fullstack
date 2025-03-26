// TodoListComponent.tsx
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
	// NOTE FOR REVIEWER: Missing handling for potential 'null' or 'undefined' todos prop?
	// What should happen if the list is loading or fails to load?
}


/*
 * =============================================================================
 * TodoItem Component
 * =============================================================================
 * Renders a single TODO item within a list item element.
 */

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
	// NOTE FOR REVIEWER: Inline styles are used here.
	// While convenient for small examples, in larger applications, this can lead to:
	// - Less reusability and consistency compared to CSS classes/modules.
	// - Potential performance issues if the style object is recalculated on every render
	//   (though less impactful for static styles like this).
	// - Mixing styling concerns directly into the component logic.
	const itemStyle: React.CSSProperties = {
		textDecoration: todo.isDone ? 'line-through' : 'none',
		color: todo.isDone ? 'grey' : 'black',
		fontStyle: 'italic', // Maybe an unnecessary style? Good point for discussion.
	};

	return (
		<li style={itemStyle}>
			{todo.description}
			{/* NOTE FOR REVIEWER: Simple conditional rendering using ternary. This is fine.
          Could also use `&&` for brevity if 'Pending' wasn't needed: `todo.isDone && <span> (Done)</span>`
          Consider accessibility: Is the visual distinction (line-through, color) enough?
          Maybe add hidden text for screen readers? (e.g., <span className="sr-only">{todo.isDone ? 'Completed' : 'Pending'}</span>) - Probably too advanced for Junior focus unless specifically tested.
       */}
			<span> ({todo.isDone ? 'Done' : 'Pending'})</span>
		</li>
	);
};


/*
 * =============================================================================
 * TodoList Component
 * =============================================================================
 * Renders the entire list of TODO items.
 */

const TodoList: React.FC<TodoListProps> = ({ todos }) => {

	// NOTE FOR REVIEWER: Basic check for empty list. Returns null, which means nothing is rendered.
	// Is this the desired behavior? Maybe render a message like "No todos yet!"?
	if (!todos || todos.length === 0) {
		return null; // Or <p>No tasks found.</p>;
	}

	return (
		<div>
			<h2>My TODO List</h2>
			<ul>
				{/* --- KEY PROP ISSUE --- */}
				{/* NOTE FOR REVIEWER (CRITICAL): Using the array index as the `key` prop.
            This is a common anti-pattern IF the list can ever change (items added, removed, reordered).
            React uses the key to identify items during reconciliation. If the index is used,
            reordering or adding/removing items can lead to incorrect component state/updates or performance issues.
            The `key` should be a stable, unique identifier associated with the data *item* itself,
            like `todo.id`.
            Correct version: `todos.map(todo => <TodoItem key={todo.id} todo={todo} />)`
         */}
				{todos.map((todo, index) => (
					<TodoItem key={index} todo={todo} />
				))}
			</ul>
		</div>
	);
};

/*
 * =============================================================================
 * Default Export
 * =============================================================================
 * Exporting the main component for use elsewhere.
 */

export default TodoList;


/*
 * =============================================================================
 * Potential Discussion Points for Junior React Code Review:
 * =============================================================================
 * - **List Keys:** The use of `index` as a key is the most important point here. Explain *why* it's bad and what to use instead (`todo.id`).
 * - **Component Structure:** Is splitting `TodoList` and `TodoItem` good? (Yes, promotes reusability and separation).
 * - **Props:** Correct typing with TypeScript. Discussion about passing whole objects vs. specific props. Handling potentially missing props (`todos`).
 * - **Styling:** Inline styles vs. CSS classes/CSS Modules/Styled Components. Consistency.
 * - **Conditional Rendering:** Simple ternary/`&&`. Is it readable? Does it meet requirements?
 * - **Error/Empty State Handling:** What happens when `todos` is empty? Returning `null` vs. a user-friendly message.
 * - **Semantic HTML:** Use of `<div>`, `<h2>`, `<ul>`, `<li>`. (Seems okay here).
 * - **Readability:** Naming conventions, comments, formatting.
 * =============================================================================
 */