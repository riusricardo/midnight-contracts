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

# <img src="https://midnight.network/brand-hub/logo-compact-dark.svg" alt="Midnight Network" width="24" height="24"> Midnight Contracts Library

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](./contracts/tokens/nft/src/test/)

## 🎯 Library Objectives

A comprehensive **smart contract library** for the Midnight blockchain ecosystem. This library provides production-ready, auditable, and reusable contract implementations written in the Compact language.

- **Accelerate Development**: Use ready-to-integrate, well-tested contract modules for a wide range of use cases
- **Promote Reusability**: Import and compose modular contracts for tokens, governance, privacy, and more
- **Ensure Security**: All modules are designed with security and best practices in mind
- **Enable Customization**: Build your own authorization, business logic, and workflows on top of robust primitives
- **Foster Innovation**: Focus on your application logic, not reinventing contract basics
- **Maintain Quality**: Comprehensive testing, documentation, and continuous integration
- **Support Privacy**: Special focus on privacy-preserving and zero-knowledge contract patterns

## 🎯 Library Architecture

This isn't just contracts - it's a **modular library**:

- 📦 **Import modules**: Get core functionality.
- 🔧 **Add your logic**: Wrap circuits with your won logic or export them directly from your contract.
- 🎨 **Unlimited flexibility**: Create any governance, payment, or access control system

### The Modular Pattern
```
modules/Nft   - Core module for public NFTs
modules/NftZk - Core module for privacy NFTs
```

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

## ⚙️ Compact Compiler Path Setup

The Compact compiler (`compactc`) needs to know where to find imported libraries, especially when using dependencies installed in `node_modules`.

**Set the `COMPACT_PATH` environment variable before compiling:**

```bash
export COMPACT_PATH="$COMPACT_PATH:./node_modules:../node_modules"
```

- This ensures the compiler can resolve imports from your project's `node_modules` and any parent directory's `node_modules`.
- You can add this line to your shell profile (e.g., `.bashrc`, `.zshrc`) or run it in your terminal before running any Compact compilation commands.
- The provided `yarn compact` and `npm run compact` scripts already set this variable automatically.

**Why is this needed?**

Compact modules and libraries are distributed via npm and installed in `node_modules`. Setting `COMPACT_PATH` allows the compiler to find and use these dependencies just like with JavaScript/TypeScript projects.

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
  ...
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
