/**
 * @file Midnight Contracts Library - Main Index
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

// Compiled Contract Exports (for JavaScript/TypeScript usage)
export * as Nft from "./managed/nft/contract/index.cjs";
export * as NftZk from "./managed/nft-zk/contract/index.cjs";

// Token Contracts
export * from "./tokens.js";

// Version and Library Information
export const LIBRARY_VERSION = "0.1.0";
export const LIBRARY_NAME = "@midnight-ntwrk/contracts-lib";

/**
 * Library metadata and information
 */
export const LibraryInfo = {
  name: LIBRARY_NAME,
  version: LIBRARY_VERSION,
  description:
    "Essential smart contracts library for Midnight blockchain development",
  author: "Ricardo Rius",
  license: "GPL-3.0",
  repository: "https://github.com/riusricardo/midnight-contracts",
  documentation: "https://github.com/riusricardo/midnight-contracts#readme",
  supportedLanguageVersion: "0.16"
} as const;
