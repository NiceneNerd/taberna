import { Accessor, createSignal, For, Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";
import {
  RiDeviceSave2Fill,
  RiDeviceSave3Fill,
  RiDocumentFolderOpenFill,
  RiSystemAddFill,
  RiSystemDeleteBinFill
} from "solid-icons/ri";
import { Option, OptionEquipped, None, equip } from "rustic";
import { Table, TableItem } from "./shop";
import { TableView } from "./components/TableView";
import "./App.css";
import { toObject } from "./util";

interface File {
  path: string;
  tables: Map<string, Table>;
}

function App() {
  const [file, setFile] = createSignal<Option<File>>(None);
  const [selectedTable, setSelectedTable] = createSignal<Option<string>>(None);
  const [newTableName, setNewTableName] = createSignal("");

  const openFile = async () => {
    const selected = equip(
      await open({
        filters: [
          {
            name: "Binary Shop Table",
            extensions: ["bshop"]
          },
          {
            name: "Text Shop Table",
            extensions: ["yaml", "yml"]
          },
          {
            name: "All Files",
            extensions: ["*"]
          }
        ],
        title: "Open Shop File"
      })
    );

    if (selected.isSome()) {
      let path = selected.unwrap();
      if (Array.isArray(path)) {
        path = path[0];
      }
      try {
        const res: Object = await invoke("open", { path });
        const tables: Map<string, Table> = new Map(
          Object.entries(res).map(([name, table]) => [
            name,
            new Map(
              Object.entries(table).map(([itemName, item]) => [
                itemName,
                item as TableItem
              ])
            )
          ])
        );
        const file: File = {
          path,
          tables
        };
        console.log(file);
        setFile(file);
        const initialTable = file.tables.has("Normal")
          ? "Normal"
          : file.tables.keys().next().value;
        setSelectedTable(initialTable);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const saveFile = async () => {
    if (!file()) return;
    const { path, tables } = equip(file()).unwrap();
    await invoke("save", { path, tables: toObject(tables) });
  };

  const saveFileAs = async () => {
    if (!file()) return;
    const { tables } = equip(file()).unwrap();
    const path = await save({
      title: "Save As",
      filters: [
        {
          name: "Binary Shop Table",
          extensions: ["bshop"]
        },
        {
          name: "Text Shop Table",
          extensions: ["yaml", "yml"]
        },
        {
          name: "All Files",
          extensions: ["*"]
        }
      ]
    });
    if (path)
      await invoke("save", { path, tables: toObject(tables) });
  };

  const addTable = () => {
    let openFile = equip(file()).unwrap();
    let tables = openFile.tables;
    tables.set(newTableName(), new Map());
    setFile({
      tables,
      path: openFile.path
    });
    setNewTableName("");
  };

  const deleteTable = () => {
    let openFile = equip(file()).unwrap();
    let tables = openFile.tables;
    tables.delete(equip(selectedTable()).unwrapOr(""));
    setSelectedTable(
      openFile.tables.has("Normal") ? "Normal" : openFile.tables.keys().next().value
    );
    setFile({
      tables,
      path: openFile.path
    });
  };

  return (
    <div class="container">
      <div class="row">
        <button title="Open Shop File…" onClick={openFile}>
          <RiDocumentFolderOpenFill size={16} />
        </button>
        <button title="Save" onClick={saveFile}>
          <RiDeviceSave2Fill size={16} />
        </button>
        <button title="Save As…" onClick={saveFileAs}>
          <RiDeviceSave3Fill size={16} />
        </button>
      </div>

      {equip(file())
        .map(file => (
          <>
            <div class="row table-select">
              <select
                value={equip(selectedTable()).unwrapOr("")}
                onChange={e => {
                  const target = e.target as HTMLSelectElement;
                  setSelectedTable(target.value);
                }}>
                <For each={[...file.tables.keys()]}>
                  {tableName => <option>{tableName}</option>}
                </For>
              </select>
              <button class="del" onClick={deleteTable}>
                <RiSystemDeleteBinFill />
              </button>
            </div>
            {equip(selectedTable())
              .map(tableName => (
                <TableView table={equip(file.tables.get(tableName)).unwrap()} />
              ))
              .unwrapOr(None)}
            <div class="row table-select">
              <input
                placeholder="Add new table…"
                value={newTableName()}
                onInput={e => setNewTableName((e.target as HTMLInputElement).value)}
              />
              <button onClick={addTable}>
                <RiSystemAddFill />
              </button>
            </div>
          </>
        ))
        .unwrapOr(<h3 class="empty">No file opened</h3>)}
    </div>
  );
}

export default App;
