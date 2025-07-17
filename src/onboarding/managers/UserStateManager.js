const fs = require("fs").promises;
const path = require("path");
const UserState = require("../models/UserState");

/**
 * UserStateManager handles persistence and retrieval of user onboarding states
 */
class UserStateManager {
	constructor() {
		this.dataDir = path.join(__dirname, "../../data/onboarding");
		this.userStatesFile = path.join(this.dataDir, "userStates.json");
		this.userStates = new Map();
		this.initialized = false;
	}

	/**
	 * Initialize the manager by loading existing data
	 */
	async initialize() {
		if (this.initialized) {
			return;
		}

		try {
			// Ensure data directory exists
			await fs.mkdir(this.dataDir, { recursive: true });

			// Load existing user states
			await this.loadUserStates();
			this.initialized = true;
		} catch (error) {
			console.error("Error initializing UserStateManager:", error);
			throw error;
		}
	}

	/**
	 * Load user states from JSON file
	 */
	async loadUserStates() {
		try {
			const data = await fs.readFile(this.userStatesFile, "utf8");
			const statesData = JSON.parse(data);

			this.userStates.clear();
			for (const [key, stateData] of Object.entries(statesData)) {
				this.userStates.set(key, UserState.fromJSON(stateData));
			}
		} catch (error) {
			if (error.code === "ENOENT") {
				// File doesn't exist yet, start with empty states
				this.userStates.clear();
			} else {
				console.error("Error loading user states:", error);
				throw error;
			}
		}
	}

	/**
	 * Save user states to JSON file
	 */
	async saveUserStates() {
		try {
			const statesData = {};
			for (const [key, state] of this.userStates.entries()) {
				statesData[key] = state.toJSON();
			}

			await fs.writeFile(
				this.userStatesFile,
				JSON.stringify(statesData, null, 2),
			);
		} catch (error) {
			console.error("Error saving user states:", error);
			throw error;
		}
	}

	/**
	 * Generate key for user state storage
	 * @param {string} userId - Discord user ID
	 * @param {string} guildId - Discord guild ID
	 * @returns {string}
	 */
	getUserKey(userId, guildId) {
		return `${guildId}-${userId}`;
	}

	/**
	 * Get user state
	 * @param {string} userId - Discord user ID
	 * @param {string} guildId - Discord guild ID
	 * @returns {UserState|null}
	 */
	async getUserState(userId, guildId) {
		await this.initialize();

		const key = this.getUserKey(userId, guildId);
		return this.userStates.get(key) || null;
	}

	/**
	 * Create or update user state
	 * @param {string} userId - Discord user ID
	 * @param {string} guildId - Discord guild ID
	 * @param {Object} updates - Updates to apply to the state
	 * @returns {UserState}
	 */
	async updateUserState(userId, guildId, updates = {}) {
		await this.initialize();

		const key = this.getUserKey(userId, guildId);
		let state = this.userStates.get(key);

		if (!state) {
			state = new UserState(userId, guildId);
			this.userStates.set(key, state);
		}

		// Apply updates
		Object.assign(state, updates);

		await this.saveUserStates();
		return state;
	}

	/**
	 * Set onboarding step for a user
	 * @param {string} userId - Discord user ID
	 * @param {string} guildId - Discord guild ID
	 * @param {string} step - Onboarding step
	 * @returns {UserState}
	 */
	async setOnboardingStep(userId, guildId, step) {
		return this.updateUserState(userId, guildId, {
			onboardingStep: step,
		});
	}

	/**
	 * Mark a step as complete for a user
	 * @param {string} userId - Discord user ID
	 * @param {string} guildId - Discord guild ID
	 * @param {string} step - Step to mark as complete
	 * @returns {UserState}
	 */
	async markStepComplete(userId, guildId, step) {
		await this.initialize();

		const key = this.getUserKey(userId, guildId);
		let state = this.userStates.get(key);

		if (!state) {
			state = new UserState(userId, guildId);
			this.userStates.set(key, state);
		}

		state.completeStep(step);
		await this.saveUserStates();
		return state;
	}

	/**
	 * Get all user states for a guild
	 * @param {string} guildId - Discord guild ID
	 * @returns {UserState[]}
	 */
	async getGuildUserStates(guildId) {
		await this.initialize();

		const guildStates = [];
		for (const [, state] of this.userStates.entries()) {
			if (state.guildId === guildId) {
				guildStates.push(state);
			}
		}
		return guildStates;
	}

	/**
	 * Delete user state
	 * @param {string} userId - Discord user ID
	 * @param {string} guildId - Discord guild ID
	 */
	async deleteUserState(userId, guildId) {
		await this.initialize();

		const key = this.getUserKey(userId, guildId);
		this.userStates.delete(key);
		await this.saveUserStates();
	}

	/**
	 * Get users who need reminders
	 * @param {string} guildId - Discord guild ID
	 * @param {number} maxReminders - Maximum number of reminders to send
	 * @returns {UserState[]}
	 */
	async getUsersNeedingReminders(guildId, maxReminders = 3) {
		await this.initialize();

		const now = new Date();
		const reminderThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

		const usersNeedingReminders = [];
		for (const [, state] of this.userStates.entries()) {
			if (
				state.guildId === guildId &&
				!state.rulesAcknowledged &&
				state.remindersSent < maxReminders
			) {
				const startedAt = new Date(state.onboardingStartedAt);
				const timeSinceStart = now - startedAt;

				if (timeSinceStart >= reminderThreshold) {
					usersNeedingReminders.push(state);
				}
			}
		}
		return usersNeedingReminders;
	}
}

module.exports = UserStateManager;
