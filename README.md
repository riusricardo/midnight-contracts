<!--
midnight-contracts
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

# 🌙 Midnight Contracts Library

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](./contracts/tokens/nft/src/test/)
[![NPM Version](https://img.shields.io/npm/v/@midnight-ntwrk/contracts-lib)](https://www.npmjs.com/package/@midnight-ntwrk/contracts-lib)

A comprehensive **smart contract library** for the Midnight blockchain ecosystem. This library provides production-ready, auditable, and reusable contract implementations written in the Compact language.

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install @midnight-ntwrk/contracts-lib

# Using yarn
yarn add @midnight-ntwrk/contracts-lib

# Using pnpm
pnpm add @midnight-ntwrk/contracts-lib
```

## 🎯 Library Objectives

The Midnight Contracts Library aims to:

- **Accelerate Development**: Provide ready-to-use, battle-tested smart contracts
- **Ensure Security**: All contracts are thoroughly tested and follow security best practices
- **Promote Reusability**: Create modular contracts that can be easily integrated into any project
- **Maintain Quality**: Implement comprehensive testing and continuous integration
- **Foster Innovation**: Enable developers to build on solid foundations rather than starting from scratch
- **Preserve Privacy**: Special focus on privacy-preserving contract implementations

## � Available Contracts

### Token Contracts

#### 🎨 NFT (Non-Fungible Token)

- **Module**: `modules/nft.compact`
- **Description**: Standard ERC721-like NFT implementation with full ownership tracking
- **Features**: Minting, burning, transfers, approvals, operator management
- **Use Cases**: Art collections, gaming items, certificates, unique assets

#### 🔒 NFT-ZK (Privacy-Preserving NFT)

- **Module**: `modules/nft-zk.compact`
- **Description**: Privacy-focused NFT with hidden ownership using zero-knowledge proofs
- **Features**: Anonymous ownership, private transfers, selective disclosure
- **Use Cases**: Private collections, confidential assets, anonymous trading

#### 🛠️ NFT-Base (Shared Utilities)

- **Module**: `modules/nft-base.compact`
- **Description**: Common utilities and helper functions for NFT implementations
- **Features**: Validation circuits, hash generation, reusable logic
- **Use Cases**: Building custom NFT variants, extending functionality

## 🏗️ Module Architecture

The library is organized using Compact's module system for maximum reusability:

```
contracts/src/modules/
├── index.compact          # Main library entry point
├── tokens.compact         # Token contracts module
├── nft.compact           # Standard NFT module
├── nft-zk.compact        # Zero-knowledge NFT module
├── nft-base.compact      # Shared NFT utilities
└── examples/             # Usage examples
    ├── example-nft-usage.compact
    └── example-nft-zk-usage.compact
```

## 📚 Documentation

- **[Contract Documentation](./contracts/tokens/)** - Detailed contract docs

## 🚀 Getting Started

### 1. Installation

Add the library to your Midnight project:

```bash
yarn add @midnight-ntwrk/contracts-lib
```

### 2. Basic Usage

Import contracts directly into your Compact files using the new module system:

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "./modules/Nft";

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

### 3. Privacy-Preserving Contracts

Use the NFT-ZK module for privacy-focused applications:

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "./modules/NftZk";

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
## 🔧 Development Setup

### Prerequisites

- Node.js 20+
- Yarn or npm
- Midnight development environment

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/riusricardo/midnight-contracts.git
   cd midnight-contracts
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Build contracts**

   ```bash
   yarn compact
   yarn build
   ```

4. **Run tests**
   ```bash
   yarn test-contracts
   ```
   │ ├── 📄 package.json # Contracts package configuration
   │ ├── 📄 tsconfig.json # TypeScript configuration
   │ ├── 📄 vitest.config.ts # Test runner configuration
   │ ├── 📄 eslint.config.mjs # Linting rules
   │ ├── 📁 src/ # Generated contract code
   │ │ ├── 📄 index.ts # Main exports
   │ │ └── 📁 managed/ # Compiled contract artifacts
   │ └── 📁 tokens/ # Token-related contracts
   │ ├── 📁 nft/ # NFT contract (Public Ledger)
   │ │ ├── 📄 README.md # NFT public version documentation
   │ │ └── 📁 src/ # NFT source code and tests
   │ └── 📁 nft-zk/ # NFT-ZK contract (Zero-Knowledge Privacy)
   │ ├── 📄 README.md # NFT-ZK privacy documentation
   │ └── 📁 src/ # NFT-ZK source code and tests
   ├── 📁 compact/ # Compact compiler tooling
   │ ├── 📄 package.json # Compiler package configuration
   │ └── 📁 src/ # Compiler utilities
   └── 📁 reports/ # Test coverage and CI reports

````

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

### What this means:

- ✅ **Free to use** in open source projects
- ✅ **Free to modify** and distribute
- ⚠️ **Must remain open source** if distributed
- ⚠️ **Must include license notice** in derivative works

---

**Built with ❤️ for the Midnight ecosystem**

_Empowering developers to build privacy-first applications with confidence._
