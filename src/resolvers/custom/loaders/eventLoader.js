const batchEvents = async (ids, db, logger) => {
  logger('fetching eventIds=>', ids);

  const events = await db
    .collection('events')
    .find({ _id: { $in: ids } })
    .toArray();

  const eventMap = new Map();
  events.forEach((event, index) => {
    eventMap.set(event._id, index);
  });

  const sortedEvents = ids.map(id => {
    const eventIndex = eventMap.get(id);
    if (eventIndex === undefined) return null;
    return events[eventIndex];
  });

  return sortedEvents;
};

module.exports = { batchEvents };
