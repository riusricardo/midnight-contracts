<!--
NFT Contract Documentation
Author: Ricardo Rius
License: GPL-3.0

Copyright (C) 2025 Ricardo Rius

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

DISCLAIMER: This software is provided "as is" without any warranty.
Use at your own risk. The author assumes no responsibility for any
damages or losses arising from the use of this software.
-->

# NFT-ZK Contract (Zero-Knowledge Privacy)

This directory contains a complete NFT (Non-Fungible Token) contract implementation using the Compact language for the Midnight blockchain. This is the **zero-knowledge privacy version** that uses hash-based ownership and private state to provide privacy-preserving NFT functionality. The contract follows ERC-721 standards while adding cryptographic privacy protections.

> **Note**: For a simpler, fully transparent alternative, see the [NFT Contract](../nft/) which stores all data on the public ledger.

## Overview

The NFT-ZK contract provides the following functionality with cryptographic privacy:

- **Private Minting**: Create new unique tokens with ownership hidden behind cryptographic hashes
- **Private Ownership**: Track token ownership using hash keys instead of public addresses
- **Private Transfers**: Transfer tokens between hash-based identities using zero-knowledge proofs
- **Private Approvals**: Grant permission using hash-based operator keys
- **Private Operator Approvals**: Manage bulk permissions through private hash mappings
- **Private Burning**: Destroy tokens while maintaining ownership privacy
- **Private Balance Tracking**: Query token counts through hash-based lookups

## Key Characteristics

### Zero-Knowledge Architecture

- **Hash-Based Ownership**: Token owners are identified by cryptographic hash keys, not public addresses
- **Dual Secret System**: Uses both local secrets (for self-ownership) and shared secrets (for transfers/operators)
- **Private State**: Sensitive data stored in private witness values
- **Zero-Knowledge Proofs**: All operations verified cryptographically without revealing private information

### Privacy Features

- **Ownership Privacy**: Real owner identities hidden behind hash commitments
- **Transfer Privacy**: Token movements don't reveal sender/receiver identities
- **Balance Privacy**: Token holdings computed privately from hash-based mappings
- **Operator Privacy**: Approval relationships hidden from public view

### Comparison with Standard NFT

| Feature           | NFT (Public)           | NFT-ZK (Private)         |
| ----------------- | ---------------------- | ------------------------ |
| Ownership Privacy | ❌ Public addresses    | ✅ Hash-based identities |
| Transfer Privacy  | ❌ Public transactions | ✅ Zero-knowledge proofs |
| Balance Privacy   | ❌ Public balances     | ✅ Private hash lookups  |

## Contract Features

### Core Functions (Zero-Knowledge)

- `mint(to, tokenId)` - Create a new token with hash-based ownership assignment
- `transfer(to, tokenId)` - Convenient transfer using automatic owner hash resolution
- `transferFrom(fromHashKey, to, tokenId)` - Transfer between hash-based identities
- `approve(to, tokenId)` - Approve a hash-based operator for a specific token
- `setApprovalForAll(operator, approved)` - Set hash-based operator permissions for all tokens
- `burn(ownerHashKey, tokenId)` - Destroy a token using owner's hash key

### Query Functions (Zero-Knowledge)

- `ownerOf(tokenId)` - Get the hash key of the token owner (not the public address)
- `balanceOf(owner)` - Get the number of tokens owned by a public address (computed from hash mappings)
- `getApproved(tokenId)` - Get the approved hash key for a specific token
- `isApprovedForAll(ownerHashKey, operatorHashKey)` - Check approval status between hash keys

## Project Structure

```
tokens/nft-zk/
├── README.md                      # This file
├── src/
│   ├── index.ts                   # Main exports
│   ├── nft-zk.compact             # Zero-knowledge contract implementation
│   ├── witnesses.ts               # TypeScript witness definitions with secret management
│   └── test/
│       ├── nft-zk-simulator.ts    # Contract simulator with hash key management
│       └── nft-zk.test.ts         # Comprehensive test suite (23 tests)
```

## Usage

### Installing Dependencies

```bash
yarn install
```

### Running Tests

The contract includes a comprehensive test suite with 23 test cases covering all zero-knowledge functionality:

```bash
# Run tests with verbose output
npx vitest run tokens/nft-zk/src/test/nft-zk.test.ts --reporter=verbose
```

### Test Coverage

The test suite covers zero-knowledge functionality:

