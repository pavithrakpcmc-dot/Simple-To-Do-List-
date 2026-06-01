/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Edit2, CheckCircle2, Circle, AlertCircle, Tag, Calendar } from 'lucide-react';
import { Todo } from '../types';

interface TodoItemProps {
  key?: string | number;
  todo: Todo;
  onToggleComplete: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
  onStartEdit: (todo: Todo) => void;
}

export default function TodoItem({ todo, onToggleComplete, onDeleteTodo, onStartEdit }: TodoItemProps) {
  
  // Format Date nicely
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const priorityMeta = {
    low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      dot: 'bg-emerald-500'
    },
    medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      dot: 'bg-amber-500'
    },
    high: {
      bg: 'bg-rose-50 text-rose-700 border-rose-100',
      dot: 'bg-rose-500'
    }
  };

  const meta = priorityMeta[todo.priority || 'medium'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`group bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs hover:shadow-md hover:border-slate-200 ${
        todo.completed ? 'border-slate-100 bg-slate-50/50' : 'border-slate-100'
      }`}
    >
      <div className="flex items-start gap-4">
        
        {/* Toggle Checkbox Button */}
        <button
          onClick={() => onToggleComplete(todo.id)}
          className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer flex-shrink-0"
          aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        >
          {todo.completed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
          ) : (
            <Circle className="w-6 h-6 hover:scale-105 active:scale-95 transition-all" />
          )}
        </button>

        {/* Content Box */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full border ${meta.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
              <span className="capitalize">{todo.priority}</span>
            </span>

            {/* Category Badge */}
            {todo.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] md:text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/50 rounded-full">
                <Tag className="w-3 h-3" />
                {todo.category}
              </span>
            )}
          </div>

          <h4 className={`text-base md:text-lg font-bold tracking-tight text-slate-800 transition-all ${
            todo.completed ? 'line-through text-slate-400 font-medium' : ''
          }`}>
            {todo.title}
          </h4>

          {todo.description && (
            <p className={`mt-1.5 text-xs md:text-sm text-slate-500 whitespace-pre-wrap leading-relaxed ${
              todo.completed ? 'text-slate-400/80 line-through' : ''
            }`}>
              {todo.description}
            </p>
          )}

          {/* Creation date */}
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Calendar className="w-3 w-3 flex-shrink-0" />
            <span>Created {formatDate(todo.createdAt)}</span>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="flex items-center gap-1.5 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {/* Edit option */}
          {!todo.completed && (
            <button
              onClick={() => onStartEdit(todo)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Delete option */}
          <button
            onClick={() => {
              onDeleteTodo(todo.id);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
