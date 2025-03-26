import {Controller, Get, Post, Put, Delete, BadRequestException} from '@nestjs/common';

interface TodoItem {
	id: number;       // Unique identifier for the TODO item
	description: string; // Text description of the task
	isDone: boolean;    // Status of the task (true = completed, false = pending)
}

// DTO for creating a new TODO item
class CreateTodoDto {
	description: string;
}

// DTO for updating an existing TODO item
class UpdateTodoDto {
	description?: string; // Optional: New description
	isDone?: boolean;    // Optional: New status
}


/*
 * =============================================================================
 * In-Memory Data Store
 * =============================================================================
 * Simple in-memory array for demonstration purposes.
 */
let todos: TodoItem[] = [
	{id: 1, description: 'Buy groceries', isDone: false},
	{id: 2, description: 'Finish NestJS project', isDone: false},
	{id: 3, description: 'Walk the dog', isDone: true},
];
let nextId = 4; // Simple counter for generating IDs

@Controller('todos')
export class TodoController {
	@Get()
	getAllTodos(): TodoItem[] {
		// Returns the entire list of TODOs.
		return todos;
	}

	@Get(':id')
	getTodoById(@Param('id') id: string): TodoItem | null {
		const todoId = Number(id);
		const todo = todos.find(t => t.id === todoId);

		if (!todo) {
			return null;
		}
		return todo;
	}

	@Post()
	createTodo(@Body() createTodoDto: CreateTodoDto): TodoItem {
		if (!createTodoDto || !createTodoDto.description) {
			throw new BadRequestException('Description cannot be empty');
		}

		const newTodo: TodoItem = {
			id: nextId++,
			description: createTodoDto.description,
			isDone: false,
		};

		todos.push(newTodo);
		return newTodo;
	}

	@Put(':id')
	updateTodo(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto): TodoItem | null {
		const todoId = Number(id);
		const todoIndex = todos.findIndex(t => t.id === todoId);

		if (todoIndex === -1) {
			return null;
		}

		const existingTodo = todos[todoIndex];
		existingTodo.isDone = true;

		if (updateTodoDto.description !== undefined) {
			existingTodo.description = updateTodoDto.description;
		}

		return existingTodo;
	}

	@Delete(':id')
	deleteTodo(@Param('id') id: string): { message: string } | null {
		const todoId = Number(id);
		const todoIndex = todos.findIndex(t => t.id === todoId);

		todos.splice(todoIndex, 1);

		return {message: `Todo with ID ${id} successfully deleted.`};
	}

}