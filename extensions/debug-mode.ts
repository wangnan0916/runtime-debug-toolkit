import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerCheckpointTool, type CheckpointSpec } from "./checkpoint.mjs";
import { buildSkillPrompt } from "./skill-prompt.mjs";

const COMMAND_NAME = "debug-mode";
const TOOL_NAME = "debug_mode_checkpoint";

const DEBUG_CHECKPOINT_SPEC: CheckpointSpec = {
	workflowName: "Debug Mode",
	toolName: TOOL_NAME,
	label: "Debug Mode",
	description:
		"Show one Debug Mode checkpoint. An active session survives replies and retries until cleanup or explicit abandonment.",
	promptSnippet: "Show an interactive Debug Mode checkpoint with A, B, and C",
	promptGuidelines: [
		"Use the bundled debug-mode checkpoint reference to choose the supported interaction path; native tools take precedence only when permitted in the current mode.",
		"On the Pi path, call debug_mode_checkpoint for the current manual attempt after preparing its context, then wait for a submitted result before dependent work.",
		"A cancelled or UI-unavailable result requests the plain-text fallback while the attempt stays pending. Preserve the active session across replies.",
	],
	phases: [
		{ id: "pre-fix", action: "reproduce the bug" },
		{ id: "post-fix", action: "verify the original bug" },
	],
	choices: [
		{ code: "A", label: "A - Reproduced", meaning: "Reproduced" },
		{ code: "B", label: "B - Fixed", meaning: "Fixed" },
		{ code: "C", label: "C - Other: enter details", meaning: "Other" },
	],
	otherCode: "C",
	endpointLabel: "Debug endpoint",
};

export default function debugMode(pi: ExtensionAPI) {
	// /debug-mode injects the bundled SKILL.md directly (the package no longer loads skills).
	pi.registerCommand(COMMAND_NAME, {
		description: "Start Debug Mode for a runtime bug",
		handler: async (args, ctx) => {
			pi.sendUserMessage(
				buildSkillPrompt(COMMAND_NAME, args, "Start Debug Mode."),
				ctx.isIdle() ? undefined : { deliverAs: "steer" },
			);
		},
	});

	registerCheckpointTool(pi, DEBUG_CHECKPOINT_SPEC);
}
