// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Base64.sol";

/**
 * @title Polygon Identities
 * Polygon Identities - A name service manager for Polygon
 */

contract PolygonME is ERC721, Ownable {
    uint256 private _value;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 minting_price_short = 10 ether;
    uint256 minting_price_medium = 5 ether;
    uint256 minting_price_long = 2 ether;
    
    struct Name {
        address eth_address;
        string name;
        string tld;
        string ethereum_address;
        string bitcoin_address;
        string email;
        string url;
        string social;
        string background;
        string color;
        string logo;
        string description;
    }

    mapping(string => uint256) public _nameToTokenId;
    mapping(uint256 => Name) private _namesCollection;
    mapping(address => bool) private _bannedAccounts;
    mapping(string => bool) private _blackList;
    mapping(string => bool) public _tlds;
    mapping(string => string) private _base_logos;
    mapping(string => string) private _base_descriptions;

    constructor() ERC721("PolygonME", "ME") {}

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function contractURI() public pure returns (string memory) {
        return "https.//ipfs.io/ipfs/bafkreibexbrryidpuixkir2zpgsalwp776sjbh5uxorx5wvylccbibyvea";
    }

    function tokensOfOwner(address _owner) external view returns(uint256[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalTkns = totalSupply();
            uint256 resultIndex = 0;
            uint256 tnkId;

            for (tnkId = 1; tnkId <= totalTkns; tnkId++) {
                if (ownerOf(tnkId) == _owner) {
                    result[resultIndex] = tnkId;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    function returnNameID(string memory _name) public view returns (uint256) {
        return _nameToTokenId[_name];
    }

    function getAddressByName(string memory _name) public view returns (address) {
        uint256 tknId = _nameToTokenId[_name];
        return _namesCollection[tknId].eth_address;
    }
    
    function getAddressById(uint256 tknId) public view returns (address) {
        return _namesCollection[tknId].eth_address;
    }
    
    function tokenURI(uint256 tokenId) public override view returns (string memory) {
        string[19] memory parts;
        Name memory name = _namesCollection[tokenId];
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 500 500"><style>.base { fill: ';
        parts[1] = name.color;
        parts[2] = '; font-family: monospace; font-size: 14px; }</style><rect width="100%" height="100%" fill="';
        parts[3] = name.background;
        parts[4] = '" />';
        parts[5] = name.logo;
        parts[6] = '<text x="10" y="390" class="base">NAME: ';
        parts[7] = string(abi.encodePacked(name.name, '.', name.tld));
        parts[8] = '</text><text x="10" y="410" class="base">ETH: ';
        parts[9] = name.ethereum_address;
        parts[10] = '</text><text x="10" y="430" class="base">BTC: ';
        parts[11] = name.bitcoin_address;
        parts[12] = '</text><text x="10" y="450" class="base">E-MAIL: ';
        parts[13] = name.email;
        parts[14] = '</text><text x="10" y="470" class="base">URL: ';
        parts[15] = name.url;
        parts[16] = '</text><text x="10" y="490" class="base">SOCIAL: ';
        parts[17] = name.social;
        parts[18] = '</text></svg>';

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7]));
        output = string(abi.encodePacked(output, parts[8], parts[9], parts[10], parts[11], parts[12], parts[13], parts[14]));
        output = string(abi.encodePacked(output, parts[15], parts[16], parts[17], parts[18]));

        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "', name.name, '.',name.tld,'", "description": "', name.description, '", "ethereum_address": "',name.ethereum_address,'", "bitcoin_address": "',name.bitcoin_address,'", "email": "',name.email,'", "url": "',name.url,'", "social": "',name.social,'", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '", "logo": "',Base64.encode(bytes(name.logo)),'", "background": "',name.background,'", "color": "',name.color,'"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }

    function canMint(string memory str, address sender) internal view returns (bool) {
		bytes memory bStr = bytes(str);
        bool _itIs = true;
        // Check if contains uppercase or spaces
		for (uint i = 0; i < bStr.length; i++) {
			if ((bStr[i] >= 0x41) && (bStr[i] <= 0x5A)) {
                _itIs = false;
			} else if ((bStr[i] < 0x61 || bStr[i] > 0x7a) && bStr[i] != 0x2d){
                if(bStr[i] < 0x30 || bStr[i] > 0x39){
                    _itIs = false;
                }
            }

		}
        // Check if name is blacklisted
        if(_itIs && _blackList[str] == true){
            _itIs = false;
        }
        // Check if account is banned
        if(_itIs && _bannedAccounts[sender] == true){
            _itIs = false;
        }
		return _itIs;
	}

    function mintName(string memory name, string memory tld) public payable {
        uint length = bytes(name).length;
        uint256 minting_price = minting_price_short;
        if(length > 5 && length <= 10){
            minting_price = minting_price_medium;
        }
        if (length > 10) {
            minting_price = minting_price_long;
        }
        string memory final_name = string(abi.encodePacked(name,'.',tld));
        require(length > 0, "PNS: String can't be void");
        require(_tlds[tld], 'PNS: This TLD is not allowed');
        require(_nameToTokenId[final_name] == 0, 'PNS: This name already exists');
        require(msg.value == minting_price, 'PNS: Amount should be exactly minting cost');
        require(canMint(name, msg.sender), 'PNS: This name cannot be minted or account is banned');
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _nameToTokenId[final_name] = newTokenId;
        _namesCollection[newTokenId].background = "#8247E5";
        _namesCollection[newTokenId].color = "#ffffff";
        _namesCollection[newTokenId].logo = _base_logos[tld];
        _namesCollection[newTokenId].description = _base_descriptions[tld];
        _namesCollection[newTokenId].name = name;
        _namesCollection[newTokenId].tld = tld;
        _mint(msg.sender, newTokenId);
    }

    function fixDetails(
        uint256 tokenId,
        address eth_address,
        string memory ethereum_address,
        string memory bitcoin_address,
        string memory email,
        string memory url,
        string memory social,
        string memory background,
        string memory color,
        string memory logo,
        string memory description
    ) public {
        require(msg.sender == ownerOf(tokenId) || msg.sender == owner(), 'PNS: You must own the name');
        require(_bannedAccounts[msg.sender] == false, "PNS: Account banned");
        _namesCollection[tokenId].eth_address = eth_address;
        _namesCollection[tokenId].ethereum_address = ethereum_address;
        _namesCollection[tokenId].bitcoin_address = bitcoin_address;
        _namesCollection[tokenId].email = email;
        _namesCollection[tokenId].url = url;
        _namesCollection[tokenId].social = social;
        _namesCollection[tokenId].background = background;
        _namesCollection[tokenId].color = color;
        _namesCollection[tokenId].logo = logo;
        _namesCollection[tokenId].description = description;
    }

    function fixPrice(uint256 _what, uint256 price) public onlyOwner {
        if(_what == 0){
            minting_price_short = price;
        }else if(_what == 1){
            minting_price_medium = price;
        }else if(_what == 2){
            minting_price_long = price;
        }
    }

    function withdrawMatic() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, 'PNS: Nothing to withdraw!');
        payable(msg.sender).transfer(balance);
    }

    function changeAdminLists(address _address, string memory _string1, string memory _string2, uint256 _what, bool _state) public onlyOwner {
        if(_what == 0){
            _bannedAccounts[_address] = _state;
        } else if (_what == 1) {
            _blackList[_string1] = _state;
        } else if (_what == 2) {
             _tlds[_string1] = _state;
        } else if (_what == 3) {
             _base_logos[_string1] = _string2;
        } else if (_what == 4) {
             _base_descriptions[_string1] = _string2;
        }
    }

}
