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

# NFT Contract (Public Ledger)

This directory contains a complete NFT (Non-Fungible Token) contract implementation using the Compact language for the Midnight blockchain. This is the **public ledger version** that stores all ownership and approval data on the public blockchain ledger. The contract follows ERC-721 standards and provides a secure way to create and manage unique digital assets with full transparency.

> **Note**: For a privacy-preserving alternative, see the [NFT-ZK Contract](../nft-zk/) which uses zero-knowledge proofs and private state.

## Overview

The public NFT contract provides the following functionality with full transparency on the blockchain:

- **Minting**: Create new unique tokens with specific IDs (publicly visible)
- **Ownership**: Track token ownership transparently on the public ledger
- **Transfers**: Transfer tokens between addresses with public verification
- **Approvals**: Grant permission for others to transfer specific tokens (publicly visible)
- **Operator Approvals**: Grant permission for others to manage all tokens (publicly visible)
- **Burning**: Destroy tokens permanently (publicly recorded)
- **Balance Tracking**: Query how many tokens an address owns (publicly visible)

## Key Characteristics

### Public Ledger Architecture
- **Full Transparency**: All token ownership, transfers, and approvals are stored on the public blockchain
- **Direct Address Storage**: Token owners and approved addresses are stored as public keys directly
- **Public Verification**: Anyone can verify token ownership and approval status
- **Simple Implementation**: Straightforward mapping of tokens to public addresses

### Comparison with NFT-ZK
| Feature | NFT (Public) | NFT-ZK (Private) |
|---------|--------------|------------------|
| Ownership Privacy | ❌ Public | ✅ Private (hash-based) |
| Transfer Privacy | ❌ Public | ✅ Private (zero-knowledge) |
| Balance Privacy | ❌ Public | ✅ Private (computed privately) |

## Contract Features

### Core Functions (Public Ledger)

- `mint(to, tokenId)` - Create a new token and assign it to a public address
- `transferFrom(from, to, tokenId)` - Transfer a token between public addresses
- `approve(to, tokenId)` - Approve a public address to transfer a specific token
- `setApprovalForAll(operator, approved)` - Set or unset approval for all tokens to a public operator
- `burn(owner, tokenId)` - Destroy a token permanently (public record)

### Query Functions (Public Ledger)

- `ownerOf(tokenId)` - Get the public address of the owner of a specific token
- `balanceOf(owner)` - Get the number of tokens owned by a public address
- `getApproved(tokenId)` - Get the approved public address for a specific token
- `isApprovedForAll(owner, operator)` - Check if a public operator is approved for all tokens

## Project Structure

```
tokens/nft/
├── README.md                  # This file
├── src/
│   ├── index.ts               # Main exports
│   ├── nft.compact            # Contract implementation in Compact
│   ├── witnesses.ts           # TypeScript witness definitions
│   └── test/
│       ├── nft-simulator.ts   # Contract simulator for testing
│       └── nft.test.ts        # Comprehensive test suite
```

## Usage

### Installing Dependencies

```bash
yarn install
```

### Running Tests

The contract includes a comprehensive test suite with 20 test cases covering all functionality:

```bash
# Run tests with verbose output
npx vitest run tokens/nft/src/test/nft.test.ts --reporter=verbose
```

### Test Coverage

The test suite covers:

```bash
 ✓ contracts/tokens/nft/src/test/nft.test.ts (20 tests) 357ms
   ✓ NFT Contract Tests (20)
     ✓ should mint a new token 33ms
     ✓ should transfer token between users 21ms
     ✓ should approve and get approved address 9ms
     ✓ should set approval for all 12ms
     ✓ should burn a token 20ms
     ✓ should mint multiple tokens with different IDs 16ms
     ✓ should handle non-existent tokens correctly 4ms
     ✓ should prevent minting duplicate token IDs 6ms
     ✓ should clear approvals on transfer 19ms
     ✓ should clear approvals on burn 14ms
     ✓ should not allow approving yourself 7ms
     ✓ should not allow setting yourself as operator 3ms
     ✓ should handle zero balance correctly 4ms
     ✓ should maintain correct balances after multiple operations 33ms
     ✓ should handle operator approvals correctly 11ms
     ✓ should handle complex approval and transfer scenarios 25ms
     ✓ should handle large token IDs and edge values 13ms
     ✓ should handle sequential minting and burning operations 53ms
     ✓ should correctly handle mixed approval types in transfer scenarios 29ms
     ✓ should handle rapid approval changes correctly 22ms

 Test Files  1 passed (1)
      Tests  20 passed (20)
```

## Development

### Contract Implementation

The core contract logic is implemented in `src/nft.compact` using the Compact language. Key features include:

- **Public Transparency**: All data stored directly on public ledger
- **Secure**: Implements proper authorization checks and error handling
- **Standards-compliant**: Follows ERC-721 interface patterns
- **Simple Architecture**: Direct mapping of tokens to public addresses

### Simulator

The `NftSimulator` class provides a convenient way to interact with the contract for testing and development:

- **Public Key Management**: Generates deterministic public keys from strings
- **Format Compatibility**: Handles hex string formatting for proper data storage
- **Error Handling**: Provides appropriate error responses for invalid operations
- **State Management**: Maintains contract state across operations

### Key Implementation Details

1. **Public Key Format**: The contract uses 64-character hex strings for public key representation
2. **Public Storage**: All ownership and approval data stored directly on the blockchain
3. **Transparent Authorization**: All operations and their authorization are publicly verifiable
4. **State Management**: Contract state is properly updated after each operation on the public ledger
5. **Error Handling**: Invalid operations throw appropriate errors with public visibility

## Security Considerations

- **Public Visibility**: All token ownership and transfers are publicly visible
- Always verify token ownership before transfers (publicly verifiable)
- Approvals are automatically cleared on transfers and burns (publicly recorded)
- Self-approvals are prevented to avoid confusion
- Token IDs must be unique (duplicates will throw errors)
- All operations require proper authorization (publicly verifiable)
- **Privacy**: This contract provides no privacy - all data is public

## Contributing

When contributing to this repository:

1. Ensure all tests pass: `yarn test-contracts`
2. Add tests for new functionality
3. Follow the existing code style and patterns
4. Update documentation for any API changes
5. Verify security implications of changes

## License

This project is licensed under the GPL-3.0 License - see the file header for details.
