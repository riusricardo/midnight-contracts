/**
 * @file NFT-ZK contract test suite (Transparent and Explicit)
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

import { describe, it, expect } from "vitest";
import { NftZkSimulator } from "./nft-zk-simulator.js";
import {
  NetworkId,
  setNetworkId
} from "@midnight-ntwrk/midnight-js-network-id";
import type { CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

setNetworkId(NetworkId.Undeployed);

describe("NFT-ZK Contract Tests", () => {
  /**
   * Test utility class to manage hash key mappings explicitly in tests
   */
  class TestHashManager {
    private simulator: NftZkSimulator;
    private publicKeyToHashMap = new Map<string, bigint>();

    constructor(simulator: NftZkSimulator) {
      this.simulator = simulator;
    }

    /**
     * Generate owner hash key (uses local secret)
     */
    generateOwnerHashKey(publicKey: CoinPublicKey): bigint {
      const publicKeyBytes = this.simulator.publicKeyToBytes(publicKey);
      const hashKey = this.simulator.generateHashKey(
        publicKeyBytes.bytes,
        this.simulator.getLocalSecret()
      );
      this.publicKeyToHashMap.set(`owner:${publicKey}`, hashKey);
      return hashKey;
    }

    /**
     * Generate operator hash key (uses shared secret)
     */
    generateOperatorHashKey(publicKey: CoinPublicKey): bigint {
      const publicKeyBytes = this.simulator.publicKeyToBytes(publicKey);
      const hashKey = this.simulator.generateHashKey(
        publicKeyBytes.bytes,
        this.simulator.getSharedSecret()
      );
      this.publicKeyToHashMap.set(`operator:${publicKey}`, hashKey);
      return hashKey;
    }

    /**
     * Get stored hash key for verification
     */
    getStoredHashKey(
      type: "owner" | "operator",
      publicKey: CoinPublicKey
    ): bigint {
      const key = `${type}:${publicKey}`;
      const hashKey = this.publicKeyToHashMap.get(key);
      if (!hashKey) {
        throw new Error(`Hash key not found for ${type}:${publicKey}`);
      }
      return hashKey;
    }
  }

  it("should mint a new token and validate hash key directly", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Generate expected hash key for Alice as owner
    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);

    // Mint token to Alice
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Check that ownerOf returns the exact hash key (bigint)
    const actualOwnerHashKey = simulator.ownerOf(tokenId);
    expect(actualOwnerHashKey).toBe(aliceOwnerHashKey);
    expect(typeof actualOwnerHashKey).toBe("bigint"); // Verify correct type

    // Verify Alice's balance
    const aliceBalance = simulator.balanceOf(aliceBytes);
    expect(aliceBalance).toBe(1n);
  });

  it("should handle approvals with explicit hash key validation", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint token to Alice
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Generate expected hash key for Bob as operator
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);

    // Alice approves Bob
    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.approve(bobBytes, tokenId);

    // Check that getApproved returns the exact hash key (bigint)
    const actualApprovedHashKey = simulator.getApproved(tokenId);
    expect(actualApprovedHashKey).toBe(bobOperatorHashKey);
    expect(typeof actualApprovedHashKey).toBe("bigint"); // Verify correct type
  });

  it("should handle setApprovalForAll with explicit hash key pairs", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Generate hash keys with correct secrets
    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);

    // Set approval for all (Bob as operator for Alice's tokens)
    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.setApprovalForAll(bobBytes, true);

    // Check using raw hash keys (bigint pairs)
    const isApproved = simulator.isApprovedForAll(
      aliceOwnerHashKey,
      bobOperatorHashKey
    );
    expect(isApproved).toBe(true);
    expect(typeof isApproved).toBe("boolean"); // Verify correct type

    // Test revoking approval
    simulator.setApprovalForAll(bobBytes, false);
    const isApprovedAfterRevoke = simulator.isApprovedForAll(
      aliceOwnerHashKey,
      bobOperatorHashKey
    );
    expect(isApprovedAfterRevoke).toBe(false);
  });

  it("should transfer tokens using explicit hash keys", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint token to Alice
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Get Alice's hash key as current owner
    const aliceOwnerHashKey = simulator.ownerOf(tokenId);

    // When transferring, new owner gets hash key with SHARED secret (per contract logic)
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);

    // Transfer from Alice to Bob using explicit hash key
    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.transferFrom(aliceOwnerHashKey, bobBytes, tokenId);

    // Verify Bob is now the owner (with shared secret hash)
    const actualNewOwnerHashKey = simulator.ownerOf(tokenId);
    expect(actualNewOwnerHashKey).toBe(bobOperatorHashKey);

    // Verify balances
    const aliceBalance = simulator.balanceOf(aliceBytes);
    expect(aliceBalance).toBe(0n);

    const bobBalance = simulator.balanceOf(bobBytes);
    expect(bobBalance).toBe(1n);
  });

  it("should burn tokens using explicit hash keys", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Mint token to Alice
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Get Alice's hash key as current owner
    const aliceOwnerHashKey = simulator.ownerOf(tokenId);

    // Burn the token using explicit hash key
    simulator.burn(aliceOwnerHashKey, tokenId);

    // Verify Alice's balance decreased
    const aliceBalance = simulator.balanceOf(aliceBytes);
    expect(aliceBalance).toBe(0n);

    // Token should no longer exist (this should throw or return 0)
    expect(() => simulator.ownerOf(tokenId)).toThrow();
  });

  it("should validate hash key generation consistency", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Generate hash keys multiple times and verify consistency
    const aliceBytes = simulator.publicKeyToBytes(alice);
    const bobBytes = simulator.publicKeyToBytes(bob);

    const aliceHash1 = simulator.generateHashKey(
      aliceBytes.bytes,
      simulator.getLocalSecret()
    );
    const aliceHash2 = simulator.generateHashKey(
      aliceBytes.bytes,
      simulator.getLocalSecret()
    );
    expect(aliceHash1).toBe(aliceHash2);

    const bobHash1 = simulator.generateHashKey(
      bobBytes.bytes,
      simulator.getSharedSecret()
    );
    const bobHash2 = simulator.generateHashKey(
      bobBytes.bytes,
      simulator.getSharedSecret()
    );
    expect(bobHash1).toBe(bobHash2);

    // Different secrets should produce different hashes
    const aliceHashWithSharedSecret = simulator.generateHashKey(
      aliceBytes.bytes,
      simulator.getSharedSecret()
    );
    expect(aliceHash1).not.toBe(aliceHashWithSharedSecret);
  });

  it("should handle complex approval scenarios with explicit hash management", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    // Mint token to Alice
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Generate all required hash keys
    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);
    const charlieOperatorHashKey = hashManager.generateOperatorHashKey(charlie);

    // Set Bob as operator for all Alice's tokens
    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.setApprovalForAll(bobBytes, true);

    // Also approve Charlie for this specific token
    const charlieBytes = simulator.publicKeyToBytes(charlie);
    simulator.approve(charlieBytes, tokenId);

    // Verify both approvals exist
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(true);

    const approvedForToken = simulator.getApproved(tokenId);
    expect(approvedForToken).toBe(charlieOperatorHashKey);

    // Charlie transfers the token to himself using specific approval
    // IMPORTANT: After transfer, Charlie gets hash key with SHARED secret
    const charlieTransferredHashKey =
      hashManager.generateOperatorHashKey(charlie);
    const aliceCurrentOwnerHash = simulator.ownerOf(tokenId);
    simulator.transferFrom(aliceCurrentOwnerHash, charlieBytes, tokenId);

    // Token should now belong to Charlie (with shared secret hash)
    const newOwnerHash = simulator.ownerOf(tokenId);
    expect(newOwnerHash).toBe(charlieTransferredHashKey);

    // Specific approval should be cleared (should throw or return 0)
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should mint multiple tokens with different IDs", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Generate expected hash keys
    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob); // Bob gets shared secret hash

    // Mint tokens
    const aliceBytes = simulator.publicKeyToBytes(alice);
    const bobBytes = simulator.publicKeyToBytes(bob);

    simulator.mint(aliceBytes, 1n); // Alice mints to herself (local secret)
    simulator.mint(bobBytes, 2n); // Alice mints to Bob (shared secret)
    simulator.mint(aliceBytes, 3n); // Alice mints to herself again (local secret)

    // Check ownership using hash keys
    expect(simulator.ownerOf(1n)).toBe(aliceOwnerHashKey);
    expect(simulator.ownerOf(2n)).toBe(bobOperatorHashKey);
    expect(simulator.ownerOf(3n)).toBe(aliceOwnerHashKey);

    // Check balances
    expect(simulator.balanceOf(aliceBytes)).toBe(2n);
    expect(simulator.balanceOf(bobBytes)).toBe(1n);
  });

  it("should handle non-existent tokens correctly", () => {
    const simulator = new NftZkSimulator();

    // Try to get owner of non-existent token
    expect(() => simulator.ownerOf(999n)).toThrow();

    // Try to burn non-existent token
    expect(() => simulator.burn(123n, 999n)).toThrow();
  });

  it("should prevent minting duplicate token IDs", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint first token
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Try to mint with same ID again
    const bobBytes = simulator.publicKeyToBytes(bob);
    expect(() => simulator.mint(bobBytes, tokenId)).toThrow();
  });

  it("should clear approvals on transfer", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    // Alice mints and approves Bob
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.approve(bobBytes, tokenId);

    // Verify approval exists
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    // Alice transfers to Charlie
    const aliceOwnerHashKey = simulator.ownerOf(tokenId);
    const charlieBytes = simulator.publicKeyToBytes(charlie);
    simulator.transferFrom(aliceOwnerHashKey, charlieBytes, tokenId);

    // Approval should be cleared
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should clear approvals on burn", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Alice mints and approves Bob
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.approve(bobBytes, tokenId);

    // Verify approval exists
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    // Alice burns the token
    const aliceOwnerHashKey = simulator.ownerOf(tokenId);
    simulator.burn(aliceOwnerHashKey, tokenId);

    // Both token and approval should be gone
    expect(() => simulator.ownerOf(tokenId)).toThrow();
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should not allow approving yourself", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Alice mints a token
    const aliceBytes = simulator.publicKeyToBytes(alice);
    simulator.mint(aliceBytes, tokenId);

    // Alice tries to approve herself - this should fail at contract level
    expect(() => simulator.approve(aliceBytes, tokenId)).toThrow();
  });

  it("should not allow setting yourself as operator", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const aliceBytes = simulator.publicKeyToBytes(alice);

    // Alice tries to set herself as operator - this should fail at contract level
    expect(() => simulator.setApprovalForAll(aliceBytes, true)).toThrow();
  });

  it("should handle zero balance correctly", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const aliceBytes = simulator.publicKeyToBytes(alice);

    // Check balance of user with no tokens
    const balance = simulator.balanceOf(aliceBytes);
    expect(balance).toBe(0n);
  });

  it("should maintain correct balances after multiple operations", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    const aliceBytes = simulator.publicKeyToBytes(alice);
    const bobBytes = simulator.publicKeyToBytes(bob);

    // Alice mints 3 tokens to herself
    simulator.mint(aliceBytes, 1n);
    simulator.mint(aliceBytes, 2n);
    simulator.mint(aliceBytes, 3n);
    expect(simulator.balanceOf(aliceBytes)).toBe(3n);

    // Alice transfers 1 to Bob
    const aliceOwnerHashKey = simulator.ownerOf(1n);
    simulator.transferFrom(aliceOwnerHashKey, bobBytes, 1n);
    expect(simulator.balanceOf(aliceBytes)).toBe(2n);
    expect(simulator.balanceOf(bobBytes)).toBe(1n);

    // Alice burns 1 token
    const aliceOwnerHashKey2 = simulator.ownerOf(2n);
    simulator.burn(aliceOwnerHashKey2, 2n);
    expect(simulator.balanceOf(aliceBytes)).toBe(1n);

    // Bob burns his token
    const bobOwnerHashKey = simulator.ownerOf(1n);
    simulator.burn(bobOwnerHashKey, 1n);
    expect(simulator.balanceOf(bobBytes)).toBe(0n);
  });

  it("should handle operator approvals correctly", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");

    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);
    const charlieOperatorHashKey = hashManager.generateOperatorHashKey(charlie);

    // Initial state - no approvals
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(false);

    // Alice approves Bob as operator
    const bobBytes = simulator.publicKeyToBytes(bob);
    simulator.setApprovalForAll(bobBytes, true);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(true);

    // Charlie is not approved
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(false);

    // Alice revokes Bob's approval
    simulator.setApprovalForAll(bobBytes, false);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(false);
  });

  it("should handle large token IDs and edge values", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const aliceBytes = simulator.publicKeyToBytes(alice);

    // Test with very large token ID
    const largeTokenId = 18446744073709551615n; // Near max uint64
    simulator.mint(aliceBytes, largeTokenId);

    // Get the actual owner hash from the contract
    const largeTokenOwnerHash = simulator.ownerOf(largeTokenId);
    expect(typeof largeTokenOwnerHash).toBe("bigint");
    expect(simulator.balanceOf(aliceBytes)).toBe(1n);

    // Test with token ID 1 (contract doesn't allow 0)
    const smallTokenId = 1n;
    simulator.mint(aliceBytes, smallTokenId);

    const smallTokenOwnerHash = simulator.ownerOf(smallTokenId);
    expect(typeof smallTokenOwnerHash).toBe("bigint");
    expect(simulator.balanceOf(aliceBytes)).toBe(2n);
  });

  it("should handle sequential minting and burning operations", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    const aliceBytes = simulator.publicKeyToBytes(alice);
    const bobBytes = simulator.publicKeyToBytes(bob);

    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);

    // Mint tokens 1-5 to Alice
    for (let i = 1n; i <= 5n; i++) {
      simulator.mint(aliceBytes, i);
    }
    expect(simulator.balanceOf(aliceBytes)).toBe(5n);

    // Transfer odd tokens to Bob
    simulator.transferFrom(simulator.ownerOf(1n), bobBytes, 1n);
    simulator.transferFrom(simulator.ownerOf(3n), bobBytes, 3n);
    simulator.transferFrom(simulator.ownerOf(5n), bobBytes, 5n);

    expect(simulator.balanceOf(aliceBytes)).toBe(2n);
    expect(simulator.balanceOf(bobBytes)).toBe(3n);

    // Burn some tokens
    simulator.burn(simulator.ownerOf(2n), 2n);
    simulator.burn(simulator.ownerOf(1n), 1n);

    expect(simulator.balanceOf(aliceBytes)).toBe(1n);
    expect(simulator.balanceOf(bobBytes)).toBe(2n);

    // Verify remaining tokens
    expect(simulator.ownerOf(4n)).toBe(aliceOwnerHashKey);
    expect(simulator.ownerOf(3n)).toBe(bobOperatorHashKey);
    expect(simulator.ownerOf(5n)).toBe(bobOperatorHashKey);
  });

  it("should correctly handle mixed approval types in transfer scenarios", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const dave = simulator.createPublicKey("Dave");

    const aliceBytes = simulator.publicKeyToBytes(alice);
    const bobBytes = simulator.publicKeyToBytes(bob);
    const charlieBytes = simulator.publicKeyToBytes(charlie);
    const daveBytes = simulator.publicKeyToBytes(dave);

    // Alice mints two tokens
    simulator.mint(aliceBytes, 1n);
    simulator.mint(aliceBytes, 2n);

    const daveOperatorHashKey = hashManager.generateOperatorHashKey(dave);

    // Alice sets Bob as operator for all
    simulator.setApprovalForAll(bobBytes, true);

    // Alice approves Charlie for token 1 specifically
    simulator.approve(charlieBytes, 1n);

    // Bob (as operator) can transfer token 2
    simulator.transferFrom(simulator.ownerOf(2n), daveBytes, 2n);
    expect(simulator.ownerOf(2n)).toBe(daveOperatorHashKey);

    // Charlie (with specific approval) can transfer token 1
    simulator.transferFrom(simulator.ownerOf(1n), daveBytes, 1n);
    expect(simulator.ownerOf(1n)).toBe(daveOperatorHashKey);

    // Alice should have no tokens left
    expect(simulator.balanceOf(aliceBytes)).toBe(0n);
    expect(simulator.balanceOf(daveBytes)).toBe(2n);
  });

  it("should handle rapid approval changes correctly", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    const aliceBytes = simulator.publicKeyToBytes(alice);
    const bobBytes = simulator.publicKeyToBytes(bob);
    const charlieBytes = simulator.publicKeyToBytes(charlie);

    simulator.mint(aliceBytes, tokenId);

    const aliceOwnerHashKey = hashManager.generateOwnerHashKey(alice);
    const bobOperatorHashKey = hashManager.generateOperatorHashKey(bob);
    const charlieOperatorHashKey = hashManager.generateOperatorHashKey(charlie);

    // Rapid approval changes
    simulator.approve(bobBytes, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    simulator.approve(charlieBytes, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(charlieOperatorHashKey);

    simulator.approve(bobBytes, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    // Operator approval changes
    simulator.setApprovalForAll(charlieBytes, true);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(true);

    simulator.setApprovalForAll(charlieBytes, false);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(false);

    simulator.setApprovalForAll(charlieBytes, true);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(true);
  });

  it("should test transfer circuit functionality", () => {
    const simulator = new NftZkSimulator();
    const hashManager = new TestHashManager(simulator);
    const alice = simulator.createPublicKey("Alice");
    const charlie = simulator.createPublicKey("Charlie");

    const aliceBytes = simulator.publicKeyToBytes(alice);
    const charlieBytes = simulator.publicKeyToBytes(charlie);

    const charlieOperatorHashKey = hashManager.generateOperatorHashKey(charlie);

    // Verify hash key consistency in transfer circuit
    const tokenId1 = 1n;
    simulator.mint(aliceBytes, tokenId1);

    // Transfer from Alice to Charlie
    simulator.transfer(charlieBytes, tokenId1);
    const charlieFirstTokenHash = simulator.ownerOf(tokenId1);

    // Transfer another token from Alice to Charlie
    const tokenId2 = 2n;
    simulator.mint(aliceBytes, tokenId2);
    simulator.transfer(charlieBytes, tokenId2);
    const charlieSecondTokenHash = simulator.ownerOf(tokenId2);

    // Both tokens should have the same hash key for Charlie (consistency check)
    expect(charlieFirstTokenHash).toBe(charlieSecondTokenHash);
    expect(charlieFirstTokenHash).toBe(charlieOperatorHashKey);

    // Final balance verification
    expect(simulator.balanceOf(aliceBytes)).toBe(0n);
    expect(simulator.balanceOf(charlieBytes)).toBe(2n); // Charlie has 2 tokens
  });
});
