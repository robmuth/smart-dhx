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
var SmartDiffieHellman = artifacts.require("./SmartDiffieHellman.sol");

module.exports = function(deployer) {
  var dhInst1;
  var dhInst2;

  var dhInst1aA;
  var dhInst2bB;

  var jsInitTransmit, jsCalcSecret;

  deployer.deploy(BigMod)
    .then(() => {
      return deployer.link(BigMod, SmartDiffieHellman);
    })
    .then(() => {
      return deployer.deploy(SmartDiffieHellman);
    })
    .then((instance1) => {
      dhInst1 = instance1;

      return deployer.deploy(SmartDiffieHellman);
    })
    .then((instance2) => {
      dhInst2 = instance2;
    })
    .then(() => {
      return dhInst1.jsInitTransmit.call();
    })
    .then((js) => {
      jsInitTransmit = js;
    })
    .then(() => {
      return dhInst1.jsCalcSecret.call();
    })
    .then((js) => {
      jsCalcSecret = js;

      return eval("(async (dhInst1, dhInst2) => {" + jsInitTransmit + "})(dhInst1, dhInst2)");
    })
    .then(async (aA) => {
        dhInst1aA = aA;
    })
    .then(() => {
        return eval("(async (dhInst1, dhInst2) => {" + jsInitTransmit + "})(dhInst2, dhInst1)");
    })
    .then((bB) => {
        dhInst2bB = bB;
    })
    .then(() => {
        return eval("(async (dhInst, genAa) => {" + jsCalcSecret + "})(dhInst1, dhInst1aA)");
    })
    .then((shared) =>{
        console.log("1: " + shared);
    })
    .then(() => {
        return eval("(async (dhInst, genAa) => {" + jsCalcSecret + "})(dhInst2, dhInst2bB)");
    })
    .then((shared) =>{
        console.log("2: " + shared);
    });
};
