import {ITariff} from "./tariff.interface";
import {Tariffs} from "../../models/tariff.model";

export function tariffToITariff(tariff: Tariffs): ITariff {
    return {
        id: tariff.id,
        pricePerKWh: tariff.pricePerKWh.toFixed(2),
        CGST: tariff.CGST.toFixed(2),
        SGST: tariff.SGST.toFixed(2),
        IGST: tariff.IGST.toFixed(2),
        createdAt: tariff.createdAt,
        updatedAt: tariff.updatedAt,
    };
}