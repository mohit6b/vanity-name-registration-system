//SPDX-License-Identifier: MIT 

pragma solidity ^0.8;

contract NameRegistration {
    
    struct RegisteredDetails {
        address user;
        uint256 validTill;
    }

    event Registered(string name, address user, uint256 validity);

    mapping(bytes32 => RegisteredDetails) details;

    // @dev To convert the given string into lower case
    // @param str
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    // @dev To hash the given name
    // @param _name
    function hash(string memory _name) internal pure returns(bytes32) {
        string memory _newName = whiteSpaces(_name);
        return(keccak256(abi.encodePacked(_toLower(_newName))));
    }

    
    // @dev To check for whiteSpaces in the given name
    // @param _str
    // Whitespaces should be removed off-chain to reduce the block gas limit exceeded error in cases of larger strings.
    function whiteSpaces(string memory _str) internal pure returns(string memory) {
        bytes memory actual = bytes(_str);
        for(uint i; i< actual.length; i++) {
            require(actual[i] != " ", "Trim whitespaces");
        }
        return string(actual);
    }

    // @dev To get the charge amount for the name to be registered/extended
    // @param _name
    function chargeAmount(string memory _str) public pure returns(uint256) {
        return bytes(_str).length * (1 ether / 100);
    }

    // @dev To register a new name/buy an inactive name
    // @param _name, Name to be registered/bought
    // If in case, the name is already registered, there is a 24 hour cooldown before it can be bought if not already extended by the current owner
    // Any new name will be registered for 52 weeks by default
    function register(string memory _name) external payable returns(bool) {
        require(msg.value == chargeAmount(_name), "Wrong ETH price");
        bytes32 name = hash(_name);
        if(details[name].user != address(0)) {
            require(details[name].validTill + 24 hours < block.timestamp, "Already registered");
        }
        details[name] = RegisteredDetails(msg.sender, block.timestamp + 52 weeks);
        emit Registered(_name, msg.sender, details[name].validTill);
        return true;
    }

    // @dev To extend the time period for the user registered name
    // @param _name, Registered name to extend the validity
    // By default the validity will be extended by 52 weeks
    function extend(string memory _name) external payable returns(bool) {
        require(msg.value == chargeAmount(_name), "Wrong ETH price");
        bytes32 name = hash(_name);
        require(details[name].user == msg.sender, "Not the owner");
        details[name].validTill += 52 weeks;
        emit Registered(_name, msg.sender, details[name].validTill);
        return true;
    }

    // @dev To get the registration details
    // @param _name
    function registration(string memory _name) external view returns(address, uint) {
        bytes32 name = hash(_name);
        return (details[name].user, details[name].validTill);
    }
}