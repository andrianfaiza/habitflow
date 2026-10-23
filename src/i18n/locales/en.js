// English translation dictionary.
// Keys are grouped by feature so additional locales can mirror the structure.
// Placeholders written as {name} are replaced with the values passed to t().
export default {
  tasks: {
    groups: {
      overdue: 'Overdue',
      today: 'Today',
      upcoming: 'Upcoming',
    },
    groupCount: {
      overdue: '{count} overdue task(s)',
      today: '{count} task(s) due today',
      upcoming: '{count} upcoming task(s)',
    },
    badge: {
      overdue: 'Overdue',
      completed: 'Completed',
    },
    emptyGroup: {
      today: 'Nothing scheduled for today.',
    },
    empty: {
      title: 'No tasks today',
      description: 'Create your first task to make your day more organized!',
      singleDateTitle: 'No tasks on this date',
      singleDateDescription: 'Pick another date or add a new task for this date.',
    },
  },
}
