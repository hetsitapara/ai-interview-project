const { generateAIOverview } = require('./utils/aiOverview');
const dotenv = require('dotenv');
const path = require('path');

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    console.log("Testing AI Overview API call...");
    const overview = await generateAIOverview(
        "Give an example of a Closure in Javascript.",
        "A closure is a function that remembers its lexical scope even when it is executed outside that scope.",
        "8",
        "Good core definition, could be more comprehensive."
    );
    console.log("\n--- AI OVERVIEW ---");
    console.log(overview);
    console.log("-------------------\n");
}

test();
