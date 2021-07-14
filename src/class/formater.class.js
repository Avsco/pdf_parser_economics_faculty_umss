const { isFirstWordOFDay, isDay } = require("../enums/days.enum");
const { isLevel } = require("../enums/levels.enums");

class FormaterEcoPDF {
	constructor() {
		this.pageFormatter = new PageFormatter();
		this.builderDataStructure = new BuilderDataStructure();
	}

	formatPDF(pdfData) {
		let data = this.pageFormatter.formatAllPages(pdfData);
		data = this.#recoverBrokenData(data);
		return this.builderDataStructure.buildDataStructure(data);
	}

	#recoverBrokenData(data) {
		for (let i = 0; i < data.length; i++) {
			if (data[i].length === 1 && isFirstWordOFDay(data[i])) {
				data[i] += data.splice(i + 1, 1)[0];
			} else if (data[i] === "[AUX]" || data[i] === "E ") {
				data[i] = (data[i] + data.splice(i + 1, 1)[0]).trim();
			} else if (isDay(data[i - 1]) && data[i].length != 13) {
				while (data[i].length < 13) {
					data[i] += data.splice(i + 1, 1)[0];
				}
			} else if (data[i].length === 1 && !isNaN(data[i])) {
				data[i - 1] += data.splice(i, 1)[0];
			}
		}
		for (let i = 0; i < data.length; i++) {
			if (data[i].length === 3) {
				data[i] = data[i].trim();
			} else if (/\s$/.test(data[i])) {
				data[i] += data.splice(i + 1, 1)[0];
			}
		}
		for (let i = 0; i < data.length; i++) {
			if (/^POR DESIGNAR/.test(data[i])) {
				const [, , day] = data[i].split(" ");
				data.splice(i, 1, data[i].slice(0, 12), day);
			}
		}

		return data;
	}
}

class PageFormatter {
	#formatPageData(pageData) {
		pageData = this.#removeHeaderData(pageData.Texts);
		pageData = this.#removeFooterData(pageData);
		return pageData.map((value) => decodeURIComponent(value.R[0].T));
	}

	formatAllPages(pdfData) {
		const pages = [];
		const keys = [];
		pdfData.formImage.Pages.forEach((pageData) => {
			const page = this.#formatPageData(pageData);
			if (!keys.includes(page[1] + page[5] + page[10])) {
				pages.push(...page);
				keys.push(page[1] + page[5] + page[10]);
			}
		});
		return pages;
	}

	#removeHeaderData = (data) => data.slice(7, data.length);

	#removeFooterData = (data) => data.slice(0, data.length - 8);
}

class BuilderDataStructure {
	buildDataStructure(data) {
		data = this.#separateByLevels(data);
		data = this.#separeteSubjects(data);
		return this.#separateGroups(data);
	}

	#separateGroups(data) {
		let groupsKeys = {};
		let groups = [];

		data.levels.forEach((level) => {
			level.subjects.forEach((subject) => {
				for (let i = 0; i < subject.groups.length; i += 5) {
					if (groupsKeys[subject.groups[i]] !== undefined) {
						groups[groups.length - 1].schedule.push(
							this.#transformSchedules(subject.groups.slice(i + 1, i + 5))
						);
					} else {
						groupsKeys[subject.groups[i]] = i;
						groups.push({
							code: subject.groups[i],
							schedule: [this.#transformSchedules(subject.groups.slice(i + 1, i + 5))],
						});
					}
				}
				subject.groups = groups;
				groupsKeys = {};
				groups = [];
			});
		});
		return data;
	}

	#transformSchedules([teacher, day, hours, room]) {
		return {
			day,
			start: hours.slice(0, 5),
			end: hours.slice(8),
			duration: 2,
			room,
			teacher: /\[AUX\]/.test(teacher) ? teacher.slice(5) : teacher,
			isClass: !/\[AUX\]/.test(teacher),
		};
	}

	#separeteSubjects(data) {
		data.levels.forEach((level) => {
			const indexOfSubjects = this.#getIndexSubjects(level);
			level.subjects = indexOfSubjects.map((value, index, array) => ({
				code: level.subjects[value].slice(0, 7),
				name: level.subjects[value].slice(8, level.subjects[value].length),
				groups: level.subjects.slice(value + 1, array[index + 1] ? array[index + 1] : level.subjects.length),
			}));
		});

		return data;
	}

	#separateByLevels(data) {
		const indexLevels = this.#getIndexLevels(data);

		return {
			levels: indexLevels.map((value, index, array) => ({
				code: data.slice(value, value + 1)[0],
				subjects: data.slice(value + 1, array[index + 1] ? array[index + 1] : data.length),
			})),
		};
	}

	#getIndexSubjects(level) {
		const subjects = {};

		level.subjects.forEach((value, index) => {
			if (/^130/.test(value) || /^180/.test(value)) {
				subjects[value] = index;
			}
		});

		return Object.values(subjects);
	}

	#getIndexLevels(data) {
		const levels = {};

		for (let i = 0; i < data.length; i++) {
			if (!isLevel(data[i])) continue;
			if (levels[data[i]] !== undefined) {
				data.splice(i, 1);
				i--;
				continue;
			}
			levels[data[i]] = i;
		}

		return Object.values(levels);
	}
}

module.exports = FormaterEcoPDF;
