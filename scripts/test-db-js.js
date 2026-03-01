const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load .env manualy
try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1]] = match[2].replace(/"/g, '').trim();
            }
        });
        console.log("Loaded .env file");
    }
} catch (e) {
    console.error("Failed to load .env:", e);
}

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("Successfully connected to database!");
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
