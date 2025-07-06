/**
 * @file NFT contract test suite
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
import { NftSimulator } from "./nft-simulator.js";
import {
  NetworkId,
  setNetworkId
} from "@midnight-ntwrk/midnight-js-network-id";

setNetworkId(NetworkId.Undeployed);

describe("NFT Contract Tests", () => {
  /*
   * NOTE: All mint and burn operations in these tests are performed by the contract admin.
   * The simulator is initialized with Alice as the deployer/admin, so only the admin
   * can mint new tokens or burn existing tokens, regardless of who owns them.
   * Regular users can only transfer tokens they own or have approval for.
   */

  it("should mint a new token", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Admin mints a token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Check that Alice owns the token
    const owner = simulator.ownerOf(tokenId);
    expect(owner).toBe(alice);

    // Check Alice's balance
    const balance = simulator.balanceOf(alice);
    expect(balance).toBe(1n);
  });

  it("should transfer token between users", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Admin mints a token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Alice transfers to Bob
    simulator.transferFrom(alice, bob, tokenId);

    // Check new owner
    const newOwner = simulator.ownerOf(tokenId);
    expect(newOwner).toBe(bob);

    // Check balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance).toBe(0n);

    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance).toBe(1n);
  });

  it("should approve and get approved address", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint a token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Alice approves Bob to transfer her token
    simulator.approve(bob, tokenId);

    // Check approval
    const approved = simulator.getApproved(tokenId);
    expect(approved).toBe(bob);
  });

  it("should set approval for all", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Alice sets Bob as operator for all her tokens
    simulator.setApprovalForAll(bob, true);

    // Check approval
    const isApproved = simulator.isApprovedForAll(alice, bob);
    expect(isApproved).toBe(true);
  });

  it("should burn a token", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    // Admin mints a token to Alice
    simulator.mintAdmin(alice, tokenId);

    // Admin burns Alice's token (only admin can burn)
    simulator.burnAdmin(tokenId);

    // Check that Alice's balance decreased
    const balance = simulator.balanceOf(alice);
    expect(balance).toBe(0n);

    // Token should no longer exist (this would throw in ownerOf)
    expect(() => simulator.ownerOf(tokenId)).toThrow();
  });

  it("should mint multiple tokens with different IDs", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    simulator.mintAdmin(alice, 1n);
    simulator.mintAdmin(bob, 2n);
    simulator.mintAdmin(alice, 3n);

    // Check ownership
    expect(simulator.ownerOf(1n)).toBe(alice);
    expect(simulator.ownerOf(2n)).toBe(bob);
    expect(simulator.ownerOf(3n)).toBe(alice);

    // Check balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance).toBe(2n);

    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance).toBe(1n);
  });

  it("should handle non-existent tokens correctly", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Try to get owner of non-existent token
    expect(() => simulator.ownerOf(999n)).toThrow();

    // Try to burn non-existent token
    expect(() => simulator.burnAdmin(alice, 999n)).toThrow();
  });

  it("should prevent minting duplicate token IDs", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Mint first token
    simulator.mintAdmin(alice, tokenId);

    // Try to mint with same ID again
    expect(() => simulator.mintAdmin(bob, tokenId)).toThrow();
  });

  it("should clear approvals on transfer", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    // Alice mints and approves Bob (Alice is the caller)
    simulator.mintAdmin(alice, tokenId);
    simulator.approve(bob, tokenId);

    // Verify approval
    expect(simulator.getApproved(tokenId)).toBe(bob);

    // Alice transfers to Charlie (Alice is the caller)
    simulator.transferFrom(alice, charlie, tokenId);

    // Approval should be cleared
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should clear approvals on burn", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const tokenId = 1n;

    // Alice mints and approves Bob (Admin is the caller)
    simulator.mintAdmin(alice, tokenId);
    simulator.approve(bob, tokenId);

    // Verify approval
    expect(simulator.getApproved(tokenId)).toBe(bob);

    // Admin burns Alice's token (only admin can burn)
    simulator.burnAdmin(tokenId);

    // Both token and approval should be gone
    expect(() => simulator.ownerOf(tokenId)).toThrow();
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should not allow approving yourself", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const tokenId = 1n;

    simulator.mintAdmin(alice, tokenId);

    // Alice tries to approve herself (Alice is the caller)
    expect(() => simulator.approve(alice, tokenId)).toThrow();
  });

  it("should not allow setting yourself as operator", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Alice tries to set herself as operator (Alice is the caller)
    expect(() => simulator.setApprovalForAll(alice, true)).toThrow();
  });

  it("should handle zero balance correctly", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Check balance of user with no tokens
    const balance = simulator.balanceOf(alice);
    expect(balance).toBe(0n);
  });

  it("should maintain correct balances after multiple operations", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Admin mints 3 tokens to Alice
    simulator.mintAdmin(alice, 1n);
    simulator.mintAdmin(alice, 2n);
    simulator.mintAdmin(alice, 3n);
    expect(simulator.balanceOf(alice)).toBe(3n);

    // Alice transfers 1 to Bob (Alice is the caller)
    simulator.transferFrom(alice, bob, 1n);
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
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");

    // Initial state - no approvals
    expect(simulator.isApprovedForAll(alice, bob)).toBe(false);

    // Alice approves Bob as operator (Alice is the caller)
    simulator.setApprovalForAll(bob, true);
    expect(simulator.isApprovedForAll(alice, bob)).toBe(true);

    // Charlie is not approved
    expect(simulator.isApprovedForAll(alice, charlie)).toBe(false);

    // Alice revokes Bob's approval (Alice is the caller)
    simulator.setApprovalForAll(bob, false);
    expect(simulator.isApprovedForAll(alice, bob)).toBe(false);
  });

  it("should handle complex approval and transfer scenarios", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    // Alice mints a token
    simulator.mintAdmin(alice, tokenId);

    // Alice sets Bob as an operator for all her tokens
    simulator.setApprovalForAll(bob, true);

    // Alice also approves Charlie for this specific token
    simulator.approve(charlie, tokenId);

    // Verify both approvals exist
    expect(simulator.isApprovedForAll(alice, bob)).toBe(true);
    expect(simulator.getApproved(tokenId)).toBe(charlie);

    // Charlie transfers the token to himself (using specific approval)
    simulator.transferFrom(alice, charlie, tokenId);

    // Token should now belong to Charlie
    expect(simulator.ownerOf(tokenId)).toBe(charlie);

    // All approvals should be cleared after transfer
    expect(simulator.isApprovedForAll(alice, bob)).toBe(true); // operator approval for Alice remains
    expect(() => simulator.getApproved(tokenId)).toThrow(); // specific approval should be cleared
  });

  it("should handle large token IDs and edge values", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");

    // Test with very large token ID
    const largeTokenId = 18446744073709551615n; // Near max uint64
    simulator.mintAdmin(alice, largeTokenId);

    expect(simulator.ownerOf(largeTokenId)).toBe(alice);
    expect(simulator.balanceOf(alice)).toBe(1n);

    // Test with token ID 1 (contract doesn't allow 0)
    const smallTokenId = 1n;
    simulator.mintAdmin(alice, smallTokenId);

    expect(simulator.ownerOf(smallTokenId)).toBe(alice);
    expect(simulator.balanceOf(alice)).toBe(2n);
  });

  it("should handle sequential minting and burning operations", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");

    // Admin mints tokens 1-5 to Alice
    for (let i = 1n; i <= 5n; i++) {
      simulator.mintAdmin(alice, i);
    }
    expect(simulator.balanceOf(alice)).toBe(5n);

    // Transfer odd tokens to Bob
    simulator.transferFrom(alice, bob, 1n);
    simulator.transferFrom(alice, bob, 3n);
    simulator.transferFrom(alice, bob, 5n);

    expect(simulator.balanceOf(alice)).toBe(2n);
    expect(simulator.balanceOf(bob)).toBe(3n);

    // Admin burns some tokens (only admin can burn)
    simulator.burnAdmin(2n);
    simulator.burnAdmin(1n);

    expect(simulator.balanceOf(alice)).toBe(1n);
    expect(simulator.balanceOf(bob)).toBe(2n);

    // Verify remaining tokens
    expect(simulator.ownerOf(4n)).toBe(alice);
    expect(simulator.ownerOf(3n)).toBe(bob);
    expect(simulator.ownerOf(5n)).toBe(bob);
  });

  it("should correctly handle mixed approval types in transfer scenarios", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const dave = simulator.createPublicKey("Dave");

    // Alice mints two tokens
    simulator.mintAdmin(alice, 1n);
    simulator.mintAdmin(alice, 2n);

    // Alice sets Bob as operator for all
    simulator.setApprovalForAll(bob, true);

    // Alice approves Charlie for token 1 specifically
    simulator.approve(charlie, 1n);

    // Bob (as operator) can transfer token 2
    simulator.transferFrom(alice, dave, 2n);
    expect(simulator.ownerOf(2n)).toBe(dave);

    // Charlie (with specific approval) can transfer token 1
    simulator.transferFrom(alice, dave, 1n);
    expect(simulator.ownerOf(1n)).toBe(dave);

    // Alice should have no tokens left
    expect(simulator.balanceOf(alice)).toBe(0n);
    expect(simulator.balanceOf(dave)).toBe(2n);
  });

  it("should handle rapid approval changes correctly", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const bob = simulator.createPublicKey("Bob");
    const charlie = simulator.createPublicKey("Charlie");
    const tokenId = 1n;

    simulator.mintAdmin(alice, tokenId);

    // Rapid approval changes
    simulator.approve(bob, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(bob);

    simulator.approve(charlie, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(charlie);

    simulator.approve(bob, tokenId);
    expect(simulator.getApproved(tokenId)).toBe(bob);

    // Operator approval changes
    simulator.setApprovalForAll(charlie, true);
    expect(simulator.isApprovedForAll(alice, charlie)).toBe(true);

    simulator.setApprovalForAll(charlie, false);
    expect(simulator.isApprovedForAll(alice, charlie)).toBe(false);

    simulator.setApprovalForAll(charlie, true);
    expect(simulator.isApprovedForAll(alice, charlie)).toBe(true);
  });

  it("should test transfer circuit functionality", () => {
    const simulator = new NftSimulator();
    const alice = simulator.createPublicKey("Alice");
    const charlie = simulator.createPublicKey("Charlie");

    // Verify hash key consistency in transfer circuit
    const tokenId1 = 1n;
    simulator.mintAdmin(alice, tokenId1);

    // Transfer from Alice to Charlie
    simulator.transfer(charlie, tokenId1);
    const charlieFirstToken = simulator.ownerOf(tokenId1);

    // Transfer another token from Alice to Charlie
    const tokenId2 = 2n;
    simulator.mintAdmin(alice, tokenId2);
    simulator.transfer(charlie, tokenId2);
    const charlieSecondToken = simulator.ownerOf(tokenId2);

    // Both tokens should have the same hash key for Charlie (consistency check)
    expect(charlieFirstToken).toBe(charlieSecondToken);
    expect(charlieFirstToken).toBe(charlie);

    // Final balance verification
    expect(simulator.balanceOf(alice)).toBe(0n);
    expect(simulator.balanceOf(charlie)).toBe(2n); // Charlie has 2 tokens
  });
});
