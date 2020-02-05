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
 
const SmartDiffieHellman = artifacts.require("SmartDiffieHellman");
var SEEDS = require("./seeds.js");

contract("SmartDiffieHellman", (accounts) => {
	const instances = 2;
	var contracts = [];

	// Deploys SmartDiffieHellman independently from migrations 
	before(async () => {
		for(let i = 0; i < instances; i++) 
			contracts = [...contracts, SmartDiffieHellman.new()];

		await Promise.all(contracts).then((instances) => {
			contracts = instances;
		})
	});

	it("should be differenct contracts", () => {
		for(let i = 0; i < contracts.length - 1; i++) {
			assert.ok(contracts[i].address, "Contract " + i + " has not been deployed");

			for(let j = i + 1; j < contracts.length; j++) 
				assert.notEqual(contracts[i].address, contracts[j].address, "Contract " + i + " and contract " + j + " should be different");
		}
	});

	it("should exchange one and the same key between two clients", async () => {
		const contract1 = contracts[0];
		const contract2 = contracts[1];

		let aA = await contract1.generateA.call([SEEDS.SEED1]);
		await contract1.transmitA(contract2.address, aA["_A"]);

		assert.ok(aA["_a"], "Missing 'a' in contract 1");
		assert.ok(aA["_A"], "Missing 'A' in contract 1");

		let bB = await contract2.generateA.call([SEEDS.SEED2]);
		await contract2.transmitA(contract1.address, bB["_A"]);

		assert.ok(bB["_a"], "Missing 'b' in contract 2");
		assert.ok(bB["_A"], "Missing 'B' in contract 2");

		let AB1 = await contract1.generateAB.call(aA["_a"]);
		let AB2 = await contract2.generateAB.call(bB["_a"]);

		assert.equal(AB1.toString(), AB2.toString(), "Exchanged keys keys are not the same");
	});
});