export function getExpirationDate(age: number) {
	const now = new Date();
	return new Date(+now + age * 1000);
}
