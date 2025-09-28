const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const PROMPT_FILE = path.join(__dirname, "prompts.yml");


interface DrawioPrompts {
  system_prompt: string;
  style_guide: string;
  prompt: string;
  follow_up_prompt: string;
  correct_prompt: string;
  verify_prompt: string;
}

interface Prompts {
  drawio_prompts: DrawioPrompts;
}

interface FileInput {
  name: string;
  content: string;
}

export class PromptBuilder {
  private prompts: DrawioPrompts;

  constructor() {
    const rawYaml = fs.readFileSync(PROMPT_FILE, "utf8");
    let prompts = yaml.load(rawYaml) as Prompts;
    this.prompts = prompts.drawio_prompts;
  }

  getPrompts(): DrawioPrompts {
    return this.prompts;
  }

  getSystemPrompt(): string {
    return this.prompts.system_prompt;
  }

  getStyleGuide(): string {
    return this.prompts.style_guide;
  }

  buildInitialPrompt(fileInputs: FileInput[], additionalContext: string = ""): string {
    return this.prompts.prompt
      .replace("{{CODEBASEFILESUSERINPUT}}", this.processUserInputFiles(fileInputs))
      .replace("{{ADDITIONALCONTEXTUSERINPUT}}", additionalContext);
  }

  buildFollowUpPrompt(followUpInput: string): string {
    return this.prompts.follow_up_prompt.replace("{{FOLLOWUPUSERINPUT}}", followUpInput);
  }

  buildCorrectPrompt(_xml: string): string {
    return this.prompts.correct_prompt;
  }

  buildVerifyPrompt(_xml: string): string {
    return this.prompts.verify_prompt;
  }

  processUserInputFiles(fileInputs: {"name": string, "content": string}[]): string {
    let formattedInput = "The user has provided the following files:\n";
    fileInputs.forEach((file, i) => {
      formattedInput += `File ${i + 1} (${file.name}):\n${file.content}\n\n`;
    });
    return formattedInput;
  }
}
