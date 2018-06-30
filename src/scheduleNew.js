'use strict';
const request = require('sync-request');
const fs = require('fs');
const csv = require('csvtojson');
const moment = require('moment');
const Sync = require('sync');

const faculties = ['Гуманитарного образования', 'Довузовской подготовки', 'Заочного обучения',
	'Информационных технологий и компьютерных систем', 'Машиностроительный',
	'Нефтехимический', 'Отдел аспирантуры и докторантуры', 'Радиотехнический', 'СПО "Ориентир"',
	'Транспорта, нефти и газа', 'Учебно-методическое управление', 'Художественно-технологический',
	'Экономики и сервисных технологий', 'Экономики и управления', 'Элитного образования и магистратуры',
	'Энергетический'
];

class Schedule {

	constructor(group) {
		this.group = group;
		this.update()
	}

	update() {
		let today = moment().format('DD.MM.YYYY');
		let tomorrow = moment().add(1, 'days').format('DD.MM.YYYY');
		let afterTomorrow = moment().add(2, 'days').format('DD.MM.YYYY');
		this.lastUpdate = today;
		this.todaySchedule = this.getSchedule(today, tomorrow);
		this.tomorrowSchedule = this.getSchedule(tomorrow, afterTomorrow);
		this.week = this.getSchedule('', '');
		console.log(this.week);
	}

	getGroups(faculty, course) {

	}
	
	getSchedule(dateFrom, dateTo) {
		const res = request('POST', `https://www.omgtu.ru/students/temp/csv.php`, {
			headers: {
				'Content-Type': "application/x-www-form-urlencoded"
			},
			body: `filter%5Btype%5D=g&filter%5Bfaculty%5D=&filter%5Bcourse%5D=&filter%5BgroupOid%5D=${this.group}&filter%5BlecturerOid%5D=&filter%5BauditoriumOid%5D=&filter%5BfromDate%5D=${dateFrom}&filter%5BtoDate%5D=${dateTo}`
		});
		if (res.statusCode === 200) {
			Sync(function(){
				let body = csv().fromString(res.getBody().toString('UTF-8')).then(result => {return result}).sync();
				body.then(result => {
					console.log(result);
				})
			});
			let body = csv().fromString(res.getBody().toString('UTF-8'));
			return body;
		/*	csv()
			.fromString(res.getBody().toString('UTF-8'))
			.then((jsonObj)=>{
				console.log(jsonObj);
			})
		*/
			//let body=await csv().fromString(res.getBody());
			//console.log(body);
		/*	subjects.push({
				time: time,
				subject: subject,
				lecturer: lecturer,
				room: room,
				groups: groups,
				date: date,
				subjects: subjects
			}) */
			//console.log(result);
			//fs.writeFile('result.json', JSON.stringify(result), err => {});
			//return result;
		}
		
	}

	getPairsToday(user) {

	}

	getPairsTomorrow(user) {

	}
}

module.exports = {Schedule, faculties};