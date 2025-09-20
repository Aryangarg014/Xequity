import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MockV3AggregatorModule = buildModule("MockV3AggregatorModule", (m) => {
    const DECIMALS = 8;
    const INITIAL_ANSWER = 200000000000; // Initial price

    const mockV3Aggregator = m.contract("MockV3Aggregator", [DECIMALS, INITIAL_ANSWER]);

    return { mockV3Aggregator };
});

export default MockV3AggregatorModule;
