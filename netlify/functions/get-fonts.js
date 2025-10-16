const fetch = require('node-fetch');

// This function acts as the secure middleman. It hides your GOOGLE_FONTS_API_KEY
// by calling the Google API from the server side (Netlify's function environment).
exports.handler = async (event, context) => {
    // 1. Retrieve the secret key from Netlify's Environment Variables
    const API_KEY = process.env.GOOGLE_FONTS_API_KEY;

    if (!API_KEY) {
        console.error("GOOGLE_FONTS_API_KEY is not set in Netlify environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API key missing." }),
        };
    }

    // MODIFIED: Changed sort=popularity to sort=trending for more varied fonts
    const GOOGLE_FONTS_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=trending`;

    try {
        // 2. Securely call the external Google API
        const response = await fetch(GOOGLE_FONTS_API_URL);

        if (!response.ok) {
            // Check for specific API error codes
            const errorText = await response.text();
            console.error(`Google API responded with status ${response.status}: ${errorText}`);
            
            // If Netlify's API key is invalid, this is where it fails (e.g., 400 or 403)
            return {
                statusCode: response.status,
                body: JSON.stringify({ 
                    error: "Failed to fetch fonts from Google API.",
                    details: errorText.substring(0, 100) + '...'
                }),
            };
        }

        // 3. Return the data directly to the client
        const data = await response.json();
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Function execution error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error during font fetch." }),
        };
    }
};
