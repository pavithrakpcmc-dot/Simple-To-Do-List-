/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  CheckCircle2, 
  Circle, 
  ListTodo, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Inbox, 
  Sparkles, 
  Check, 
  AlertCircle,
  Clock
} from 'lucide-react';

import { User, Todo, TodoFilter } from './types';
import { 
  getCurrentSession, 
  clearCurrentSession, 
  getTodos, 
  saveTodos 
} from './db';

import LoginScreen from './components/LoginScreen';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<TodoFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'category'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Check current session on mount
  useEffect(() => {
    const activeUser = getCurrentSession();
    if (activeUser) {
      setUser(activeUser);
      // Retrieve todos for the logged-in user
      const userTodos = getTodos(activeUser.id);
      setTodos(userTodos);
    }
    setIsLoading(false);
  }, []);

  // Sync todos to localStorage when they change
  const syncTodos = (updatedTodos: Todo[]) => {
    if (user) {
      saveTodos(user.id, updatedTodos);
      setTodos(updatedTodos);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    const userTodos = getTodos(loggedInUser.id);
    setTodos(userTodos);
  };

  const handleLogout = () => {
    clearCurrentSession();
    setUser(null);
    setTodos([]);
    setEditingTodo(null);
    // Reset filters
    setActiveFilter('all');
    setCategoryFilter('All');
    setSortBy('newest');
    setSearchQuery('');
  };

  // 1. Add Task
  const handleAddTodo = (title: string, description: string, category: string, priority: 'low' | 'medium' | 'high') => {
    if (!user) return;

    const newTodo: Todo = {
      id: Math.random().toString(36).substring(2, 11),
      userId: user.id,
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      category,
      priority,
    };

    const updatedTodos = [newTodo, ...todos];
    syncTodos(updatedTodos);
  };

  // 2. Toggle Complete Status
  const handleToggleComplete = (todoId: string) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === todoId) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    syncTodos(updatedTodos);

    // If active editing todo is checked off, cancel edit mode
    if (editingTodo && editingTodo.id === todoId) {
      setEditingTodo(null);
    }
  };

  // 3. Delete Task
  const handleDeleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== todoId);
    syncTodos(updatedTodos);

    if (editingTodo && editingTodo.id === todoId) {
      setEditingTodo(null);
    }
  };

  // 4. Start Edit Mode
  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    // Scroll to the top of the form on small devices
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Save Changes
  const handleEditTodo = (todoId: string, updatedFields: Partial<Todo>) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === todoId) {
        return { ...todo, ...updatedFields };
      }
      return todo;
    });
    syncTodos(updatedTodos);
    setEditingTodo(null);
  };

  // Extract unique categories for filtering
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    todos.forEach((todo) => {
      if (todo.category) cats.add(todo.category);
    });
    return ['All', ...Array.from(cats)];
  }, [todos]);

  // Compute status counts
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Sort Logic
  const processedTodos = useMemo(() => {
    let result = [...todos];

    // Status filter
    if (activeFilter === 'pending') {
      result = result.filter((todo) => !todo.completed);
    } else if (activeFilter === 'completed') {
      result = result.filter((todo) => todo.completed);
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter((todo) => todo.category === categoryFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (todo) => 
          todo.title.toLowerCase().includes(q) || 
          (todo.description && todo.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'category') {
        const catA = a.category || '';
        const catB = b.category || '';
        return catA.localeCompare(catB);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const weightA = priorityWeight[a.priority || 'medium'];
        const weightB = priorityWeight[b.priority || 'medium'];
        return weightB - weightA; // High priority first
      }
      return 0;
    });

    return result;
  }, [todos, activeFilter, categoryFilter, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500 font-mono">Initializing app...</span>
        </div>
      </div>
    );
  }

  // If no user is logged in, show Auth component
  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      
      {/* Premium Dynamic Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-950 tracking-tight block">
                  Simple To-Do
                </span>
                <span className="text-[10px] text-slate-400 font-mono leading-none block -mt-0.5">
                  V1.0 LOCAL ENGINE
                </span>
              </div>
            </div>

            {/* Right User Area */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-slate-800">{user.displayName}</p>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold select-none cursor-pointer transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Welcome Dashboard Box */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-900/10 mb-8 relative overflow-hidden">
          {/* Decorative subtle background waves */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" />
                  WORKSPACE ACTIVE
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Hello, {user.displayName}!
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-lg">
                Manage your duties, filter by categories, and stay highly productive today.
              </p>
            </div>

            {/* Statistics Banner card */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-4 min-w-[220px] self-start md:self-auto">
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1 font-semibold">
                <span>TASK COMPLETION</span>
                <span className="font-mono">{completionPercentage}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div 
                  className="h-full bg-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-black/20 py-1.5 rounded-lg">
                  <span className="block text-slate-300 text-[10px]">TOTAL</span>
                  <span className="font-extrabold text-white text-sm">{totalCount}</span>
                </div>
                <div className="bg-black/20 py-1.5 rounded-lg">
                  <span className="block text-emerald-400 text-[10px]">PENDING</span>
                  <span className="font-extrabold text-emerald-300 text-sm">{pendingCount}</span>
                </div>
                <div className="bg-black/20 py-1.5 rounded-lg">
                  <span className="block text-blue-400 text-[10px]">DONE</span>
                  <span className="font-extrabold text-blue-300 text-sm">{completedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Inputs and Filters */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Primary TodoForm element */}
            <TodoForm 
              onAddTodo={handleAddTodo}
              onEditTodo={handleEditTodo}
              onCancelEdit={() => setEditingTodo(null)}
              editingTodo={editingTodo}
            />

            {/* QUICK FILTERS & CONTROLS PANEL */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-500" />
                Category Filters
              </h3>

              {/* List of categories */}
              <div className="flex flex-wrap lg:flex-col gap-1.5">
                {categoriesList.map((cat) => {
                  const isActive = categoryFilter === cat;
                  // Count items in this category
                  const count = cat === 'All' 
                    ? todos.length 
                    : todos.filter(t => t.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-xl select-none cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100 font-bold' 
                          : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
                        isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: List View, Search, Filters */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search and Sorting Header Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                
                {/* Search Bar Input */}
                <div className="relative w-full sm:flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords in title/details..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white text-sm transition-all text-slate-800"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort dropdown bar */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white text-slate-700 cursor-pointer"
                  >
                    <option value="newest">Newest Created</option>
                    <option value="oldest">Oldest Created</option>
                    <option value="priority">High Priority First</option>
                    <option value="category">Category Alphabetical</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Filter Tabs Navbar */}
            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
              {[
                { id: 'all', label: 'All Duties', count: totalCount },
                { id: 'pending', label: 'Pending / Working', count: pendingCount },
                { id: 'completed', label: 'Completed', count: completedCount }
              ].map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as TodoFilter)}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 select-none ${
                      isActive 
                        ? 'border-blue-600 text-blue-600 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TODO ITEMS FEED/CONTAINER */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {processedTodos.length > 0 ? (
                  processedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={handleToggleComplete}
                      onDeleteTodo={handleDeleteTodo}
                      onStartEdit={handleStartEdit}
                    />
                  ))
                ) : (
                  // EMPTY STATE CARDS
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center"
                  >
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                      <Inbox className="w-6 h-6" />
                    </div>
                    {searchQuery ? (
                      <>
                        <h4 className="text-base font-bold text-slate-800">No matching tasks found</h4>
                        <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                          Try adjusting your spelling or clear search filters to explore your tasks.
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-4 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                        >
                          Clear Search
                        </button>
                      </>
                    ) : (
                      <>
                        <h4 className="text-base font-bold text-slate-800">All caught up here!</h4>
                        <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                          {activeFilter === 'completed' 
                            ? "You haven't checked off any duties yet! Complete tasks to list them here." 
                            : activeFilter === 'pending'
                            ? "Hooray! No pending duties left under this filter context."
                            : "Your task feed is completely empty. Create a task using the composer to get started!"
                          }
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
