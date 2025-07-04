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

# 🌙 Midnight Contracts

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](./contracts/tokens/nft/src/test/)

A comprehensive collection of smart contracts built for the Midnight blockchain using the Compact language. This repository serves as a centralized hub for essential, production-ready contracts that prioritize privacy, security, and modularity.

## 🎯 Project Objectives

The Midnight Contracts project aims to:

- **Accelerate Development**: Provide ready-to-use, battle-tested smart contracts
- **Promote Reusability**: Create modular contracts that can be easily integrated into different projects
- **Maintain Quality**: Implement comprehensive testing and security best practices
- **Foster Innovation**: Enable developers to build on solid foundations rather than starting from scratch

## 📁 Project Structure

```
midnight-contracts/
├── 📄 README.md                    # This file - project overview and guide
├── 📄 LICENSE                      # GPL-3.0 license
├── 📄 package.json                 # Root package configuration
├── 📄 turbo.json                   # Monorepo build configuration
├── 📁 contracts/                   # Main contracts workspace
│   ├── 📄 package.json             # Contracts package configuration
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── 📄 vitest.config.ts         # Test runner configuration
│   ├── 📄 eslint.config.mjs        # Linting rules
│   ├── 📁 src/                     # Generated contract code
│   │   ├── 📄 index.ts             # Main exports
│   │   └── 📁 managed/             # Compiled contract artifacts
│   └── 📁 tokens/                  # Token-related contracts
│       ├── 📁 nft/                 # NFT contract (Public Ledger)
│       │   ├── 📄 README.md        # NFT public version documentation
│       │   └── 📁 src/             # NFT source code and tests
│       └── 📁 nft-zk/              # NFT-ZK contract (Zero-Knowledge Privacy)
│           ├── 📄 README.md        # NFT-ZK privacy documentation
│           └── 📁 src/             # NFT-ZK source code and tests
├── 📁 compact/                     # Compact compiler tooling
│   ├── 📄 package.json             # Compiler package configuration
│   └── 📁 src/                     # Compiler utilities
└── 📁 reports/                     # Test coverage and CI reports
```

## 🛠️ Available Contracts

### NFT (Non-Fungible Token) Contracts

We provide **two complete NFT implementations** to meet different privacy and transparency requirements:

#### 🔓 NFT Contract (Public Ledger)
**Location**: [`./contracts/tokens/nft/`](./contracts/tokens/nft/)

A transparent ERC-721 compatible NFT implementation with full public visibility:

- ✅ **Public Transparency**: All ownership and transfers visible on blockchain
- ✅ **Simple Implementation**: Direct address-to-token mappings
- ✅ **High Performance**: Efficient operations with minimal overhead
- ✅ **Full Auditability**: Complete transaction history publicly verifiable
- ✅ **Standards Compliant**: ERC-721 compatible interface

📖 **[Read the NFT (Public) documentation →](./contracts/tokens/nft/README.md)**

#### 🔐 NFT-ZK Contract (Zero-Knowledge Privacy)
**Location**: [`./contracts/tokens/nft-zk/`](./contracts/tokens/nft-zk/)

A privacy-preserving NFT implementation using zero-knowledge proofs and hash-based ownership:

- ✅ **Ownership Privacy**: Hash-based identities instead of public addresses
- ✅ **Transfer Privacy**: Zero-knowledge proofs hide transaction details
- ✅ **Balance Privacy**: Private computation of token holdings
- ✅ **Cryptographic Security**: Dual secret system for enhanced privacy
- ✅ **Standards Compliant**: ERC-721 compatible with privacy enhancements

📖 **[Read the NFT-ZK (Privacy) documentation →](./contracts/tokens/nft-zk/README.md)**

#### 🔄 Choosing Between NFT Variants

| Feature | NFT (Public) | NFT-ZK (Private) |
|---------|--------------|------------------|
| **Privacy** | ❌ Fully public | ✅ Hash-based privacy |
| **Performance** | ✅ High efficiency | ⚠️ ZK overhead |
| **Complexity** | ✅ Simple | ⚠️ Complex (ZK circuits) |
| **Auditability** | ✅ Full transparency | ✅ Provable correctness |
| **Use Case** | Public marketplaces, transparency required | Private collections, confidential transfers |

**Common Features** (Both Implementations):
- ✅ **Minting & Burning**: Create and destroy unique tokens
- ✅ **Approval System**: Granular permission management  
- ✅ **Balance Tracking**: Efficient ownership queries
- ✅ **Operator Support**: Delegate management capabilities
- ✅ **Comprehensive Testing**: 20+ test cases covering all scenarios

### 🚀 More Contracts Coming Soon

## Getting Started

### Prerequisites

- **Node.js** 18+ and **yarn**
- **Midnight SDK** and development tools
- **Compact** compiler (included in this project)

### Installation

```bash
# Clone the repository
git clone https://github.com/riusricardo/midnight-contracts.git
cd midnight-contracts

# Install dependencies
yarn install

# Build all contracts
yarn build
```

### Running Tests

```bash
# Run all tests
yarn test-contracts

# Run specific contract tests
npx vitest run tokens/nft/src/test/nft.test.ts --reporter=verbose      # Public NFT
npx vitest run tokens/nft-zk/src/test/nft-zk.test.ts --reporter=verbose  # Private NFT-ZK
```

### Development Workflow

```bash
# Lint code
yarn lint

# Format code
yarn format

# Build for production
yarn build
```

## 🧪 Testing Strategy

Our contracts follow rigorous testing practices:

- **Unit Tests**: Every function is thoroughly tested
- **Integration Tests**: Complex scenarios and edge cases

### Test Coverage

- **NFT Contract (Public)**: 20 comprehensive test cases covering public ledger functionality
- **NFT-ZK Contract (Privacy)**: 23 comprehensive test cases covering zero-knowledge features
- **Coverage**: 100% function coverage, 95%+ line coverage across both implementations
- **Scenarios**: Normal operations, edge cases, error conditions, privacy validation

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-contract`
3. **Write** tests for your changes
4. **Ensure** all tests pass: `yarn test`
5. **Submit** a pull request

### Contribution Guidelines

- Follow existing code style and patterns
- Add comprehensive tests for new functionality
- Update documentation for API changes
- Ensure backward compatibility when possible
- Include security considerations in your changes

## 📚 Documentation

- **[NFT Contract (Public) Guide](./contracts/tokens/nft/README.md)**: Complete public NFT documentation
- **[NFT-ZK Contract (Privacy) Guide](./contracts/tokens/nft-zk/README.md)**: Complete private NFT documentation

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
