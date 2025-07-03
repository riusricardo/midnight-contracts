import { describe, it, expect } from "vitest";
import { NftSimulator } from "./nft-simulator.js";
import {
  NetworkId,
  setNetworkId
} from "@midnight-ntwrk/midnight-js-network-id";
import { type CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

setNetworkId(NetworkId.Undeployed);

describe("NFT Contract Tests", () => {
  it("should mint a new token", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const tokenId = 1n;

    const result = simulator.mint(alice, tokenId);
    expect(result).toBeDefined();

    // Check that Alice owns the token
    const owner = simulator.ownerOf(tokenId);
    expect(owner[0]).toBe(alice);

    // Check Alice's balance
    const balance = simulator.balanceOf(alice);
    expect(balance[0]).toBe(1n);
  });

  it("should transfer token between users", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Mint a token to Alice
    simulator.mint(alice, tokenId);

    // Alice transfers to Bob (Alice is the caller)
    simulator.transferFrom(alice, bob, tokenId, alice);

    // Check new owner
    const newOwner = simulator.ownerOf(tokenId);
    expect(newOwner[0]).toBe(bob);

    // Check balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance[0]).toBe(0n);

    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance[0]).toBe(1n);
  });

  it("should approve and get approved address", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Mint a token to Alice
    simulator.mint(alice, tokenId);

    // Alice approves Bob to transfer her token (Alice is the caller)
    simulator.approve(bob, tokenId, alice);

    // Check approval
    const approved = simulator.getApproved(tokenId);
    expect(approved[0]).toBe(bob);
  });

  it("should set approval for all", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;

    // Alice sets Bob as operator for all her tokens (Alice is the caller)
    simulator.setApprovalForAll(bob, true, alice);

    // Check approval
    const isApproved = simulator.isApprovedForAll(alice, bob);
    expect(isApproved[0]).toBe(true);
  });

  it("should burn a token", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Mint a token to Alice
    simulator.mint(alice, tokenId);

    // Alice burns her token (Alice is the caller)
    simulator.burn(alice, tokenId, alice);

    // Check that Alice's balance decreased
    const balance = simulator.balanceOf(alice);
    expect(balance[0]).toBe(0n);

    // Token should no longer exist (this would throw in ownerOf)
    expect(() => simulator.ownerOf(tokenId)).toThrow();
  });

  it("should mint multiple tokens with different IDs", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;

    simulator.mint(alice, 1n);
    simulator.mint(bob, 2n);
    simulator.mint(alice, 3n);

    // Check ownership
    expect(simulator.ownerOf(1n)[0]).toBe(alice);
    expect(simulator.ownerOf(2n)[0]).toBe(bob);
    expect(simulator.ownerOf(3n)[0]).toBe(alice);

    // Check balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance[0]).toBe(2n);

    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance[0]).toBe(1n);
  });

  it("should handle non-existent tokens correctly", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;

    // Try to get owner of non-existent token
    expect(() => simulator.ownerOf(999n)).toThrow();

    // Try to burn non-existent token
    expect(() => simulator.burn(alice, 999n, alice)).toThrow();
  });

  it("should prevent minting duplicate token IDs", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Mint first token
    simulator.mint(alice, tokenId);

    // Try to mint with same ID again
    expect(() => simulator.mint(bob, tokenId)).toThrow();
  });

  it("should clear approvals on transfer", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const charlie = "charlie_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Alice mints and approves Bob (Alice is the caller)
    simulator.mint(alice, tokenId);
    simulator.approve(bob, tokenId, alice);

    // Verify approval
    expect(simulator.getApproved(tokenId)[0]).toBe(bob);

    // Alice transfers to Charlie (Alice is the caller)
    simulator.transferFrom(alice, charlie, tokenId, alice);

    // Approval should be cleared
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should clear approvals on burn", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Alice mints and approves Bob (Alice is the caller)
    simulator.mint(alice, tokenId);
    simulator.approve(bob, tokenId, alice);

    // Verify approval
    expect(simulator.getApproved(tokenId)[0]).toBe(bob);

    // Alice burns the token (Alice is the caller)
    simulator.burn(alice, tokenId, alice);

    // Both token and approval should be gone
    expect(() => simulator.ownerOf(tokenId)).toThrow();
    expect(() => simulator.getApproved(tokenId)).toThrow();
  });

  it("should not allow approving yourself", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const tokenId = 1n;

    simulator.mint(alice, tokenId);

    // Alice tries to approve herself (Alice is the caller)
    expect(() => simulator.approve(alice, tokenId, alice)).toThrow();
  });

  it("should not allow setting yourself as operator", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;

    // Alice tries to set herself as operator (Alice is the caller)
    expect(() => simulator.setApprovalForAll(alice, true, alice)).toThrow();
  });

  it("should handle zero balance correctly", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;

    // Check balance of user with no tokens
    const balance = simulator.balanceOf(alice);
    expect(balance[0]).toBe(0n);
  });

  it("should maintain correct balances after multiple operations", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;

    // Alice mints 3 tokens
    simulator.mint(alice, 1n);
    simulator.mint(alice, 2n);
    simulator.mint(alice, 3n);
    expect(simulator.balanceOf(alice)[0]).toBe(3n);

    // Alice transfers 1 to Bob (Alice is the caller)
    simulator.transferFrom(alice, bob, 1n, alice);
    expect(simulator.balanceOf(alice)[0]).toBe(2n);
    expect(simulator.balanceOf(bob)[0]).toBe(1n);

    // Alice burns 1 token (Alice is the caller)
    simulator.burn(alice, 2n, alice);
    expect(simulator.balanceOf(alice)[0]).toBe(1n);

    // Bob burns his token (Bob is the caller)
    simulator.burn(bob, 1n, bob);
    expect(simulator.balanceOf(bob)[0]).toBe(0n);
  });

  it("should handle operator approvals correctly", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const charlie = "charlie_public_key" as CoinPublicKey;

    // Initial state - no approvals
    expect(simulator.isApprovedForAll(alice, bob)[0]).toBe(false);

    // Alice approves Bob as operator (Alice is the caller)
    simulator.setApprovalForAll(bob, true, alice);
    expect(simulator.isApprovedForAll(alice, bob)[0]).toBe(true);

    // Charlie is not approved
    expect(simulator.isApprovedForAll(alice, charlie)[0]).toBe(false);

    // Alice revokes Bob's approval (Alice is the caller)
    simulator.setApprovalForAll(bob, false, alice);
    expect(simulator.isApprovedForAll(alice, bob)[0]).toBe(false);
  });

  it("should handle complex approval and transfer scenarios", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const charlie = "charlie_public_key" as CoinPublicKey;
    const tokenId = 1n;

    // Alice mints a token
    simulator.mint(alice, tokenId);

    // Alice sets Bob as an operator for all her tokens
    simulator.setApprovalForAll(bob, true, alice);

    // Alice also approves Charlie for this specific token
    simulator.approve(charlie, tokenId, alice);

    // Verify both approvals exist
    expect(simulator.isApprovedForAll(alice, bob)[0]).toBe(true);
    expect(simulator.getApproved(tokenId)[0]).toBe(charlie);

    // Charlie transfers the token to himself (using specific approval)
    simulator.transferFrom(alice, charlie, tokenId, charlie);

    // Token should now belong to Charlie
    expect(simulator.ownerOf(tokenId)[0]).toBe(charlie);

    // All approvals should be cleared after transfer
    expect(simulator.isApprovedForAll(alice, bob)[0]).toBe(true); // operator approval for Alice remains
    expect(() => simulator.getApproved(tokenId)).toThrow(); // specific approval should be cleared
  });

  it("should handle large token IDs and edge values", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;

    // Test with very large token ID
    const largeTokenId = 18446744073709551615n; // Near max uint64
    simulator.mint(alice, largeTokenId);

    expect(simulator.ownerOf(largeTokenId)[0]).toBe(alice);
    expect(simulator.balanceOf(alice)[0]).toBe(1n);

    // Test with token ID 1 (contract doesn't allow 0)
    const smallTokenId = 1n;
    simulator.mint(alice, smallTokenId);

    expect(simulator.ownerOf(smallTokenId)[0]).toBe(alice);
    expect(simulator.balanceOf(alice)[0]).toBe(2n);
  });

  it("should handle sequential minting and burning operations", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;

    // Mint tokens 1-5 to Alice
    for (let i = 1n; i <= 5n; i++) {
      simulator.mint(alice, i);
    }
    expect(simulator.balanceOf(alice)[0]).toBe(5n);

    // Transfer odd tokens to Bob
    simulator.transferFrom(alice, bob, 1n, alice);
    simulator.transferFrom(alice, bob, 3n, alice);
    simulator.transferFrom(alice, bob, 5n, alice);

    expect(simulator.balanceOf(alice)[0]).toBe(2n);
    expect(simulator.balanceOf(bob)[0]).toBe(3n);

    // Burn some tokens
    simulator.burn(alice, 2n, alice);
    simulator.burn(bob, 1n, bob);

    expect(simulator.balanceOf(alice)[0]).toBe(1n);
    expect(simulator.balanceOf(bob)[0]).toBe(2n);

    // Verify remaining tokens
    expect(simulator.ownerOf(4n)[0]).toBe(alice);
    expect(simulator.ownerOf(3n)[0]).toBe(bob);
    expect(simulator.ownerOf(5n)[0]).toBe(bob);
  });

  it("should correctly handle mixed approval types in transfer scenarios", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const charlie = "charlie_public_key" as CoinPublicKey;
    const dave = "dave_public_key" as CoinPublicKey;

    // Alice mints two tokens
    simulator.mint(alice, 1n);
    simulator.mint(alice, 2n);

    // Alice sets Bob as operator for all
    simulator.setApprovalForAll(bob, true, alice);

    // Alice approves Charlie for token 1 specifically
    simulator.approve(charlie, 1n, alice);

    // Bob (as operator) can transfer token 2
    simulator.transferFrom(alice, dave, 2n, bob);
    expect(simulator.ownerOf(2n)[0]).toBe(dave);

    // Charlie (with specific approval) can transfer token 1
    simulator.transferFrom(alice, dave, 1n, charlie);
    expect(simulator.ownerOf(1n)[0]).toBe(dave);

    // Alice should have no tokens left
    expect(simulator.balanceOf(alice)[0]).toBe(0n);
    expect(simulator.balanceOf(dave)[0]).toBe(2n);
  });

  it("should handle rapid approval changes correctly", () => {
    const simulator = new NftSimulator();
    const alice = "alice_public_key" as CoinPublicKey;
    const bob = "bob_public_key" as CoinPublicKey;
    const charlie = "charlie_public_key" as CoinPublicKey;
    const tokenId = 1n;

    simulator.mint(alice, tokenId);

    // Rapid approval changes
    simulator.approve(bob, tokenId, alice);
    expect(simulator.getApproved(tokenId)[0]).toBe(bob);

    simulator.approve(charlie, tokenId, alice);
    expect(simulator.getApproved(tokenId)[0]).toBe(charlie);

    simulator.approve(bob, tokenId, alice);
    expect(simulator.getApproved(tokenId)[0]).toBe(bob);

    // Operator approval changes
    simulator.setApprovalForAll(charlie, true, alice);
    expect(simulator.isApprovedForAll(alice, charlie)[0]).toBe(true);

    simulator.setApprovalForAll(charlie, false, alice);
    expect(simulator.isApprovedForAll(alice, charlie)[0]).toBe(false);

    simulator.setApprovalForAll(charlie, true, alice);
    expect(simulator.isApprovedForAll(alice, charlie)[0]).toBe(true);
  });
});
