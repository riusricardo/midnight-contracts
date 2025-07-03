/**
 * @file NFT contract simulator for testing
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

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  constructorContext,
  type CoinPublicKey
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger
} from "../../../../src/managed/nft/contract/index.cjs";
import { type NftPrivateState, witnesses } from "../witnesses.js";

// Import TextEncoder/TextDecoder for Node.js compatibility
import { TextEncoder } from "util";

// This simulator uses the actual compiled NFT contract
export class NftSimulator {
  readonly contract: Contract<NftPrivateState>;
  private baseContext: CircuitContext<NftPrivateState>;

  constructor() {
    this.contract = new Contract<NftPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext({}, this.getUserPublicKey("Alice"))
    );
    this.baseContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress()
      )
    };
  }

  // Get the current public key from the circuit context
  public getUserPublicKey(userName: string): CoinPublicKey {
    // Generate a 64-character hex string from the user name for compatibility
    // Create a hash-like representation from the username
    const encoded = new TextEncoder().encode(userName);
    const hexChars = [];

    // Convert each byte to hex and pad to ensure we get 64 characters
    for (let i = 0; i < 32; i++) {
      const byte =
        i < encoded.length
          ? encoded[i]
          : (userName.charCodeAt(i % userName.length) + i) % 256;
      hexChars.push(byte.toString(16).padStart(2, "0"));
    }

    return hexChars.join("") as CoinPublicKey;
  }

  // Helper function to convert string to 32-byte format
  private stringToBytes(str: string): { bytes: Uint8Array } {
    const encoded = new TextEncoder().encode(str);
    const bytes = new Uint8Array(32);
    bytes.set(encoded.slice(0, 32)); // Truncate if too long, pad with zeros if too short
    return { bytes };
  }

  // Helper function to convert bytes to hex string (64 characters)
  private bytesToHexString(bytesObj: { bytes: Uint8Array }): string {
    return Array.from(bytesObj.bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Helper function to convert hex string to bytes
  private hexStringToBytes(hexStr: string): { bytes: Uint8Array } {
    const bytes = new Uint8Array(32); // Contract expects 32 bytes
    for (let i = 0; i < Math.min(hexStr.length / 2, 32); i++) {
      const byte = parseInt(hexStr.substr(i * 2, 2), 16);
      bytes[i] = isNaN(byte) ? 0 : byte;
    }
    return { bytes };
  }

  public getLedger(): Ledger {
    return ledger(this.baseContext.originalState.data);
  }

  public getPrivateState(): NftPrivateState {
    return this.baseContext.currentPrivateState;
  }

  public mint(to: CoinPublicKey, tokenId: bigint): [] {
    // Use base context for mint operations
    // Check if 'to' is a hex string (64 characters of hex) and convert appropriately
    const toBytes =
      to.length === 64 && /^[0-9a-fA-F]+$/.test(to)
        ? this.hexStringToBytes(to)
        : this.stringToBytes(to);

    const result = this.contract.impureCircuits.mint(
      this.baseContext,
      toBytes,
      tokenId
    );
    this.baseContext = result.context;
    return [];
  }

  public ownerOf(tokenId: bigint): [CoinPublicKey] {
    const result = this.contract.circuits.ownerOf(this.baseContext, tokenId);
    // Convert the result bytes to a hex string to match the format of getUserPublicKey
    return [this.bytesToHexString(result.result) as CoinPublicKey];
  }

  public balanceOf(owner: CoinPublicKey): [bigint] {
    // Check if 'owner' is a hex string and convert appropriately
    const ownerBytes =
      owner.length === 64 && /^[0-9a-fA-F]+$/.test(owner)
        ? this.hexStringToBytes(owner)
        : this.stringToBytes(owner);

    const result = this.contract.circuits.balanceOf(
      this.baseContext,
      ownerBytes
    );
    return [result.result];
  }

  public approve(to: CoinPublicKey, tokenId: bigint): [] {
    // Call the contract approve method directly
    const toBytes =
      to.length === 64 && /^[0-9a-fA-F]+$/.test(to)
        ? this.hexStringToBytes(to)
        : this.stringToBytes(to);

    const result = this.contract.impureCircuits.approve(
      this.baseContext,
      toBytes,
      tokenId
    );
    this.baseContext = result.context;
    return [];
  }

  public getApproved(tokenId: bigint): [CoinPublicKey | undefined] {
    const result = this.contract.circuits.getApproved(
      this.baseContext,
      tokenId
    );
    return [this.bytesToHexString(result.result) as CoinPublicKey];
  }

  public setApprovalForAll(operator: CoinPublicKey, approved: boolean): [] {
    const operatorBytes =
      operator.length === 64 && /^[0-9a-fA-F]+$/.test(operator)
        ? this.hexStringToBytes(operator)
        : this.stringToBytes(operator);

    const result = this.contract.impureCircuits.setApprovalForAll(
      this.baseContext,
      operatorBytes,
      approved
    );
    this.baseContext = result.context;
    return [];
  }

  public isApprovedForAll(
    owner: CoinPublicKey,
    operator: CoinPublicKey
  ): [boolean] {
    const ownerBytes =
      owner.length === 64 && /^[0-9a-fA-F]+$/.test(owner)
        ? this.hexStringToBytes(owner)
        : this.stringToBytes(owner);
    const operatorBytes =
      operator.length === 64 && /^[0-9a-fA-F]+$/.test(operator)
        ? this.hexStringToBytes(operator)
        : this.stringToBytes(operator);

    const result = this.contract.circuits.isApprovedForAll(
      this.baseContext,
      ownerBytes,
      operatorBytes
    );
    return [result.result];
  }

  public transferFrom(
    from: CoinPublicKey,
    to: CoinPublicKey,
    tokenId: bigint
  ): [] {
    const fromBytes =
      from.length === 64 && /^[0-9a-fA-F]+$/.test(from)
        ? this.hexStringToBytes(from)
        : this.stringToBytes(from);
    const toBytes =
      to.length === 64 && /^[0-9a-fA-F]+$/.test(to)
        ? this.hexStringToBytes(to)
        : this.stringToBytes(to);

    const result = this.contract.impureCircuits.transferFrom(
      this.baseContext,
      fromBytes,
      toBytes,
      tokenId
    );
    this.baseContext = result.context;
    return [];
  }

  public burn(owner: CoinPublicKey, tokenId: bigint): [] {
    const ownerBytes =
      owner.length === 64 && /^[0-9a-fA-F]+$/.test(owner)
        ? this.hexStringToBytes(owner)
        : this.stringToBytes(owner);

    const result = this.contract.impureCircuits.burn(
      this.baseContext,
      ownerBytes,
      tokenId
    );
    this.baseContext = result.context;
    return [];
  }
}
