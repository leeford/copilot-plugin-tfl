export interface ILineStatus {
    id: number;
    created: string;
    disruption?: any;
    lineId: string;
    reason?: string;
    statusSeverity: number;
    statusSeverityDescription: string;
    validityPeriods: any[];
}

export interface ILineStatusExtended extends ILineStatus {
    lineColour?: string;
    lineName: string;
    modeName: string;
}