import { Accessor, createSignal, Setter } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";
import {
  RiDeviceSave2Fill,
  RiDeviceSave3Fill,
  RiDocumentFolderOpenFill,
} from "solid-icons/ri";
import { Option, OptionEquipped, None, equip } from "rustic";
import "./App.css";
import { Table, TableItem } from "./shop";

interface File {
  path: string;
  file: Map<string, TableItem>;
}

function App() {
  const [file, setFile] = createSignal<Option<File>>(None);

  const openFile = async () => {
    const path = equip(
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

    if (path.isSome()) {
      console.log(path.unwrap());
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

      <div class="row">
        {equip(file())
          .map((file) => <h3>File opened</h3>)
          .unwrapOr(<h3 class="empty">No file opened</h3>)}
      </div>
    </div>
  );
}

export default App;
