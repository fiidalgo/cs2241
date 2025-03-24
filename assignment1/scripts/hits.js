// hits.js - Implementation of HITS algorithm
import * as math from 'mathjs';

// Define the adjacency matrix for the graph
const A = [
    [0, 0, 1, 1, 0, 1],  // a -> *
    [0, 0, 1, 0, 0, 1],  // b -> *
    [0, 0, 0, 1, 0, 1],  // c -> *
    [0, 1, 1, 0, 0, 0],  // d -> *
    [1, 0, 0, 0, 0, 0],  // e -> *
    [0, 0, 0, 0, 1, 0]   // f -> *
];

// Node labels for output
const labels = ['a', 'b', 'c', 'd', 'e', 'f'];

// Number of nodes
const n = A.length;

// HITS parameters
const max_iter = 100;
const tol = 1e-6;

// Initialize hub and authority scores
let hub = Array(n).fill(1);
let auth = Array(n).fill(1);

// Compute transpose of A
const AT = Array(n).fill().map(() => Array(n).fill(0));
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        AT[i][j] = A[j][i];
    }
}

console.log("Adjacency matrix A:");
console.table(A);

console.log("\nTranspose matrix A^T:");
console.table(AT);

// HITS iteration
for (let iter = 0; iter < max_iter; iter++) {
    // Update authority scores: a = A^T * h
    const auth_new = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            auth_new[i] += AT[i][j] * hub[j];
        }
    }
    
    // Normalize authority scores
    const auth_norm = math.norm(auth_new);
    const auth_normalized = auth_new.map(val => val / auth_norm);
    
    // Update hub scores: h = A * a
    const hub_new = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            hub_new[i] += A[i][j] * auth_normalized[j];
        }
    }
    
    // Normalize hub scores
    const hub_norm = math.norm(hub_new);
    const hub_normalized = hub_new.map(val => val / hub_norm);
    
    // Check convergence
    const auth_diff = math.norm(auth_normalized.map((val, idx) => val - auth[idx]));
    const hub_diff = math.norm(hub_normalized.map((val, idx) => val - hub[idx]));
    
    if (auth_diff < tol && hub_diff < tol) {
        auth = auth_normalized;
        hub = hub_normalized;
        console.log(`HITS converged after ${iter+1} iterations.`);
        break;
    }
    
    auth = auth_normalized;
    hub = hub_normalized;
}

// Print results
console.log("\nHub scores:");
for (let i = 0; i < labels.length; i++) {
    console.log(`Node ${labels[i]}: ${hub[i].toFixed(6)}`);
}

console.log("\nAuthority scores:");
for (let i = 0; i < labels.length; i++) {
    console.log(`Node ${labels[i]}: ${auth[i].toFixed(6)}`);
}