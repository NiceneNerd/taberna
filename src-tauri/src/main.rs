#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs, path::Path};

use anyhow::Context;
use indexmap::IndexMap;
use roead::aamp::ParameterIO;
use table::{tables_to_pio, Table};

mod table;

#[derive(serde::Serialize)]
pub struct Error(String);

pub type Result<T> = std::result::Result<T, Error>;

impl From<anyhow::Error> for Error {
    fn from(err: anyhow::Error) -> Self {
        Error(format!("{:#?}", err))
    }
}

#[tauri::command]
fn open(path: &str) -> Result<IndexMap<String, Table>> {
    let path = Path::new(path);
    let bytes =
        fs::read(path).with_context(|| format!("Failed to open file at {}", path.display()))?;
    let pio = if path.extension().unwrap_or_default() == "bshop" {
        ParameterIO::from_binary(bytes).context("Failed to parse binary shop data file")?
    } else {
        ParameterIO::from_text(std::str::from_utf8(&bytes).context("Invalid UTF-8 text")?)
            .context("Failed to parse YAML shop data file")?
    };
    Ok(table::parse_tables(&pio)?)
}

#[tauri::command]
fn save(tables: IndexMap<String, Table>, path: &str) -> Result<()> {
    let path = Path::new(path);
    std::fs::write(path, tables_to_pio(tables).to_text()).context("Failed to save")?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![open, save])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
