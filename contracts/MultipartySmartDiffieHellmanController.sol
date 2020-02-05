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
import "./MultipartySmartDiffieHellmanClient.sol";

contract MultipartySmartDiffieHellmanController is SmartDiffieHellman {
	MultipartySmartDiffieHellmanClient[] public clients;

	struct Key {
		bool received;
		MultipartySmartDiffieHellmanClient[] clients;
		uint256 key;
	}

	mapping(bytes32 => Key) public keys;
	mapping(bytes32 => bool) public requestedPartyCombinations;

	function addClient(MultipartySmartDiffieHellmanClient _client) public returns (uint) {
		// Add only if not already added
		bool found = false;
		for(uint256 i = 0; i < clients.length && !found; i++) {
			found = address(clients[i]) == address(_client);
		}

		if(!found)
			clients.push(_client);

		return clients.length;
	}

	function start() public {
		sortClients();

		for(uint256 i = 0; i < clients.length; i++) {
			MultipartySmartDiffieHellmanClient[] memory reqClients = new MultipartySmartDiffieHellmanClient[](1);
			reqClients[0] = clients[i];

			clients[i].requestKey(reqClients, 0);
			keys[keccak256(abi.encodePacked(reqClients))] = Key(false, reqClients, 0);
		}
	}

	function sortClients() public {
		// Bubble sort clients
		for(uint256 i = 0; i < clients.length; i++) {
			for(uint256 j = i + 1; j < clients.length; j++) {
				if(clients[i] > clients[j]) {
					MultipartySmartDiffieHellmanClient p = clients[j];
					clients[j] = clients[i];
					clients[i] = p;
				}
			}
		}
	}

	function receiveKey(MultipartySmartDiffieHellmanClient[] memory _clients, uint256 _key) public {
		// Check if correctly sortied
		for(uint256 i = 0; i < _clients.length - 1; i++) {
			require(_clients[i] < _clients[i + 1], "_clients not sorted or not unique (1)");
		}

		// Check if already answered
		if(keys[keccak256(abi.encodePacked(_clients))].received == true)
			return; // return w/o error

		keys[keccak256(abi.encodePacked(_clients))] = Key(true, _clients, _key);

		uint256 index = 0;
		MultipartySmartDiffieHellmanClient[] memory _clientsWithClient = new MultipartySmartDiffieHellmanClient[](_clients.length + 1);
		
		for(uint256 i = 0; i < _clients.length; i++) {
			_clientsWithClient[index++] = _clients[i];
		}

		for(uint256 i = 0; i < clients.length; i++) {
			if(address(clients[i]) > address(_clientsWithClient[index - 1])) {
				_clientsWithClient[index] = clients[i];
				clients[i].requestKey(_clientsWithClient, _key);
			}
		}
	}

	function getKey(bytes32 _index) public view returns (uint256 _key) {
		_key = keys[_index].key;
	}
}
