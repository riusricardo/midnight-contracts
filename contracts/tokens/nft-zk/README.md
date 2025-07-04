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

# NFT Contract

This directory contains a complete NFT (Non-Fungible Token) contract implementation using the Compact language for the Midnight blockchain. The contract follows ERC-721 standards and provides a secure way to create and manage unique digital assets.

## Overview

The NFT contract provides the following functionality:
- **Minting**: Create new unique tokens with specific IDs
- **Ownership**: Track token ownership of token
- **Transfers**: Transfer tokens between addresses with proper authorization
- **Approvals**: Grant permission for others to transfer specific tokens
- **Operator Approvals**: Grant permission for others to manage all tokens
- **Burning**: Destroy tokens permanently
- **Balance Tracking**: Query how many tokens an address owns

## Contract Features

### Core Functions
- `mint(to, tokenId)` - Create a new token and assign it to an address
- `transferFrom(from, to, tokenId)` - Transfer a token between addresses
- `approve(to, tokenId)` - Approve an address to transfer a specific token
- `setApprovalForAll(operator, approved)` - Set or unset approval for all tokens
- `burn(owner, tokenId)` - Destroy a token permanently

### Query Functions
- `ownerOf(tokenId)` - Get the owner of a specific token
- `balanceOf(owner)` - Get the number of tokens owned by an address
- `getApproved(tokenId)` - Get the approved address for a specific token
- `isApprovedForAll(owner, operator)` - Check if an operator is approved for all tokens

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
# Run NFT contract tests
yarn test -- tokens/nft/src/test/nft.test.ts

# Run tests with verbose output
yarn test -- tokens/nft/src/test/nft.test.ts --reporter=verbose
```

### Test Coverage

The test suite covers:
```bash
@midnight-ntwrk/contracts-lib:test:  ✓ tokens/nft/src/test/nft.test.ts (20 tests) 375ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should mint a new token 31ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should transfer token between users 24ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should approve and get approved address 10ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should set approval for all 9ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should burn a token 16ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should mint multiple tokens with different IDs 22ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle non-existent tokens correctly 5ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should prevent minting duplicate token IDs 7ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should clear approvals on transfer 21ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should clear approvals on burn 15ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should not allow approving yourself 7ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should not allow setting yourself as operator 3ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle zero balance correctly 4ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should maintain correct balances after multiple operations 35ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle operator approvals correctly 12ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle complex approval and transfer scenarios 26ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle large token IDs and edge values 13ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle sequential minting and burning operations 57ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should correctly handle mixed approval types in transfer scenarios 32ms
@midnight-ntwrk/contracts-lib:test:    ✓ NFT Contract Tests > should handle rapid approval changes correctly 23ms
@midnight-ntwrk/contracts-lib:test: 
@midnight-ntwrk/contracts-lib:test:  Test Files  1 passed (1)
@midnight-ntwrk/contracts-lib:test:       Tests  20 passed (20)
```


## Development

### Contract Implementation

The core contract logic is implemented in `src/nft.compact` using the Compact language. Key features include:

- **Secure**: Implements proper authorization checks and error handling
- **Standards-compliant**: Follows ERC-721 interface patterns

### Simulator

The `NftSimulator` class provides a convenient way to interact with the contract for testing and development:

- **Public Key Management**: Generates deterministic public keys from strings
- **Format Compatibility**: Handles hex string formatting for proper data storage
- **Error Handling**: Provides appropriate error responses for invalid operations
- **State Management**: Maintains contract state across operations

### Key Implementation Details

1. **Public Key Format**: The contract uses 64-character hex strings for public key representation
2. **Authorization**: All operations check that the caller has proper permissions
3. **State Management**: Contract state is properly updated after each operation
4. **Error Handling**: Invalid operations throw appropriate errors

## Security Considerations

- Always verify token ownership before transfers
- Approvals are automatically cleared on transfers and burns
- Self-approvals are prevented to avoid confusion
- Token IDs must be unique (duplicates will throw errors)
- All operations require proper authorization

## Contributing

When contributing to this repository:

1. Ensure all tests pass: `yarn test-contracts`
2. Add tests for new functionality
3. Follow the existing code style and patterns
4. Update documentation for any API changes
5. Verify security implications of changes

## License

This project is licensed under the GPL-3.0 License - see the file header for details.
