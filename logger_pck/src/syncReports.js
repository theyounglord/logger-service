// src/syncReports.js
const fs = require('fs');
const path = require('path');
const { saveLog, saveEvent } = require('./db');
const config = require('./config');

async function syncReports() {
  const rootFolder = config.rootDirectory;

  if (!fs.existsSync(rootFolder)) {
    console.error(`Root directory ${rootFolder} does not exist.`);
    return;
  }

  const userIds = fs
    .readdirSync(rootFolder)
    .filter((f) => fs.statSync(path.join(rootFolder, f)).isDirectory());

  for (const userId of userIds) {
    const userFolderPath = path.join(rootFolder, userId);
    const applicationIds = fs
      .readdirSync(userFolderPath)
      .filter((f) => fs.statSync(path.join(userFolderPath, f)).isDirectory());

    for (const applicationId of applicationIds) {
      const applicationFolderPath = path.join(userFolderPath, applicationId);

      // Process both .report.json and .event.json files
      const jsonFiles = fs
        .readdirSync(applicationFolderPath)
        .filter((f) => f.endsWith('.report.json') || f.endsWith('.event.json'));

      for (const jsonFile of jsonFiles) {
        const filePath = path.join(applicationFolderPath, jsonFile);

        if (fs.existsSync(filePath)) {
          try {
            let fileData = fs.readFileSync(filePath, 'utf8');

            // For .report.json files, check if already synced
            if (jsonFile.endsWith('.report.json')) {
              // Check if the first line is '{ synced: true }'
              const firstLine = fileData.split('\n')[0].trim();
              if (firstLine === '{ synced: true }') {
                console.log(`Skipping already synced file: ${filePath}`);
                continue;
              }

              // Remove the '{ synced: true }' line if present
              if (fileData.startsWith('{ synced: true }\n')) {
                fileData = fileData.replace('{ synced: true }\n', '');
              }
            }

            // Parse JSON data
            let jsonData;
            try {
              jsonData = JSON.parse(fileData);
            } catch (err) {
              console.error(`Invalid JSON in ${filePath}:`, err.message);
              continue;
            }

            // Enrich data with userId and applicationId
            const enrichedData = {
              userId,
              applicationId,
              ...jsonData,
            };

            // Process the data
            if (Array.isArray(enrichedData)) {
              for (const dataItem of enrichedData) {
                await saveData(jsonFile, dataItem);
              }
            } else if (typeof enrichedData === 'object') {
              await saveData(jsonFile, enrichedData);
            } else {
              console.warn(`Unexpected data format in ${filePath}`);
            }

            if (jsonFile.endsWith('.report.json')) {
              // For .report.json files, write '{ synced: true }' at the top
              const updatedData = '{ synced: true }\n' + fileData;
              fs.writeFileSync(filePath, updatedData, 'utf8');
              console.log(`Marked ${filePath} as synced.`);
            } else if (jsonFile.endsWith('.event.json')) {
              // For .event.json files, delete after syncing
              fs.unlinkSync(filePath);
              console.log(`Processed and deleted ${filePath}`);
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
          }
        }
      }
    }
  }
}

// Helper function to save data to the correct collection/table
async function saveData(filename, data) {
  if (filename.endsWith('.report.json')) {
    await saveLog(data);
  } else if (filename.endsWith('.event.json')) {
    await saveEvent(data);
  }
}

module.exports = { syncReports };