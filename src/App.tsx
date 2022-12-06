import { Accessor, createSignal, For, Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";
import {
  RiDeviceSave2Fill,
  RiDeviceSave3Fill,
  RiDocumentFolderOpenFill,
} from "solid-icons/ri";
import { Option, OptionEquipped, None, equip } from "rustic";
import { Table, TableItem } from "./shop";
import { TableView } from "./components/TableView";

interface File {
  path: string;
  tables: Map<string, Table>;
}

function App() {
  const [file, setFile] = createSignal<Option<File>>(None);
  const [selectedTable, setSelectedTable] = createSignal<Option<string>>(None);

  const openFile = async () => {
    const selected = equip(
      await open({
        filters: [
          {
            name: "BOTW Shop Tables",
            extensions: ["bshop", "yaml", "yml"],
          },
          {
            name: "All Files",
            extensions: ["*"],
          },
        ],
        title: "Open Shop File",
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
                item as TableItem,
              ])
            ),
          ])
        );
        const file: File = {
          path,
          tables,
        };
        console.log(file);
        setFile(file);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div class="container">
      <div class="row">
        <button title="Open Shop File…" onClick={openFile}>
          <RiDocumentFolderOpenFill size={16} />
        </button>
        <button title="Save">
          <RiDeviceSave2Fill size={16} />
        </button>
        <button title="Save As…">
          <RiDeviceSave3Fill size={16} />
        </button>
      </div>

      {equip(file())
        .map((file) => (
          <>
            <div class="row">
              <select
                onChange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  setSelectedTable(target.value);
                }}
              >
                <For each={[...file.tables.keys()]}>
                  {(tableName) => <option>{tableName}</option>}
                </For>
              </select>
              <button>Add</button>
            </div>
            {equip(selectedTable())
              .map((tableName) => (
                <TableView table={equip(file.tables.get(tableName)).unwrap()} />
              ))
              .unwrapOr(None)}
          </>
        ))
        .unwrapOr(<h3 class="empty">No file opened</h3>)}
    </div>
  );
}

export default App;
