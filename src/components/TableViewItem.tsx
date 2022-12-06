import { For, Match, Switch } from "solid-js";
import { TableItem } from "../shop";
import "./TableViewItem.css";

type TableItemViewProps = {
  name: string;
  item: TableItem;
  selected: boolean;
  onClick: (name: string) => any;
};

export function TableItemView(props: TableItemViewProps) {
  return (
    <div
      classList={{ item: true, selected: props.selected }}
      onClick={() => props.onClick(props.name)}
    >
      <div class="label">
        <label>{props.name}</label>
        <div class="spacer"></div>
        <button>Del</button>
      </div>
      <div class="props">
        <For
          each={[
            {
              value: props.item.num,
              name: "Max Stock",
            },
            {
              value: props.item.adjustPrice,
              name: "Adjust Price",
            },
            {
              value: props.item.amount,
              name: "Amount",
            },
            {
              value: props.item.sort,
              name: "Sort Value",
            },
            {
              value: props.item.lookGetFlag,
              name: "Use IsGet Flag",
            },
          ]}
        >
          {(itemField) => (
            <div class="row">
              <div>{itemField.name}</div>
              <div>
                <Switch>
                  <Match when={typeof itemField.value === "number"}>
                    <input
                      type="number"
                      pattern="[0-9]"
                      value={itemField.value}
                      onInput={(e) => null}
                    />
                  </Match>
                  <Match when={typeof itemField.value === "boolean"}>
                    <input
                      type="checkbox"
                      id={itemField.name + props.name}
                      value={itemField.value}
                      class="cbx hidden"
                    />
                    <label for={itemField.name + props.name} class="lbl"></label>
                  </Match>
                </Switch>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
