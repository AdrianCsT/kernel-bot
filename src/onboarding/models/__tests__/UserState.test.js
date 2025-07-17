const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const UserState = require("../UserState");

describe("UserState", () => {
	let userState;
	const userId = "user123";
	const guildId = "guild456";

	beforeEach(() => {
		userState = new UserState(userId, guildId);
	});

	describe("constructor", () => {
		test("should initialize with correct default values", () => {
			assert.strictEqual(userState.userId, userId);
			assert.strictEqual(userState.guildId, guildId);
			assert.strictEqual(userState.onboardingStep, "welcome");
			assert.strictEqual(userState.rulesAcknowledged, false);
			assert.strictEqual(userState.rulesAcknowledgedAt, null);
			assert.strictEqual(userState.githubConnected, false);
			assert.strictEqual(userState.githubUsername, null);
			assert.strictEqual(userState.tutorialCompleted, false);
			assert.strictEqual(userState.onboardingCompletedAt, null);
			assert.strictEqual(userState.remindersSent, 0);
			assert.ok(userState.onboardingStartedAt);
		});
	});

	describe("fromJSON", () => {
		test("should create UserState from JSON data", () => {
			const jsonData = {
				userId: "user789",
				guildId: "guild012",
				onboardingStep: "rules",
				rulesAcknowledged: true,
				rulesAcknowledgedAt: "2023-01-01T00:00:00.000Z",
				githubConnected: false,
				githubUsername: null,
				tutorialCompleted: false,
				onboardingStartedAt: "2023-01-01T00:00:00.000Z",
				onboardingCompletedAt: null,
				remindersSent: 1,
			};

			const state = UserState.fromJSON(jsonData);

			assert.strictEqual(state.userId, "user789");
			assert.strictEqual(state.guildId, "guild012");
			assert.strictEqual(state.onboardingStep, "rules");
			assert.strictEqual(state.rulesAcknowledged, true);
			assert.strictEqual(state.remindersSent, 1);
		});
	});

	describe("toJSON", () => {
		test("should convert UserState to JSON", () => {
			const json = userState.toJSON();

			assert.strictEqual(json.userId, userId);
			assert.strictEqual(json.guildId, guildId);
			assert.strictEqual(json.onboardingStep, "welcome");
			assert.strictEqual(json.rulesAcknowledged, false);
			assert.strictEqual(json.githubConnected, false);
			assert.strictEqual(json.tutorialCompleted, false);
			assert.strictEqual(json.remindersSent, 0);
		});
	});

	describe("completeStep", () => {
		test("should complete rules step correctly", () => {
			userState.completeStep("rules");

			assert.strictEqual(userState.rulesAcknowledged, true);
			assert.ok(userState.rulesAcknowledgedAt);
			assert.strictEqual(userState.onboardingStep, "github");
		});

		test("should complete github step correctly", () => {
			userState.onboardingStep = "github";
			userState.completeStep("github");

			assert.strictEqual(userState.onboardingStep, "tutorial");
		});

		test("should complete tutorial step correctly", () => {
			userState.onboardingStep = "tutorial";
			userState.completeStep("tutorial");

			assert.strictEqual(userState.tutorialCompleted, true);
			assert.strictEqual(userState.onboardingStep, "complete");
			assert.ok(userState.onboardingCompletedAt);
		});
	});

	describe("isComplete", () => {
		test("should return false for incomplete onboarding", () => {
			assert.strictEqual(userState.isComplete(), false);
		});

		test("should return true for complete onboarding", () => {
			userState.onboardingStep = "complete";
			assert.strictEqual(userState.isComplete(), true);
		});
	});
});
