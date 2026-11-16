use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct AppState {
    pub active_tab: String,
    pub is_ready: bool,
}

pub struct StorageManager {
    pub state: Mutex<AppState>,
}

impl StorageManager {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(AppState {
                active_tab: "home".to_string(),
                is_ready: true,
            }),
        }
    }
}
