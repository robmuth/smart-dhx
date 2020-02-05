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

import "./BigMod.sol";

contract SmartDiffieHellman {
	using BigMod for uint256;

	uint256 public P = 0xF3EC75CC015A7F458C242E37C292EEF96C40CFB670ED8CFF3BBA27EE3301205B; // openssl dhparam 256 | openssl asn1parse
	uint256 public G = 2;

	uint256 public B;

	address other;

	string public jsInitTransmit = "let random = [...Array(32)].map(() => parseInt(Math.random() * 255)); let genAa = await dhInst1.generateA.call(random); await dhInst1.transmitA(dhInst2.address, genAa[\"_A\"]); return genAa;";
	string public jsCalcSecret = "return await dhInst.generateAB.call(genAa[\"_a\"]);";

	function generateA(uint256[] memory _seed) public view returns (uint256 _a, uint256 _A) {
		assert(P != 0);
		assert(G != 0);

		_a = uint256(keccak256(abi.encodePacked(_seed)));
		_A = G.bigMod(_a, P);
	}

	function transmitA(SmartDiffieHellman _other, uint256 _A) public {
		require(address(_other) != address(0), "Other SmartDiffieHellman contract unassigned.");
		require(P == _other.P(), "Prime is different.");
		require(G == _other.G(), "Root is different.");

		_other.setB(_A);
	}


	function generateAExtB(uint256 _a, uint256 _B) public view returns (uint256 _AB) {
		_AB = _B.bigMod(_a, P);
	}

	function generateAB(uint256 _a) public view returns (uint256 _AB) {
		require(address(other) != address(0), "Other SmartDiffieHellman contract unassigned.");
		require(B != 0, "B has not been transmitted by other SmartDiffieHellman.");

		_AB = B.bigMod(_a, P);
	}

	function setB(uint256 _B) public {
		other = msg.sender;
		B = _B;
	}

	function stop() public {
		selfdestruct(msg.sender);
	}
}