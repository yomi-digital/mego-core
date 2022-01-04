// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IME.sol";

/**
 * @title IndexerME
 * IndexerME - Searcher for PolygonME compatibility with Metamask
 */
contract IndexerME is Ownable {

    IME private _me;

    constructor (address PolygonME) {
        _me = IME(PolygonME);
    }

    function returnOwner(string memory _name, string memory _gate) public view returns (address){
        uint256 tknId = _me._nameToTokenId(string(abi.encodePacked(_name, '.', _gate)));
        require(tknId > 0, "IndexerME: This name doesn't exists.");
        return _me.ownerOf(tknId);
    }

    function returnAddress(string memory _name, string memory _gate) public view returns (address){
        uint256 tknId = _me._nameToTokenId(string(abi.encodePacked(_name, '.', _gate)));
        require(tknId > 0, "IndexerME: This name doesn't exists.");
        return _me.getAddressById(tknId);
    }

    function returnIdentity(string memory _name, string memory _gate) public view returns (string memory){
        uint256 tknId = _me._nameToTokenId(string(abi.encodePacked(_name, '.', _gate)));
        require(tknId > 0, "IndexerME: This name doesn't exists.");
        return _me.tokenURI(tknId);
    }

}
