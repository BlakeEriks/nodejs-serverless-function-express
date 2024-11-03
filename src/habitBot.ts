import { Markup, Scenes, session, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { HABIT_COMMANDS, HABIT_SCENES } from '../src/commands/habits'
import { REMINDER_COMMANDS, REMINDER_SCENES } from '../src/commands/reminders'
import { TIMEZONE_COMMANDS, TIMEZONE_SCENES } from '../src/commands/timezone'
import attachHabits from '../src/middlewares/attachHabits'
import attachUser from '../src/middlewares/attachUser'
import saveMessage from '../src/middlewares/saveMessage'
import { HabitContext } from '../src/types'

const commandGroups = [
  { name: 'Habits', commands: HABIT_COMMANDS },
  { name: 'Reminders', commands: REMINDER_COMMANDS },
  { name: 'Timezone', commands: TIMEZONE_COMMANDS },
]

const availableCommands = commandGroups.map(group => {
  return `${group.name}:\n${group.commands
    .map(({ name, description }) => `  /${name} - ${description}`)
    .join('\n')}`
})

const DEFAULT_MESSAGE = `
🤖 Beep Boop! 

I am the habit tracking bot!
I can help you stay accountable to your habits.

Available commands:

${availableCommands.join('\n\n')}
`

if (!process.env.HABIT_BOT_TOKEN) throw new Error('HABIT_BOT_TOKEN is required')

const habitBot = new Telegraf<HabitContext>(process.env.HABIT_BOT_TOKEN)

const stage = new Scenes.Stage<HabitContext>([
  ...HABIT_SCENES,
  ...REMINDER_SCENES,
  ...TIMEZONE_SCENES,
])

habitBot.use(Telegraf.log())
habitBot.use(session())
habitBot.use(attachUser)
habitBot.use(attachHabits)
habitBot.use(saveMessage)
habitBot.use(stage.middleware())

const allCommands = commandGroups.flatMap(({ commands }) => commands)
for (const { name, action } of allCommands) {
  habitBot.command(name, action as any)
}

// Default
habitBot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE, Markup.removeKeyboard()))

export default habitBot
