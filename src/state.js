import { translate } from "./locale_provider";

// NOTE: operational = IDLE | FINISHED | STOPPED
export const LinkState = {
    UNKNOWN: "UNKNOWN",
    IDLE: "IDLE",
    READY: "READY",
    BUSY: "BUSY",
    PRINTING: "PRINTING",
    PAUSED: "PAUSED",
    FINISHED: "FINISHED",
    STOPPED: "STOPPED",
    ERROR: "ERROR",
    ATTENTION: "ATTENTION",
    fromApi: (linkState) => {
        switch (linkState) {
            case "IDLE": return LinkState.IDLE;
            case "READY": return LinkState.READY;
            case "BUSY": return LinkState.BUSY;
            case "PRINTING": return LinkState.PRINTING;
            case "PAUSED": return LinkState.PAUSED;
            case "FINISHED": return LinkState.FINISHED;
            case "STOPPED": return LinkState.STOPPED;
            case "ERROR": return LinkState.ERROR;
            case "ATTENTION": return LinkState.ATTENTION;
            default:
                console.error(`Unsupported state: ${linkState}`);
                return LinkState.UNKNOWN;
        }
    },
};

export const OperationalStates = [
    LinkState.IDLE,
    LinkState.READY,
    LinkState.FINISHED
];

export const translateState = (state) => {
    switch (state) {
        case LinkState.IDLE: return translate("prop.st-idle");
        case LinkState.READY: return translate("prop.st-ready");
        case LinkState.BUSY: return translate("prop.st-busy");
        case LinkState.PRINTING: return translate("prop.st-printing");
        case LinkState.PAUSED: return translate("prop.st-paused");
        case LinkState.FINISHED: return translate("prop.st-finished");
        case LinkState.STOPPED: return translate("prop.st-stopped");
        case LinkState.ERROR: return translate("prop.st-error");
        case LinkState.ATTENTION: return translate("prop.st-attention");
        default:
            console.error(`Unsupported state: ${state}`);
            return translate("prop.st-unknown");
    }
}
