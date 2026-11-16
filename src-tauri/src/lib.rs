pub mod commands;
pub mod storage;

use commands::app::{get_app_info, get_system_info, ping};
use storage::StorageManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(StorageManager::new())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_system_info,
            ping
        ])
        .run(tauri::generate_context!())
        .expect("error while running Nexus application");
}
