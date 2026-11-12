import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export interface CheckpointChoice {
	code: string;
	label: string;
	meaning: string;
	result: string;
}

export interface CheckpointPhase {
	id: string;
	action: string;
	choices?: CheckpointChoice[];
}

export interface CheckpointSpec {
	workflowName: string;
	toolName: string;
	label: string;
	description: string;
	promptSnippet: string;
	promptGuidelines: string[];
	phases: CheckpointPhase[];
	choices: CheckpointChoice[];
	otherCode: string;
	endpointLabel: string;
	extraDetails?(params: Record<string, string>): Record<string, unknown>;
}

export function registerCheckpointTool(pi: ExtensionAPI, spec: CheckpointSpec): void;
