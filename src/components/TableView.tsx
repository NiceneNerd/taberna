import { None, Option } from "rustic";
import { createSignal, For } from "solid-js";
import { Table, TableItem } from "../shop";
import "./TableView.css";
import { TableItemView } from "./TableViewItem";

type TableViewProps = {
  table: Table;
};

export function TableView({ table }: TableViewProps) {
  const [selectedItem, setSelectedItem] = createSignal<Option<string>>(None);
  const isSelected = (name: string) => {
    console.log(name);
    return selectedItem() == name;
  };
  return (
    <div class="table-view">
      {[...table.entries()].map(([itemName, tableItem]) => (
        <TableItemView
          name={itemName}
          item={tableItem}
          selected={selectedItem() == itemName}
          onClick={(name) => setSelectedItem(name)}
        />
      ))}
    </div>
  );
}
