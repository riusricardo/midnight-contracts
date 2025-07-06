/**
 * @file NFT-ZK contract simulator for testing
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
  ledger,
  pureCircuits
} from "../../../../src/managed/nft-zk/contract/index.cjs";
import {
  type NftZkPrivateState,
  createNftZkPrivateState,
  witnesses
} from "../witnesses.js";
import { fromHex, isHex } from "@midnight-ntwrk/midnight-js-utils";

// Import TextEncoder for Node.js compatibility
import { TextEncoder } from "util";

export class NftZkSimulator {
  readonly contract: Contract<NftZkPrivateState>;
  private baseContext: CircuitContext<NftZkPrivateState>;

  constructor() {
    this.contract = new Contract<NftZkPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext(
        createNftZkPrivateState(
          this.stringToBytes("my_local_secret").bytes,
          this.stringToBytes("my_shared_secret").bytes
        ),
        this.createPublicKey("Alice")
      )
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

  // === Contract State Access ===

  public getLedger(): Ledger {
    return ledger(this.baseContext.originalState.data);
  }

  public getPrivateState(): NftZkPrivateState {
    return this.baseContext.currentPrivateState;
  }

  public getLocalSecret(): Uint8Array {
    return this.getPrivateState().local_secret;
  }

  public getSharedSecret(): Uint8Array {
    return this.getPrivateState().shared_secret;
  }

  // === Raw Contract Methods (Return Actual Contract Types) ===

  /**
   * Returns the balance count (bigint) - matches contract interface
   */
  public balanceOf(owner: CoinPublicKey): bigint {
    const result = this.contract.circuits.balanceOf(
      this.baseContext,
      this.publicKeyToBytes(owner)
    );
    return result.result;
  }

  /**
   * Returns the hash key of the token owner (bigint) - matches contract interface
   */
  public ownerOf(tokenId: bigint): bigint {
    const result = this.contract.circuits.ownerOf(this.baseContext, tokenId);
    return result.result;
  }

  /**
   * Approve an address (as bytes) for a token
   */
  public approve(to: CoinPublicKey, tokenId: bigint): void {
    const result = this.contract.impureCircuits.approve(
      this.baseContext,
      this.publicKeyToBytes(to),
      tokenId
    );
    this.baseContext = result.context;
  }

  /**
   * Returns the hash key of the approved address (bigint) - matches contract interface
   */
  public getApproved(tokenId: bigint): bigint {
    const result = this.contract.circuits.getApproved(
      this.baseContext,
      tokenId
    );
    return result.result;
  }

  /**
   * Set approval for all tokens
   */
  public setApprovalForAll(operator: CoinPublicKey, approved: boolean): void {
    const result = this.contract.impureCircuits.setApprovalForAll(
      this.baseContext,
      this.publicKeyToBytes(operator),
      approved
    );
    this.baseContext = result.context;
  }

  /**
   * Returns approval status (boolean) - matches contract interface
   */
  public isApprovedForAll(
    ownerHashKey: bigint,
    operatorHashKey: bigint
  ): boolean {
    const result = this.contract.circuits.isApprovedForAll(
      this.baseContext,
      ownerHashKey,
      operatorHashKey
    );
    return result.result;
  }

  /**
   * Convenient transfer function that automatically gets current owner hash
   * and transfers token to the specified recipient
   */
  public transfer(to: CoinPublicKey, tokenId: bigint): void {
    const result = this.contract.impureCircuits.transfer(
      this.baseContext,
      this.publicKeyToBytes(to),
      tokenId
    );
    this.baseContext = result.context;
  }

  /**
   * Transfer token from hash key to bytes address
   */
  public transferFrom(
    fromHashKey: bigint,
    to: CoinPublicKey,
    tokenId: bigint
  ): void {
    const result = this.contract.impureCircuits.transferFrom(
      this.baseContext,
      fromHashKey,
      this.publicKeyToBytes(to),
      tokenId
    );
    this.baseContext = result.context;
  }

  /**
   * Mint a token to the given bytes address (admin only)
   */
  public mintAdmin(to: CoinPublicKey, tokenId: bigint): void {
    const result = this.contract.impureCircuits.mintAdmin(
      this.baseContext,
      this.publicKeyToBytes(to),
      tokenId
    );
    this.baseContext = result.context;
  }

  /**
   * Burn a token by ID (admin only)
   */
  public burnAdmin(tokenId: bigint): void {
    const result = this.contract.impureCircuits.burnAdmin(
      this.baseContext,
      tokenId
    );
    this.baseContext = result.context;
  }

  // === Utility Methods ===

  /**
   * Create a deterministic public key from a username for testing
   */
  public createPublicKey(userName: string): CoinPublicKey {
    const encoded = new TextEncoder().encode(userName);
    const hexChars = [];

    for (let i = 0; i < 32; i++) {
      const byte =
        i < encoded.length
          ? encoded[i]
          : (userName.charCodeAt(i % userName.length) + i) % 256;
      hexChars.push(byte.toString(16).padStart(2, "0"));
    }

    return hexChars.join("") as CoinPublicKey;
  }

  /**
   * Convert string to 32-byte format
   */
  public stringToBytes(str: string): { bytes: Uint8Array } {
    const encoded = new TextEncoder().encode(str);
    const bytes = new Uint8Array(32);
    bytes.set(encoded.slice(0, 32));
    return { bytes };
  }

  /**
   * Convert CoinPublicKey to bytes
   */
  public publicKeyToBytes(publicKey: CoinPublicKey): { bytes: Uint8Array } {
    if (isHex(publicKey)) {
      const bytes = fromHex(publicKey.padStart(64, "0"));
      const result = new Uint8Array(32);
      result.set(bytes.slice(0, 32));
      return { bytes: result };
    }
    return this.stringToBytes(publicKey);
  }

  /**
   * Generate hash key using the contract's pure circuit
   */
  public generateHashKey(publicKey: Uint8Array, secret: Uint8Array): bigint {
    return pureCircuits.generateHashKey(publicKey, secret);
  }

  /**
   * Generate owner hash key (uses local secret)
   */
  public generateLocalUserHashKey(publicKey: CoinPublicKey): bigint {
    const publicKeyBytes = this.publicKeyToBytes(publicKey);
    const hashKey = this.generateHashKey(
      publicKeyBytes.bytes,
      this.getLocalSecret()
    );
    return hashKey;
  }

  /**
   * Generate operator hash key (uses shared secret)
   */
  public generateSharedUserHashKey(publicKey: CoinPublicKey): bigint {
    const publicKeyBytes = this.publicKeyToBytes(publicKey);
    const hashKey = this.generateHashKey(
      publicKeyBytes.bytes,
      this.getSharedSecret()
    );
    return hashKey;
  }
}
