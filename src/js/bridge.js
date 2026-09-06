/**
 * TodoLite - Bridge Layer between Frontend and Tauri Backend
 * Provides transparent fallback to localStorage when running in standard browser/preview.
 */

const STORAGE_KEY_TABS = 'todolite_tabs_data';
const STORAGE_KEY_TODOS = 'todolite_todos_data';
const STORAGE_KEY_SETTINGS = 'todolite_settings_data';

// Initial default seed data for first launch
const DEFAULT_TABS = [
  { id: 'tab-1', name: 'Công việc', sort_order: 0, created_at: new Date().toISOString() },
  { id: 'tab-2', name: 'Cá nhân', sort_order: 1, created_at: new Date().toISOString() }
];

const DEFAULT_TODOS = [
  {
    id: 'todo-1',
    tab_id: 'tab-1',
    text: 'Hoàn thành báo cáo tiến độ tuần',
    completed: 0,
    priority: 'high',
    sort_order: 0,
    due_date: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'todo-2',
    tab_id: 'tab-1',
    text: 'Gửi email xác nhận kế hoạch cho team',
    completed: 1,
    priority: 'medium',
    sort_order: 1,
    due_date: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'todo-3',
    tab_id: 'tab-2',
    text: 'Mua cuốn sổ tay và bút mực mới',
    completed: 0,
    priority: 'low',
    sort_order: 0,
    due_date: null,
    created_at: new Date().toISOString()
  }
];

export class Bridge {
  static isTauri() {
    return typeof window !== 'undefined' && 
      (Boolean(window.__TAURI_INTERNALS__) || Boolean(window.__TAURI__));
  }

  static formatArgs(command, args = {}) {
    const res = { ...args };
    if (command === 'create_todo') {
      const tabId = args.tab_id || args.tabId;
      const dueDate = args.due_date !== undefined ? args.due_date : (args.dueDate !== undefined ? args.dueDate : null);
      res.tab_id = tabId;
      res.tabId = tabId;
      res.due_date = dueDate;
      res.dueDate = dueDate;
      res.text = args.text || '';
      res.priority = args.priority || 'none';
    } else if (command === 'reorder_todos') {
      res.items = (args.items || []).map(item => ({
        id: item.id,
        sort_order: item.sort_order ?? item.sortOrder ?? 0,
        sortOrder: item.sort_order ?? item.sortOrder ?? 0
      }));
    } else if (command === 'update_todo_deadline') {
      const dueDate = args.due_date !== undefined ? args.due_date : (args.dueDate !== undefined ? args.dueDate : null);
      res.id = args.id;
      res.due_date = dueDate;
      res.dueDate = dueDate;
    } else if (command === 'set_always_on_top') {
      const val = args.always_on_top ?? args.alwaysOnTop ?? true;
      res.always_on_top = val;
      res.alwaysOnTop = val;
    }
    return res;
  }

  static async rawTauriInvoke(command, formattedArgs = {}) {
    if (typeof window !== 'undefined') {
      if (window.__TAURI__?.core?.invoke) {
        return await window.__TAURI__.core.invoke(command, formattedArgs);
      }
      if (window.__TAURI_INTERNALS__?.invoke) {
        return await window.__TAURI_INTERNALS__.invoke(command, formattedArgs);
      }
    }
    throw new Error('Tauri not available');
  }

  static async invoke(command, args = {}) {
    const formattedArgs = this.formatArgs(command, args);

    if (this.isTauri()) {
      try {
        const result = await this.rawTauriInvoke(command, formattedArgs);
        // Synchronize to localStorage backup
        try {
          this.syncBackup(command, args, result);
        } catch (_) {}
        return result;
      } catch (err) {
        console.warn(`Tauri invoke "${command}" failed, fallback to local store:`, err);
      }
    }

    // Local Storage Fallback Implementation
    return this.fallbackHandler(command, args);
  }

