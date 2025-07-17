const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs").promises;
const path = require("path");
const UserStateManager = require("../UserStateManager");
const UserState = require("../../models/UserState");

describe("UserStateManager", () => {
	let manager;
	let tempDir;
	const testUserId = "user123";
	const testGuildId = "guild456";

	beforeEach(async () => {
		// Create a temporary directory for testing
		tempDir = path.join(__dirname, "temp-test-data");
		await fs.mkdir(tempDir, { recursive: true });

		manager = new UserStateManager();
		// Override the data directory for testing
		manager.dataDir = tempDir;
		manager.userStatesFile = path.join(tempDir, "userStates.json");
	});

	afterEach(async () => {
		// Clean up temporary directory
		try {
			await fs.rm(tempDir, { recursive: true, force: true });
		} catch (_error) {
			// Ignore cleanup errors
		}
	});

	describe("getUserKey", () => {
		test("should generate correct user key", () => {
			const key = manager.getUserKey(testUserId, testGuildId);
			assert.strictEqual(key, "guild456-user123");
		});
	});

	describe("initialize", () => {
		test("should initialize successfully with no existing data", async () => {
			await manager.initialize();

			assert.strictEqual(manager.initialized, true);
			assert.strictEqual(manager.userStates.size, 0);
		});

		test("should not reinitialize if already initialized", async () => {
			manager.initialized = true;
			const originalSize = manager.userStates.size;

			await manager.initialize();

			assert.strictEqual(manager.userStates.size, originalSize);
		});
	});

	describe("getUserState", () => {
		test("should return null for non-existent user", async () => {
			const state = await manager.getUserState(testUserId, testGuildId);
			assert.strictEqual(state, null);
		});
	});

	describe("updateUserState", () => {
		test("should create new user state if none exists", async () => {
			const updates = { onboardingStep: "rules" };

			const state = await manager.updateUserState(
				testUserId,
				testGuildId,
				updates,
			);

			assert.ok(state instanceof UserState);
			assert.strictEqual(state.userId, testUserId);
			assert.strictEqual(state.guildId, testGuildId);
			assert.strictEqual(state.onboardingStep, "rules");
		});

		test("should update existing user state", async () => {
			// First create a state
			await manager.updateUserState(testUserId, testGuildId, {
				onboardingStep: "welcome",
			});

			// Then update it
			const updates = { onboardingStep: "rules", rulesAcknowledged: true };
			const state = await manager.updateUserState(
				testUserId,
				testGuildId,
				updates,
			);

			assert.strictEqual(state.onboardingStep, "rules");
			assert.strictEqual(state.rulesAcknowledged, true);
		});
	});

	describe("setOnboardingStep", () => {
		test("should set onboarding step correctly", async () => {
			const state = await manager.setOnboardingStep(
				testUserId,
				testGuildId,
				"github",
			);

			assert.strictEqual(state.onboardingStep, "github");
		});
	});

	describe("markStepComplete", () => {
		test("should mark step as complete and advance state", async () => {
			const state = await manager.markStepComplete(
				testUserId,
				testGuildId,
				"rules",
			);

			assert.strictEqual(state.rulesAcknowledged, true);
			assert.ok(state.rulesAcknowledgedAt);
			assert.strictEqual(state.onboardingStep, "github");
		});
	});

	describe("getGuildUserStates", () => {
		test("should return only states for specified guild", async () => {
			// Add some test states
			await manager.updateUserState("user1", testGuildId, {
				onboardingStep: "rules",
			});
			await manager.updateUserState("user2", testGuildId, {
				onboardingStep: "github",
			});
			await manager.updateUserState("user3", "otherGuild", {
				onboardingStep: "tutorial",
			});

			const states = await manager.getGuildUserStates(testGuildId);

			assert.strictEqual(states.length, 2);
			assert.ok(states.every((state) => state.guildId === testGuildId));
		});
	});

	describe("deleteUserState", () => {
		test("should delete user state", async () => {
			await manager.updateUserState(testUserId, testGuildId, {
				onboardingStep: "rules",
			});

			await manager.deleteUserState(testUserId, testGuildId);

			const state = await manager.getUserState(testUserId, testGuildId);
			assert.strictEqual(state, null);
		});
	});

	describe("getUsersNeedingReminders", () => {
		test("should return users who need reminders", async () => {
			// Create test states with different scenarios
			const yesterday = new Date(
				Date.now() - 25 * 60 * 60 * 1000,
			).toISOString();

			// User who needs reminder (rules not acknowledged, started yesterday)
			await manager.updateUserState("user1", testGuildId, {
				onboardingStep: "rules",
				rulesAcknowledged: false,
				onboardingStartedAt: yesterday,
				remindersSent: 0,
			});

			// User who already acknowledged rules
			await manager.updateUserState("user2", testGuildId, {
				onboardingStep: "github",
				rulesAcknowledged: true,
				onboardingStartedAt: yesterday,
				remindersSent: 0,
			});

			// User who started recently (less than 24 hours ago)
			await manager.updateUserState("user3", testGuildId, {
				onboardingStep: "rules",
				rulesAcknowledged: false,
				onboardingStartedAt: new Date().toISOString(),
				remindersSent: 0,
			});

			const users = await manager.getUsersNeedingReminders(testGuildId, 3);

			assert.strictEqual(users.length, 1);
			assert.strictEqual(users[0].userId, "user1");
		});

		test("should respect max reminders limit", async () => {
			const yesterday = new Date(
				Date.now() - 25 * 60 * 60 * 1000,
			).toISOString();

			await manager.updateUserState("user1", testGuildId, {
				onboardingStep: "rules",
				rulesAcknowledged: false,
				onboardingStartedAt: yesterday,
				remindersSent: 3,
			});

			const users = await manager.getUsersNeedingReminders(testGuildId, 3);

			assert.strictEqual(users.length, 0);
		});
	});
});
