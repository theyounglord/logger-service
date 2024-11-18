const fs = require('fs');
const path = require('path');

/**
 * Recursively reads a directory, generates its tree structure, and retrieves file contents.
 * @param {string} dirPath - The directory path to scan.
 * @param {string} prefix - The prefix for tree indentation.
 * @param {string[]} output - Array to store tree structure as a string.
 * @param {string[]} content - Array to store file content as strings.
 */
function processDirectory(dirPath, prefix = '', output = [], content = []) {
    const stats = fs.statSync(dirPath);

    if (stats.isFile()) {
        const fileName = path.basename(dirPath);
        output.push(`${prefix}├── ${fileName}`);
        
        // Read and store file content
        const fileData = fs.readFileSync(dirPath, 'utf8');
        content.push(`\n\nFile: ${fileName}\n\n${fileData}`);
    } else if (
        stats.isDirectory() && 
        !['.git', 'build','logs','node_modules'].includes(path.basename(dirPath)) // Exclude .git and build folders
    ) {
        const dirName = path.basename(dirPath);
        output.push(`${prefix}└── ${dirName}`);

        const children = fs.readdirSync(dirPath);

        // Recursively process children
        for (let i = 0; i < children.length; i++) {
            const childPath = path.join(dirPath, children[i]);
            const isLast = i === children.length - 1;
            processDirectory(
                childPath,
                `${prefix}${isLast ? '    ' : '│   '}`,
                output,
                content
            );
        }
    }
}

// The root folder to scan
const ROOT_FOLDER = path.resolve('./');

// Arrays to store tree structure and file contents
const treeOutput = [];
const fileContents = [];

// Generate tree structure and gather file contents
treeOutput.push(path.basename(ROOT_FOLDER));
processDirectory(ROOT_FOLDER, '', treeOutput, fileContents);

// Combine tree structure and file contents
const finalOutput = treeOutput.join('\n') + '\n\n' + fileContents.join('\n');

// Save the combined output to a file
const OUTPUT_FILE = path.join(ROOT_FOLDER, 'directory_with_contents.txt');
fs.writeFileSync(OUTPUT_FILE, finalOutput, 'utf8');

console.log(`Directory tree and file contents saved to ${OUTPUT_FILE}`);