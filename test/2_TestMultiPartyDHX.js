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

const MultipartySmartDiffieHellmanController = artifacts.require("MultipartySmartDiffieHellmanController");
const MultipartySmartDiffieHellmanClient = artifacts.require("MultipartySmartDiffieHellmanClient");

var SEEDS = require("./seeds.js");

contract("MultipartySmartDiffieHellmanController", (accounts) => {
	const instances = 5;
	var controller;
	var clients = [];

	var clientAas = [];

	// Deploys MultipartySmartDiffieHellmanController independently from migrations 
	before(async () => {
		controller = await MultipartySmartDiffieHellmanController.new();

		for(let i = 0; i < instances; i++)  {
			let client = await MultipartySmartDiffieHellmanClient.new(controller.address);
			clients = [...clients, client];
		}
	});

	it("should be " + instances + " differenct clients", () => {
		for(let i = 0; i < clients.length - 1; i++) {
			assert.ok(clients[i].address, "Contract " + i + " has not been deployed");

			for(let j = i + 1; j < clients.length; j++) 
				assert.notEqual(clients[i].address, clients[j].address, "Contract " + i + " and contract " + j + " should be different");
		}
	});

	it("should generate Aa's for the clients", async () => {
		for(let i = 0; i < instances; i++) {
			let client = clients[i];

			clientAas.push(await client.generateA.call([SEEDS.SEEDS[i]]));

			assert.ok(clientAas[i]["_A"], "Missing _A");
			assert.ok(clientAas[i]["_a"], "Missing _a");
		}
	});

	it("should sort clients", async () => {
		await controller.sortClients();

		let contractClients = [];

		for(let j = 0; j < clients.length; j++)
			contractClients = [...contractClients, (await controller.clients.call(j)).toLowerCase()];

		let jsSort = [...contractClients];
		jsSort.sort();
		
		clients.sort((l, r) => {
			let lStr = parseInt((l + "").substr(2), 16);
			let rStr = parseInt((r + "").substr(2), 16);
			return l.address.toLowerCase().localeCompare(r.address.toLowerCase());
		});

		assert.equal(contractClients.length, instances, "Sort did not work (wrong length)");
		
		assert.deepEqual(contractClients, jsSort, "Clients not correctly sorted");
	});

	it("should request the first keys", async () => {
		await controller.start();

		for(let i = 0; i < instances; i++) {
			let client = clients[i];

			assert.ok(await client.requested.call(0), "Client does not have any request");
			
			let reqKeys = await client.requestedKeys.call();
			assert.ok(reqKeys["_clientsKeys"], "Request has no _clientKeys");
			assert.ok(reqKeys["_keys"], "Request has no _keys");

			assert.equal(reqKeys["_clientsKeys"].length, 1, "Wrong number of _clientKeys");
			assert.equal(reqKeys["_keys"].length, 1, "Wrong number of _keys");
		}
	});

	it("should compute all keys", async() => { 
		let found = false;

		do {
			for(let i = 0; i < instances; i++) {
				let client = clients[i];

				found = await client.getRequestedSize.call() > 0;

				let requested = await client.requestedKeys.call();

				assert.equal(requested["_clientsKeys"].length, requested["_keys"].length, "_clientsKeys.length != _keys.length");

				for(let j = 0; j < requested["_clientsKeys"].length; j++) {
					let clientsKey = requested["_clientsKeys"][j];
					let key = requested["_keys"][j];

					let answerKey = key == 0 ? clientAas[i]["_A"] : await client.generateAExtB.call(clientAas[i]["_a"], key);
					
					await client.answer(clientsKey, answerKey);
				}
			} 
		} while(found);

		// Calculate secret key
		let privateKeys = [];
		for(let i = 0; i < instances; i++) {
			let client = clients[i];

			let finalKey = await client.getFinalKey.call(clients.map(c => c.address));
			
			privateKeys = [...privateKeys, await client.generateAExtB.call(clientAas[i]["_a"], finalKey)];
		}

		// Check if all keys are the same
		assert.equal(Object.keys(privateKeys).length, instances, "Not all clients have a secret key");
		for(let i = 0; i < instances - 1; i++) {
			assert.equal(privateKeys[i] + "", privateKeys[i + 1] + "", "privateKeys[" + i +"] != privateKeys[" + (i + 1) + "]");
		}

		console.log("The secret key: " + privateKeys[0]);
	});
});