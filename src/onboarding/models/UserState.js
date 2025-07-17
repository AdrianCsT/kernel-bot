/**
 * UserState model representing the onboarding state of a user
 */
class UserState {
	constructor(userId, guildId) {
		this.userId = userId;
		this.guildId = guildId;
		this.onboardingStep = "welcome"; // 'welcome', 'rules', 'github', 'tutorial', 'complete'
		this.rulesAcknowledged = false;
		this.rulesAcknowledgedAt = null;
		this.githubConnected = false;
		this.githubUsername = null;
		this.tutorialCompleted = false;
		this.onboardingStartedAt = new Date().toISOString();
		this.onboardingCompletedAt = null;
		this.remindersSent = 0;
	}

	/**
	 * Create UserState from JSON data
	 * @param {Object} data - JSON data
	 * @returns {UserState}
	 */
	static fromJSON(data) {
		const state = new UserState(data.userId, data.guildId);
		Object.assign(state, data);
		return state;
	}

	/**
	 * Convert UserState to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			userId: this.userId,
			guildId: this.guildId,
			onboardingStep: this.onboardingStep,
			rulesAcknowledged: this.rulesAcknowledged,
			rulesAcknowledgedAt: this.rulesAcknowledgedAt,
			githubConnected: this.githubConnected,
			githubUsername: this.githubUsername,
			tutorialCompleted: this.tutorialCompleted,
			onboardingStartedAt: this.onboardingStartedAt,
			onboardingCompletedAt: this.onboardingCompletedAt,
			remindersSent: this.remindersSent,
		};
	}

	/**
	 * Mark a step as complete and advance to next step
	 * @param {string} step - The step to mark as complete
	 */
	completeStep(step) {
		switch (step) {
			case "rules":
				this.rulesAcknowledged = true;
				this.rulesAcknowledgedAt = new Date().toISOString();
				this.onboardingStep = "github";
				break;
			case "github":
				this.onboardingStep = "tutorial";
				break;
			case "tutorial":
				this.tutorialCompleted = true;
				this.onboardingStep = "complete";
				this.onboardingCompletedAt = new Date().toISOString();
				break;
		}
	}

	/**
	 * Check if onboarding is complete
	 * @returns {boolean}
	 */
	isComplete() {
		return this.onboardingStep === "complete";
	}
}

module.exports = UserState;
