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

// Export contract metadata and utilities with specific naming to avoid conflicts
export { NFTContract } from "./nft";
export { NFTZKContract } from "./nft-zk";

// Re-export witness utilities with namespaced names
export { nftWitnesses } from "./nft";
export { nftZkWitnesses, createNftZkPrivateState } from "./nft-zk";

// Re-export types
export type { NftPrivateState } from "./nft";
export type { NftZkPrivateState, NftZkContractType } from "./nft-zk";

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
