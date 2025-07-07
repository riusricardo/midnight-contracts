# NFT-ZK Contract Documentation

## Overview

The NFT-ZK (Privacy-Preserving Non-Fungible Token) contract provides a modularized, privacy-focused implementation for the Midnight blockchain with **hidden ownership** using zero-knowledge proofs. This documentation covers the **core module** that developers import and the **usage example** that demonstrates admin authorization.

## Modular Pattern

This project follows a **modular architecture** designed for maximum flexibility:

- 📦 **Module** (`./modules/NftZk.compact`): Core privacy-preserving NFT functionality that you import
- 🔧 **Usage Example** (`nft-zk.compact`): Shows how to wrap module circuits with admin controls
- 🎯 **Your Implementation**: Import the module and create your own authorization patterns

### The Key Distinction

- **What you import**: The `NftZk` module with ALL circuits (`mint`, `burn`, `transfer`, etc.)
- **What this file shows**: An example of wrapping mint/burn with admin authorization
- **What you build**: Your own authorization logic around the module's circuits

The module exports everything - including `mint` and `burn`. The main contract file (`nft-zk.compact`) is just one way to use those circuits, adding admin-only restrictions as an example.

## Key Privacy Features

- **Anonymous Ownership**: Token ownership is hidden behind cryptographic hash keys
- **Private Transfers**: Transfers don't reveal the actual public keys involved
- **Selective Disclosure**: Owners can choose when to reveal ownership information
- **Hash-Based Accounts**: Uses generated hash keys instead of direct public key mapping
- **Dual Secret System**: Utilizes both local and shared secrets for different operations
- **Admin Privacy**: Even admin operations maintain privacy of token ownership

## The Core NFT-ZK Module

**Path**: `./modules/NftZk.compact`

This is what you'll **import into your projects**. The module exports ALL privacy-preserving NFT circuits including:

- 🔄 **Transfer circuits**: `transfer`, `transferFrom`
- ✅ **Approval circuits**: `approve`, `setApprovalForAll`
- 🔍 **Query circuits**: `balanceOf`, `ownerOf`, `getApproved`, `isApprovedForAll`
- 🔧 **Utility circuits**: `generateHashKey`
- 🏭 **Core circuits**: `mint`, `burn` (yes, these are exported!)

**Important**: The module exports `mint` and `burn` circuits. It's up to YOU to decide how to authorize them.

## Public Functions

### `balanceOf(owner: ZswapCoinPublicKey): Uint<64>`

Returns the number of tokens owned by a given public key (privacy-preserving).

**Privacy Note**: Uses different secrets based on whether you're checking your own balance or someone else's.

**Parameters:**

- `owner`: The public key to check the balance for

**Returns:** The number of tokens owned

### `ownerOf(tokenId: Uint<64>): Field`

Returns the hash key of the owner of a given token ID.

**Privacy Note**: Returns a hash key, not the actual public key.

**Parameters:**

- `tokenId`: The ID of the token to check

**Returns:** The hash key of the token owner

### `approve(to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

Approves another public key to transfer the specified token ID.

**Privacy Note**: Creates approval using shared secret for the approved party.

**Parameters:**

- `to`: The public key to approve
- `tokenId`: The token ID to approve for transfer

### `getApproved(tokenId: Uint<64>): Field`

Returns the approved hash key for a given token ID.

**Parameters:**

- `tokenId`: The token ID to check approvals for

**Returns:** The approved hash key (or default if none)

### `setApprovalForAll(operator: ZswapCoinPublicKey, approved: Boolean): []`

Sets or unsets approval for an operator to manage all of the caller's tokens.

**Privacy Note**: Uses hash of owner+operator combination for approval tracking.

**Parameters:**

- `operator`: The public key to set as operator
- `approved`: Whether to approve or revoke operator status

### `isApprovedForAll(ownerHashKey: Field, operatorHashKey: Field): Boolean`

Checks if an operator is approved to manage all tokens of a given owner.

**Parameters:**

- `ownerHashKey`: The owner's hash key
- `operatorHashKey`: The operator's hash key

**Returns:** True if the operator is approved

### `transfer(to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

Transfers ownership of a given token ID from the caller to another account.

**Parameters:**

- `to`: The recipient's public key
- `tokenId`: The token ID to transfer

### `transferFrom(fromHashKey: Field, to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

Transfers ownership of a given token ID from one hash key to another account.

**Privacy Note**: Uses hash keys for the sender and generates appropriate hash key for recipient.

**Parameters:**

- `fromHashKey`: The current owner's hash key
- `to`: The recipient's public key
- `tokenId`: The token ID to transfer

### `mintAdmin(to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

**[ADMIN ONLY]** Mints a new token with the specified token ID to the given public key.

**Privacy Note**: Automatically chooses appropriate secret based on whether minting to admin or others.
**Authorization**: Only the contract admin (deployer) can call this function.

