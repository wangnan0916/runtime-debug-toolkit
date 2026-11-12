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
		"Collect one manual Debug Mode observation. Returns a phase-specific result; cancellation or unavailable UI leaves the session pending.",
	promptSnippet: "Collect a required manual Debug Mode observation",
	promptGuidelines: [
		"Use only for required user participation or an explicit manual choice; agent-executed attempts do not need this tool.",
		"Follow the bundled debug-mode checkpoint reference for transport selection, current-attempt results, and pending/cancelled handling.",
	],
	phases: [
		{
			id: "pre-fix",
			action: "reproduce the bug",
			choices: [
				{ code: "A", label: "A - Reproduced", meaning: "Reproduced", result: "reproduced" },
				{ code: "B", label: "B - Issue did not recur", meaning: "Issue did not recur", result: "not_reproduced" },
				{ code: "C", label: "C - Other: enter details", meaning: "Other", result: "inconclusive" },
			],
		},
		{ id: "post-fix", action: "verify the original bug" },
	],
	choices: [
		{ code: "A", label: "A - Still reproducible", meaning: "Still reproducible", result: "failed" },
		{ code: "B", label: "B - Fixed", meaning: "Fixed", result: "passed" },
		{ code: "C", label: "C - Other: enter details", meaning: "Other", result: "inconclusive" },
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
