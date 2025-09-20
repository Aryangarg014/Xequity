import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PriceConverterModule = buildModule("PriceConverterModule", (m) => {
    const priceConverter = m.contract("PriceConverter");

    return { priceConverter };
});

export default PriceConverterModule;
