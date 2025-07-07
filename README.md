<!--
midnight-contracts
Author: Ricardo Rius
License: GPL-3.0

Copyright (C) 2025 Ricardo Rius

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

A comprehensive **modular smart contract library** for the Midnight blockchain ecosystem. This library provides production-ready, reusable **modules** that you import and customize with your own authorization logic.

## 🎯 Library Architecture

This isn't just contracts - it's a **modular library**:

- 📦 **Import modules**: Get core functionality (`mint`, `burn`, `transfer`, etc.)
- 🔧 **Add your logic**: Wrap circuits with your authorization patterns
- 🎨 **Unlimited flexibility**: Create any governance, payment, or access control system

### The Modular Pattern

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "midnight-contracts/contracts/tokens/nft/src/modules/Nft";

// 1. Export safe circuits from the module
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

// 2. Add your authorization around mint/burn
export circuit mintPaid(to: ZswapCoinPublicKey, tokenId: Uint<64>): [] {
  // Your payment logic here
  assert(paymentReceived(), "Payment required");
  mint(to, tokenId);
}

// 3. Deploy with your custom rules
```

**Key insight**: The modules give you ALL the circuits. YOU decide how to authorize them.

## 🚀 Quick Start

### Installation

Currently available as a GitHub dependency while we prepare for npm publishing:

```json
{
  "dependencies": {
    "midnight-contracts": "git+https://github.com/riusricardo/midnight-contracts.git"
  }
}
```

Or install directly:

```bash
# Using npm
npm install git+https://github.com/riusricardo/midnight-contracts.git

# Using yarn
yarn add git+https://github.com/riusricardo/midnight-contracts.git
```

### Basic Usage

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "midnight-contracts/contracts/tokens/nft/src/modules/Nft";

// 1. Export safe circuits directly from module
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

// 2. Create your authorization wrapper
export circuit mintPaid(to: ZswapCoinPublicKey, tokenId: Uint<64>): [] {
  // Add payment logic, governance, time locks, etc.
  assert(paymentReceived(), "Payment required");
  mint(to, tokenId);
}

// 3. Your wrapped version replaces the raw circuit
```

## 🎯 Library Objectives

This modular library aims to:

- **Provide Building Blocks**: Give you the core circuits (`mint`, `burn`, `transfer`) to build with
- **Enable Customization**: YOU decide authorization - admin-only, payment-based, governance, etc.
- **Ensure Security**: Core circuits are thoroughly tested and battle-hardened
- **Promote Reusability**: Import the same module into different projects with different rules
- **Maintain Quality**: Comprehensive testing and continuous integration
- **Foster Innovation**: Build custom authorization instead of reinventing token logic
- **Preserve Privacy**: Special focus on zero-knowledge and privacy-preserving implementations

## 📦 Available Modules

### Token Modules

#### 🎨 NFT (Non-Fungible Token)

- **Module**: `contracts/tokens/nft/src/modules/Nft.compact`
- **Exports**: `mint`, `burn`, `transfer`, `approve`, `balanceOf`, `ownerOf`, etc.
- **Description**: Complete ERC721-like NFT implementation
- **Your choice**: Add payment, governance, time-locks, or any authorization you want

#### 🔒 NFT-ZK (Privacy-Preserving NFT)

- **Module**: `contracts/tokens/nft-zk/src/modules/NftZk.compact`
- **Exports**: `mintPrivate`, `burnPrivate`, `transferPrivate`, `approvePrivate`, etc.
- **Description**: Privacy-focused NFT with hidden ownership using zero-knowledge proofs
- **Your choice**: Add anonymous payments, private governance, or confidential authorization

## 🛠️ Usage Examples

### Example 1: Admin-Only NFT (Simple)

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "midnight-contracts/contracts/tokens/nft/src/modules/Nft";

// Export safe circuits from the module
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

constructor() {
  contractAdmin = ownPublicKey();
}

// Only admin can mint tokens
export circuit mintAdmin(to: ZswapCoinPublicKey, tokenId: Uint<64>): [] {
  const senderPublicKey = ownPublicKey();
  assert(senderPublicKey == contractAdmin, "Not authorized to mint.");
  mint(to, tokenId);
}

// Only admin can burn tokens
export circuit burnAdmin(tokenId: Uint<64>): [] {
  const senderPublicKey = ownPublicKey();
  assert(senderPublicKey == contractAdmin, "Not authorized to burn.");
  const tokenOwner = ownerOf(tokenId);
  burn(tokenOwner, tokenId);
}
```

### Example 2: Payment-Based NFT (Advanced)

```compact
pragma language_version 0.16;

import CompactStandardLibrary;
import "midnight-contracts/contracts/tokens/nft/src/modules/Nft";

export { 
  balanceOf,
  ownerOf,
  transfer,
  approve
};

export ledger mintPrice: Uint<64>;
export ledger treasury: ZswapCoinPublicKey;

constructor() {
  mintPrice = 1000n;
  treasury = ownPublicKey();
}

// Anyone can mint by paying
export circuit mintPaid(to: ZswapCoinPublicKey, tokenId: Uint<64>): [] {
  // Verify payment (implementation would check actual payment)
  assert(paymentAmount() >= mintPrice, "Insufficient payment");
  
  // Process payment to treasury
  processPayment(treasury, mintPrice);
  
  // Mint the token
  mint(to, tokenId);
}
```

### Integration in Your Project

1. **Add Dependency**:
```json
{
  "dependencies": {
    "midnight-contracts": "git+https://github.com/riusricardo/midnight-contracts.git"
  }
}
```

## 🏗️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/riusricardo/midnight-contracts.git
cd midnight-contracts

# Install dependencies
yarn install

# Build all contracts
yarn build

# Run tests
yarn test-contracts
```

### Project Structure

```
midnight-contracts/
├── contracts/                    # Main contracts package
│   ├── tokens/                   # Token implementations
│   │   ├── nft/                  # Standard NFT
│   │   │   ├── src/
│   │   │   │   ├── nft.compact   # Main contract
│   │   │   │   ├── modules/      # Core modules
│   │   │   │   └── test/         # Test suite
│   │   │   └── CONTRACT.md       # Documentation
│   │   └── nft-zk/               # Privacy NFT
│   │       ├── src/
│   │       │   ├── nft-zk.compact # Main contract
│   │       │   ├── modules/       # Privacy modules
│   │       │   └── test/          # Test suite
│   │       └── CONTRACT.md        # Documentation
│   ├── src/                      # Compiled outputs
│   │   └── managed/              # Generated contracts
│   └── dist/                     # Distribution files
├── compact/                      # Compact compiler tools
└── package.json                  # Root package (workspace)
```

## 🏁 Quick Development Setup

### Prerequisites
- Node.js 18+ 
- Yarn package manager
- Git

### Setup Steps

1. **Clone and install**
   ```bash
   git clone https://github.com/riusricardo/midnight-contracts.git
   cd midnight-contracts
   yarn install
   ```

2. **Build contracts**
   ```bash
   yarn compact
   yarn build
   ```

3. **Run tests**
   ```bash
   yarn test-contracts
   ```

4. **Development workflow**
   ```bash
   # Make changes to contracts
   # Re-compile and test
   yarn compact && yarn build && yarn test-contracts
   ```

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
