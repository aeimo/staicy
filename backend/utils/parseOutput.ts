class parseOutput {
    static parseJsonResponse(response: string): { xml: string; commentary: string } | null {
        try {
            const lines = response.split(/\r?\n/);
            let cleaned = response;
            if (lines.length >= 3) {
                cleaned = lines.slice(1, -1).join('\n');
            } else {
                // if fewer than 3 lines, just trim whitespace
                cleaned = response.trim();
            }

            const parsed = JSON.parse(cleaned);
            if (parsed.xml && parsed.commentary) {
                return { xml: parsed.xml, commentary: parsed.commentary };
            }
            return null;
        } catch (error) {
            console.error("Failed to parse JSON response:", error);
            return null;
        }
    }
}

export { parseOutput }; 
