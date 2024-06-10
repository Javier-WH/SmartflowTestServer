export type TableColumn<T> = {
    title: string;
    uid: T;
    format?: (value: any) => any;
    sortable?: boolean;
};
