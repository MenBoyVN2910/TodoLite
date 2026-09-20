/**
 * TodoLite - TakeNote (Rich Text Note Manager)
 * Full Vietnamese input support (IME-safe), rich formatting, color/highlight palettes, emoji picker, and auto-save.
 */

import { store } from './state.js';
import { Bridge } from './bridge.js';
import { showToast } from './app.js';

const POPULAR_EMOJIS = [
  '📌', '⭐', '💡', '🎯', '📅', '⏰', '⚠️', '✅', '❌', '🚀',
  '📝', '🔥', '✨', '⚡', '🎉', '👍', '❤️', '💬', '🏷️', '💻',
  '📊', '📚', '🧠', '💼', '☕', '🌟', '🔔', '🛠️', '🔑', '🌈',
  '🎨', '🏖️', '✈️', '🛒', '💰', '🎵'
];

export class NoteManager {
  constructor() {
    this.editorArea = document.getElementById('note-editor-area');
    this.editor = document.getElementById('note-editor');
    this.toolbar = document.getElementById('note-toolbar');

    // Note Tab Navigation Elements
    this.noteTabsListEl = document.getElementById('note-tabs-list');
    this.addNoteTabBtn = document.getElementById('btn-add-note-tab');
    this.currentTabTitleEl = document.getElementById('current-tab-title');

    // Confirm Modal Elements for Note Tab
    this.confirmBackdrop = document.getElementById('note-tab-confirm-modal-backdrop');
    this.confirmTabName = document.getElementById('note-confirm-tab-name');
    this.btnCancelClose = document.getElementById('btn-cancel-close-note-tab');
    this.btnConfirmClose = document.getElementById('btn-confirm-close-note-tab');

    this.pendingCloseTab = null;

    // Toolbar elements
    this.headingSelect = document.getElementById('note-heading-select');
    this.sizeSelect = document.getElementById('note-size-select');
    this.btnColor = document.getElementById('btn-note-color');
    this.textColorPopover = document.getElementById('text-color-popover');
    this.textColorBar = document.getElementById('text-color-bar');

    this.btnHighlight = document.getElementById('btn-note-highlight');
    this.highlightColorPopover = document.getElementById('highlight-color-popover');
    this.highlightColorBar = document.getElementById('highlight-color-bar');

    this.btnEmoji = document.getElementById('btn-note-emoji');
    this.emojiPopover = document.getElementById('emoji-popover');
    this.emojiGrid = document.getElementById('emoji-grid');
    this.btnHr = document.getElementById('btn-note-hr');

    // Find in Document elements
    this.findBar = document.getElementById('note-find-bar');
    this.findInput = document.getElementById('note-find-input');
    this.findCountEl = document.getElementById('note-find-count');
    this.btnFindPrev = document.getElementById('note-find-prev');
    this.btnFindNext = document.getElementById('note-find-next');
    this.btnFindClose = document.getElementById('note-find-close');
    this.findMatches = [];
    this.findCurrentIndex = -1;
    this.findDebounceTimeout = null;
    this.isFindBarOpen = false;

    // Status bar
    this.wordCountEl = document.getElementById('note-word-count');
    this.charCountEl = document.getElementById('note-char-count');
    this.syncIndicator = document.getElementById('note-sync-indicator');
    this.syncText = document.getElementById('note-sync-text');

    this.isComposing = false;
    this.saveTimeout = null;
    this.savedRange = null;
    this.savedOffsets = null;
    this.currentTabId = null;

    this.init();
  }

  init() {
    this.initNoteTabEvents();
    this.initFindBar();
    this.populateEmojiGrid();
    this.bindToolbarEvents();
    this.bindEditorEvents();
    this.bindPopoverClose();

    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {}

    // Subscribe to state changes
    store.subscribe('noteTabs', () => this.renderNoteTabs());
    store.subscribe('activeNoteTabId', (newTabId) => {
      this.renderNoteTabs();
      this.updateCurrentTabLabel();
      if (newTabId !== this.currentTabId) {
        this.handleTabSwitch(newTabId);
      }
    });

    store.subscribe('viewMode', (mode) => {
      if (mode === 'note') {
        this.updateCurrentTabLabel();
        this.loadActiveNote();
      } else {
        this.saveCurrentNoteImmediately();
      }
    });

    // Save on window blur or page unload
    window.addEventListener('beforeunload', () => this.saveCurrentNoteImmediately());
  }

  async loadInitialData() {
    const noteTabs = await Bridge.invoke('get_all_note_tabs');
    const validTabs = noteTabs || [];
    store.setState({
      noteTabs: validTabs,
      activeNoteTabId: validTabs.length > 0 ? validTabs[0].id : null
    });
  }

