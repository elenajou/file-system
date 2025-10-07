const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDate } = require('./modules/utils');

const app = express();
const PORT = process.env.PORT || 3000;

const strings = require('./lang/en.json');
const GREETING_TEMPLATE = strings.greeting;
const TARGET_FILE = 'file.txt';

app.get('/writeFile', (req, res) => {
    const textToAppend = req.query.text;

    if (!textToAppend) {
        return res.status(400).send("Error: Please provide 'text' in the query string, e.g., /writeFile?text=Hello");
    }

    const content = textToAppend + '\n';
    
    // create the file if it doesn't exist, and append if it does.
    fs.appendFile(TARGET_FILE, content, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).send(`Error: Could not write to ${TARGET_FILE}.`);
        }

        res.send(`Successfully appended text: "${textToAppend}" to ${TARGET_FILE}`);
    });
});

app.get('/readFile/:filename', (req, res) => {
    const filename = req.params.filename;
    const fullPath = path.join(process.cwd(), filename);

    // Check if the requested file is the allowed file
    if (filename !== TARGET_FILE) {
        return res.status(403).send(`Error: Access denied. Only reading from ${TARGET_FILE} is permitted.`);
    }

    // Read the entire contents of the file
    fs.readFile(fullPath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).send(`<h1>404 File Not Found</h1><p>The file: <strong>${filename}</strong> does not exist on the server.</p>`);
            }
            
            console.error('Error reading file:', err);
            return res.status(500).send(`Error: Could not read file ${filename}.`);
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>File Content</title>
            </head>
            <body>
                <h2>Content of ${filename}:</h2>
                <pre>${data}</pre>
            </body>
            </html>
        `);
    });
});

app.get('/getDate', (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).send("Error: Please provide your name in the address bar, e.g., /getDate?name=John");
    }

    const serverTime = getDate();
    const message = GREETING_TEMPLATE.replace('%1', name) + ` ${serverTime}`;
    
    const styledResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Server Greeting</title>
        </head>
        <body>
            <p style="color: blue; font-family: Arial, sans-serif; font-size: 1.2em;">
                ${message}
            </p>
        </body>
        </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(styledResponse);
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`--- Endpoints ---`);
    console.log(`C.1 Write: http://localhost:${PORT}/writeFile?text=BCIT`);
    console.log(`C.2 Read:  http://localhost:${PORT}/readFile/file.txt`);
    console.log(`A.2 Time:  http://localhost:${PORT}/getDate?name=Elena`);
});