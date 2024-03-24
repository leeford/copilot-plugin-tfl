import axios from "axios";
import { ILine } from "../types/ILine";
import { ILineStatusExtended } from "../types/ILineStatus";

export class Tfl {
    private TFL_APP_KEY: string;

    constructor() {
        this.TFL_APP_KEY = process.env.TFL_APP_KEY;
    }

    public async getLineStatus(lineQuery?: string) {
        try {
            let allLines: ILine[] = [];
            // If a line query is provided, get all lines and filter by the query (TfL API does not support filtering by line name)
            if (lineQuery) {
                const tubeResponse = await axios.get(`https://api.tfl.gov.uk/Line/Mode/tube/Status?app_key=${this.TFL_APP_KEY}`);
                const busResponse = await axios.get(`https://api.tfl.gov.uk/Line/Mode/bus/Status?app_key=${this.TFL_APP_KEY}`);
                allLines = [...tubeResponse.data, ...busResponse.data];
            } else {
                // Get just the tube lines (It's faster to get just the tube lines if no query is provided)
                const tubeResponse = await axios.get(`https://api.tfl.gov.uk/Line/Mode/tube/Status?app_key=${this.TFL_APP_KEY}`);
                allLines = tubeResponse.data;
            }
            const lineStatuses: ILineStatusExtended[] = allLines
                .filter((line: ILine) => lineQuery ? line.name.toLowerCase().includes(lineQuery.toLowerCase()) : true)
                .map((line: ILine) => {
                    if (line.lineStatuses.length === 0) {
                        return;
                    }
                    const lineStatus: ILineStatusExtended = {
                        ...line.lineStatuses[0],
                        lineName: line.name,
                        lineColour: this.getLineColour(line.id),
                        modeName: line.modeName
                    };
                    return lineStatus;
                });
            return lineStatuses;
        } catch (error) {
            console.error("Failed to get the TfL status", error);
        }
    }

    private getLineColour(lineId: string) {
        switch (lineId) {
            case "bakerloo":
                return "#B36305";
            case "central":
                return "#E32017";
            case "circle":
                return "#FFD300";
            case "district":
                return "#00782A";
            case "hammersmith-city":
                return "#F3A9BB";
            case "jubilee":
                return "#A0A5A9";
            case "metropolitan":
                return "#9B0056";
            case "northern":
                return "#000000";
            case "piccadilly":
                return "#003688";
            case "victoria":
                return "#0098D4";
            case "waterloo":
                return "#95CDBA";
            default:
                return "#808080"; // Default to grey
        }
    }
}
