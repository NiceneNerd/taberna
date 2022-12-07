import { None, Option } from "rustic";
import { RiSystemAddFill } from "solid-icons/ri";
import { createSignal, For } from "solid-js";
import { Table, TableItem } from "../shop";
import { createOptions, Select } from "@thisbeyond/solid-select";
import "./TableView.css";
import "@thisbeyond/solid-select/style.css";

import { TableItemView } from "./TableViewItem";
import { STOCK_ITEMS } from "../util";

type TableViewProps = {
  table: Table;
};

const ITEM_OPTIONS = createOptions(STOCK_ITEMS, { createable: true, filterable: true });

export function TableView(props: TableViewProps) {
  const loadItems = () => {
    return [...props.table.entries()].sort((a, b) => a[1].sort - b[1].sort);
  };

  const [newItemName, setNewItemName] = createSignal("");
  const [tableItems, setTableItems] = createSignal(loadItems());

  const addItem = () => {
    if (!newItemName()) return;
    let newItem = {
      adjustPrice: 0,
      amount: 0,
      lookGetFlag: false,
      num: 0,
      sort: props.table.size
    };
    props.table.set(newItemName(), newItem);
    setTableItems(loadItems());
    setNewItemName("");
  };

  const deleteItem = (name: string) => {
    props.table.delete(name);
    setTableItems(loadItems());
  };

  return (
    <div class="table-view">
      <For each={tableItems()}>
        {([itemName, tableItem]) => (
          <TableItemView name={itemName} item={tableItem} onDelete={deleteItem} />
        )}
      </For>
      <div class="item row">
        <div class="item-select">
          {/* <input
            placeholder="Add new shop item…"
            value={newItemName()}
            onInput={e => setNewItemName((e.target as HTMLInputElement).value)}
          /> */}
          <Select
            {...ITEM_OPTIONS}
            placeholder="Add new shop item…"
            initialValue={newItemName()}
            onChange={e => setNewItemName(e as string)}
          />
        </div>
        <div>
          <button onClick={addItem}>
            <RiSystemAddFill />
          </button>
        </div>
      </div>
    </div>
  );
}