  static syncBackup(command, args, result) {
    if (command === 'create_todo' && result) {
      const todos = this.fallbackHandler('get_all_todos');
      if (!todos.some(t => t.id === result.id)) {
        todos.unshift(result);
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
      }
    } else if (command === 'toggle_todo' && result) {
      const todos = this.fallbackHandler('get_all_todos');
      const idx = todos.findIndex(t => t.id === result.id);
      if (idx !== -1) {
        todos[idx] = result;
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
      }
    } else if (command === 'update_todo' && result) {
      const todos = this.fallbackHandler('get_all_todos');
      const idx = todos.findIndex(t => t.id === result.id);
      if (idx !== -1) {
        todos[idx] = result;
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
      }
    } else if (command === 'update_todo_deadline' && result) {
      const todos = this.fallbackHandler('get_all_todos');
      const idx = todos.findIndex(t => t.id === result.id);
      if (idx !== -1) {
        todos[idx] = result;
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
      }
    } else if (command === 'delete_todo') {
      let todos = this.fallbackHandler('get_all_todos');
      todos = todos.filter(t => t.id !== args.id);
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
    } else if (command === 'reorder_todos') {
      let todos = this.fallbackHandler('get_all_todos');
      const map = new Map((args.items || []).map(item => [item.id, item.sort_order ?? item.sortOrder]));
      todos.forEach(t => {
        if (map.has(t.id)) t.sort_order = map.get(t.id);
      });
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
    } else if (command === 'create_tab' && result) {
      const tabs = this.fallbackHandler('get_all_tabs');
      if (!tabs.some(t => t.id === result.id)) {
        tabs.push(result);
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
      }
    } else if (command === 'update_tab' && result) {
      const tabs = this.fallbackHandler('get_all_tabs');
      const idx = tabs.findIndex(t => t.id === result.id);
      if (idx !== -1) {
        tabs[idx] = result;
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
      }
    } else if (command === 'delete_tab') {
      let tabs = this.fallbackHandler('get_all_tabs');
      tabs = tabs.filter(t => t.id !== args.id);
      localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
      let todos = this.fallbackHandler('get_all_todos');
      todos = todos.filter(t => t.tab_id !== args.id);
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
    }
  }

  static async syncAndRecoverData() {
    if (!this.isTauri()) return;
    try {
      const dbTabs = await this.rawTauriInvoke('get_all_tabs').catch(() => []);
      const dbTodos = await this.rawTauriInvoke('get_all_todos').catch(() => []);

      const localTodosRaw = localStorage.getItem(STORAGE_KEY_TODOS);
      const localTabsRaw = localStorage.getItem(STORAGE_KEY_TABS);
      const localTodos = localTodosRaw ? JSON.parse(localTodosRaw) : [];
      const localTabs = localTabsRaw ? JSON.parse(localTabsRaw) : [];

      console.log(`[TodoLite Sync] SQLite: ${dbTabs.length} tabs, ${dbTodos.length} todos | LocalStorage: ${localTabs.length} tabs, ${localTodos.length} todos`);

      // If SQLite has tabs but 0 todos, and localStorage has saved todos: migrate them!
      if (dbTodos.length === 0 && localTodos.length > 0) {
        console.log(`[TodoLite Recovery] Recovering ${localTodos.length} todos into SQLite...`);
        const tabIdMap = new Set(dbTabs.map(t => t.id));
        const firstTabId = dbTabs.length > 0 ? dbTabs[0].id : null;

        for (const todo of localTodos) {
          let targetTabId = todo.tab_id;
          if (!tabIdMap.has(targetTabId)) {
            if (firstTabId) {
              targetTabId = firstTabId;
            } else {
              const newTab = await this.rawTauriInvoke('create_tab', { name: 'Công việc' });
              targetTabId = newTab.id;
              tabIdMap.add(newTab.id);
            }
          }

          try {
            await this.rawTauriInvoke('create_todo', this.formatArgs('create_todo', {
              tab_id: targetTabId,
              text: todo.text,
              priority: todo.priority || 'none',
              due_date: todo.due_date || null
            }));
          } catch (createErr) {
            console.error('Failed to recover todo into SQLite:', createErr);
          }
        }
      }
    } catch (err) {
      console.warn('Sync and recover check encountered an issue:', err);
    }
  }

  static fallbackHandler(command, args) {
    switch (command) {
      case 'get_all_tabs': {
        const raw = localStorage.getItem(STORAGE_KEY_TABS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(DEFAULT_TABS));
          return [...DEFAULT_TABS];
        }
        return JSON.parse(raw);
      }

      case 'create_tab': {
        const tabs = this.fallbackHandler('get_all_tabs');
        const newTab = {
          id: 'tab-' + Date.now(),
          name: args.name || 'Tab mới',
          sort_order: tabs.length,
          created_at: new Date().toISOString()
        };
        tabs.push(newTab);
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
        return newTab;
      }

      case 'update_tab': {
        const tabs = this.fallbackHandler('get_all_tabs');
        const index = tabs.findIndex(t => t.id === args.id);
        if (index !== -1) {
          tabs[index] = { ...tabs[index], ...args };
          localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
          return tabs[index];
        }
        throw new Error('Tab not found');
      }

      case 'delete_tab': {
        let tabs = this.fallbackHandler('get_all_tabs');
        tabs = tabs.filter(t => t.id !== args.id);
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
        // Also remove associated todos
        let todos = this.fallbackHandler('get_all_todos');
        todos = todos.filter(t => t.tab_id !== args.id);
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
        return true;
      }

      case 'get_all_todos': {
        const raw = localStorage.getItem(STORAGE_KEY_TODOS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(DEFAULT_TODOS));
          return [...DEFAULT_TODOS];
        }
        return JSON.parse(raw);
      }

