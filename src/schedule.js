'use strict'; 
const request = require('sync-request');
const fs = require('fs');
const cheerio = require('cheerio');
const moment = require('moment');

const faculties = ['Гуманитарного образования', 'Довузовской подготовки', 'Заочного обучения', 
	'Информационных технологий и компьютерных систем', 'Машиностроительный',
	'Нефтехимический', 'Отдел аспирантуры и докторантуры', 'Радиотехнический', 'СПО "Ориентир"',
	'Транспорта, нефти и газа', 'Учебно-методическое управление', 'Художественно-технологический',
	'Экономики и сервисных технологий', 'Экономики и управления', 'Элитного образования и магистратуры',
	'Энергетический'
];
function getGroups(faculty, course) {
	const res = request('POST', `https://omgtu.ru/students/temp/ajax.php?action=get_groups`, {
		headers: {
			'Content-Type': "application/x-www-form-urlencoded"
		},
		body: `filter%5Btype%5D=g&filter%5Bfaculty%5D=${faculty}&filter%5Bcourse%5D=${course}&filter%5BgroupOid%5D=&filter%5BlecturerOid%5D=&filter%5BauditoriumOid%5D=&filter%5BfromDate%5D=&filter%5BtoDate%5D=`
	});
	if (res.statusCode === 200) {
		return JSON.parse(res.getBody()).list;
	}
	return ['Ошибка'];
}

function getSchedule(user, dateFrom, dateTo) {
	const res = request('POST', `https://omgtu.ru/students/temp/ajax.php?action=get_schedule`, {
		headers: {
			'Content-Type': "application/x-www-form-urlencoded"
		},
		body: `filter%5Btype%5D=g&filter%5Bfaculty%5D=&filter%5Bcourse%5D=&filter%5BgroupOid%5D=${user.group}&filter%5BlecturerOid%5D=&filter%5BauditoriumOid%5D=&filter%5BfromDate%5D=${dateFrom}&filter%5BtoDate%5D=${dateTo}`
	});
	if (res.statusCode === 200) {
		var $ = cheerio.load(JSON.parse(res.getBody()).html);
		fs.writeFile('result.html', JSON.parse(res.getBody()).html, err => {});
		let days = $('table');
		let result = [];
		for (let i = 0; i < days.length; ++i) {
			let date = $(days[i]).children('thead').children('tr').children('td').text().replace(/\n */, ' ');
			let pairs = $(days[i]).children('tbody');
			let subjects = [];
			for (let j = 0; j < pairs.length; ++j) {
				let time = $(pairs[j]).children('tr').children('td')[0].children[0].data.replace(/\s\s+|\r?\n|\r/g , ' ').trim();
				console.log(time);
				let subject = $(pairs[j]).children('tr').children('td')[1].children[0].data.replace(/\s\s+|\r?\n|\r/g , ' ').trim();
				let lecturer = $(pairs[j]).children('tr').children('td')[1].children[2].data.replace(/\s\s+|\r?\n|\r/g , ' ').trim();
				let room = $(pairs[j]).children('tr').children('td')[1].children[4].data.replace(/\s\s+|\r?\n|\r/g , ' ').trim();
				let groups = $(pairs[j]).children('tr').children('td')[1].children[6].data.replace(/\s\s+|\r?\n|\r/g , ' ').trim();
				subjects.push({
					time: time,
					subject: subject,
					lecturer: lecturer,
					room: room,
					groups: groups
				})
			}
			result.push({
				date: date,
				subjects: subjects
			});			
		}
		//fs.writeFile('result.json', JSON.stringify(result), err => {});
		return result;
	} 
}

function getPairsToday(user){
	let today = moment().format('DD.MM.YYYY')
	let tomorrow = moment().add(1, 'days').format('DD.MM.YYYY');
	return getSchedule(user, today, tomorrow)[0];
}

function getPairsTomorrow(user){
	let today = moment().add(1, 'days').format('DD.MM.YYYY')
	let tomorrow = moment().add(2, 'days').format('DD.MM.YYYY');
	return getSchedule(user, today, tomorrow)[0];
}
module.exports = {getSchedule, getPairsToday, getPairsTomorrow, faculties, getGroups};