import { db } from "../lib/db";

async function main() {
    try {
        console.log("Connecting to database...");
        await db.$connect();
        console.log("Successfully connected to database!");
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();
