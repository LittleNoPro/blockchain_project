import { expect } from "chai";
import { ethers } from "hardhat";
import { Example } from "../typechain-types";

describe("Example", () => {
  let contract: Example;

  before(async () => {
    const factory = await ethers.getContractFactory("Example");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  it("should start with value = 0", async () => {
    expect(await contract.getValue()).to.equal(0n);
  });

  it("should set value and emit event", async () => {
    const tx = await contract.setValue(42);
    await tx.wait();

    expect(await contract.getValue()).to.equal(42n);
    await expect(tx).to.emit(contract, "ValueSet").withArgs(42n);
  });
});
