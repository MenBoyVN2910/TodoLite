/**
 * TodoLite - Cross-tab Real-time Search
 */

import { store } from './state.js';
import { Bridge } from './bridge.js';

export class SearchManager {
  constructor() {
    this.overlay = document.getElementById('search-overlay');
    this.searchInput = document.getElementById('search-input');
    this.btnClear = document.getElementById('btn-search-clear');
    this.btnClose = document.getElementById('btn-search-close');
    this.btnToggle = document.getElementById('btn-tool-search');
    this.resultsList = document.getElementById('search-results');

    this.debounceTimeout = null;
    this.initEvents();
  }

  initEvents() {
    this.btnToggle.addEventListener('click', () => this.toggleSearch());

    // Nút đóng tìm kiếm
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.closeSearch());
    }

    // Nút xóa nội dung ô tìm kiếm
    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => {
        this.searchInput.value = '';
        this.updateClearBtn();
        this.searchInput.focus();
        this.executeSearch('');
      });
    }

    this.searchInput.addEventListener('input', (e) => {
      this.updateClearBtn();
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.executeSearch(e.target.value);
      }, 180);
    });

    // Close on escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && store.getState().isSearchOpen) {
        this.closeSearch();
      }
      // Ctrl+F or Cmd+F opens search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        this.openSearch();
      }
    });

    // Close on click outside search box
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeSearch();
      }
    });
  }

  updateClearBtn() {
    if (!this.btnClear) return;
    if (this.searchInput.value.trim().length > 0) {
      this.btnClear.style.display = 'flex';
    } else {
      this.btnClear.style.display = 'none';
    }
  }

  toggleSearch() {
    if (store.getState().isSearchOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch() {
    store.setState({ isSearchOpen: true });
    this.overlay.classList.add('open');
    this.btnToggle.classList.add('active');
    this.updateClearBtn();
    this.searchInput.focus();
    this.searchInput.select();
    this.executeSearch(this.searchInput.value);
  }

  closeSearch() {
    store.setState({ isSearchOpen: false });
    this.overlay.classList.remove('open');
    this.btnToggle.classList.remove('active');
    this.updateClearBtn();
    
    // Ensure window frame is at top
    const appWin = document.getElementById('app-window');
    if (appWin && appWin.scrollTop !== 0) appWin.scrollTop = 0;
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  }

  async executeSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.resultsList.innerHTML = '<div class="search-no-results">Nhập từ khóa để tìm kiếm việc cần làm trên tất cả các tab...</div>';
      return;
    }

    const { tabs, todos } = store.getState();
    const matched = todos.filter(t => t.text.toLowerCase().includes(q));

    if (matched.length === 0) {
      this.resultsList.innerHTML = `<div class="search-no-results">Không tìm thấy công việc nào khớp với "<b>${escapeHtml(query)}</b>"</div>`;
      return;
    }

    this.resultsList.innerHTML = '';

    // Group by tab
    const grouped = new Map();
    matched.forEach(t => {
      if (!grouped.has(t.tab_id)) {
        grouped.set(t.tab_id, []);
      }
      grouped.get(t.tab_id).push(t);
    });

    grouped.forEach((tabTodos, tabId) => {
      const tabObj = tabs.find(t => t.id === tabId);
      const tabName = tabObj ? tabObj.name : 'Khác';

      const groupEl = document.createElement('div');
      groupEl.className = 'search-result-group';

      const headerEl = document.createElement('div');
      headerEl.className = 'search-group-header';
      headerEl.textContent = `📁 ${tabName} (${tabTodos.length})`;
      groupEl.appendChild(headerEl);

      tabTodos.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'search-result-item';

        // Highlight matching text
        const regex = new RegExp(`(${escapeRegex(q)})`, 'gi');
        const highlightedText = item.text.replace(regex, '<span class="match-highlight">$1</span>');

        itemEl.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="opacity: 0.6; font-size: 11px;">${item.completed ? '✓' : '○'}</span>
            <span style="${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${highlightedText}</span>
          </div>
          ${item.priority && item.priority !== 'none' ? `<span class="priority-tag ${item.priority}">${item.priority}</span>` : ''}
        `;

        itemEl.addEventListener('click', () => {
          // Switch to this tab
          store.setState({ activeTabId: tabId });
          this.closeSearch();
          // Scroll within todo-scroll-area only (never scroll the outer app window or header)
          setTimeout(() => {
            const scrollArea = document.querySelector('.todo-scroll-area');
            const targetEl = document.querySelector(`.todo-item[data-id="${item.id}"]`);
            if (scrollArea && targetEl) {
              const scrollAreaRect = scrollArea.getBoundingClientRect();
              const targetRect = targetEl.getBoundingClientRect();
              const currentScrollTop = scrollArea.scrollTop;
              const relativeTop = targetRect.top - scrollAreaRect.top + currentScrollTop;
              const targetScrollTop = relativeTop - (scrollArea.clientHeight / 2) + (targetRect.height / 2);

              scrollArea.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
              });

              targetEl.style.boxShadow = '0 0 12px var(--accent-color)';
              setTimeout(() => {
                targetEl.style.boxShadow = '';
              }, 1500);
            }

            const appWin = document.getElementById('app-window');
            if (appWin && appWin.scrollTop !== 0) appWin.scrollTop = 0;
            if (window.scrollY !== 0) window.scrollTo(0, 0);
          }, 100);
        });

        groupEl.appendChild(itemEl);
      });

      this.resultsList.appendChild(groupEl);
    });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
