// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod tray;

use db::{DbState, NoteItem, ReorderItem, TabItem, TodoItem};
use tauri::{Manager, State, WebviewWindow};

// ----------------- TAB COMMANDS -----------------
#[tauri::command]
fn get_all_tabs(state: State<DbState>) -> Result<Vec<TabItem>, String> {
    state.get_all_tabs().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_tab(name: String, state: State<DbState>) -> Result<TabItem, String> {
    state.create_tab(name).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_tab(id: String, name: String, state: State<DbState>) -> Result<TabItem, String> {
    state.update_tab(id, name).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_tab(id: String, state: State<DbState>) -> Result<(), String> {
    state.delete_tab(id).map_err(|e| e.to_string())
}

// ----------------- TODO COMMANDS -----------------
#[tauri::command]
fn get_all_todos(state: State<DbState>) -> Result<Vec<TodoItem>, String> {
    state.get_all_todos().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_todo(
    tab_id: String,
    text: String,
    priority: String,
    due_date: Option<String>,
    state: State<DbState>,
) -> Result<TodoItem, String> {
    state
        .create_todo(tab_id, text, priority, due_date)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_todo(id: String, state: State<DbState>) -> Result<TodoItem, String> {
    state.toggle_todo(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_todo(id: String, text: String, state: State<DbState>) -> Result<TodoItem, String> {
    state.update_todo(id, text).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_todo_deadline(
    id: String,
    due_date: Option<String>,
    state: State<DbState>,
) -> Result<TodoItem, String> {
    state.update_todo_deadline(id, due_date).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_todo(id: String, state: State<DbState>) -> Result<(), String> {
    state.delete_todo(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn reorder_todos(items: Vec<ReorderItem>, state: State<DbState>) -> Result<(), String> {
    state.reorder_todos(items).map_err(|e| e.to_string())
}

// ----------------- NOTE TAB COMMANDS -----------------
#[tauri::command]
fn get_all_note_tabs(state: State<DbState>) -> Result<Vec<TabItem>, String> {
    state.get_all_note_tabs().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_note_tab(name: String, state: State<DbState>) -> Result<TabItem, String> {
    state.create_note_tab(name).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_note_tab(id: String, name: String, state: State<DbState>) -> Result<TabItem, String> {
    state.update_note_tab(id, name).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note_tab(id: String, state: State<DbState>) -> Result<(), String> {
    state.delete_note_tab(id).map_err(|e| e.to_string())
}

// ----------------- NOTE COMMANDS -----------------
#[tauri::command]
fn get_all_notes(state: State<DbState>) -> Result<Vec<NoteItem>, String> {
    state.get_all_notes().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_note_by_tab(tab_id: String, state: State<DbState>) -> Result<Option<NoteItem>, String> {
    state.get_note_by_tab(tab_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn upsert_note(tab_id: String, content: String, state: State<DbState>) -> Result<NoteItem, String> {
    state.upsert_note(tab_id, content).map_err(|e| e.to_string())
}

// ----------------- WINDOW ACTIONS -----------------
#[tauri::command]
fn set_always_on_top(always_on_top: bool, window: WebviewWindow) -> Result<(), String> {
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())
}

#[tauri::command]
fn minimize_window(window: WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
fn hide_window(window: WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

fn main() {
    let db = DbState::new().expect("Failed to initialize SQLite database");

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .manage(db)
        .setup(|app| {
            let app_handle = app.handle().clone();
            tray::setup_tray(&app_handle)?;

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_tabs,
            create_tab,
            update_tab,
            delete_tab,
            get_all_todos,
            create_todo,
            toggle_todo,
            update_todo,
            update_todo_deadline,
            delete_todo,
            reorder_todos,
            get_all_note_tabs,
            create_note_tab,
            update_note_tab,
            delete_note_tab,
            get_all_notes,
            get_note_by_tab,
            upsert_note,
            set_always_on_top,
            minimize_window,
            hide_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running TodoLite application");
}
