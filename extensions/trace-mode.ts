import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerCheckpointTool, type CheckpointSpec } from "./checkpoint.mjs";
import { buildSkillPrompt } from "./skill-prompt.mjs";

const COMMAND_NAME = "trace-mode";
const TOOL_NAME = "trace_mode_checkpoint";
const DEFAULT_REQUEST =
	"Start Trace Mode to answer my runtime code-location question.";

const TRACE_CHECKPOINT_SPEC: CheckpointSpec = {
	workflowName: "Trace Mode",
	toolName: TOOL_NAME,
	label: "Trace Mode",
	description:
		"Collect one manual Trace Mode observation. Returns a phase-specific result; cancellation or unavailable UI leaves the session pending.",
	promptSnippet: "Collect a required manual Trace Mode observation",
	promptGuidelines: [
		"Use only for required user participation or an explicit manual choice; agent-executed attempts do not need this tool.",
		"Follow the bundled trace-mode checkpoint reference for transport selection, current-attempt results, and pending/cancelled handling.",
	],
	phases: [{ id: "capture", action: "run the stated trigger" }],
	choices: [
		{ code: "A", label: "A - Trace captured", meaning: "Captured", result: "captured" },
		{ code: "B", label: "B - Could not trigger", meaning: "Not triggered", result: "not_triggered" },
		{ code: "C", label: "C - Other: enter details", meaning: "Other", result: "inconclusive" },
	],
	otherCode: "C",
	endpointLabel: "Trace endpoint",
};

export default function traceMode(pi: ExtensionAPI) {
	// /trace-mode injects the bundled SKILL.md directly (the package no longer loads skills).
	pi.registerCommand(COMMAND_NAME, {
		description: "Start Trace Mode to trace runtime behavior and locate responsible code",
		handler: async (args, ctx) => {
			pi.sendUserMessage(
				buildSkillPrompt(COMMAND_NAME, args, DEFAULT_REQUEST),
				ctx.isIdle() ? undefined : { deliverAs: "steer" },
			);
		},
	});

	registerCheckpointTool(pi, TRACE_CHECKPOINT_SPEC);
}
