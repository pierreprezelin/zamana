const salutation = (hour: number) => {
	if (hour < 5) return "Belle soirée";
	if (hour < 12) return "Belle matinée";
	if (hour < 18) return "Bonjour";
	return "Bonsoir";
};

export const greeting = (hour: number, name: string | null) =>
	`${salutation(hour)}${name ? `, ${name}` : ""} 👋`;
