/**
 * @file Token Contracts Index
 * @author Ricardo Rius
 * @license GPL-3.0
 *
 * Copyright (C) 2025 Ricardo Rius
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * DISCLAIMER: This software is provided "as is" without any warranty.
 * Use at your own risk. The author assumes no responsibility for any
 * damages or losses arising from the use of this software.
 */

/**
 * Token contract information and metadata
 */
export const TokenContracts = {
  nft: {
    name: "NFT (Non-Fungible Token)",
    file: "tokens/nft.compact",
    description:
      "Standard ERC721-like NFT implementation with full ownership tracking",
    features: [
      "Minting",
      "Burning",
      "Transfers",
      "Approvals",
      "Operator Management"
    ],
    useCases: [
      "Art collections",
      "Gaming items",
      "Certificates",
      "Unique assets"
    ]
  },
  nftZk: {
    name: "NFT-ZK (Privacy-Preserving NFT)",
    file: "tokens/nft-zk.compact",
    description:
      "Privacy-focused NFT with hidden ownership using zero-knowledge proofs",
    features: [
      "Anonymous ownership",
      "Private transfers",
      "Selective disclosure"
    ],
    useCases: [
      "Private collections",
      "Confidential assets",
      "Anonymous trading"
    ]
  }
} as const;

/**
 * Contract metadata for NFT
 */
export const NFTContract = {
  name: "NFT (Non-Fungible Token)",
  version: "1.0.0",
  file: "tokens/nft.compact",
  description:
    "Standard ERC721-like NFT implementation with full ownership tracking",
  features: [
    "Minting new tokens",
    "Burning existing tokens",
    "Safe transfers between accounts",
    "Individual token approvals",
    "Operator approvals for all tokens",
    "Balance queries",
    "Owner verification"
  ],
  useCases: [
    "Digital art collections",
    "Gaming items and assets",
    "Digital certificates",
    "Unique collectibles",
    "Identity tokens",
    "Access tokens"
  ],
  security: {
    audited: false,
    testCoverage: "95%+",
    lastReview: "2025-01-01"
  }
} as const;

/**
 * Contract metadata for NFT-ZK
 */
export const NFTZKContract = {
  name: "NFT-ZK (Privacy-Preserving NFT)",
  version: "1.0.0",
  file: "tokens/nft-zk.compact",
  description:
    "Privacy-focused NFT with hidden ownership using zero-knowledge proofs",
  features: [
    "Anonymous token ownership",
    "Private minting and burning",
    "Confidential transfers",
    "Selective ownership disclosure",
    "Privacy-preserving balance queries",
    "Hash-based account system",
    "Zero-knowledge proofs for authorization"
  ],
  useCases: [
    "Private art collections",
    "Confidential asset ownership",
    "Anonymous trading platforms",
    "Privacy-focused gaming items",
    "Confidential certificates",
    "Anonymous access tokens"
  ],
  security: {
    audited: false,
    testCoverage: "90%+",
    lastReview: "2025-01-01",
    privacyLevel: "High - Zero-knowledge proofs"
  }
} as const;
