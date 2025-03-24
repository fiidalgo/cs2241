// pagerank.js - Implementation of PageRank algorithm
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

// Calculate out-degrees for each node
const out_degrees = A.map(row => row.reduce((sum, val) => sum + val, 0));
console.log("Out-degrees:", out_degrees);

// Create transition matrix (column-stochastic)
const M = Array(n).fill().map(() => Array(n).fill(0));
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        if (A[i][j] > 0) {
            M[j][i] = 1.0 / out_degrees[i];
        }
    }
}

console.log("\nTransition matrix M:");
console.table(M);

// PageRank parameters
const d = 0.85;  // Damping factor
const max_iter = 100;
const tol = 1e-6;

// Initialize PageRank
let pr = Array(n).fill(1/n);

// Algorithm iteration
for (let iter = 0; iter < max_iter; iter++) {
    // Calculate M * pr
    const M_pr = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            M_pr[i] += M[i][j] * pr[j];
        }
    }
    
    // Calculate (1-d)/n + d * (M * pr)
    const pr_new = M_pr.map(val => (1-d)/n + d * val);
    
    // Check convergence
    const diff = math.norm(pr_new.map((val, idx) => val - pr[idx]));
    if (diff < tol) {
        pr = pr_new;
        console.log(`\nPageRank converged after ${iter+1} iterations.`);
        break;
    }
    
    pr = pr_new;
}

// Normalize to sum to 1
const pr_sum = pr.reduce((sum, val) => sum + val, 0);
pr = pr.map(val => val / pr_sum);

// Print results
console.log("\nPageRank scores:");
for (let i = 0; i < labels.length; i++) {
    console.log(`Node ${labels[i]}: ${pr[i].toFixed(6)}`);
}