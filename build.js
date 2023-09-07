const resources = [
    './index.html',
    './cog.png',
    './app.css',
    './node_modules/primeflex/primeflex.css',
    './node_modules/primeflex/themes/primeone-light.css'
]

const dest = 'dist';

async function execute() {
    const fs = require('fs').promises;
    const path = require('path');
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    // clearn
    var existingFiles = await fs.readdir(dest, { recursive: false, withFileTypes: true });
    for (const file of existingFiles.filter(x => x.isFile())) {
        await fs.rm(path.join(dest, file.name));
    }

    // run tsc
    await exec("./node_modules/typescript/bin/tsc");

    // copy resources to target
    for (const file of resources) {
        await fs.copyFile(file, path.join(dest, path.basename(file)));
    }
}

execute();
