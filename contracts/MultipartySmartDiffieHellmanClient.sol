pragma solidity >=0.5.0 <0.6.0;

// SCIENTIFIC PURPOSE ONLY --- DO NOT USE FOR PRODUCTION

/*
 * Copyright 2019-2020 muth@tu-berlin.de www.dsi.tu-berlin.de
 *
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import "./SmartDiffieHellman.sol";
import "./MultipartySmartDiffieHellmanController.sol";

contract MultipartySmartDiffieHellmanClient is SmartDiffieHellman {
	MultipartySmartDiffieHellmanController public controller;

	struct Key {
		bool answered;
		MultipartySmartDiffieHellmanClient[] clients;
		uint256 key;
	}

	mapping (bytes32 => Key) public keys;

	bytes32[] public requested;
	bytes32[] public answered;

	constructor(MultipartySmartDiffieHellmanController _controller) public {
		controller = _controller;
		controller.addClient(this);
	}

	function requestKey(MultipartySmartDiffieHellmanClient[] memory _clients, uint256 _key) public/*controllerOnly*/ {
		// Check if correctly sorted
		for(uint256 i = 0; i < _clients.length - 1; i++) {
			require(_clients[i] < _clients[i + 1], "_clients not sorted or not unique (2)");
		}

		bytes32 index = keccak256(abi.encodePacked(_clients));

		// Check if not already requested
		bool found = false;
		for(uint256 i = 0; i < requested.length && !found; i++) {
			found = requested[i] == index;
		}

		if(found) {
			return; // Return w/o error
		}

		requested.push(index);
		keys[index] = Key(false, _clients, _key);
	}

	function requestedKeys() public view returns (bytes32[] memory _clientsKeys, uint256[] memory _keys) {
		_clientsKeys = new bytes32[](requested.length - answered.length);
		_keys = new uint256[](requested.length - answered.length);

		uint256 index = 0;

		for(uint256 i = 0; i < requested.length; i++) {
			bool found = false;

			// Check if already answered
			for(uint j = 0; j < answered.length && !found; j++) {
				found = answered[j] == requested[i];
			}

			if(!found) {
				// Not already answered
				_clientsKeys[index] = requested[i];
				_keys[index] = keys[requested[i]].key;

				index++;
			}
		}
	}

	function getFinalKey(MultipartySmartDiffieHellmanClient[] memory _clients) public view returns (uint256) {
		MultipartySmartDiffieHellmanClient[] memory clients = new MultipartySmartDiffieHellmanClient[](_clients.length - 1);

		uint256 index = 0;
		for(uint256 i = 0; i < _clients.length; i++) {
			if(address(this) != address(_clients[i])) {
				clients[index++] = _clients[i];
			}
		}

		bytes32 clientsIndex = keccak256(abi.encodePacked(clients));
		return controller.getKey(clientsIndex);

	}

	function answer(bytes32 _clientsKey, uint256 _key) public {
		keys[_clientsKey] = Key(true, keys[_clientsKey].clients, _key);
		
		controller.receiveKey(keys[_clientsKey].clients, _key);

		answered.push(_clientsKey);
	}

	function getRequestedSize() public view returns (uint256) {
		return requested.length - answered.length;
	}

/*	modifier controllerOnly {
		require(msg.sender == address(controller), "Can only be called by the controller");
		_;
	}*/

}