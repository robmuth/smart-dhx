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

// insecure but random seeds
module.exports = {
	SEED1 : "0xC89FA119C29A3E3429ED200002FDD9A6D0C6B30B3FCE948D42158CC078440B2B",
	SEED2 : "0xD6BB78C499BD8CF59333100002F040FEED2AFCEED19FF05CA94CF38B780EC5DB",
	SEED3 : "0x01FDB083EBC57FA04DFFC0C67EFB98E09C280913B9BF3C4FE5DE0409A8DC35D2",
	SEED4 : "0xD90D5E09CB09035F8CBF9F813CB80DA0C7723B8FFB0EE4F2C4EAE6D193540DFC",
	SEED5 : "0xCEBE5BFD38DFC0D7DCFFDB05498440C10763CEBC1AF300F0F999B5E3829A802E",
};

module.exports = {
	...module.exports,
	SEEDS: Object.keys(module.exports).filter((key) => { return key.startsWith("SEED") }).map((key) => { return module.exports[key] } )
};