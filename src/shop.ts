export interface TableItem {
    sort: number;
    name: string;
    num: number;
    adjustPrice: number;
    lookGetFlag: boolean;
    amount: number;
}

export type Table = Map<String, TableItem>;