const LEVELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const isLevel = (level) => LEVELS.includes(level);

module.exports = {
	LEVELS,
	isLevel,
};
