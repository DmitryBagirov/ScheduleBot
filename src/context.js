const Schedule = require('./schedule');
const keyboards = require('./keyboards');
const moment = require('moment');
const fs = require('fs');

class Context {
	
	constructor(bot) {
		this.bot = bot;
		this.users = this.loadUsers('./users.json');
		this.currentState = 'menu';
		this.map = {};
		this.map.menu = {};
		this.map.settings = {};
		this.map.schedule = {};
		this.map.menu['settings'] = this.menuSettings;
		this.map.menu['schedule'] = this.menuSchedule;
		this.map.settings['faculty'] = this.settingsFaculty;
		this.map.settings['course'] = this.settingsCourse;
		this.map.settings['group'] = this.settingsGroup;
		this.map.settings['remind'] = this.settingsRemind;
		this.map.faculty = this.setFaculty;
		this.map.course = this.setCourse;
		this.map.group = this.setGroup;
		this.map.remind = this.setRemind;
		this.map.schedule['today'] = this.scheduleToday;
		this.map.schedule['tomorrow'] = this.scheduleTomorrow;
		this.map.schedule['week'] = this.scheduleWeek;
		this.map.schedule['date'] = this.scheduleDate;
	}
	
	getAction(msg) {
		try {
			let result = JSON.parse(msg.data);
			if ('action' in result) {
				return result.action
			}else {
				return null	
			}
		}catch(SyntaxError) {
			return msg.data
		}
	}
	
	execute(msg, action) {
		this.msg = msg;
		action = action || this.getAction(msg);

		if (this.currentState in this.map) {
			if (action != null && action in this.map[this.currentState]) {
				this.currentState = this.map[this.currentState][action](this, action);
			} else if (typeof this.map[this.currentState] === 'function'){
				this.currentState = this.map[this.currentState](this, action);
			} else {
				this.currentState = 'menu';
				return false;
				// throw 
			}
		} 
		console.log(this.currentState);
	}
	




	//деействия на состояния
	menuSettings(inst) { 
		// Почему this перестал указывать на экземпляр класса
		inst.bot.sendMessage(inst.msg.from.id, `Что будем настраивать?`, keyboards.settings);
		return 'settings';
	}

	menuSchedule(inst) { 
		inst.bot.sendMessage(inst.msg.from.id, `На какой период?`, keyboards.schedule);
		return 'schedule';
	}

	settingsFaculty(inst) { 
		let values = [];
		for(let i = 0; i < Schedule.faculties.length; ++i) {
			values.push(i);
		}
		inst.bot.sendMessage(inst.msg.from.id, `Какой у тебя факультет?`, keyboards.makeKeyboard(Schedule.faculties, values));
		return 'faculty';
	}

	settingsCourse(inst) {
		console.log('Настройка Курса');
		inst.bot.sendMessage(inst.msg.from.id, `На каком ты курсе?`, keyboards.makeKeyboard([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]));
		return 'course';
	}

	settingsGroup(inst) {
		let user = inst.users[inst.msg.from.id];
		if (!user.faculty) {
			let values = [];
			for(let i = 0; i < Schedule.faculties.length; ++i) {
				values.push(i);
			}
			inst.bot.sendMessage(inst.msg.from.id, `Для начала давай узнаем на каком ты факультете?`, keyboards.makeKeyboard(Schedule.faculties, values));
			return;
		}
		if (!user.course) {
			inst.bot.sendMessage(inst.msg.from.id, `А на каком ты курсе?`, keyboards.makeKeyboard([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]));
			return;
		}
		let groups = Schedule.getGroups(user.faculty, user.course);
		let keys = [];
		let	values = [];
		for(let i = 0; i < groups.length; ++i) {
			keys.push(groups[i].number);
			values.push(groups[i].groupOid);
		}
		inst.bot.sendMessage(inst.msg.from.id, `В какой ты группе?`, keyboards.makeKeyboard(keys, values));
		return 'group';
	}
	
	settingsRemind(inst) {
		inst.bot.sendMessage(inst.msg.from.id, `Вы хотите включить напоминание следующей пары?`, keyboards.makeKeyboard(['Включить', 'Выключить'], [1, 0], 'remind'));
		return 'remind';
	}
	
	setRemind(inst, remind) {
		inst.editUser(inst, inst.msg.from.id, 'remind', remind);
		inst.bot.sendMessage(inst.msg.from.id, remind ? 'Напоминание включено' : 'Напоминание выключено', keyboards.settings);
		return 'settings';
	}

	setFaculty(inst, faculty) {
		inst.editUser(inst, inst.msg.from.id, 'faculty', Schedule.faculties[faculty]);
		inst.bot.sendMessage(inst.msg.from.id, `Принято! Что дальше?`, keyboards.settings);
		return 'settings';
	}

	setCourse(inst, course) {
		inst.editUser(inst, inst.msg.from.id, 'course', course);
		inst.bot.sendMessage(inst.msg.from.id, `Принято! Что дальше?`, keyboards.settings);
		return 'settings';
	}
	
	setGroup(inst, group) {
		inst.editUser(inst, inst.msg.from.id, 'group', group);
		inst.bot.sendMessage(inst.msg.from.id, `Ок! Дальше что?`, keyboards.settings);
		return 'settings';
	}

	scheduleToday(inst) { 
		let pairs = Schedule.getPairsToday(inst.users[id]);
		let result = '';
		for(let i = 0; i < pairs.subjects.length; ++i) {
			let p = pairs.subjects[i];
			result += `${p.time}\n${p.subject}\n${p.lecturer}\n${p.room}\n\n` ;
		}
		let string = `Сегодня ${pairs.date}:\n\n${result}`;
		//inst.bot.sendMessage(inst.msg.from.id, string, keyboards.buttons);
		return 'menu';
	}

	scheduleTomorrow(inst) {
		let pairs = Schedule.getPairsTomorrow(users[id]);
		let result = '';
		for(let i = 0; i < pairs.subjects.length; ++i) {
			let p = pairs.subjects[i];
			result += `${p.time}\n${p.subject}\n${p.lecturer}\n${p.room}\n\n` ;
		}
		let string = `Завтра ${pairs.date}:\n\n${result}`;
		//inst.bot.sendMessage(inst.msg.from.id, string, keyboards.buttons);
		return 'menu';
	}

	scheduleWeek(inst) { 
		console.log('Расписание на неделю');
		return 'menu';
	}

	scheduleDate(inst) {
		console.log('Расписание по дате');
		return 'scheduleDate';
	}
	
	//вспомогательные функции	
	editUser(inst, id, key, value) {
		inst.users[id][key] = value;
		inst.saveUsers(inst, './users.json');
	}
	
	loadUsers(fName) {
		let result = fs.readFileSync(fName, {flag: 'a+'});
		if (result.length > 0) {
			return JSON.parse(result);
		}
		return {};
	}

	saveUsers(inst, fName) {
		fs.writeFile(fName, JSON.stringify(inst.users), (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
}
module.exports = Context;