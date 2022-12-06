export interface TableItem {
    sort: number;
    num: number;
    adjustPrice: number;
    lookGetFlag: boolean;
    amount: number;
}

export type Table = Map<string, TableItem>;