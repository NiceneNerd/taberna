import { equip } from "rustic";
import { RiSystemAddFill, RiSystemDeleteBinFill } from "solid-icons/ri";
import { createSignal, createMemo, For, Match, Switch } from "solid-js";
import { TableItem } from "../shop";
import { ITEM_NAMES } from "../util";
import "./TableViewItem.css";

type TableItemViewProps = {
  name: string;
  item: TableItem;
  onDelete: (name: string) => void;
};

export function TableItemView(props: TableItemViewProps) {
  const [expanded, setExpanded] = createSignal(false);
  const friendlyName = createMemo(() => ITEM_NAMES.get(props.name));

  return (
    <div
      classList={{ item: true, expanded: expanded() }}
    >
      <div class="label" onClick={() => setExpanded(!expanded())}>
        <label>{props.name}</label>
        {equip(friendlyName()).map(friendly => <small>({friendly})</small>).unwrapOr(<></>)}
        <div class="spacer"></div>
        <button class="del" onClick={() => props.onDelete(props.name)}><RiSystemDeleteBinFill /></button>
      </div>
      <div class="props">
        <For
          each={[
            {
              get: () => props.item.num,
              name: "Max Stock",
              set: (e: InputEvent) => props.item.num = +(e.target as HTMLInputElement).value,
            },
            {
              get: () => props.item.adjustPrice,
              name: "Adjust Price",
              set: (e: InputEvent) => props.item.adjustPrice = +(e.target as HTMLInputElement).value,
            },
            {
              get: () => props.item.amount,
              name: "Amount",
              set: (e: InputEvent) => props.item.amount = +(e.target as HTMLInputElement).value,
            },
            {
              get: () => props.item.sort,
              name: "Sort Value",
              set: (e: InputEvent) => props.item.sort = +(e.target as HTMLInputElement).value,
            },
            {
              get: () => props.item.lookGetFlag,
              name: "Use IsGet Flag",
              set: (e: InputEvent) => props.item.lookGetFlag = (e.target as HTMLInputElement).checked,
            },
          ]}
        >
          {(itemField) => (
            <div class="row">
              <div>{itemField.name}</div>
              <div>
                <Switch>
                  <Match when={typeof itemField.get() === "number"}>
                    <input
                      type="number"
                      pattern="[0-9]"
                      value={itemField.get() as number}
                      onInput={itemField.set}
                    />
                  </Match>
                  <Match when={typeof itemField.get() === "boolean"}>
                    <input
                      type="checkbox"
                      id={itemField.name + props.name}
                      checked={itemField.get() as boolean}
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
