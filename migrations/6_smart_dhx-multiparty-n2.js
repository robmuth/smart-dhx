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

var BigMod = artifacts.require("./BigMod.sol");

var MultipartySmartDiffieHellmanClient = artifacts.require("./MultipartySmartDiffieHellmanClient.sol");
var MultipartySmartDiffieHellmanController = artifacts.require("./MultipartySmartDiffieHellmanController.sol");
var MigrationsHelper = artifacts.require("./MigrationsHelper.sol");

module.exports = function(deployer) {
  var seeds = ["0xC89FA119C29A3E3429ED2DDBB2FDD9A6D0C6B30B3FCE948D42158CC078440B2B", "0xD6BB78C499BD8CF5933315D192F040FEED2AFCEED19FF05CA94CF38B780EC5DB"];

  var instances = 2;
  var clients = [];
  var clientAas = [];
  var controller;

  var helper; 

  deployer.deploy(BigMod)
    .then(() => {
      return deployer.link(BigMod, MultipartySmartDiffieHellmanClient);
    })
    .then(() => {
      return deployer.link(BigMod, MultipartySmartDiffieHellmanController);
    })
    .then(() => {
      return deployer.deploy(MultipartySmartDiffieHellmanController);
    })
    .then((controllerInstance) => {
      controller = controllerInstance;

      return controller;
    })
    .then(() => {
      let depl = [];
      for(let i = 0; i < instances; i++) {
        depl = [...depl, deployer.deploy(MultipartySmartDiffieHellmanClient, controller.address)];
      }

      return Promise.all(depl);
    })
    .then((deployedClients) => {
      clients = deployedClients;
    })
    .then(() => {
      return deployer.deploy(MigrationsHelper, clients.map(c => c.address));
    })
    .then((helperInstance) => {
      helper = helperInstance;
    })
    .then(() => {
      return controller.start();
    })
    .then(async () => {
      let i = 0; 
      clientAas = await Promise.all(clients.map((client) => { return client.generateA.call([seeds[i++]]) } ));
      return clientAas;
    })
    .then(async () => {
      let found = false;

      let gas = 0;

      do {
        let batchClients = [];
        let batchClientsKeys = [];
        let batchAnswerKeys = [];

        for(let i = 0; i < instances; i++) {
          let client = clients[i];

          found = await client.getRequestedSize.call() > 0;

          let requested = await client.requestedKeys.call();

          for(let j = 0; j < requested["_clientsKeys"].length; j++) {
            let clientsKey = requested["_clientsKeys"][j];
            let key = requested["_keys"][j];

            let answerKey = key == 0 ? clientAas[i]["_A"] : await client.generateAExtB.call(clientAas[i]["_a"], key);
            
            //let b = await client.answer(clientsKey, answerKey);
            
            batchClients = [...batchClients, client];
            batchClientsKeys = [...batchClientsKeys, clientsKey];
            batchAnswerKeys = [...batchAnswerKeys, answerKey];
          }
        } 

        if(batchClients.length > 0) {
          let b = await helper.answerBatch(batchClients.map(c => c.address), batchClientsKeys, batchAnswerKeys);
          gas += b.receipt.gasUsed;

          console.log("Gas: " + gas + " " + b.receipt.gasUsed);
        }
      } while(found);

      console.log("Gas: " + gas);
    });
};