  initNoteTabEvents() {
    if (this.addNoteTabBtn) {
      this.addNoteTabBtn.addEventListener('click', () => this.handleCreateNoteTab());
    }

    if (this.btnCancelClose) {
      this.btnCancelClose.addEventListener('click', () => this.closeConfirmModal());
    }
    if (this.btnConfirmClose) {
      this.btnConfirmClose.addEventListener('click', () => this.executeDeleteNoteTab());
    }
    if (this.confirmBackdrop) {
      this.confirmBackdrop.addEventListener('click', (e) => {
        if (e.target === this.confirmBackdrop) {
          this.closeConfirmModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (this.confirmBackdrop && this.confirmBackdrop.classList.contains('open')) {
        if (e.key === 'Escape') {
          this.closeConfirmModal();
        } else if (e.key === 'Enter') {
          this.executeDeleteNoteTab();
        }
      }
    });
  }

  async handleCreateNoteTab() {
    const { noteTabs } = store.getState();
    if (noteTabs.length >= 4) {
      showToast('⚠️ Bạn chỉ có thể mở tối đa 4 tab ghi chú!', 'error');
      if (this.addNoteTabBtn) {
        this.addNoteTabBtn.classList.add('shake');
        setTimeout(() => this.addNoteTabBtn.classList.remove('shake'), 400);
      }
      return;
    }

    const defaultName = `Ghi chú ${noteTabs.length + 1}`;
    const newTab = await Bridge.invoke('create_note_tab', { name: defaultName });

    const updated = [...noteTabs, newTab];
    store.setState({
      noteTabs: updated,
      activeNoteTabId: newTab.id
    });
  }

  async handleSwitchNoteTab(tabId) {
    if (store.getState().activeNoteTabId === tabId) return;
    store.setState({ activeNoteTabId: tabId });
  }

  promptCloseNoteTab(tab, e) {
    if (e) e.stopPropagation();
    const { noteTabs } = store.getState();

    if (noteTabs.length <= 1) {
      showToast('⚠️ Cần giữ lại ít nhất 1 tab ghi chú!', 'error');
      return;
    }

    this.pendingCloseTab = tab;
    if (this.confirmTabName) {
      this.confirmTabName.textContent = tab.name;
    }

    if (this.confirmBackdrop) {
      this.confirmBackdrop.classList.add('open');
      this.btnCancelClose?.focus();
    }
  }

  closeConfirmModal() {
    this.pendingCloseTab = null;
    if (this.confirmBackdrop) {
      this.confirmBackdrop.classList.remove('open');
    }
  }

  async executeDeleteNoteTab() {
    if (!this.pendingCloseTab) return;
    const tabToDelete = this.pendingCloseTab;
    this.closeConfirmModal();

    const { noteTabs, activeNoteTabId } = store.getState();
    await Bridge.invoke('delete_note_tab', { id: tabToDelete.id });

    const remaining = noteTabs.filter(t => t.id !== tabToDelete.id);
    let nextActiveId = activeNoteTabId;
    if (activeNoteTabId === tabToDelete.id) {
      nextActiveId = remaining.length > 0 ? remaining[0].id : null;
    }

    const { notes } = store.getState();
    const updatedNotes = { ...notes };
    delete updatedNotes[tabToDelete.id];

    store.setState({
      noteTabs: remaining,
      notes: updatedNotes,
      activeNoteTabId: nextActiveId
    });

    showToast(`Đã đóng tab "${tabToDelete.name}"`, 'info');
  }

  handleStartRename(tab, titleEl) {
    const currentName = tab.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tab-title-edit';
    input.value = currentName;
    input.maxLength = 30;
    input.style.width = '80px';
    input.style.border = '1px solid var(--accent-color)';
    input.style.borderRadius = '3px';
    input.style.padding = '1px 4px';
    input.style.fontSize = '12px';
    input.style.outline = 'none';

    titleEl.replaceWith(input);
    input.focus();
    input.select();

    const saveName = async () => {
      const newName = input.value.trim() || currentName;
      await Bridge.invoke('update_note_tab', { id: tab.id, name: newName });
      const { noteTabs } = store.getState();
      const updated = noteTabs.map(t => t.id === tab.id ? { ...t, name: newName } : t);
      store.setState({ noteTabs: updated });
    };

    input.addEventListener('blur', saveName);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        input.value = currentName;
        input.blur();
      }
    });
  }

  updateCurrentTabLabel() {
    const { noteTabs, activeNoteTabId, viewMode } = store.getState();
    if (viewMode !== 'note') return;
    const current = noteTabs.find(t => t.id === activeNoteTabId);
    if (this.currentTabTitleEl && current) {
      this.currentTabTitleEl.textContent = current.name;
    }
  }

  renderNoteTabs() {
    if (!this.noteTabsListEl) return;
    const { noteTabs, activeNoteTabId } = store.getState();
    this.noteTabsListEl.innerHTML = '';

    if (this.addNoteTabBtn) {
      if (noteTabs.length >= 4) {
        this.addNoteTabBtn.classList.add('at-limit');
        this.addNoteTabBtn.title = 'Đã đạt tối đa 4 tab ghi chú';
      } else {
        this.addNoteTabBtn.classList.remove('at-limit');
        this.addNoteTabBtn.title = 'Thêm tab ghi chú mới';
      }
    }

    noteTabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab-item ${tab.id === activeNoteTabId ? 'active' : ''}`;
      tabEl.dataset.tabId = tab.id;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'tab-title';
      titleSpan.textContent = tab.name;
      titleSpan.title = 'Nhấp đúp để đổi tên';

      titleSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.handleStartRename(tab, titleSpan);
      });

      tabEl.appendChild(titleSpan);

      // Close button if more than 1 tab
      if (noteTabs.length > 1) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tab-close-btn';
        closeBtn.title = 'Đóng tab';
        closeBtn.innerHTML = `
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        closeBtn.addEventListener('click', (e) => this.promptCloseNoteTab(tab, e));
        tabEl.appendChild(closeBtn);
      }

      tabEl.addEventListener('click', () => this.handleSwitchNoteTab(tab.id));
      this.noteTabsListEl.appendChild(tabEl);
    });
  }

  populateEmojiGrid() {
    if (!this.emojiGrid) return;
    this.emojiGrid.innerHTML = '';
    POPULAR_EMOJIS.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item';
      btn.textContent = emoji;
      btn.title = `Chèn ${emoji}`;
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.insertEmoji(emoji);
        this.closeAllPopovers();
      });
      this.emojiGrid.appendChild(btn);
    });
  }

  bindToolbarEvents() {
    // Basic formatting buttons (Bold, Italic, Underline, Strikethrough, Lists, RemoveFormat)
    const commandButtons = this.toolbar.querySelectorAll('.note-tool-btn[data-command]');
    commandButtons.forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Keep focus and selection in editor
        const cmd = btn.dataset.command;
        this.executeFormat(cmd);
      });
    });

    // Heading Select
    if (this.headingSelect) {
      ['mousedown', 'touchstart', 'focus'].forEach((evt) => {
        this.headingSelect.addEventListener(evt, () => this.saveSelection(true));
      });

      this.headingSelect.addEventListener('change', () => {
        const val = this.headingSelect.value;
        this.applyHeading(val);
      });
    }

    // Font Size Select (1-7 in execCommand)
    if (this.sizeSelect) {
      ['mousedown', 'touchstart', 'focus'].forEach((evt) => {
        this.sizeSelect.addEventListener(evt, () => this.saveSelection(true));
      });

      this.sizeSelect.addEventListener('change', () => {
        const size = this.sizeSelect.value;
        this.restoreSelection();
        document.execCommand('fontSize', false, size);
        this.editor.focus();
        this.saveSelection(true);
        this.updateToolbarState();
        this.triggerAutoSave();
      });
    }

    // Text Color Toggle & Swatches
    if (this.btnColor && this.textColorPopover) {
      this.btnColor.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.saveSelection();
      });
      this.btnColor.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.saveSelection();
        this.openPopover(this.textColorPopover);
      });

      const colorSwatches = this.textColorPopover.querySelectorAll('.palette-swatch[data-color]');
      colorSwatches.forEach((swatch) => {
        swatch.addEventListener('mousedown', (e) => e.preventDefault());
        swatch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const color = swatch.dataset.color;
          this.applyTextColor(color);
          this.closeAllPopovers();
        });
      });
    }

    // Highlight Color Toggle & Swatches
    if (this.btnHighlight && this.highlightColorPopover) {
      this.btnHighlight.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.saveSelection();
      });
      this.btnHighlight.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.saveSelection();
        this.openPopover(this.highlightColorPopover);
      });

      const highlightSwatches = this.highlightColorPopover.querySelectorAll('.palette-swatch[data-highlight]');
      highlightSwatches.forEach((swatch) => {
        swatch.addEventListener('mousedown', (e) => e.preventDefault());
        swatch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const highlightColor = swatch.dataset.highlight;
          this.applyHighlightColor(highlightColor);
          this.closeAllPopovers();
        });
      });
    }

    // Emoji Popover Toggle
    if (this.btnEmoji && this.emojiPopover) {
      this.btnEmoji.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.saveSelection();
      });
      this.btnEmoji.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.saveSelection();
        this.openPopover(this.emojiPopover);
      });
    }

    // Horizontal Divider <hr>
    if (this.btnHr) {
      this.btnHr.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.restoreSelection();
        document.execCommand('insertHorizontalRule', false, null);
        this.editor.focus();
        this.saveSelection();
        this.updateToolbarState();
        this.triggerAutoSave();
      });
    }
  }

  bindEditorEvents() {
    // IME Composition events for safe Vietnamese typing (Unikey / EVKey / Windows Telex)
    this.editor.addEventListener('compositionstart', () => {
      this.isComposing = true;
    });

    this.editor.addEventListener('compositionend', () => {
      this.isComposing = false;
      this.updateCounts();
      this.triggerAutoSave();
    });

    // Content input
    this.editor.addEventListener('input', () => {
      this.cleanBlinkInjectedStyles();
      this.updateCounts();
      if (!this.isComposing) {
        this.triggerAutoSave();
      }
    });

    // Paste plain text & clean up foreign styles
    this.editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      if (!text) return;

      const lines = text.split(/\r\n|\r|\n/);
      if (lines.length === 1) {
        document.execCommand('insertText', false, lines[0]);
      } else {
        const html = lines
          .map(line => `<p>${line.trim() || '<br>'}</p>`)
          .join('');
        document.execCommand('insertHTML', false, html);
      }

      this.cleanBlinkInjectedStyles();
      this.updateCounts();
      this.triggerAutoSave();
    });

    // Save selection range on mouseup / keyup
    this.editor.addEventListener('mouseup', () => {
      this.saveSelection();
      this.updateToolbarState();
    });
    this.editor.addEventListener('keyup', (e) => {
      if (!['Control', 'Shift', 'Alt'].includes(e.key)) {
        this.saveSelection();
        this.updateToolbarState();
      }
    });

    // Real-time selection tracking & toolbar sync
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (this.editor.contains(range.commonAncestorContainer)) {
          this.saveSelection();
          this.updateToolbarState();
        }
      }
    });

    this.editor.addEventListener('focus', () => {
      try {
        document.execCommand('defaultParagraphSeparator', false, 'p');
      } catch {}
      if (!this.editor.innerHTML.trim() || this.editor.innerHTML === '<br>') {
        this.editor.innerHTML = '<p><br></p>';
      }
      this.updateToolbarState();
    });

    // Keyboard shortcuts
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    });
  }

  bindPopoverClose() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.popover-wrapper')) {
        this.closeAllPopovers();
      }
    });

    // Real-time repositioning when user resizes the window with an active popover
    window.addEventListener('resize', () => {
      this.repositionActivePopover();
    });
  }

  repositionActivePopover() {
    const activePopover = [this.textColorPopover, this.highlightColorPopover, this.emojiPopover].find(
      (p) => p && p.classList.contains('open')
    );
    if (activePopover) {
      this.applyPopoverPosition(activePopover);
    }
  }

  applyPopoverPosition(popover) {
    if (!popover) return;
    const wrapper = popover.closest('.popover-wrapper');
    const windowWidth = window.innerWidth;
    const padding = 14; // Margin from window edges

    // Reset inline styles to calculate natural geometry
    popover.style.left = '';
    popover.style.right = '';
    popover.style.transform = '';

    if (wrapper) {
      const wrapperRect = wrapper.getBoundingClientRect();

      // If button is in the right half of the window, align to right of button; otherwise align to left
      if (wrapperRect.left + wrapperRect.width / 2 > windowWidth / 2) {
        popover.style.left = 'auto';
        popover.style.right = '0';
      } else {
        popover.style.left = '0';
        popover.style.right = 'auto';
      }
    }

    // Safety boundary clamping: guarantee popover never exceeds left or right window borders
    const rect = popover.getBoundingClientRect();
    if (rect.right > windowWidth - padding) {
      const overflow = rect.right - (windowWidth - padding);
      popover.style.transform = `translateX(-${overflow}px)`;
    } else if (rect.left < padding) {
      const overflow = padding - rect.left;
      popover.style.transform = `translateX(${overflow}px)`;
    }
  }

  openPopover(popover) {
    if (!popover) return;
    const wasOpen = popover.classList.contains('open');
    this.closeAllPopovers();
    if (wasOpen) return;

    popover.classList.add('open');
    this.applyPopoverPosition(popover);
  }

  closeAllPopovers() {
    [this.textColorPopover, this.highlightColorPopover, this.emojiPopover].forEach((p) => {
      if (p) {
        p.classList.remove('open');
        p.style.transform = '';
        p.style.left = '';
        p.style.right = '';
      }
    });
  }

  saveSelection(force = false) {
    if (!force && document.activeElement !== this.editor) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (this.editor.contains(range.commonAncestorContainer)) {
        this.savedRange = range.cloneRange();
        this.savedOffsets = this.getSelectionOffsets();
      }
    }
  }

  getSelectionOffsets() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return null;

    let start = 0;
    let end = 0;
    let charCount = 0;
    let foundStart = false;
    let foundEnd = false;

    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;
      if (!foundStart && node === range.startContainer) {
        start = charCount + range.startOffset;
        foundStart = true;
      }
      if (!foundEnd && node === range.endContainer) {
        end = charCount + range.endOffset;
        foundEnd = true;
      }
      charCount += nodeLength;
      if (foundStart && foundEnd) break;
    }

    if (!foundStart || !foundEnd) {
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(this.editor);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      start = preCaretRange.toString().length;
      end = start + range.toString().length;
    }

    return { start, end };
  }

  setSelectionOffsets(start, end) {
    const sel = window.getSelection();
    if (!sel) return null;

    let charCount = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;

      if (!startNode && charCount + nodeLength >= start) {
        startNode = node;
        startOffset = start - charCount;
      }

      if (!endNode && charCount + nodeLength >= end) {
        endNode = node;
        endOffset = end - charCount;
        break;
      }

      charCount += nodeLength;
    }

    if (!startNode || !endNode) {
      return null;
    }

    const range = document.createRange();
    range.setStart(startNode, Math.min(Math.max(0, startOffset), startNode.textContent.length));
    range.setEnd(endNode, Math.min(Math.max(0, endOffset), endNode.textContent.length));

    sel.removeAllRanges();
    sel.addRange(range);
    this.savedRange = range.cloneRange();
    this.savedOffsets = { start, end };
    return range;
  }

  restoreSelection() {
    const sel = window.getSelection();
    // If active selection is already valid inside editor, keep it
    if (sel && sel.rangeCount > 0) {
      const currentRange = sel.getRangeAt(0);
      if (this.editor.contains(currentRange.commonAncestorContainer)) {
        return;
      }
    }

    // Try restoring from savedRange if still connected to DOM
    if (
      this.savedRange &&
      this.savedRange.startContainer &&
      this.savedRange.startContainer.isConnected &&
      this.savedRange.endContainer &&
      this.savedRange.endContainer.isConnected &&
      this.editor.contains(this.savedRange.commonAncestorContainer)
    ) {
      try {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
        return;
      } catch {
        // Fallback to offsets
      }
    }

    // Fallback: restore from character offsets
    if (this.savedOffsets) {
      this.setSelectionOffsets(this.savedOffsets.start, this.savedOffsets.end);
    }
  }

  executeFormat(command, value = null) {
    this.restoreSelection();
    document.execCommand(command, false, value);
    this.editor.focus();
    this.saveSelection(true);
    this.updateToolbarState();
    this.triggerAutoSave();
  }

  applyHeading(tag) {
    this.restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;

    const getBlock = (node) => {
      let curr = node;
      while (curr && curr !== this.editor) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
          const t = curr.tagName.toLowerCase();
          if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote'].includes(t)) {
            return curr;
          }
        }
        curr = curr.parentNode;
      }
      return null;
    };

    let startBlock = getBlock(range.startContainer);
    let endBlock = getBlock(range.endContainer);

    if (!startBlock || startBlock === this.editor) {
      this.normalizeEditorContent();
      startBlock = getBlock(range.startContainer);
      endBlock = getBlock(range.endContainer);
    }

    // CASE 1: Collapsed caret (no text selected)
    if (range.collapsed) {
      if (startBlock && startBlock !== this.editor) {
        const newBlock = document.createElement(tag);
        while (startBlock.firstChild) {
          newBlock.appendChild(startBlock.firstChild);
        }
        startBlock.parentNode.replaceChild(newBlock, startBlock);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        this.saveSelection(true);
      }
      this.editor.focus();
      this.updateToolbarState();
      this.triggerAutoSave();
      return;
    }

    // CASE 2: Text is selected within a single block
    if (startBlock && startBlock === endBlock && startBlock !== this.editor) {
      const blockText = startBlock.textContent;
      const selectedText = range.toString();
      const isEntireBlock = blockText.trim() === selectedText.trim();
      const isAlreadyHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(startBlock.tagName.toLowerCase());

      if (isEntireBlock || isAlreadyHeading) {
        const newBlock = document.createElement(tag);
        while (startBlock.firstChild) {
          newBlock.appendChild(startBlock.firstChild);
        }
        startBlock.parentNode.replaceChild(newBlock, startBlock);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        sel.removeAllRanges();
        sel.addRange(newRange);
        this.saveSelection(true);
      } else {
        // Partial selection within a paragraph: extract into new heading, split paragraph
        const extracted = range.extractContents();
        const headingEl = document.createElement(tag);
        headingEl.appendChild(extracted);

        const parent = startBlock.parentNode;

        // Content before selection
        const preRange = document.createRange();
        preRange.setStart(startBlock, 0);
        preRange.setEnd(range.startContainer, range.startOffset);
        const preContent = preRange.extractContents();

        if (preContent.textContent.trim().length > 0 || preContent.querySelector('img, hr, br')) {
          const beforeP = document.createElement('p');
          beforeP.appendChild(preContent);
          parent.insertBefore(beforeP, startBlock);
        }

        parent.insertBefore(headingEl, startBlock);

        if (!startBlock.textContent.trim() && !startBlock.querySelector('img, hr, br')) {
          parent.removeChild(startBlock);
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(headingEl);
        sel.removeAllRanges();
        sel.addRange(newRange);
        this.saveSelection(true);
      }
    } else {
      // CASE 3: Selection spans multiple blocks
      if (tag === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else {
        document.execCommand('formatBlock', false, `<${tag}>`);
      }
      this.saveSelection(true);
    }

    this.editor.focus();
    this.updateToolbarState();
    this.triggerAutoSave();
  }

  normalizeEditorContent() {
    if (!this.editor) return;
    const html = this.editor.innerHTML.trim();
    if (!html || html === '<br>' || html === '<p><br></p>') {
      this.editor.innerHTML = '<p><br></p>';
      return;
    }

    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {}

    const hasBlockElements = Array.from(this.editor.children).some(child =>
      ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'ul', 'ol', 'blockquote', 'hr'].includes(child.tagName.toLowerCase())
    );

    if (!hasBlockElements) {
      const content = this.editor.innerHTML;
      const lines = content.split(/<br\s*\/?>/i);
      this.editor.innerHTML = lines
        .map(line => `<p>${line.trim() || '<br>'}</p>`)
        .join('');
    }

    this.cleanBlinkInjectedStyles();
  }

  cleanBlinkInjectedStyles() {
    if (!this.editor) return;

    const defaultColors = [
      'rgb(248, 250, 252)',
      'rgb(248,250,252)',
      '#f8fafc',
      'rgb(15, 23, 42)',
      'rgb(15,23,42)',
      '#0f172a',
      'rgb(0, 0, 0)',
      'rgb(0,0,0)',
      '#000000',
      'black',
      'rgb(255, 255, 255)',
      'rgb(255,255,255)',
      '#ffffff',
      'white'
    ];

    const styledElements = this.editor.querySelectorAll('[style], font');
    styledElements.forEach((el) => {
      if (el.hasAttribute('data-user-color')) return;

      const bgColor = el.style ? el.style.backgroundColor : '';
      if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
        el.style.removeProperty('background-color');
      }

      const color = el.style ? el.style.color : el.getAttribute('color');
      if (color && defaultColors.includes(color.trim().toLowerCase())) {
        if (el.style) el.style.removeProperty('color');
        if (el.hasAttribute('color')) el.removeAttribute('color');
      }

      if (el.tagName.toLowerCase() === 'font' && !el.getAttribute('color') && !el.getAttribute('size') && !el.getAttribute('face')) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
      }

      if (el.tagName.toLowerCase() === 'span' && (!el.getAttribute('style') || !el.getAttribute('style').trim()) && !el.className && !el.id) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
      }
    });
  }

  applyTextColor(color) {
    this.restoreSelection();
    const savedOffsets = this.savedOffsets || this.getSelectionOffsets();
    if (color === 'inherit') {
      document.execCommand('removeFormat', false, null);
      this.cleanBlinkInjectedStyles();
    } else {
      document.execCommand('foreColor', false, color);
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const fontOrSpans = (container.nodeType === Node.ELEMENT_NODE ? container : container.parentNode)
          .querySelectorAll('font[color], span[style*="color"]');
        fontOrSpans.forEach(el => el.setAttribute('data-user-color', 'true'));
      }
    }
    if (this.textColorBar) {
      this.textColorBar.style.backgroundColor = color === 'inherit' ? 'var(--text-primary)' : color;
    }
    this.editor.focus();
    if (savedOffsets) {
      this.setSelectionOffsets(savedOffsets.start, savedOffsets.end);
    }
    this.saveSelection(true);
    this.updateToolbarState();
    this.triggerAutoSave();
  }

  applyHighlightColor(color) {
    this.restoreSelection();
    const savedOffsets = this.savedOffsets || this.getSelectionOffsets();
    if (color === 'transparent') {
      try {
        document.execCommand('hiliteColor', false, 'transparent');
      } catch {
        document.execCommand('backColor', false, 'transparent');
      }
    } else {
      try {
        document.execCommand('hiliteColor', false, color);
      } catch {
        document.execCommand('backColor', false, color);
      }
    }
    if (this.highlightColorBar) {
      this.highlightColorBar.style.backgroundColor = color === 'transparent' ? 'transparent' : color;
    }
    this.editor.focus();
    if (savedOffsets) {
      this.setSelectionOffsets(savedOffsets.start, savedOffsets.end);
    }
    this.saveSelection();
    this.updateToolbarState();
    this.triggerAutoSave();
  }

  insertEmoji(emoji) {
    this.restoreSelection();
    document.execCommand('insertHTML', false, emoji);
    this.editor.focus();
    this.saveSelection();
    this.updateToolbarState();
    this.triggerAutoSave();
    this.updateCounts();
  }

  updateToolbarState() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;

    // 1. Heading Select Sync
    if (this.headingSelect) {
      let block = range.commonAncestorContainer;
      while (block && block !== this.editor) {
        if (block.nodeType === Node.ELEMENT_NODE) {
          const tag = block.tagName.toLowerCase();
          if (['h1', 'h2', 'h3', 'p'].includes(tag)) {
            this.headingSelect.value = tag;
            break;
          }
        }
        block = block.parentNode;
      }
      if (!block || block === this.editor) {
        this.headingSelect.value = 'p';
      }
    }

    // 2. Format Buttons Sync (.active class)
    const commandButtons = this.toolbar.querySelectorAll('.note-tool-btn[data-command]');
    commandButtons.forEach((btn) => {
      const cmd = btn.dataset.command;
      try {
        if (document.queryCommandState(cmd)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      } catch {
        // Ignore unsupported commands
      }
    });

    // 3. Font Size Sync
    if (this.sizeSelect) {
      try {
        const size = document.queryCommandValue('fontSize');
        if (size && ['2', '3', '4', '5'].includes(String(size))) {
          this.sizeSelect.value = String(size);
        }
      } catch {
        // Ignore
      }
    }
  }

  updateCounts() {
    const text = this.editor.innerText || '';
    const trimmed = text.trim();
    const wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const charCount = text.replace(/[\r\n]/g, '').length;

    if (this.wordCountEl) this.wordCountEl.textContent = `${wordCount} từ`;
    if (this.charCountEl) this.charCountEl.textContent = `${charCount} ký tự`;
  }

  triggerAutoSave() {
    this.setSyncStatus('saving');
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveCurrentNoteImmediately();
    }, 500);
  }

  async saveCurrentNoteImmediately() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    const activeNoteTabId = this.currentTabId || store.getState().activeNoteTabId;
    if (!activeNoteTabId) return;

    const content = this.editor.innerHTML;

    try {
      const updatedNote = await Bridge.invoke('upsert_note', {
        tab_id: activeNoteTabId,
        content: content
      });

      const { notes } = store.getState();
      store.setState({
        notes: {
          ...notes,
          [activeNoteTabId]: updatedNote
        }
      });

      this.setSyncStatus('saved');
    } catch (err) {
      console.error('Failed to save note:', err);
      this.setSyncStatus('error');
    }
  }

  async handleTabSwitch(newTabId) {
    // 1. Save previous note immediately if switching to different tab
    if (this.currentTabId && this.currentTabId !== newTabId) {
      await this.saveCurrentNoteImmediately();
    }
    // 2. Set new tab and load note
    this.currentTabId = newTabId;
    await this.loadActiveNote();
  }

  async loadActiveNote() {
    const activeNoteTabId = store.getState().activeNoteTabId;
    if (!activeNoteTabId) return;

    this.currentTabId = activeNoteTabId;

    let note = store.getState().notes[activeNoteTabId];
    if (!note) {
      try {
        note = await Bridge.invoke('get_note_by_tab', { tab_id: activeNoteTabId });
        if (note) {
          const { notes } = store.getState();
          store.setState({ notes: { ...notes, [activeNoteTabId]: note } });
        }
      } catch (err) {
        console.warn('Error fetching note for tab:', err);
      }
    }

    const htmlContent = note ? note.content : '';
    this.editor.innerHTML = htmlContent;
    this.normalizeEditorContent();
    this.savedRange = null;
    this.savedOffsets = null;
    this.updateCounts();
    this.updateToolbarState();
    this.setSyncStatus('saved');
  }

  setSyncStatus(status) {
    if (!this.syncIndicator || !this.syncText) return;

    if (status === 'saving') {
      this.syncIndicator.className = 'note-sync-indicator saving';
      this.syncText.textContent = 'Đang lưu...';
    } else if (status === 'saved') {
      this.syncIndicator.className = 'note-sync-indicator saved';
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.syncText.textContent = `Đã lưu (${timeStr})`;
    } else if (status === 'error') {
      this.syncIndicator.className = 'note-sync-indicator';
      this.syncText.textContent = 'Chưa lưu được';
    }
  }

  // ==========================================================================
  // Find in Document (IDE-style Ctrl+F)
  // ==========================================================================

  initFindBar() {
    if (!this.findBar || !this.findInput) return;

    // Input: real-time search with debounce
    this.findInput.addEventListener('input', () => {
      clearTimeout(this.findDebounceTimeout);
      this.findDebounceTimeout = setTimeout(() => {
        this.findInEditor(this.findInput.value);
      }, 120);
    });

    // Keyboard shortcuts inside find input
    this.findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          this.navigateMatch(-1); // Previous
        } else {
          this.navigateMatch(1);  // Next
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeFindBar();
      }
    });

    // Navigation buttons
    if (this.btnFindPrev) {
      this.btnFindPrev.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateMatch(-1);
      });
    }

    if (this.btnFindNext) {
      this.btnFindNext.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateMatch(1);
      });
    }

    // Close button
    if (this.btnFindClose) {
      this.btnFindClose.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeFindBar();
      });
    }
  }

  openFindBar() {
    if (!this.findBar) return;
    this.isFindBarOpen = true;
    this.findBar.classList.add('open');
    this.findInput.focus();
    this.findInput.select();

    // If there's already text, re-run search
    if (this.findInput.value.trim()) {
      this.findInEditor(this.findInput.value);
    }
  }

  closeFindBar() {
    if (!this.findBar) return;
    this.isFindBarOpen = false;
    this.findBar.classList.remove('open');
    this.clearFindHighlights();
    this.findInput.value = '';
    this.updateFindCounter();
    this.editor.focus();
  }

  findInEditor(query) {
    // Clear previous highlights first
    this.clearFindHighlights();
    this.findMatches = [];
    this.findCurrentIndex = -1;

    const q = query.trim();
    if (!q) {
      this.updateFindCounter();
      return;
    }

    const qLower = q.toLowerCase();

    // Walk all text nodes inside the editor
    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      // Skip text nodes inside existing find marks (shouldn't happen after clear, but safety)
      if (node.parentElement && node.parentElement.classList.contains('note-find-highlight')) continue;
      textNodes.push(node);
    }

    // Search and wrap matches with <mark> tags
    // Process in reverse order so DOM mutations don't invalidate subsequent nodes
    const nodesToProcess = [];
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const textLower = text.toLowerCase();
      let startIdx = 0;
      const ranges = [];

      while (startIdx < text.length) {
        const matchIdx = textLower.indexOf(qLower, startIdx);
        if (matchIdx === -1) break;
        ranges.push({ start: matchIdx, end: matchIdx + q.length });
        startIdx = matchIdx + q.length;
      }

      if (ranges.length > 0) {
        nodesToProcess.push({ textNode, ranges });
      }
    });

    // Apply highlights (process in reverse document order to keep offsets valid)
    nodesToProcess.reverse().forEach(({ textNode, ranges }) => {
      const parent = textNode.parentNode;
      if (!parent) return;

      // Process ranges in reverse so split offsets remain valid
      const sortedRanges = [...ranges].sort((a, b) => b.start - a.start);

      let currentNode = textNode;
      sortedRanges.forEach(range => {
        const text = currentNode.textContent;
        if (range.end > text.length) return;

        // Split: [before][match][after]
        currentNode.splitText(range.end);
        const matchNode = currentNode.splitText(range.start);

        // Wrap matchNode in <mark>
        const mark = document.createElement('mark');
        mark.className = 'note-find-highlight';
        mark.textContent = matchNode.textContent;

        parent.replaceChild(mark, matchNode);
        this.findMatches.push(mark);
      });
    });

    // Reverse the findMatches array so index 0 is the first match in document order
    this.findMatches.reverse();

    // Navigate to first match if any
    if (this.findMatches.length > 0) {
      this.findCurrentIndex = 0;
      this.activateCurrentMatch();
    }

    this.updateFindCounter();
  }

  navigateMatch(direction) {
    if (this.findMatches.length === 0) return;

    // Deactivate current
    if (this.findCurrentIndex >= 0 && this.findCurrentIndex < this.findMatches.length) {
      this.findMatches[this.findCurrentIndex].classList.remove('active');
    }

    // Move index with wrapping
    this.findCurrentIndex += direction;
    if (this.findCurrentIndex >= this.findMatches.length) {
      this.findCurrentIndex = 0;
    } else if (this.findCurrentIndex < 0) {
      this.findCurrentIndex = this.findMatches.length - 1;
    }

    this.activateCurrentMatch();
    this.updateFindCounter();
  }

  activateCurrentMatch() {
    if (this.findCurrentIndex < 0 || this.findCurrentIndex >= this.findMatches.length) return;

    const mark = this.findMatches[this.findCurrentIndex];
    mark.classList.add('active');

    // Scroll the match into view within the editor wrapper
    const editorWrapper = this.editor.closest('.note-editor-wrapper');
    if (editorWrapper && mark) {
      const wrapperRect = editorWrapper.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      const relativeTop = markRect.top - wrapperRect.top + editorWrapper.scrollTop;

      // Scroll so the match is roughly centered
      const targetScroll = relativeTop - (editorWrapper.clientHeight / 2) + (markRect.height / 2);
      editorWrapper.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }

  clearFindHighlights() {
    // Unwrap all <mark class="note-find-highlight"> back to plain text
    const marks = this.editor.querySelectorAll('mark.note-find-highlight');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      const textNode = document.createTextNode(mark.textContent);
      parent.replaceChild(textNode, mark);
      // Normalize to merge adjacent text nodes
      parent.normalize();
    });
    this.findMatches = [];
    this.findCurrentIndex = -1;
  }

  updateFindCounter() {
    if (!this.findCountEl) return;

    if (this.findMatches.length === 0) {
      const query = this.findInput ? this.findInput.value.trim() : '';
      if (query) {
        this.findCountEl.textContent = '0 kết quả';
        this.findCountEl.classList.remove('has-results');
      } else {
        this.findCountEl.textContent = '';
        this.findCountEl.classList.remove('has-results');
      }
    } else {
      this.findCountEl.textContent = `${this.findCurrentIndex + 1}/${this.findMatches.length}`;
      this.findCountEl.classList.add('has-results');
    }
  }
}
