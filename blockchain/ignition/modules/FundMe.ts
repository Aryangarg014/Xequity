import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MockV3AggregatorModule from "./MockV3Aggregator";

const FundMeModule = buildModule("FundMeModule", (m) => {
    const { mockV3Aggregator } = m.useModule(MockV3AggregatorModule);

    const fundMe = m.contract("FundMe", [mockV3Aggregator]);

    return { fundMe };
});

export default FundMeModule;
