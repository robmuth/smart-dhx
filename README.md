Smart DHX PoC
=============

## Requirements
- **Truffle Framework** (v5.0.39, core: 5.0.39)
- **NPM** for secure PRNG [secure-random](github.com/jprichardson/secure-random)

## Migrations
- **2_smart_dhx.js**: 2-party DHKE w/o client-side JS eval seed generator
- **3_smart_dhx-jseval.js**: 2-party DHKE *with* client-side JS eval seed generator
- **4_smart_dhx-jseval-SPRNG-n2.js**: 2-party DHKE *with* client-side JS eval seed generator and *secure-random*
- **5_smart_dhx-jseval-SPRNG-n9.js**: 2-party DHKE *with* client-side JS eval seed generator and *secure-random* for 9 contracts
- **6_smart_dhx-multiparty-n2.js**: multi-party DHKE for 2 contracts
- **7_smart_dhx-multiparty-n2.js**: multi-party DHKE for 9 contracts

The Gas per TX must be increased depending on the number of contracts.

## License
License: MIT