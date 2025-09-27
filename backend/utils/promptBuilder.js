const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const PROMPT_FILE = path.join(__dirname, '../drawio_prompts.yml');
const rawYaml = fs.readFileSync(PROMPT_FILE, 'utf8');
const prompts = yaml.load(rawYaml);

class PromptBuilder {
  prompts: any;

  constructor() {
    const PROMPT_FILE = path.join(__dirname, 'prompts.yml');
    const rawYaml = fs.readFileSync(PROMPT_FILE, 'utf8');
    this.prompts = yaml.load(rawYaml);
  }


}

/**
 * Build a draw.io prompt for initial diagram generation
 * @param {string} codebaseInput - The user's codebase description
 * @param {string} additionalContext - Optional extra context
 * @returns {string} - Final prompt string to send to LLM
 */
function buildInitialPrompt(codebaseInput, additionalContext = '') {
  let prompt = prompts.system_prompt + '\n\n';
  prompt += prompts.style_guide + '\n\n';
  prompt += prompts.prompt
    .replace('{{CODEBASEFILESUSERINPUT}}', codebaseInput)
    .replace('{{ADDITIONALCONTEXTUSERINPUT}}', additionalContext);
  return prompt;
}

/**
 * Build a follow-up prompt for updating an existing diagram
 * @param {string} followUpInput - Instructions for changes
 * @returns {string} - Prompt string
 */
function buildFollowUpPrompt(followUpInput) {
  return prompts.follow_up_prompt.replace('{{FOLLOWUPUSERINPUT}}', followUpInput);
}

/**
 * Build a correction prompt for validating and fixing XML
 * @param {string} xml - XML to validate/fix
 * @returns {string} - Prompt string
 */
function buildCorrectPrompt(xml) {
  return prompts.correct_prompt.replace('{{XMLFILE}}', xml || '');
}

/**
 * Build a verification prompt to ensure valid draw.io XML
 * @param {string} xml - XML to verify
 * @returns {string} - Prompt string
 */
function buildVerifyPrompt(xml) {
  return prompts.verify_prompt.replace('{{XMLFILE}}', xml || '');
}

module.exports = {
  buildInitialPrompt,
  buildFollowUpPrompt,
  buildCorrectPrompt,
  buildVerifyPrompt,
};
