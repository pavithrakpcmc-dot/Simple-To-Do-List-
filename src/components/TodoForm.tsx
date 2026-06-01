/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Check, X, Tag, AlertCircle } from 'lucide-react';
import { Todo } from '../types';

interface TodoFormProps {
  onAddTodo?: (title: string, description: string, category: string, priority: 'low' | 'medium' | 'high') => void;
  onEditTodo?: (todoId: string, updatedFields: Partial<Todo>) => void;
  onCancelEdit?: () => void;
  editingTodo?: Todo | null;
}

const CATEGORIES = ['Personal', 'Work', 'Shopping', 'Study', 'Health', 'Finance', 'Others'];
const PRIORITIES: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export default function TodoForm({ onAddTodo, onEditTodo, onCancelEdit, editingTodo }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState('');

  // Populate fields if we are editing an existing Todo
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setCategory(editingTodo.category || 'Personal');
      setPriority(editingTodo.priority || 'medium');
    } else {
      resetForm();
    }
    setError('');
  }, [editingTodo]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setPriority('medium');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (editingTodo && onEditTodo) {
      onEditTodo(editingTodo.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      if (onCancelEdit) onCancelEdit();
    } else if (onAddTodo) {
      onAddTodo(title.trim(), description.trim(), category, priority);
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 transition-all">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
        {editingTodo ? 'Edit Task Details' : 'Create New Task'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 text-sm placeholder-slate-400 transition-all text-slate-800"
            maxLength={100}
          />
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details about the task..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 text-sm placeholder-slate-400 transition-all min-h-20 max-h-40 text-slate-800"
            maxLength={500}
          />
        </div>

        {/* Category & Priority selector row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 text-slate-700 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const colors = {
                  low: 'border-emerald-200 text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50 active:ring-emerald-500',
                  medium: 'border-amber-200 text-amber-700 bg-amber-50/30 hover:bg-amber-50 active:ring-amber-500',
                  high: 'border-rose-200 text-rose-700 bg-rose-50/30 hover:bg-rose-50 active:ring-rose-500',
                };
                const activeColors = {
                  low: 'bg-emerald-100 border-emerald-500 text-emerald-900 font-medium ring-2 ring-emerald-500/10',
                  medium: 'bg-amber-100 border-amber-500 text-amber-900 font-medium ring-2 ring-amber-500/10',
                  high: 'bg-rose-100 border-rose-500 text-rose-900 font-medium ring-2 ring-rose-500/10',
                };

                const isActive = priority === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2 py-2 text-xs border rounded-xl text-center capitalize cursor-pointer transition-all ${
                      isActive ? activeColors[p] : colors[p]
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trigger Buttons */}
        <div className="pt-2 flex justify-end gap-2.5">
          {editingTodo ? (
            <>
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 dark:shadow-blue-900/10"
            >
              <Plus className="w-5 h-5" />
              Add Duty / Task
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
