import {Connectors} from "../../models/connector.model";
import {IConnector} from "./connector.interface";

export function connectorToIConnector(connector: Connectors): IConnector {
    return {
        id: connector.id,
        chargerConnectorId:connector.chargerConnectorId,
        type: connector.type as IConnector['type'],
        status: connector.status,
    };
}