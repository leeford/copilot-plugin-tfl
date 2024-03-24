import { AdaptiveCardInvokeResponse, CardFactory, MessagingExtensionAttachment, MessagingExtensionQuery, MessagingExtensionResponse, TeamsActivityHandler, TurnContext } from "botbuilder";
import { Tfl } from "./Tfl";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import * as lineStatusCard from "../cards/LineStatus.json";
import { ILineStatusExtended } from "../types/ILineStatus";

interface ICardData {
    lineName: string;
    lineColour: string;
    status: string;
    reason?: string;
    statusColour: string;
    retrievedDate: string;
    modeIconUrl: string;
}

export class Bot extends TeamsActivityHandler {

    constructor() {
        super();
    }

    public async handleTeamsMessagingExtensionQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse> {
        const lineNameParameter = query.parameters.find(parameter => parameter.name === "lineName");
        const searchQuery = lineNameParameter ? lineNameParameter.value : undefined;
        const tfl = new Tfl();
        const lineStatuses = await tfl.getLineStatus(searchQuery);
        const attachments: MessagingExtensionAttachment[] = [];
        lineStatuses.forEach((lineStatus) => {
            const card = this.generateLineStatusCard(lineStatus);
            const preview = CardFactory.heroCard(lineStatus.lineName, lineStatus.statusSeverityDescription);
            const attachment: MessagingExtensionAttachment = { ...CardFactory.adaptiveCard(card), preview };
            attachments.push(attachment);
        });

        return {
            composeExtension: {
                type: "result",
                attachmentLayout: "list",
                attachments
            }
        };
    }

    private generateLineStatusCard(lineStatus: ILineStatusExtended) {
        const cardData: ICardData = {
            lineName: lineStatus.lineName,
            lineColour: lineStatus.lineColour,
            status: lineStatus.statusSeverityDescription,
            reason: lineStatus.reason || "None",
            statusColour: lineStatus.statusSeverityDescription === "Good Service" ? "#008000" : "#FF0000",
            retrievedDate: new Date().toDateString(),
            modeIconUrl: lineStatus.modeName === "bus" ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVUYuIOGSoTnapIo61CkWoEGqFVh1MLv2CJg1Jiouj4Fpw8GOx6uDirKuDqyAIfoA4OzgpukiJ/0sKLWI9OO7Hu3uPu3eAUC8zzeqKAZpum6lEXMxkV8XAK/wYwDAGEZWZZcxJUhIdx9c9fHy9i/Cszuf+HH1qzmKATySOMcO0iTeIZzZtg/M+cYgVZZX4nHjSpAsSP3Jd8fiNc8FlgWeGzHRqnjhELBbaWGljVjQ14mnisKrplC9kPFY5b3HWylXWvCd/YTCnryxzneYYEljEEiSIUFBFCWXYiNCqk2IhRfvxDv5R1y+RSyFXCYwcC6hAg+z6wf/gd7dWfirqJQXjQPeL43yMA4FdoFFznO9jx2mcAP5n4Epv+St1YPaT9FpLCx8B/dvAxXVLU/aAyx1g5MmQTdmV/DSFfB54P6NvygJDt0Dvmtdbcx+nD0CaukreAAeHwESBstc7vLunvbd/zzT7+wGwW3K/FyY3fAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB+gDERYsKI3pZfMAAAEbSURBVEjH7dU9K4ZRGAfw36NnU56wGPgKBgMmXbKw+BgWyXegZGbzJSzKei0UI7OJUhYvsTCwnCRu7ud+RCn/Op263t/OdfjraFURI6KFWSxiAsMYLAducYNrnGIfe5n5VOsgIoawi5mGwZ5gPjMv3xL7KgS3ivErrGMOYxjKzFZmttDBCKaxijOMF93aDG6KgV5wl5mdugw63+jpwHtC+zPJUoquERHPVfS+nx7TH3fQbpry38ngV5ocEZsRcR8RG014TUq0jH6sNOR96eCxRDiKbTxUrYC3vCL7qlu3Ko4wWTbkUmZe1JRxFDtYwHFmTtU1eQ17ReE8Ipr0eq3b/6CnN1A1ee1elJoE89kUHZb7oIvAm8j+4yNeACypVIioTyv/AAAAAElFTkSuQmCC" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVUYuIOGSoTnapIo61CkWoEGqFVh1MLv2CJg1Jiouj4Fpw8GOx6uDirKuDqyAIfoA4OzgpukiJ/0sKLWI9OO7Hu3uPu3eAUC8zzeqKAZpum6lEXMxkV8XAK/wYwDAGEZWZZcxJUhIdx9c9fHy9i/Cszuf+HH1qzmKATySOMcO0iTeIZzZtg/M+cYgVZZX4nHjSpAsSP3Jd8fiNc8FlgWeGzHRqnjhELBbaWGljVjQ14mnisKrplC9kPFY5b3HWylXWvCd/YTCnryxzneYYEljEEiSIUFBFCWXYiNCqk2IhRfvxDv5R1y+RSyFXCYwcC6hAg+z6wf/gd7dWfirqJQXjQPeL43yMA4FdoFFznO9jx2mcAP5n4Epv+St1YPaT9FpLCx8B/dvAxXVLU/aAyx1g5MmQTdmV/DSFfB54P6NvygJDt0Dvmtdbcx+nD0CaukreAAeHwESBstc7vLunvbd/zzT7+wGwW3K/FyY3fAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB+gDERYpJY4v7QsAAAEKSURBVEjH7dWxSgNBFAXQo9HKWCjYSQhipx8xooWQ0n+wzAfoP2iR37CUYCM+ey2UdIIEwcpSUhgEbVYIy5psVhsltxm4c7mXee8Nj7+OuSIypbSIA7SwhTUsYTmTvGKAF/TQxVlEvE8MSCmt4yIzngY97EfE8yg5XyA8rWAO2zjJk0UBuz8o+V6eWCgQrUBEFJXvY8LdapkX/CpmAdN/tK9GVkV+AP53D45Qx/FPNEUBw+zsRMQAnTEBec1bmYD77GynlOpojwnIa+7KTFEL5xVL3oqI7ihRyyv6/f5Ds9m8wWa2B2oTTIe4xWHe/NuFk72kgStsTAh4wk5EPE47RdclzKGBSzNUxSfu6UalrAbUygAAAABJRU5ErkJggg=="
        };
        return AdaptiveCards.declare<ICardData>(lineStatusCard).render(cardData);
    }

}