import {IAddress} from "./address.interface";

export function addressToIAddress(address: any): IAddress {
    return {
        id: address.id,
        line1: address.line1,
        line2: address.line2,
        location: address.location,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
    };
}