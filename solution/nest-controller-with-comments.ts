// todo.controller.ts
import {Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, BadRequestException} from '@nestjs/common';


interface TodoItem {
	id: number;       // Unique identifier for the TODO item
	description: string; // Text description of the task
	isDone: boolean;    // Status of the task (true = completed, false = pending)
}

// DTO for creating a new TODO item
// NOTE FOR REVIEWER: Missing validation decorators (e.g., from class-validator).
class CreateTodoDto {
	description: string;
}

// DTO for updating an existing TODO item
// NOTE FOR REVIEWER: Missing validation decorators (e.g., from class-validator).
class UpdateTodoDto {
	description?: string; // Optional: New description
	isDone?: boolean;    // Optional: New status
}

let todos: TodoItem[] = [
	{id: 1, description: 'Buy groceries', isDone: false},
	{id: 2, description: 'Finish NestJS project', isDone: false},
	{id: 3, description: 'Walk the dog', isDone: true},
];
let nextId = 4; // Simple counter for generating IDs

@Controller('todos')
export class TodoController {

	/*
	 * ---------------------------------------------------------------------------
	 * GET /todos
	 * ---------------------------------------------------------------------------
	 * Retrieves all TODO items.
	 */
	@Get()
	getAllTodos(): TodoItem[] {
		// Returns the entire list of TODOs.
		return todos;
	}

	/*
	 * ---------------------------------------------------------------------------
	 * GET /todos/:id
	 * ---------------------------------------------------------------------------
	 * Retrieves a single TODO item by its ID.
	 */
	@Get(':id')
	getTodoById(@Param('id') id: string): TodoItem | null {
		// LOGICAL FLAW/ERROR HANDLING: Uses `Number()` which can return NaN if the id string is not a valid number. No explicit check for NaN.
		const todoId = Number(id);

		// PERFORMANCE FLAW: Uses `find()`, which performs a linear scan (O(n) complexity). Inefficient for large lists.
		const todo = todos.find(t => t.id === todoId);

		// DESIGN FLAW/ERROR HANDLING: Returns `null` if not found. REST APIs typically return a 404 Not Found status code in this case. Should use `NotFoundException`.
		if (!todo) {
			return null; // Should throw new NotFoundException(`Todo with ID ${id} not found`);
		}
		return todo;
	}

	/*
	 * ---------------------------------------------------------------------------
	 * POST /todos
	 * ---------------------------------------------------------------------------
	 * Creates a new TODO item.
	 */
	@Post()
	createTodo(@Body() createTodoDto: CreateTodoDto): TodoItem {
		// DESIGN FLAW: Lack of input validation. `createTodoDto.description` could be empty, null, or undefined.
		if (!createTodoDto || !createTodoDto.description) {
			// LOGICAL FLAW/ERROR HANDLING: Throws a generic BadRequestException without specific details. Better validation is needed.
			throw new BadRequestException('Description cannot be empty');
		}

		const newTodo: TodoItem = {
			id: nextId++,
			description: createTodoDto.description,
			isDone: false, // New todos always start as not done.
		};

		todos.push(newTodo);

		// Returns the newly created item, typically with a 201 Created status code (NestJS handles this by default on POST).
		return newTodo;
	}

	/*
	 * ---------------------------------------------------------------------------
	 * PUT /todos/:id
	 * ---------------------------------------------------------------------------
	 * Updates an existing TODO item.
	 * NOTE FOR REVIEWER: PUT should ideally replace the entire resource. This implementation behaves more like PATCH.
	 */
	@Put(':id')
	updateTodo(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto): TodoItem | null {
		// LOGICAL FLAW/ERROR HANDLING: Same potential NaN issue as getTodoById.
		const todoId = Number(id);

		// PERFORMANCE FLAW: Uses `findIndex()`, which is O(n).
		const todoIndex = todos.findIndex(t => t.id === todoId);

		// DESIGN FLAW/ERROR HANDLING: Returns `null` instead of throwing `NotFoundException`.
		if (todoIndex === -1) {
			return null; // Should throw new NotFoundException(`Todo with ID ${id} not found`);
		}

		// LOGICAL FLAW: This update logic is buggy. It *always* sets `isDone` to `true`, regardless of the value provided in `updateTodoDto.isDone`.
		// This doesn't correctly handle partial updates or reflect the intent of the input DTO.
		const existingTodo = todos[todoIndex];
		existingTodo.isDone = true; // BUG: Always sets to true! Ignores updateTodoDto.isDone

		if (updateTodoDto.description !== undefined) {
			existingTodo.description = updateTodoDto.description;
		}

		// Returns the modified object.
		return existingTodo;
	}

	/*
	 * ---------------------------------------------------------------------------
	 * DELETE /todos/:id
	 * ---------------------------------------------------------------------------
	 * Deletes a TODO item by its ID.
	 */
	@Delete(':id')
	deleteTodo(@Param('id') id: string): { message: string } | null {
		// LOGICAL FLAW/ERROR HANDLING: Potential NaN issue.
		const todoId = Number(id);

		// PERFORMANCE FLAW: O(n) complexity for findIndex.
		const todoIndex = todos.findIndex(t => t.id === todoId);

		todos.splice(todoIndex, 1); // BUGGY if todoIndex is -1

		// DESIGN FLAW: Inconsistent return type compared to others. Returns a message object on success, null on failure (should be 404).
		// A 204 No Content response with an empty body is often standard for successful DELETE operations.
		return {message: `Todo with ID ${id} successfully deleted.`};
	}

} // End of TodoController class

/*
 * =============================================================================
 * Potential Discussion Points for Code Review:
 * =============================================================================
 * - **Design:** Logic in controller vs. service layer, state management (in-memory array), REST principles (PUT vs. PATCH, status codes 404/204), file structure (interfaces/DTOs).
 * - **Error Handling:** Returning null vs. throwing exceptions (NotFoundException, BadRequestException), handling parsing errors (parseInt/Number).
 * - **Logic:** Correctness of update logic (always true bug), correctness of delete logic (splice(-1) bug), ID generation strategy.
 * - **Performance:** O(n) complexity for lookups/updates/deletes in arrays vs. using a Map/object (O(1) average).
 * - **Validation:** Lack of input validation (using `class-validator` and `ValidationPipe`).
 * - **Security:** ID generation (predictable IDs), no authentication/authorization (out of scope for this example, but worth mentioning).
 * - **Typing:** Use of `any` (none here, but good practice), consistency in types.
 * - **Testing:** How would you test this controller? (Unit tests, E2E tests).
 * =============================================================================
 */