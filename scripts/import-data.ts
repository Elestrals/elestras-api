#!/usr/bin/env bun

import { importCardsFromJson } from '../src/utils/import-data';

const dataPath = process.argv[2] || 'data';

console.log('🚀 Starting data import...');
console.log(`📁 Data path: ${dataPath}`);

try {
    await importCardsFromJson(dataPath);
    console.log('✅ Data import completed successfully!');
} catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
}