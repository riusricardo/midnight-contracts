# NFT Contract Documentation

## Overview

The NFT (Non-Fungible Token) module provides a comprehensive, reusable implementation similar to ERC721 for the Midnight blockchain. This documentation covers the **core module** that developers import and the **usage example** that demonstrates how to add custom authorization.

## Modular Pattern

This project follows a **modular architecture** designed for maximum flexibility:

- 📦 **Module** (`./modules/Nft.compact`): Core NFT functionality that you import
- 🔧 **Usage Example** (`nft.compact`): Shows how to wrap module circuits with admin controls
- 🎯 **Your Implementation**: Import the module and create your own authorization patterns

### The Key Distinction

- **What you import**: The `Nft` module with ALL circuits (`mint`, `burn`, `transfer`, etc.)
- **What this file shows**: An example of wrapping `mint`/`burn` with admin authorization
- **What you build**: Your own authorization logic around the module's circuits

The module exports everything - including `mint` and `burn`. The main contract file (`nft.compact`) is just one way to use those circuits, adding admin-only restrictions as an example.

## The Core NFT Module

**Path**: `./modules/Nft.compact`

This is what you'll **import into your projects**. The module exports ALL NFT circuits including:

- 🔄 **Transfer circuits**: `transfer`, `transferFrom`
- ✅ **Approval circuits**: `approve`, `setApprovalForAll`
- 🔍 **Query circuits**: `balanceOf`, `ownerOf`, `getApproved`, `isApprovedForAll`
- 🏭 **Core circuits**: `mint`, `burn` (yes, these are exported!)

**Important**: The module exports `mint` and `burn` circuits. It's up to YOU to decide how to authorize them.

## Public Functions

### `balanceOf(owner: ZswapCoinPublicKey): Uint<64>`

Returns the number of tokens owned by a given public key.

**Parameters:**

- `owner`: The public key to check the balance for

**Returns:** The number of tokens owned

### `ownerOf(tokenId: Uint<64>): ZswapCoinPublicKey`

Returns the owner of a given token ID.

**Parameters:**

- `tokenId`: The ID of the token to check

**Returns:** The public key of the token owner

### `approve(to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

Approves another public key to transfer the specified token ID.

**Parameters:**

- `to`: The public key to approve
- `tokenId`: The token ID to approve for transfer

### `getApproved(tokenId: Uint<64>): ZswapCoinPublicKey`

Returns the approved public key for a given token ID.

**Parameters:**

- `tokenId`: The token ID to check approvals for

**Returns:** The approved public key (or default if none)

### `setApprovalForAll(operator: ZswapCoinPublicKey, approved: Boolean): []`

Sets or unsets approval for an operator to manage all of the caller's tokens.

**Parameters:**

- `operator`: The public key to set as operator
- `approved`: Whether to approve or revoke operator status

### `isApprovedForAll(owner: ZswapCoinPublicKey, operator: ZswapCoinPublicKey): Boolean`

Checks if an operator is approved to manage all tokens of a given owner.

**Parameters:**

- `owner`: The owner's public key
- `operator`: The operator's public key

**Returns:** True if the operator is approved

### `transfer(to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

Transfers ownership of a given token ID from the caller to another account.

**Parameters:**

- `to`: The recipient's public key
- `tokenId`: The token ID to transfer

### `transferFrom(from: ZswapCoinPublicKey, to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

Transfers ownership of a given token ID from one public key to another.

**Parameters:**

- `from`: The current owner's public key
- `to`: The recipient's public key
- `tokenId`: The token ID to transfer

### `mintAdmin(to: ZswapCoinPublicKey, tokenId: Uint<64>): []`

**[ADMIN ONLY]** Mints a new token with the specified token ID to the given public key.

**Authorization**: Only the contract admin (deployer) can call this function.

**Parameters:**

- `to`: The recipient's public key
- `tokenId`: The token ID to mint

**Throws**: "Not authorized to mint." if caller is not the admin

### `burnAdmin(tokenId: Uint<64>): []`

**[ADMIN ONLY]** Burns (destroys) a specific token by its ID, regardless of who owns it.

**Authorization**: Only the contract admin (deployer) can call this function.

**Parameters:**

- `tokenId`: The token ID to burn

**Throws**: "Not authorized to burn." if caller is not the admin

## Module Structure

### Core NFT Module (`./modules/Nft.compact`)

The module exports ALL circuits - no restrictions:

```compact
export {
  balanceOf,
  ownerOf,
  approve,
  getApproved,
  setApprovalForAll,
  isApprovedForAll,
  transfer,
  transferFrom,
  mint,        // ← Available for you to authorize as needed
  burn         // ← Available for you to authorize as needed
};
```

### Usage Example (`nft.compact`)

This shows ONE way to use the module - with admin-only controls:

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "midnight-contracts/contracts/tokens/nft/src/modules/Nft";

// Export selected circuits from the Nft module.
// We aren't exporting 'burn' or 'mint' because they have no authorization checks.
export { 
  balanceOf,
  ownerOf,
  approve,
  getApproved,
  setApprovalForAll,
  isApprovedForAll,
  transfer,
  transferFrom
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

  // Use the imported NFT functionality
  mint(to, tokenId);
}

// Example: Only admin can burn tokens.
export circuit burnAdmin(tokenId: Uint<64>): [] {
  const senderPublicKey = ownPublicKey();
  assert(senderPublicKey == contractAdmin, "Not authorized to burn.");

  // Get the owner of the token and then burn it
  const tokenOwner = ownerOf(tokenId);
  burn(tokenOwner, tokenId);
}
```

**This is just an example!** You could create:
- Public minting with payment
- Role-based authorization (minters, burners, etc.)
- Time-locked operations
- Community governance
- Any authorization pattern you need

## Security Considerations

1. **Authorization is Your Choice**: The module gives you `mint` and `burn` - decide how to authorize them
2. **Module Trust**: The module circuits are designed to be safe; authorization is your responsibility
3. **Owner Verification**: Always verify ownership before performing sensitive operations
4. **Approval Checks**: Ensure proper approval verification in transfer functions
5. **Token Existence**: Check that tokens exist before operating on them
6. **Input Validation**: Validate all inputs to prevent invalid operations

## License

This contract is licensed under GPL-3.0. See the license header in the source file for full details.