**Parameters:**

- `to`: The recipient's public key
- `tokenId`: The token ID to mint

**Throws**: "Not authorized to mint." if caller is not the admin

### `burnAdmin(tokenId: Uint<64>): []`

**[ADMIN ONLY]** Burns (destroys) a specific token by its ID, regardless of who owns it.

**Privacy Note**: Automatically retrieves the owner's hash key and performs the burn operation.
**Authorization**: Only the contract admin (deployer) can call this function.

**Parameters:**

- `tokenId`: The token ID to burn

**Throws**: "Not authorized to burn." if caller is not the admin

### `generateHashKey(pK1: Bytes<32>, pK2: Bytes<32>): Field`

Pure function to generate hash keys from two byte arrays.

**Parameters:**

- `pK1`: First public key bytes
- `pK2`: Second public key bytes (secret)

**Returns:** Generated hash key

## Module Structure

### Core NFT-ZK Module (`./modules/NftZk.compact`)

The module exports ALL circuits - no restrictions:

```compact
// Export selected circuits from the NftZk module.
// This example exports all circuits from the module even if
// they have no authorization checks.
export { 
  balanceOf,
  ownerOf,
  approve,
  getApproved,
  setApprovalForAll,
  isApprovedForAll,
  transfer,
  transferFrom,
  generateHashKey,
  mint,
  burn
};
```

### Usage Example (`nft-zk.compact`)

This shows ONE way to use the module - with admin-only controls:

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "midnight-contracts/contracts/tokens/nft-zk/src/modules/NftZk";

// Export selected circuits from the NftZk module.
// We aren't exporting 'burn' or 'mint' because they have no authorization checks.
export { 
  balanceOf,
  ownerOf,
  approve,
  getApproved,
  setApprovalForAll,
  isApprovedForAll,
  transfer,
  transferFrom,
  generateHashKey
};

export ledger contractAdmin: ZswapCoinPublicKey;

// Set the public key of the contract admin.
constructor() {
  contractAdmin = ownPublicKey();
}

// Example: Only Admin can mint tokens.
export circuit mintAdmin(to: ZswapCoinPublicKey, tokenId: Uint<64>): [] {
  const senderPublicKey = ownPublicKey();
  assert(senderPublicKey == contractAdmin, "Not authorized to mint.");

  // Use the imported NFT-ZK functionality
  mint(to, tokenId);
}

// Example: Only admin can burn tokens.
export circuit burnAdmin(tokenId: Uint<64>): [] {
  const senderPublicKey = ownPublicKey();
  assert(senderPublicKey == contractAdmin, "Not authorized to burn.");

  // Get the owner hash key of the token and then burn it
  const tokenOwnerHashKey = ownerOf(tokenId);
  burn(tokenOwnerHashKey, tokenId);
}
```

**This is just an example!** You could create:
- Private minting with payment proofs
- Role-based privacy authorization
- Time-locked private operations
- Anonymous governance
- Any privacy-preserving authorization pattern you need

## Privacy Architecture

### Hash Key Generation

The contract uses a dual-secret system for privacy:

- **Local Secret**: Used for self-operations (minting to self, checking own balance)
- **Shared Secret**: Used for operations involving other parties (approvals, transfers to others)

### Key Privacy Features

- **Anonymous Ownership**: Token ownership is hidden behind cryptographic hash keys
- **Private Transfers**: Transfers don't reveal the actual public keys involved
- **Selective Disclosure**: Owners can choose when to reveal ownership information
- **Hash-Based Accounts**: Uses generated hash keys instead of direct public key mapping
- **Dual Secret System**: Utilizes both local and shared secrets for different operations
- **Admin Privacy**: Even admin operations maintain privacy of token ownership

### Required Witnesses

Your Typescript implementation must provide two witness functions:

```compact
witness getLocalSecret(): Bytes<32>    // For self-operations
witness getSharedSecret(): Bytes<32>   // For operations with others
```

## Privacy Considerations

1. **Secret Management**: Properly secure and manage local and shared secrets
2. **Hash Key Tracking**: Keep track of hash keys for your owned tokens
3. **Selective Disclosure**: Carefully consider when to reveal ownership information
4. **Cross-Contract Privacy**: Ensure privacy is maintained across contract interactions
5. **Admin Privacy**: Admin operations don't reveal token ownership details

## Security Considerations

1. **Admin Authorization**: All minting and burning operations require admin authorization
2. **Module Encapsulation**: Raw mint/burn functions are not exposed publicly
3. **Witness Security**: Ensure witness functions are implemented securely
4. **Secret Storage**: Store secrets securely and never expose them
5. **Hash Collision**: While extremely unlikely, be aware of potential hash collisions
6. **Authorization**: Verify proper authorization before sensitive operations

## License

This contract is licensed under GPL-3.0. See the license header in the source file for full details.
