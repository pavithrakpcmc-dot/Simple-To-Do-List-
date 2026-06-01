/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Todo } from './types';

const USERS_KEY = 'todo_app_users';
const TODOS_KEY_PREFIX = 'todo_app_todos_';
const SESSION_KEY = 'todo_app_session';

export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveUser(user: User): void {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === normalized);
}

export function getTodos(userId: string): Todo[] {
  const key = `${TODOS_KEY_PREFIX}${userId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    // Populate some default tasks for a newly registered or logged in user to make the app feel alive and interactive instantly!
    const defaultTodos: Todo[] = [
      {
        id: 'default-1',
        userId,
        title: 'Welcome to your premium To-Do List! 👋',
        description: 'This is a sample task to help you get started. You can delete or edit it.',
        completed: false,
        createdAt: new Date().toISOString(),
        category: 'Personal',
        priority: 'medium',
      },
      {
        id: 'default-2',
        userId,
        title: 'Try creating a new task',
        description: 'Click the "New Task" form above, select a priority, and write a description.',
        completed: false,
        createdAt: new Date().toISOString(),
        category: 'Work',
        priority: 'high',
      },
      {
        id: 'default-3',
        userId,
        title: 'Check off a completed task',
        description: 'Click the checkbox on the left to mark a task as completed! It will move to the Completed tab.',
        completed: true,
        createdAt: new Date().toISOString(),
        category: 'Personal',
        priority: 'low',
      }
    ];
    localStorage.setItem(key, JSON.stringify(defaultTodos));
    return defaultTodos;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveTodos(userId: string, todos: Todo[]): void {
  const key = `${TODOS_KEY_PREFIX}${userId}`;
  localStorage.setItem(key, JSON.stringify(todos));
}

export function getCurrentSession(): User | null {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setCurrentSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
