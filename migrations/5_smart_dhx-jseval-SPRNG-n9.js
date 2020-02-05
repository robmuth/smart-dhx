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
var SmartDiffieHellmanSPRNG = artifacts.require("./SmartDiffieHellmanSPRNG.sol");

module.exports = function(deployer) {
  const instances = 9;

  var dhInstances = [];

  var aA = {};

  var jsInitTransmit, jsCalcSecret;

  deployer.deploy(BigMod)
    .then(() => {
      return deployer.link(BigMod, SmartDiffieHellmanSPRNG);
    })
    .then(() => {
      let depl = [];
      for(let i = 0; i < instances; i++) {
        depl = [...depl, deployer.deploy(SmartDiffieHellmanSPRNG)];
      }

      return Promise.all(depl);
    })
    .then((deployedClients) => {
      dhInstances = deployedClients;
    })
    .then(() => {
      return dhInstances[0].jsInitTransmit.call();
    })
    .then((js) => {
      jsInitTransmit = js;
    })
    .then(() => {
      return dhInstances[0].jsCalcSecret.call();
    })
    .then((js) => {
      jsCalcSecret = js;
    })
    .then(async () => {
      for(let i = 0; i < instances - 1; i++) {
        for(let j = i + 1; j < instances; j++) {
          let aA = await eval("(async (dhInst1, dhInst2) => {" + jsInitTransmit + "})(dhInstances[i], dhInstances[j])");
          let bB = await eval("(async (dhInst1, dhInst2) => {" + jsInitTransmit + "})(dhInstances[j], dhInstances[i])");

          let secret1 = await eval("(async (dhInst, genAa) => {" + jsCalcSecret + "})(dhInstances[i], aA)");
          let secret2 = await eval("(async (dhInst, genAa) => {" + jsCalcSecret + "})(dhInstances[j], bB)");          
        }
      }
    }) 
};
