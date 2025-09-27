const express = require('express');
const axios = require('axios');
const { buildPrompt } = require('../utils/promptBuilder');
const { validateXML, fixXML } = require('../utils/xmlValidator');

const router = express.Router();

// Generate draw.io XML
router.post('/', async (req, res) => {
  try {
    const { userInput } = req.body;

    // 1. Build prompt
    const prompt = buildPrompt(userInput);

    // 2. Call Claude 3.7 API
    const response = await axios.post(
      process.env.CLAUDE_ENDPOINT,
      {
        prompt: prompt,
        model: "claude-3.7",
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let xml = response.data.output_text;

    // 3. Validate XML
    if (!validateXML(xml)) {
      xml = await fixXML(xml); // Try auto-correction
    }

    res.json({ xml });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate diagram' });
  }
});

module.exports = router;
