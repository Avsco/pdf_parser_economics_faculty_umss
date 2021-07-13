const DAYS = ["LU", "MA", "MI", "JU", "VI", "SA"];

const isDay = (word) => DAYS.includes(word);

const isFirstWordOFDay = (word) => DAYS.filter((value) => new RegExp(`^${word}`).test(value)).length > 0;

module.exports = {
	DAYS,
	isDay,
	isFirstWordOFDay,
};
