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

setNetworkId(NetworkId.Undeployed);

describe("NFT-ZK Contract Tests", () => {
  /*
   * NOTE: All mint and burn operations in these tests are performed by the contract admin.
   * The simulator is initialized with Alice as the deployer/admin, so only the admin
   * can mint new tokens or burn existing tokens, regardless of who owns them.
   * Regular users can only transfer tokens they own or have approval for.
   */

  it("should mint a new token and validate hash key directly", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Generate expected hash key for Alice as owner
    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);

    // Mint token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Check that ownerOf returns the exact hash key (bigint)
    const actualOwnerHashKey = simulator.ownerOf(tokenId);
    expect(actualOwnerHashKey).toBe(aliceOwnerHashKey);
    expect(typeof actualOwnerHashKey).toBe("bigint"); // Verify correct type

    // Verify Alice's balance
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance).toBe(1n);
  });

  it("should handle approvals with explicit hash key validation", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Generate expected hash key for Bob as operator
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);

    // Alice approves Bob
    simulator.approve(bob, tokenId);

    // Check that getApproved returns the exact hash key (bigint)
    const actualApprovedHashKey = simulator.getApproved(tokenId);
    expect(actualApprovedHashKey).toBe(bobOperatorHashKey);
    expect(typeof actualApprovedHashKey).toBe("bigint"); // Verify correct type
  });

  it("should handle setApprovalForAll with explicit hash key pairs", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Generate hash keys with correct secrets
    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);

    // Set approval for all (Bob as operator for Alice's tokens)
    simulator.setApprovalForAll(bob, true);

    // Check using raw hash keys (bigint pairs)
    const isApproved = simulator.isApprovedForAll(
      aliceOwnerHashKey,
      bobOperatorHashKey
    );
    expect(isApproved).toBe(true);
    expect(typeof isApproved).toBe("boolean"); // Verify correct type

    // Test revoking approval
    simulator.setApprovalForAll(bob, false);
    const isApprovedAfterRevoke = simulator.isApprovedForAll(
      aliceOwnerHashKey,
      bobOperatorHashKey
    );
    expect(isApprovedAfterRevoke).toBe(false);
  });

  it("should transfer tokens using explicit hash keys", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Get Alice's hash key as current owner
    const aliceOwnerHashKey = simulator.ownerOf(tokenId);

    // When transferring, new owner gets hash key with SHARED secret (per contract logic)
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);

    // Transfer from Alice to Bob using explicit hash key
    simulator.transferFrom(aliceOwnerHashKey, bob, tokenId);

    // Verify Bob is now the owner (with shared secret hash)
    const actualNewOwnerHashKey = simulator.ownerOf(tokenId);
    expect(actualNewOwnerHashKey).toBe(bobOperatorHashKey);

    // Verify balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance).toBe(0n);

    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance).toBe(1n);
  });

  it("should burn tokens using explicit hash keys", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Mint token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Burn the token using explicit hash key
    simulator.burnAdmin(tokenId);

    // Verify Alice's balance decreased
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance).toBe(0n);

    // Token should no longer exist (this should throw or return 0)
    expect(() => simulator.ownerOf(tokenId)).toThrow();
  });

  it("should validate hash key generation consistency", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Generate hash keys multiple times and verify consistency

    const aliceHash1 = simulator.generateHashKey(
      simulator.publicKeyToBytes(alice).bytes,
      simulator.getLocalSecret()
    );
    const aliceHash2 = simulator.generateHashKey(
      simulator.publicKeyToBytes(alice).bytes,
      simulator.getLocalSecret()
    );
    expect(aliceHash1).toBe(aliceHash2);

    const bobHash1 = simulator.generateHashKey(
      simulator.publicKeyToBytes(bob).bytes,
      simulator.getSharedSecret()
    );
    const bobHash2 = simulator.generateHashKey(
      simulator.publicKeyToBytes(bob).bytes,
      simulator.getSharedSecret()
    );
    expect(bobHash1).toBe(bobHash2);

    // Different secrets should produce different hashes
    const aliceHashWithSharedSecret = simulator.generateHashKey(
      simulator.publicKeyToBytes(alice).bytes,
      simulator.getSharedSecret()
    );
    expect(aliceHash1).not.toBe(aliceHashWithSharedSecret);
  });

  it("should handle complex approval scenarios with explicit hash management", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    // Mint token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Generate all required hash keys
    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);
    const charlieOperatorHashKey = simulator.generateSharedUserHashKey(charlie);

    // Set Bob as operator for all Alice's tokens
    simulator.setApprovalForAll(bob, true);

    // Also approve Charlie for this specific token
    simulator.approve(charlie, tokenId);

    // Verify both approvals exist
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(true);

    const approvedForToken = simulator.getApproved(tokenId);
    expect(approvedForToken).toBe(charlieOperatorHashKey);

    // Charlie transfers the token to himself using specific approval
    // IMPORTANT: After transfer, Charlie gets hash key with SHARED secret
    const charlieTransferredHashKey =
      simulator.generateSharedUserHashKey(charlie);
    const aliceCurrentOwnerHash = simulator.ownerOf(tokenId);
    simulator.transferFrom(aliceCurrentOwnerHash, charlie, tokenId);

    // Token should now belong to Charlie (with shared secret hash)
    const newOwnerHash = simulator.ownerOf(tokenId);
    expect(newOwnerHash).toBe(charlieTransferredHashKey);

    // Specific approval should be cleared (should throw or return 0)
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should mint multiple tokens with different IDs", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Generate expected hash keys
    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob); // Bob gets shared secret hash

    // Mint tokens

    simulator.mintAdmin(alice, 1n); // Alice mints to herself (local secret)
    simulator.mintAdmin(bob, 2n); // Alice mints to Bob (shared secret)
    simulator.mintAdmin(alice, 3n); // Alice mints to herself again (local secret)

    // Check ownership using hash keys
    expect(simulator.ownerOf(1n)).toBe(aliceOwnerHashKey);
    expect(simulator.ownerOf(2n)).toBe(bobOperatorHashKey);
    expect(simulator.ownerOf(3n)).toBe(aliceOwnerHashKey);

    // Check balances
    expect(simulator.balanceOf(alice)).toBe(2n);
    expect(simulator.balanceOf(bob)).toBe(1n);
  });

  it("should handle non-existent tokens correctly", () => {
    const simulator = new NftZkSimulator();

    // Try to get owner of non-existent token
    expect(() => simulator.ownerOf(999n)).toThrow();

    // Try to burn non-existent token
    expect(() => simulator.burnAdmin(999n)).toThrow();
  });

  it("should prevent minting duplicate token IDs", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint first token
    simulator.mintAdmin(alice, tokenId);

    // Try to mint with same ID again
    expect(() => simulator.mintAdmin(bob, tokenId)).toThrow();
  });

  it("should clear approvals on transfer", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    // Alice mints and approves Bob
    simulator.mintAdmin(alice, tokenId);

    simulator.approve(bob, tokenId);

    // Verify approval exists
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    // Alice transfers to Charlie
    const aliceOwnerHashKey = simulator.ownerOf(tokenId);
    simulator.transferFrom(aliceOwnerHashKey, charlie, tokenId);

    // Approval should be cleared
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should clear approvals on burn", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Alice mints and approves Bob
    simulator.mintAdmin(alice, tokenId);

    simulator.approve(bob, tokenId);

    // Verify approval exists
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    simulator.burnAdmin(tokenId);

    // Both token and approval should be gone
    expect(() => simulator.ownerOf(tokenId)).toThrow();
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should not allow approving yourself", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Alice mints a token
    simulator.mintAdmin(alice, tokenId);

    // Alice tries to approve herself - this should fail at contract level
    expect(() => simulator.approve(alice, tokenId)).toThrow();
  });

  it("should not allow setting yourself as operator", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Alice tries to set herself as operator - this should fail at contract level
    expect(() => simulator.setApprovalForAll(alice, true)).toThrow();
  });

  it("should handle zero balance correctly", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Check balance of user with no tokens
    const balance = simulator.balanceOf(alice);
    expect(balance).toBe(0n);
  });

  it("should maintain correct balances after multiple operations", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    // Alice mints 3 tokens to herself
    simulator.mintAdmin(alice, 1n);
    simulator.mintAdmin(alice, 2n);
    simulator.mintAdmin(alice, 3n);
    expect(simulator.balanceOf(alice)).toBe(3n);

    // Alice transfers 1 to Bob
    const aliceOwnerHashKey = simulator.ownerOf(1n);
    simulator.transferFrom(aliceOwnerHashKey, bob, 1n);
    expect(simulator.balanceOf(alice)).toBe(2n);
    expect(simulator.balanceOf(bob)).toBe(1n);

    // Admin burns Alice's token (only admin can burn)
    simulator.burnAdmin(2n);
    expect(simulator.balanceOf(alice)).toBe(1n);

    // Admin burns Bob's token (only admin can burn)
    simulator.burnAdmin(1n);
    expect(simulator.balanceOf(bob)).toBe(0n);
  });

  it("should handle operator approvals correctly", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");

    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);
    const charlieOperatorHashKey = simulator.generateSharedUserHashKey(charlie);

    // Initial state - no approvals
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(false);

    // Alice approves Bob as operator
    simulator.setApprovalForAll(bob, true);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(true);

    // Charlie is not approved
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(false);

    // Alice revokes Bob's approval
    simulator.setApprovalForAll(bob, false);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, bobOperatorHashKey)
    ).toBe(false);
  });

  it("should handle large token IDs and edge values", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Test with very large token ID
    const largeTokenId = 18446744073709551615n; // Near max uint64
    simulator.mintAdmin(alice, largeTokenId);

    // Get the actual owner hash from the contract
    const largeTokenOwnerHash = simulator.ownerOf(largeTokenId);
    expect(typeof largeTokenOwnerHash).toBe("bigint");
    expect(simulator.balanceOf(alice)).toBe(1n);

    // Test with token ID 1 (contract doesn't allow 0)
    const smallTokenId = 1n;
    simulator.mintAdmin(alice, smallTokenId);

    const smallTokenOwnerHash = simulator.ownerOf(smallTokenId);
    expect(typeof smallTokenOwnerHash).toBe("bigint");
    expect(simulator.balanceOf(alice)).toBe(2n);
  });

  it("should handle sequential minting and burning operations", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);

    // Mint tokens 1-5 to Alice
    for (let i = 1n; i <= 5n; i++) {
      simulator.mintAdmin(alice, i);
    }
    expect(simulator.balanceOf(alice)).toBe(5n);

    // Transfer odd tokens to Bob
    simulator.transferFrom(simulator.ownerOf(1n), bob, 1n);
    simulator.transferFrom(simulator.ownerOf(3n), bob, 3n);
    simulator.transferFrom(simulator.ownerOf(5n), bob, 5n);

    expect(simulator.balanceOf(alice)).toBe(2n);
    expect(simulator.balanceOf(bob)).toBe(3n);

    // Burn some tokens
    simulator.burnAdmin(2n);
    simulator.burnAdmin(1n);

    expect(simulator.balanceOf(alice)).toBe(1n);
    expect(simulator.balanceOf(bob)).toBe(2n);

    // Verify remaining tokens
    expect(simulator.ownerOf(4n)).toBe(aliceOwnerHashKey);
    expect(simulator.ownerOf(3n)).toBe(bobOperatorHashKey);
    expect(simulator.ownerOf(5n)).toBe(bobOperatorHashKey);
  });

  it("should correctly handle mixed approval types in transfer scenarios", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const dave = simulator.createPublicKey("Dave");
    // Alice mints two tokens
    simulator.mintAdmin(alice, 1n);
    simulator.mintAdmin(alice, 2n);

    const daveOperatorHashKey = simulator.generateSharedUserHashKey(dave);

    // Alice sets Bob as operator for all
    simulator.setApprovalForAll(bob, true);

    // Alice approves Charlie for token 1 specifically
    simulator.approve(charlie, 1n);

    // Bob (as operator) can transfer token 2
    simulator.transferFrom(simulator.ownerOf(2n), dave, 2n);
    expect(simulator.ownerOf(2n)).toBe(daveOperatorHashKey);

    // Charlie (with specific approval) can transfer token 1
    simulator.transferFrom(simulator.ownerOf(1n), dave, 1n);
    expect(simulator.ownerOf(1n)).toBe(daveOperatorHashKey);

    // Alice should have no tokens left
    expect(simulator.balanceOf(alice)).toBe(0n);
    expect(simulator.balanceOf(dave)).toBe(2n);
  });

  it("should handle rapid approval changes correctly", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;
    simulator.mintAdmin(alice, tokenId);

    const aliceOwnerHashKey = simulator.generateLocalUserHashKey(alice);
    const bobOperatorHashKey = simulator.generateSharedUserHashKey(bob);
    const charlieOperatorHashKey = simulator.generateSharedUserHashKey(charlie);

    // Rapid approval changes
    simulator.approve(bob, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    simulator.approve(charlie, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(charlieOperatorHashKey);

    simulator.approve(bob, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(bobOperatorHashKey);

    // Operator approval changes
    simulator.setApprovalForAll(charlie, true);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(true);

    simulator.setApprovalForAll(charlie, false);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(false);

    simulator.setApprovalForAll(charlie, true);
    expect(
      simulator.isApprovedForAll(aliceOwnerHashKey, charlieOperatorHashKey)
    ).toBe(true);
  });

  it("should test transfer circuit functionality", () => {
    const simulator = new NftZkSimulator();
    const alice = simulator.createPublicKey("Alice");
    const charlie = simulator.createPublicKey("Charlie");
    const charlieOperatorHashKey = simulator.generateSharedUserHashKey(charlie);

    // Verify hash key consistency in transfer circuit
    const tokenId1 = 1n;
    simulator.mintAdmin(alice, tokenId1);

    // Transfer from Alice to Charlie
    simulator.transfer(charlie, tokenId1);
    const charlieFirstTokenHash = simulator.ownerOf(tokenId1);

    // Transfer another token from Alice to Charlie
    const tokenId2 = 2n;
    simulator.mintAdmin(alice, tokenId2);
    simulator.transfer(charlie, tokenId2);
    const charlieSecondTokenHash = simulator.ownerOf(tokenId2);

    // Both tokens should have the same hash key for Charlie (consistency check)
    expect(charlieFirstTokenHash).toBe(charlieSecondTokenHash);
    expect(charlieFirstTokenHash).toBe(charlieOperatorHashKey);

    // Final balance verification
    expect(simulator.balanceOf(alice)).toBe(0n);
    expect(simulator.balanceOf(charlie)).toBe(2n); // Charlie has 2 tokens
  });
});
