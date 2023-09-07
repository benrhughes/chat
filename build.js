const dest = 'dist';

const resources = [
    './index.html',
    './cog.png',
    './app.css',
    './node_modules/primeflex/primeflex.css',
    './node_modules/primeflex/themes/primeone-light.css'
]

async function execute() {
    const fs = require('fs').promises;
    const path = require('path');
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    await fs.mkdir(dest, {recursive: true});

    // clean
    var existingFiles = await fs.readdir(dest, { recursive: false, withFileTypes: true });
    for (const file of existingFiles.filter(x => x.isFile())) {
        await fs.rm(path.join(dest, file.name));
    }

    // compile typescript 
    await exec("./node_modules/typescript/bin/tsc");

    // copy resources to destination 
    for (const file of resources) {
        await fs.copyFile(file, path.join(dest, path.basename(file)));
    }
}

execute();