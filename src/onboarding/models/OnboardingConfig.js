/**
 * OnboardingConfig model representing the configuration for onboarding in a guild
 */
class OnboardingConfig {
	constructor(guildId) {
		this.guildId = guildId;
		this.welcomeChannelId = null;
		this.rulesChannelId = null;
		this.welcomeMessage = this.getDefaultWelcomeMessage();
		this.rulesContent = this.getDefaultRulesContent();
		this.githubIntegrationEnabled = true;
		this.tutorialEnabled = true;
		this.reminderIntervalHours = 24;
		this.maxReminders = 3;
	}

	/**
	 * Get default welcome message in Spanish
	 * @returns {string}
	 */
	getDefaultWelcomeMessage() {
		return `¡Bienvenido/a al servidor! 👋

¡Nos alegra tenerte aquí! Para comenzar, necesitas:

1. 📋 Leer y aceptar las reglas del servidor
2. 🔗 Conectar tu cuenta de GitHub (opcional)
3. 📚 Completar un breve tutorial

Usa \`/help\` para ver todos los comandos disponibles.
¡Esperamos que disfrutes tu tiempo aquí!`;
	}

	/**
	 * Get default rules content in Spanish
	 * @returns {string}
	 */
	getDefaultRulesContent() {
		return `📋 **Reglas del Servidor**

**1. Respeto y Cortesía**
- Trata a todos los miembros con respeto
- No se toleran insultos, acoso o discriminación

**2. Contenido Apropiado**
- Mantén las conversaciones apropiadas para todos
- No spam ni contenido irrelevante

**3. Canales Temáticos**
- Usa los canales apropiados para cada tema
- Mantén las discusiones organizadas

**4. Código de Conducta para Desarrolladores**
- Comparte código de manera constructiva
- Ayuda a otros desarrolladores cuando sea posible
- Respeta las diferentes tecnologías y enfoques

**5. Privacidad y Seguridad**
- No compartas información personal
- No publiques credenciales o tokens

Al hacer clic en "Acepto", confirmas que has leído y aceptas estas reglas.`;
	}

	/**
	 * Create OnboardingConfig from JSON data
	 * @param {Object} data - JSON data
	 * @returns {OnboardingConfig}
	 */
	static fromJSON(data) {
		const config = new OnboardingConfig(data.guildId);
		Object.assign(config, data);
		return config;
	}

	/**
	 * Convert OnboardingConfig to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			guildId: this.guildId,
			welcomeChannelId: this.welcomeChannelId,
			rulesChannelId: this.rulesChannelId,
			welcomeMessage: this.welcomeMessage,
			rulesContent: this.rulesContent,
			githubIntegrationEnabled: this.githubIntegrationEnabled,
			tutorialEnabled: this.tutorialEnabled,
			reminderIntervalHours: this.reminderIntervalHours,
			maxReminders: this.maxReminders,
		};
	}

	/**
	 * Update configuration with new values
	 * @param {Object} updates - Updates to apply
	 */
	update(updates) {
		Object.assign(this, updates);
	}

	/**
	 * Validate configuration values
	 * @returns {Object} Validation result with isValid and errors
	 */
	validate() {
		const errors = [];

		if (!this.guildId) {
			errors.push("Guild ID es requerido");
		}

		if (this.reminderIntervalHours < 1 || this.reminderIntervalHours > 168) {
			errors.push("Intervalo de recordatorios debe estar entre 1 y 168 horas");
		}

		if (this.maxReminders < 0 || this.maxReminders > 10) {
			errors.push("Máximo de recordatorios debe estar entre 0 y 10");
		}

		if (!this.welcomeMessage || this.welcomeMessage.trim().length === 0) {
			errors.push("Mensaje de bienvenida no puede estar vacío");
		}

		if (!this.rulesContent || this.rulesContent.trim().length === 0) {
			errors.push("Contenido de reglas no puede estar vacío");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Get Spanish messages for various onboarding steps
	 * @returns {Object}
	 */
	getMessages() {
		return {
			WELCOME: "¡Bienvenido/a al servidor! 👋",
			RULES_PROMPT: "Por favor, lee y acepta las reglas del servidor:",
			RULES_ACCEPTED: "¡Gracias por aceptar las reglas! ✅",
			GITHUB_OFFER: "¿Te gustaría conectar tu cuenta de GitHub? (Opcional)",
			GITHUB_CONNECTED: "¡GitHub conectado exitosamente! 🔗",
			GITHUB_SKIPPED:
				"GitHub omitido. Puedes conectarlo más tarde con `/github-connect`",
			TUTORIAL_START: "¡Comencemos con un breve tutorial! 📚",
			TUTORIAL_COMPLETE: "¡Tutorial completado! 🎓",
			ONBOARDING_COMPLETE: "¡Onboarding completado! ¡Disfruta del servidor! 🎉",
			REMINDER_RULES:
				"👋 ¡Hola! Aún necesitas aceptar las reglas del servidor para acceder a todos los canales.",
			ERROR_DM_FAILED:
				"No pude enviarte un mensaje directo. Te enviaré la información aquí.",
			BUTTON_ACCEPT_RULES: "Acepto las Reglas",
			BUTTON_CONNECT_GITHUB: "Conectar GitHub",
			BUTTON_SKIP_GITHUB: "Omitir por Ahora",
			BUTTON_START_TUTORIAL: "Comenzar Tutorial",
			BUTTON_SKIP_TUTORIAL: "Omitir Tutorial",
		};
	}
}

module.exports = OnboardingConfig;
