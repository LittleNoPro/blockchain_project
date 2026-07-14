// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct LandParcel {
        string coordinates;
        uint256 area;
        bool isRegistered;
    }

    struct KYCInfo {
        bool isVerified;
        uint256 verifiedAt;
    }

    mapping(uint256 => LandParcel) public parcels;
    mapping(address => KYCInfo) public kycRecords;
    uint256 public kycCount;

    event LandMinted(uint256 indexed tokenId, address indexed owner, string coordinates, uint256 area);
    event KYCVerified(address indexed wallet);
    event PropertyTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("LandRegistry", "LAND") Ownable(msg.sender) {}

    modifier onlyKYCed(address wallet) {
        require(kycRecords[wallet].isVerified, "Wallet not KYC verified");
        _;
    }

    function registerKYC(address wallet) external onlyOwner {
        require(wallet != address(0), "Invalid address");
        require(!kycRecords[wallet].isVerified, "Already KYC verified");
        kycRecords[wallet] = KYCInfo(true, block.timestamp);
        kycCount++;
        emit KYCVerified(wallet);
    }

    function mintLand(
        address to,
        string memory uri,
        string memory coordinates,
        uint256 area
    ) external onlyOwner onlyKYCed(to) returns (uint256) {
        require(bytes(uri).length > 0, "URI required");
        require(area > 0, "Area must be > 0");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        parcels[tokenId] = LandParcel(coordinates, area, true);
        emit LandMinted(tokenId, to, coordinates, area);
        return tokenId;
    }

    function transferProperty(
        uint256 tokenId,
        address to
    ) external onlyKYCed(msg.sender) onlyKYCed(to) {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _safeTransfer(msg.sender, to, tokenId, "");
        emit PropertyTransferred(tokenId, msg.sender, to);
    }

    function getParcel(uint256 tokenId) external view returns (LandParcel memory) {
        require(parcels[tokenId].isRegistered, "Parcel does not exist");
        return parcels[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
