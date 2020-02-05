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

contract SmartDiffieHellmanSPRNG is SmartDiffieHellman {
	string public jsInitTransmit = "const secureRandom = require(\"secure-random\"); let random = secureRandom(32, {type: \"Array\"}); let genAa = await dhInst1.generateA.call(random); await dhInst1.transmitA(dhInst2.address, genAa[\"_A\"]); return genAa;";
	string public jsCalcSecret = "return await dhInst.generateAB.call(genAa[\"_a\"]);";
}