pragma solidity >=0.5.0 <0.6.0;

library BigMod {
	// Original Source from https://github.com/HarryR/solcrypto/blob/master/contracts/altbn128.sol
	// Commit 396fe4642cf39e2577217651a64bc3d19362ce42 License: MIT
	// From: https://gist.githubusercontent.com/chriseth/f9be9d9391efc5beb9704255a8e2989d/raw/4d0fb90847df1d4e04d507019031888df8372239/snarktest.solidity
	// Basically just calls the precompiled EVM contract/function 0x05 which calculates (_base ** _expoonent) % _modulus efficiently 
	// Modified for Solitity ^0.5.0, original function name expMod()
	function bigMod(uint256 _base, uint256 _exponent, uint256 _modulus) internal view returns (uint256 retval) {
		bool success;
		uint256[1] memory output;
		uint[6] memory input;
		input[0] = 0x20;        // baseLen = new(big.Int).SetBytes(getData(input, 0, 32))
		input[1] = 0x20;        // expLen  = new(big.Int).SetBytes(getData(input, 32, 32))
		input[2] = 0x20;        // modLen  = new(big.Int).SetBytes(getData(input, 64, 32))
		input[3] = _base;
		input[4] = _exponent;
		input[5] = _modulus;
		assembly {
			success := staticcall(sub(gas, 2000), 5, input, 0xc0, output, 0x20)
			// Use "revert" to make gas estimation work
			switch success case 0 {
				revert(0, 0)
			}
		}
		require(success);
		return output[0];
	}
}