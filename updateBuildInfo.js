#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Leer package.json para obtener la versión
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Leer buildInfo.json actual si existe para incrementar buildNumber
let buildNumber = 1;
const buildInfoPath = path.join(__dirname, 'buildInfo.json');

if (fs.existsSync(buildInfoPath)) {
  try {
    const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
    buildNumber = (parseInt(buildInfo.buildNumber) || 0) + 1;
  } catch (e) {
    console.log('No se pudo leer buildNumber anterior, iniciando en 1');
  }
}

// Crear nuevo buildInfo
const buildInfo = {
  version: packageJson.version,
  buildDate: new Date().toISOString(),
  buildNumber: buildNumber.toString()
};

// Guardar buildInfo.json
fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

console.log('✅ Build info actualizado:');
console.log(`   Versión: ${buildInfo.version}`);
console.log(`   Build: #${buildInfo.buildNumber}`);
console.log(`   Fecha: ${new Date(buildInfo.buildDate).toLocaleString('es-BO')}`);
