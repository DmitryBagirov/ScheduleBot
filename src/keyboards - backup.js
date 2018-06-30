const buttons = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: 'Настройки расписания', callback_data: JSON.stringify({type: 'buttons', value: 'settings'}) }],
      [{ text: 'Расписание', callback_data: JSON.stringify({type: 'buttons', value: 'schedule'}) }],
    ],
	resize_keyboard: true
  })
};

const settings = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Факультет', callback_data: JSON.stringify({type: 'settings', value: 'faculty'}) }],
      [{ text: 'Курс', callback_data: JSON.stringify({type: 'settings', value: 'course'}) }],
      [{ text: 'Группа', callback_data: JSON.stringify({type: 'settings', value: 'group'}) }],
      [{ text: 'Напоминание', callback_data: JSON.stringify({type: 'settings', value: 'remind'}) }],
      [{ text: 'Назад', callback_data: JSON.stringify({type: 'settings', value: 'buttons'}) }],
    ]
  })
};

const schedule = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Сегодня', callback_data: JSON.stringify({type: 'schedule', value: 'today'}) }],
      [{ text: 'Завтра', callback_data: JSON.stringify({type: 'schedule', value: 'tomorrow'}) }],
      [{ text: 'Неделя', callback_data: JSON.stringify({type: 'schedule', value: 'week'}) }],
      [{ text: 'По дате', callback_data: JSON.stringify({type: 'schedule', value: 'date'}) }],
    ]
  })
};

function makeKeyboard(items, values, type) {
	let result = {};
	let inline_keyboard = [];
	for(let i = 0; i < items.length; ++i) {
		let item = [];
		item.push({
			text: items[i],
			callback_data: JSON.stringify({type: type, value: values[i]})
		});
		inline_keyboard.push(item);
	}
	result.reply_markup = JSON.stringify({
		inline_keyboard: inline_keyboard
	});
	return result;
}

module.exports = {buttons, settings, schedule, makeKeyboard}