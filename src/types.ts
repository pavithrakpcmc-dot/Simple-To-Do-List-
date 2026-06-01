/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string; // unique user identifier
  email: string; // or username
  displayName: string;
  passwordHash: string; // simple local hashed or plain password representation
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string; // associated user
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  category?: string; // Work, Personal, Shopping, Health, etc.
  priority?: 'low' | 'medium' | 'high';
}

export type TodoFilter = 'all' | 'pending' | 'completed';
