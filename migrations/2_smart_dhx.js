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

  var seed1 = "0xC89FA119C29A3E3429ED2DDBB2FDD9A6D0C6B30B3FCE948D42158CC078440B2B";
  var seed2 = "0xD6BB78C499BD8CF5933315D192F040FEED2AFCEED19FF05CA94CF38B780EC5DB";

  var dhInst1a;
  var dhInst2b;

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

      return instance2;
    })
    .then((instance2) => {
        return dhInst1.generateA.call([seed1]);
    })
    .then(async (aA) => {
        dhInst1a = aA["_a"];
        let transmit = await dhInst1.transmitA(dhInst2.address, aA["_A"]);
        console.log("Gas: " + transmit.receipt.gasUsed);
    })
    .then(() => {
        return dhInst2.generateA.call([seed2]);
    })
    .then((bB) => {
        dhInst2b = bB["_a"];
        return dhInst1.transmitA(dhInst1.address, bB["_A"]);
    })
    .then(() => {
        return dhInst1.generateAB.call(dhInst1a);
    })
    .then((shared) =>{
        console.log("1: " + shared);
    })
    .then(() => {
        return dhInst2.generateAB.call(dhInst2b);
    })
    .then((shared) =>{
        console.log("2: " + shared);
    });
};
