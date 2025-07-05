#!/usr/bin/env node

// Quick test to verify library exports work correctly
import * as contractsLib from '../contracts/dist/index.js';

console.log('=== Testing Midnight Contracts Library Exports ===\n');

// Test library metadata
console.log('Library Info:', contractsLib.LibraryInfo);
console.log('Library Name:', contractsLib.LIBRARY_NAME);
console.log('Library Version:', contractsLib.LIBRARY_VERSION);

// Test NFT contract exports
console.log('\nNFT Contract available:', !!contractsLib.Nft);
console.log('NFT-ZK Contract available:', !!contractsLib.NftZk);

// Test token metadata
console.log('\nToken Contracts metadata available:', !!contractsLib.TokenContracts);

if (contractsLib.TokenContracts) {
  console.log('NFT metadata:', Object.keys(contractsLib.TokenContracts.nft || {}));
  console.log('NFT-ZK metadata:', Object.keys(contractsLib.TokenContracts.nftZk || {}));
}

console.log('\n=== All exports test completed successfully! ===');