```bash
 ✓ contracts/tokens/nft-zk/src/test/nft-zk.test.ts (22 tests) 521ms
   ✓ NFT-ZK Contract Tests (22)
     ✓ should mint a new token and validate hash key directly 38ms
     ✓ should handle approvals with explicit hash key validation 16ms
     ✓ should handle setApprovalForAll with explicit hash key pairs 19ms
     ✓ should transfer tokens using explicit hash keys 29ms
     ✓ should burn tokens using explicit hash keys 20ms
     ✓ should validate hash key generation consistency 7ms
     ✓ should handle complex approval scenarios with explicit hash management 33ms
     ✓ should mint multiple tokens with different IDs 25ms
     ✓ should handle non-existent tokens correctly 5ms
     ✓ should prevent minting duplicate token IDs 8ms
     ✓ should clear approvals on transfer 24ms
     ✓ should clear approvals on burn 19ms
     ✓ should not allow approving yourself 9ms
     ✓ should not allow setting yourself as operator 4ms
     ✓ should handle zero balance correctly 4ms
     ✓ should maintain correct balances after multiple operations 44ms
     ✓ should handle operator approvals correctly 14ms
     ✓ should handle large token IDs and edge values 15ms
     ✓ should handle sequential minting and burning operations 73ms
     ✓ should correctly handle mixed approval types in transfer scenarios 43ms
     ✓ should handle rapid approval changes correctly 34ms
     ✓ should test transfer circuit functionality 34ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
```

## Development

### Contract Implementation

The core contract logic is implemented in `src/nft-zk.compact` using the Compact language. Key features include:

- **Zero-Knowledge Privacy**: Hash-based ownership with cryptographic proofs
- **Dual Secret Architecture**: Local secrets for self-ownership, shared secrets for transfers/operators
- **Private State Management**: Sensitive data stored in witness values
- **Standards-compliant**: Follows ERC-721 interface patterns with privacy enhancements

### Secret Management

The contract uses a sophisticated dual-secret system:

1. **Local Secret**: Used for tokens you own yourself (self-minting)
2. **Shared Secret**: Used for tokens received from others or for operator relationships

This allows the contract to:

- Distinguish between self-owned and received tokens
- Maintain privacy while enabling transfers
- Support complex approval scenarios privately

### Simulator

The `NftZkSimulator` class provides a convenient way to interact with the zero-knowledge contract:

- **Hash Key Management**: Generates and manages cryptographic hash keys
- **Secret Handling**: Manages local and shared secrets automatically
- **Privacy Testing**: Provides tools to test privacy-preserving functionality
- **State Management**: Maintains private contract state across operations
- **Explicit Testing**: Exposes raw hash keys for transparent testing

### Key Implementation Details

1. **Hash-Based Identity**: Owners identified by `hash(publicKey + secret)` instead of raw public keys
2. **Dual Secret System**: Local secrets for self-ownership, shared secrets for transfers/operators
3. **Private Authorization**: All permission checks done through hash key comparisons
4. **Zero-Knowledge Circuits**: State modifications proven without revealing private data
5. **Private State**: Sensitive information stored in witness values, not public ledger
6. **Circuit Types**: Both pure (read-only) and impure (state-modifying) circuits

## Security Considerations

- **Secret Management**: Local and shared secrets must be kept secure
- **Hash Key Privacy**: Hash keys provide privacy but must be managed carefully
- **Authorization Privacy**: All permissions verified through private hash comparisons
- **Transfer Privacy**: Token movements don't reveal true identities
- **Approval Privacy**: Permission grants hidden from public view
- **Circuit Security**: Zero-knowledge proofs ensure correctness without revelation
- **State Consistency**: Private state must remain consistent with cryptographic proofs

## Privacy Benefits

- **Ownership Anonymity**: Token owners identified only by hash keys
- **Transfer Privacy**: No public record of sender/receiver identities
- **Balance Confidentiality**: Token holdings computed privately
- **Approval Privacy**: Permission relationships hidden from observers
- **Activity Privacy**: Transaction patterns don't reveal user behavior

## Contributing

When contributing to this repository:

1. Ensure all tests pass: `yarn test-contracts`
2. Add tests for new functionality
3. Follow the existing code style and patterns
4. Update documentation for any API changes
5. Verify security implications of changes

## License

This project is licensed under the GPL-3.0 License - see the file header for details.
