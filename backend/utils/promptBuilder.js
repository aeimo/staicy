const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

export class PromptBuilder {
  prompts

  constructor() {
    const PROMPT_FILE = path.join(__dirname, 'prompts.yml');
    const rawYaml = fs.readFileSync(PROMPT_FILE, 'utf8');
    this.prompts = yaml.load(rawYaml);
  }

  getSystemPrompt() {
    return this.prompts.system_prompt;
  }

  getStyleGuide() {
    return this.prompts.style_guide;
  }

    /**
   * Build a draw.io prompt for initial diagram generation
   * @param {string} codebaseInput - The user's codebase description
   * @param {string} additionalContext - Optional extra context
   * @returns {string} - Final prompt string to send to LLM
   */
  buildInitialPrompt(fileInputs, additionalContext = '') {
    let prompt = prompts.prompt
      .replace('{{CODEBASEFILESUSERINPUT}}', this.processUserInputFiles(fileInputs))
      .replace('{{ADDITIONALCONTEXTUSERINPUT}}', additionalContext);
    return prompt;
  }

  /**
   * Build a follow-up prompt for updating an existing diagram
   * @param {string} followUpInput - Instructions for changes
   * @returns {string} - Prompt string
   */
  buildFollowUpPrompt(followUpInput) {
    return prompts.follow_up_prompt.replace('{{FOLLOWUPUSERINPUT}}', followUpInput);
  }

  /**
   * Build a correction prompt for validating and fixing XML
   * @param {string} xml - XML to validate/fix
   * @returns {string} - Prompt string
   */
  buildCorrectPrompt(xml) {
    return prompts.correct_prompt;
  }

  /**
   * Build a verification prompt to ensure valid draw.io XML
   * @param {string} xml - XML to verify
   * @returns {string} - Prompt string
   */
  buildVerifyPrompt(xml) {
    return prompts.verify_prompt;
  }

  processUserInputFiles(fileInputs) {
    // Process and format user file inputs as needed
    // Logic to turn files to readable text as string
    let formattedInput = '';
    formattedInput += 'The user has provided the following files:\n';
    let i = 1;
    for (const file of fileInputs) {
      formattedInput += `File ${i} (${file.name}):\n${file.content}\n\n`;
      i++;
    }
    return formattedInput;

  }


}
