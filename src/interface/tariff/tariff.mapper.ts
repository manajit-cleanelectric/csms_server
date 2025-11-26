import {ITariff} from "./tariff.interface";
import {Tariffs} from "../../models/tariff.model";

export function tariffToITariff(tariff: Tariffs): ITariff {
    return {
        id: tariff.id,
        pricePerKWh: Number(tariff.pricePerKWh).toFixed(2),
        CGST: Number(tariff.CGST).toFixed(2),
        SGST: Number(tariff.SGST).toFixed(2),
        IGST: Number(tariff.IGST).toFixed(2),
        createdAt: tariff.createdAt,
        updatedAt: tariff.updatedAt,
    };
}