      case 'get_todos_by_tab': {
        const todos = this.fallbackHandler('get_all_todos');
        return todos.filter(t => t.tab_id === args.tab_id);
      }

      case 'create_todo': {
        const todos = this.fallbackHandler('get_all_todos');
        const newTodo = {
          id: 'todo-' + Date.now(),
          tab_id: args.tab_id,
          text: args.text,
          completed: 0,
          priority: args.priority || 'none',
          sort_order: todos.filter(t => t.tab_id === args.tab_id).length,
          due_date: args.due_date || null,
          created_at: new Date().toISOString()
        };
        todos.unshift(newTodo);
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
        return newTodo;
      }

      case 'toggle_todo': {
        const todos = this.fallbackHandler('get_all_todos');
        const todo = todos.find(t => t.id === args.id);
        if (todo) {
          todo.completed = todo.completed ? 0 : 1;
          localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
          return todo;
        }
        throw new Error('Todo not found');
      }

      case 'update_todo': {
        const todos = this.fallbackHandler('get_all_todos');
        const index = todos.findIndex(t => t.id === args.id);
        if (index !== -1) {
          todos[index] = { ...todos[index], ...args };
          localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
          return todos[index];
        }
        throw new Error('Todo not found');
      }

      case 'update_todo_deadline': {
        const todos = this.fallbackHandler('get_all_todos');
        const index = todos.findIndex(t => t.id === args.id);
        if (index !== -1) {
          todos[index].due_date = args.due_date !== undefined ? args.due_date : (args.dueDate !== undefined ? args.dueDate : null);
          localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
          return todos[index];
        }
        throw new Error('Todo not found');
      }

      case 'delete_todo': {
        let todos = this.fallbackHandler('get_all_todos');
        todos = todos.filter(t => t.id !== args.id);
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
        return true;
      }

      case 'reorder_todos': {
        let todos = this.fallbackHandler('get_all_todos');
        const tabTodos = args.items; // array of updated order { id, sort_order }
        const map = new Map(tabTodos.map(item => [item.id, item.sort_order]));
        todos.forEach(t => {
          if (map.has(t.id)) {
            t.sort_order = map.get(t.id);
          }
        });
        localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
        return true;
      }

      case 'search_todos': {
        const todos = this.fallbackHandler('get_all_todos');
        const query = (args.query || '').toLowerCase().trim();
        if (!query) return [];
        return todos.filter(t => t.text.toLowerCase().includes(query));
      }

      case 'set_always_on_top': {
        localStorage.setItem('todolite_always_on_top', JSON.stringify(args.always_on_top));
        return args.always_on_top;
      }

      case 'minimize_window': {
        console.log('Window minimized (simulation in browser)');
        return true;
      }

      case 'hide_window': {
        console.log('Window hidden to tray (simulation in browser)');
        return true;
      }

      default:
        console.warn(`Unknown command: ${command}`);
        return null;
    }
  }

  // Native Window API Wrappers
  static async setAlwaysOnTop(isPinned) {
    if (this.isTauri() && window.__TAURI__ && window.__TAURI__.window) {
      try {
        const appWindow = window.__TAURI__.window.getCurrentWindow();
        await appWindow.setAlwaysOnTop(isPinned);
      } catch (err) {
        console.error('Failed to set always on top via Tauri:', err);
      }
    }
    return this.invoke('set_always_on_top', { always_on_top: isPinned });
  }

  static async minimizeWindow() {
    if (this.isTauri() && window.__TAURI__ && window.__TAURI__.window) {
      try {
        const appWindow = window.__TAURI__.window.getCurrentWindow();
        await appWindow.minimize();
        return;
      } catch (err) {
        console.error('Failed to minimize window:', err);
      }
    }
    return this.invoke('minimize_window');
  }

  static async hideWindow() {
    if (this.isTauri() && window.__TAURI__ && window.__TAURI__.window) {
      try {
        const appWindow = window.__TAURI__.window.getCurrentWindow();
        await appWindow.hide();
        return;
      } catch (err) {
        console.error('Failed to hide window:', err);
      }
    }
    return this.invoke('hide_window');
  }

  static async startDragging() {
    if (this.isTauri() && window.__TAURI__ && window.__TAURI__.window) {
      try {
        const appWindow = window.__TAURI__.window.getCurrentWindow();
        await appWindow.startDragging();
      } catch (err) {
        console.error('Failed to start dragging:', err);
      }
    }
  }
}
