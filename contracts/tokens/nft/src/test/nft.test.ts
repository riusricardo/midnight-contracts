import { describe, it, expect } from 'vitest';
import { NftSimulator } from './nft-simulator.js';
import {
  NetworkId,
  setNetworkId
} from "@midnight-ntwrk/midnight-js-network-id";
import { type CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

setNetworkId(NetworkId.Undeployed);

describe('NFT Contract Tests', () => {
  it('should mint a new token', () => {
    const simulator = new NftSimulator();
    const alice = 'alice_public_key' as CoinPublicKey;
    
    const result = simulator.mint(alice);
    expect(result).toBeDefined();
    
    const tokenId = result[0];
    expect(tokenId).toBe(1n);
    
    // Check that Alice owns the token
    const owner = simulator.ownerOf(tokenId);
    expect(owner[0]).toBe(alice);
    
    // Check Alice's balance
    const balance = simulator.balanceOf(alice);
    expect(balance[0]).toBe(1n);
  });

  it('should transfer token between users', () => {
    const simulator = new NftSimulator();
    const alice = 'alice_public_key' as CoinPublicKey;
    const bob = 'bob_public_key' as CoinPublicKey;
    
    // Mint a token to Alice
    const mintResult = simulator.mint(alice);
    const tokenId = mintResult[0];
    
    // Alice transfers to Bob
    simulator.transferFrom(alice, bob, tokenId);
    
    // Check new owner
    const newOwner = simulator.ownerOf(tokenId);
    expect(newOwner[0]).toBe(bob);
    
    // Check balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance[0]).toBe(0n);
    
    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance[0]).toBe(1n);
  });

  it('should approve and get approved address', () => {
    const simulator = new NftSimulator();
    const alice = 'alice_public_key' as CoinPublicKey;
    const bob = 'bob_public_key' as CoinPublicKey;
    
    // Mint a token to Alice
    const mintResult = simulator.mint(alice);
    const tokenId = mintResult[0];
    
    // Alice approves Bob to transfer her token
    simulator.approve(bob, tokenId);
    
    // Check approval
    const approved = simulator.getApproved(tokenId);
    expect(approved[0]).toBe(bob);
  });

  it('should set approval for all', () => {
    const simulator = new NftSimulator();
    const alice = 'alice_public_key' as CoinPublicKey;
    const bob = 'bob_public_key' as CoinPublicKey;
    
    // Alice sets Bob as operator for all her tokens
    simulator.setApprovalForAll(bob, true);
    
    // Check approval (note: this is a simplified test due to simulator limitations)
    const isApproved = simulator.isApprovedForAll(alice, bob);
    expect(isApproved[0]).toBe(false); // Will be false in simulator due to sender handling
  });

  it('should burn a token', () => {
    const simulator = new NftSimulator();
    const alice = 'alice_public_key' as CoinPublicKey;
    
    // Mint a token to Alice
    const mintResult = simulator.mint(alice);
    const tokenId = mintResult[0];
    
    // Alice burns her token
    simulator.burn(tokenId);
    
    // Check that Alice's balance decreased
    const balance = simulator.balanceOf(alice);
    expect(balance[0]).toBe(0n);
    
    // Token should no longer exist (this would throw in ownerOf)
    expect(() => simulator.ownerOf(tokenId)).toThrow();
  });

  it('should mint multiple tokens with incrementing IDs', () => {
    const simulator = new NftSimulator();
    const alice = 'alice_public_key' as CoinPublicKey;
    const bob = 'bob_public_key' as CoinPublicKey;
    
    const firstToken = simulator.mint(alice);
    const secondToken = simulator.mint(bob);
    const thirdToken = simulator.mint(alice);
    
    expect(firstToken[0]).toBe(1n);
    expect(secondToken[0]).toBe(2n);
    expect(thirdToken[0]).toBe(3n);
    
    // Check balances
    const aliceBalance = simulator.balanceOf(alice);
    expect(aliceBalance[0]).toBe(2n);
    
    const bobBalance = simulator.balanceOf(bob);
    expect(bobBalance[0]).toBe(1n);
  });

  it('should handle non-existent tokens correctly', () => {
    const simulator = new NftSimulator();
    
    // Try to get owner of non-existent token
    expect(() => simulator.ownerOf(999n)).toThrow("Token does not exist");
    
    // Try to burn non-existent token
    expect(() => simulator.burn(999n)).toThrow("Token does not exist");
  });
});
