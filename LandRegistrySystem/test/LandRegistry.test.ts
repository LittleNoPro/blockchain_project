import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { LandRegistry } from "../typechain-types";

describe("LandRegistry", () => {
  let owner: SignerWithAddress;
  let gov: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let unverified: SignerWithAddress;
  let landRegistry: LandRegistry;

  const MOCK_URI = "ipfs://QmExample";
  const MOCK_COORDS = "10.1234N,106.5678E";
  const MOCK_AREA = 1000;

  before(async () => {
    [gov, user1, user2, unverified] = await ethers.getSigners();
    owner = gov;

    const LandRegistryFactory = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistryFactory.deploy();
    await landRegistry.waitForDeployment();
  });

  describe("Deployment", () => {
    it("should set correct name and symbol", async () => {
      expect(await landRegistry.name()).to.equal("LandRegistry");
      expect(await landRegistry.symbol()).to.equal("LAND");
    });

    it("should set deployer as owner", async () => {
      expect(await landRegistry.owner()).to.equal(owner.address);
    });

    it("should start with zero total supply", async () => {
      expect(await landRegistry.totalSupply()).to.equal(0n);
    });
  });

  describe("KYC Registration", () => {
    it("should revert when non-owner tries to register KYC", async () => {
      await expect(
        landRegistry.connect(user1).registerKYC(user2.address)
      ).to.be.revertedWithCustomError(landRegistry, "OwnableUnauthorizedAccount");
    });

    it("should revert when registering zero address", async () => {
      await expect(
        landRegistry.connect(owner).registerKYC(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("should register KYC for a wallet", async () => {
      const tx = await landRegistry.connect(owner).registerKYC(user1.address);
      await tx.wait();

      const kyc = await landRegistry.kycRecords(user1.address);
      expect(kyc.isVerified).to.be.true;
      expect(kyc.verifiedAt).to.be.gt(0n);
      expect(await landRegistry.kycCount()).to.equal(1n);

      await expect(tx).to.emit(landRegistry, "KYCVerified").withArgs(user1.address);
    });

    it("should revert when registering already KYC'd wallet", async () => {
      await expect(
        landRegistry.connect(owner).registerKYC(user1.address)
      ).to.be.revertedWith("Already KYC verified");
    });
  });

  describe("Mint Land", () => {
    it("should revert when non-owner tries to mint", async () => {
      await expect(
        landRegistry.connect(user1).mintLand(user1.address, MOCK_URI, MOCK_COORDS, MOCK_AREA)
      ).to.be.revertedWithCustomError(landRegistry, "OwnableUnauthorizedAccount");
    });

    it("should revert when minting to unverified wallet", async () => {
      await expect(
        landRegistry.connect(owner).mintLand(unverified.address, MOCK_URI, MOCK_COORDS, MOCK_AREA)
      ).to.be.revertedWith("Wallet not KYC verified");
    });

    it("should revert with empty URI", async () => {
      await expect(
        landRegistry.connect(owner).mintLand(user1.address, "", MOCK_COORDS, MOCK_AREA)
      ).to.be.revertedWith("URI required");
    });

    it("should revert with zero area", async () => {
      await expect(
        landRegistry.connect(owner).mintLand(user1.address, MOCK_URI, MOCK_COORDS, 0)
      ).to.be.revertedWith("Area must be > 0");
    });

    it("should mint land parcel successfully", async () => {
      const tx = await landRegistry.connect(owner).mintLand(
        user1.address, MOCK_URI, MOCK_COORDS, MOCK_AREA
      );
      await tx.wait();

      expect(await landRegistry.ownerOf(0)).to.equal(user1.address);
      expect(await landRegistry.tokenURI(0)).to.equal(MOCK_URI);
      expect(await landRegistry.totalSupply()).to.equal(1n);

      const parcel = await landRegistry.getParcel(0);
      expect(parcel.coordinates).to.equal(MOCK_COORDS);
      expect(parcel.area).to.equal(MOCK_AREA);
      expect(parcel.isRegistered).to.be.true;

      await expect(tx)
        .to.emit(landRegistry, "LandMinted")
        .withArgs(0n, user1.address, MOCK_COORDS, MOCK_AREA);
    });

    it("should increment tokenId on subsequent mints", async () => {
      await landRegistry.connect(owner).registerKYC(user2.address);

      const tx = await landRegistry.connect(owner).mintLand(
        user2.address, MOCK_URI, MOCK_COORDS, MOCK_AREA
      );
      await tx.wait();

      expect(await landRegistry.ownerOf(1)).to.equal(user2.address);
      expect(await landRegistry.totalSupply()).to.equal(2n);
    });
  });

  describe("Transfer Property", () => {
    it("should revert when unverified sender tries to transfer", async () => {
      await expect(
        landRegistry.connect(unverified).transferProperty(0, user2.address)
      ).to.be.revertedWith("Wallet not KYC verified");
    });

    it("should revert when transferring to unverified recipient", async () => {
      await expect(
        landRegistry.connect(user1).transferProperty(0, unverified.address)
      ).to.be.revertedWith("Wallet not KYC verified");
    });

    it("should revert when non-owner tries to transfer", async () => {
      await expect(
        landRegistry.connect(user2).transferProperty(0, user1.address)
      ).to.be.revertedWith("Not the owner");
    });

    it("should transfer property between KYC'd wallets", async () => {
      const tx = await landRegistry.connect(user1).transferProperty(0, user2.address);
      await tx.wait();

      expect(await landRegistry.ownerOf(0)).to.equal(user2.address);

      await expect(tx)
        .to.emit(landRegistry, "PropertyTransferred")
        .withArgs(0n, user1.address, user2.address);
    });
  });

  describe("getParcel", () => {
    it("should revert for non-existent parcel", async () => {
      await expect(
        landRegistry.getParcel(999)
      ).to.be.revertedWith("Parcel does not exist");
    });
  });
});
