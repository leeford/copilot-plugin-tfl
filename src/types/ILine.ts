import { ILineStatus } from "./ILineStatus";

export interface ILine {
    id: string;
    name: string;
    modeName: string;
    created: string;
    modified: string;
    status: string;
    lineStatuses: ILineStatus[];
}