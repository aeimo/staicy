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

            const tryParse = (str: string) => {
            try {
                return JSON.parse(str);
            } catch {
                return null;
            }
            };

            // First attempt: raw parse
                let parsed = tryParse(cleaned);
                if (!parsed) {
                // Recovery pass: escape newlines inside string values
                let recovered = cleaned
                    // replace raw newlines inside quotes
                    .replace(/"(?:[^"\\]|\\.)*"/gs, (match) =>
                    match.replace(/\n/g, "\\n").replace(/\r/g, "\\r")
                    );

                // attempt parse again
                parsed = tryParse(recovered);

                // If still broken, try escaping backslashes/quotes more aggressively
                if (!parsed) {
                    recovered = recovered.replace(/\\(?![nrt"\\])/g, "\\\\");
                    parsed = tryParse(recovered);
                }

                if (!parsed) {
                    console.error("Failed to recover JSON response after cleanup.");
                    return null;
                }
                }

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
