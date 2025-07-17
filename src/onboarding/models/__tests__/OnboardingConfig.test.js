const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const OnboardingConfig = require("../OnboardingConfig");

describe("OnboardingConfig", () => {
	let config;
	const guildId = "guild123";

	beforeEach(() => {
		config = new OnboardingConfig(guildId);
	});

	describe("constructor", () => {
		test("should initialize with correct default values", () => {
			assert.strictEqual(config.guildId, guildId);
			assert.strictEqual(config.welcomeChannelId, null);
			assert.strictEqual(config.rulesChannelId, null);
			assert.strictEqual(config.githubIntegrationEnabled, true);
			assert.strictEqual(config.tutorialEnabled, true);
			assert.strictEqual(config.reminderIntervalHours, 24);
			assert.strictEqual(config.maxReminders, 3);
			assert.ok(config.welcomeMessage.includes("¡Bienvenido/a al servidor!"));
			assert.ok(config.rulesContent.includes("Reglas del Servidor"));
		});
	});

	describe("getDefaultWelcomeMessage", () => {
		test("should return Spanish welcome message", () => {
			const message = config.getDefaultWelcomeMessage();
			assert.ok(message.includes("¡Bienvenido/a al servidor!"));
			assert.ok(message.includes("/help"));
		});
	});

	describe("getDefaultRulesContent", () => {
		test("should return Spanish rules content", () => {
			const rules = config.getDefaultRulesContent();
			assert.ok(rules.includes("Reglas del Servidor"));
			assert.ok(rules.includes("Respeto y Cortesía"));
			assert.ok(rules.includes("Acepto"));
		});
	});

	describe("fromJSON", () => {
		test("should create OnboardingConfig from JSON data", () => {
			const jsonData = {
				guildId: "guild456",
				welcomeChannelId: "channel123",
				rulesChannelId: "channel456",
				githubIntegrationEnabled: false,
				tutorialEnabled: false,
				reminderIntervalHours: 48,
				maxReminders: 5,
				welcomeMessage: "Custom welcome",
				rulesContent: "Custom rules",
			};

			const newConfig = OnboardingConfig.fromJSON(jsonData);

			assert.strictEqual(newConfig.guildId, "guild456");
			assert.strictEqual(newConfig.welcomeChannelId, "channel123");
			assert.strictEqual(newConfig.githubIntegrationEnabled, false);
			assert.strictEqual(newConfig.reminderIntervalHours, 48);
			assert.strictEqual(newConfig.welcomeMessage, "Custom welcome");
		});
	});

	describe("toJSON", () => {
		test("should convert OnboardingConfig to JSON", () => {
			config.welcomeChannelId = "channel123";
			config.rulesChannelId = "channel456";

			const json = config.toJSON();

			assert.strictEqual(json.guildId, guildId);
			assert.strictEqual(json.welcomeChannelId, "channel123");
			assert.strictEqual(json.rulesChannelId, "channel456");
			assert.strictEqual(json.githubIntegrationEnabled, true);
			assert.strictEqual(json.tutorialEnabled, true);
			assert.strictEqual(json.reminderIntervalHours, 24);
			assert.strictEqual(json.maxReminders, 3);
		});
	});

	describe("update", () => {
		test("should update configuration with new values", () => {
			const updates = {
				welcomeChannelId: "newChannel",
				githubIntegrationEnabled: false,
				maxReminders: 5,
			};

			config.update(updates);

			assert.strictEqual(config.welcomeChannelId, "newChannel");
			assert.strictEqual(config.githubIntegrationEnabled, false);
			assert.strictEqual(config.maxReminders, 5);
			assert.strictEqual(config.tutorialEnabled, true); // Should remain unchanged
		});
	});

	describe("validate", () => {
		test("should return valid for default configuration", () => {
			const result = config.validate();
			assert.strictEqual(result.isValid, true);
			assert.strictEqual(result.errors.length, 0);
		});

		test("should return invalid for missing guild ID", () => {
			config.guildId = null;
			const result = config.validate();
			assert.strictEqual(result.isValid, false);
			assert.ok(result.errors.includes("Guild ID es requerido"));
		});

		test("should return invalid for invalid reminder interval", () => {
			config.reminderIntervalHours = 0;
			const result = config.validate();
			assert.strictEqual(result.isValid, false);
			assert.ok(
				result.errors.some((err) => err.includes("Intervalo de recordatorios")),
			);
		});

		test("should return invalid for invalid max reminders", () => {
			config.maxReminders = -1;
			const result = config.validate();
			assert.strictEqual(result.isValid, false);
			assert.ok(
				result.errors.some((err) => err.includes("Máximo de recordatorios")),
			);
		});

		test("should return invalid for empty welcome message", () => {
			config.welcomeMessage = "";
			const result = config.validate();
			assert.strictEqual(result.isValid, false);
			assert.ok(
				result.errors.some((err) => err.includes("Mensaje de bienvenida")),
			);
		});

		test("should return invalid for empty rules content", () => {
			config.rulesContent = "";
			const result = config.validate();
			assert.strictEqual(result.isValid, false);
			assert.ok(
				result.errors.some((err) => err.includes("Contenido de reglas")),
			);
		});
	});

	describe("getMessages", () => {
		test("should return Spanish messages object", () => {
			const messages = config.getMessages();

			assert.ok(messages.WELCOME.includes("¡Bienvenido/a al servidor!"));
			assert.ok(messages.RULES_PROMPT.includes("reglas del servidor"));
			assert.ok(messages.GITHUB_OFFER.includes("GitHub"));
			assert.ok(messages.TUTORIAL_START.includes("tutorial"));
			assert.ok(messages.ONBOARDING_COMPLETE.includes("completado"));
			assert.strictEqual(messages.BUTTON_ACCEPT_RULES, "Acepto las Reglas");
		});
	});
});
