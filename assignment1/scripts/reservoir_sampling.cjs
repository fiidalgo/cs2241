// reservoir_sampling.js
const { createCanvas } = require('canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

// Single-item reservoir sampling
function singleItemReservoirSampling(stream) {
    let sample = null;
    let count = 0;
    
    for (const item of stream) {
        count++;
        if (count === 1) {
            sample = item;
        } else {
            // Replace with probability 1/count
            if (Math.random() < 1/count) {
                sample = item;
            }
        }
    }
    
    return sample;
}

// Reservoir sampling of s items without replacement
function reservoirSampling(stream, s) {
    let sample = [];
    let count = 0;
    
    for (const item of stream) {
        count++;
        
        if (count <= s) {
            // Fill the reservoir with the first s items
            sample.push(item);
        } else {
            // Decide whether to include this item in the sample
            const j = Math.floor(Math.random() * count);
            if (j < s) {
                // Replace the randomly chosen item
                sample[j] = item;
            }
        }
    }
    
    return sample;
}

// Function to simulate multiple runs and track results
function runSimulations(numRuns, streamSize, sampleSize = 1) {
    const counts = {};
    
    // Initialize counts for each number
    for (let i = 1; i <= streamSize; i++) {
        counts[i] = 0;
    }
    
    for (let run = 0; run < numRuns; run++) {
        // Create a stream of numbers from 1 to streamSize
        const stream = Array.from({length: streamSize}, (_, i) => i + 1);
        
        let result;
        if (sampleSize === 1) {
            result = [singleItemReservoirSampling(stream)];
        } else {
            result = reservoirSampling(stream, sampleSize);
        }
        
        // Update counts
        result.forEach(item => {
            counts[item]++;
        });
    }
    
    // Convert to frequencies
    const frequencies = {};
    for (const [key, value] of Object.entries(counts)) {
        frequencies[key] = value / numRuns;
    }
    
    return frequencies;
}

// Function to create a bar chart and save it as an image
async function createBarChart(data, expected, title, filename) {
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    // Round to 3 decimal places for display
    const roundedValues = values.map(v => Math.round(v * 1000) / 1000);
    
    const width = 800;
    const height = 500;
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
    
    const configuration = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Observed Frequency',
                    data: values,
                    backgroundColor: title.includes('Single') ? 'rgba(54, 162, 235, 0.5)' : 'rgba(75, 192, 192, 0.5)',
                    borderColor: title.includes('Single') ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expected Frequency',
                    data: Array(labels.length).fill(expected),
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(3);
                        }
                    }
                },
                datalabels: {
                    formatter: function(value) {
                        return value.toFixed(3);
                    },
                    anchor: 'end',
                    align: 'top',
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    },
                    suggestedMax: expected * 1.2
                },
                x: {
                    title: {
                        display: true,
                        text: 'Item'
                    }
                }
            }
        }
    };
    
    // Generate image buffer
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    
    // Save the image to disk
    const imagesDir = path.join(__dirname, '../images');
    if (!fs.existsSync(imagesDir)){
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(imagesDir, filename), imageBuffer);
    
    console.log(`Chart saved as ${filename}`);
    
    return { 
        data: data,
        expected: expected,
        averageDeviation: calculateAverageDeviation(data, expected)
    };
}

// Function to calculate average deviation from expected
function calculateAverageDeviation(frequencies, expected) {
    let totalDeviation = 0;
    for (const value of Object.values(frequencies)) {
        totalDeviation += Math.abs(value - expected);
    }
    return totalDeviation / Object.keys(frequencies).length;
}

// Main execution
async function main() {
    // Test parameters
    const numRuns = 10000;
    const streamSize = 10;
    const singleSampleSize = 1;
    const multiSampleSize = 3;

    console.log("Running simulations...");
    
    // Run single-item simulations
    const singleItemFreq = runSimulations(numRuns, streamSize, singleSampleSize);
    const singleExpected = 1/streamSize;
    
    // Run multi-item simulations
    const multiItemFreq = runSimulations(numRuns, streamSize, multiSampleSize);
    const multiExpected = multiSampleSize/streamSize;
    
    // Generate charts
    const singleResult = await createBarChart(
        singleItemFreq, 
        singleExpected, 
        'Single-Item Reservoir Sampling (10,000 runs)', 
        'single_item_sampling.png'
    );
    
    const multiResult = await createBarChart(
        multiItemFreq, 
        multiExpected, 
        `Multi-Item Reservoir Sampling (s=${multiSampleSize}, 10,000 runs)`, 
        'multi_item_sampling.png'
    );
    
    // Print results
    console.log("\nSingle-item reservoir sampling results:");
    console.log("Expected frequency:", singleExpected);
    console.log("Average deviation:", singleResult.averageDeviation);
    
    console.log("\nMulti-item reservoir sampling results:");
    console.log("Expected frequency:", multiExpected);
    console.log("Average deviation:", multiResult.averageDeviation);
}

// Run the main function
main().catch(console.error);