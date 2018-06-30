const Schedule = require('./src/schedule');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const Context = require('./src/context');

//const s = new (require('./src/scheduleNew').Schedule)(2052);
//console.log(s);
//let login = "gena";
//console.log(`"${login}"`);
//return;
//process.env.http_proxy=""
//process.env.https_proxy="https://[anonymouse]:[]y5zqo9oz.cpt.vs-net-2.us"

let token = '433527533:AAFV198fxQbN7sp7n3l46jead4-Um0hcY5Y';


let bot = new TelegramBot(token, {
	polling: false,
	request: {
		proxy: 'http://127.0.0.1:80'
	},
});

let context = new Context(bot);

bot.startPolling().then(() => {
	console.log('Connected!');
	//nextPairReminder();
	//setInterval(nextPairReminder, 60000);
});

function nextPairReminder() {
	for(let id in users) {
		if(users[id].remind) {
			let time = moment().add(users[id].timeAdvance, 'minutes').format('HH:mm');
			let times = Schedule.getPairsToday(users[id]);
			let firstPair = times.subjects[0].time.split(" - ")[0];
			//console.log(time);// надо по другому
			if (time === firstPair) {
				let nextPair = times.subjects[0];
				console.log(`${users[id].name} ${nextPair.subject}`);
				bot.sendMessage(id, `Следующая пара в ${nextPair.time.split(" - ")[0]}\n${nextPair.subject}\n${nextPair.lecturer}\n${nextPair.room}	`);
				return;
			}
			for(let i = 1; i < times.subjects.length; ++i) {
				let nextPairTime = times.subjects[i].time.split(" - ")[0];// начало следующей
				let nextPair = times.subjects[i];//следующая пара
				if (nextPairTime === time) {
					console.log(`${users[id].name} ${nextPair.subject}`);
					bot.sendMessage(id, `Следующая пара в ${nextPair.time.split(" - ")[0]}\n${nextPair.subject}\n${nextPair.lecturer}\n${nextPair.room}	`);
					//return;
				} 
			}
		}
	}
}

bot.on('callback_query', function (msg) {
	let data = JSON.parse(msg.data);
	let id = msg.from.id;
	bot.answerCallbackQuery(msg.id, '', false);
	console.log(data);
	context.execute(msg);
});

bot.onText(/Настройки расписания/, (msg) => {
	context.execute(msg, 'settings');
})

bot.onText(/Расписание/, (msg) => {
	context.execute(msg, 'schedule');
})

bot.onText(/\/start/, (msg) => {
	let id = msg.from.id;
	if(users[id]) {
		bot.sendMessage(id, `Привет ${users[id].name}! Чем займемся?`, keyboards.buttons);
		return
	}
	users[id] = ({
		name: msg.from.first_name || msg.from.username
	});
	saveUsers('users.json');
	bot.sendMessage(id, `Привет ${users[id].name}! Чем займемся?`, keyboards.buttons);
});

