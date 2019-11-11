const batchEvents = async (ids, db) => {
  const events = await db
    .collection('events')
    .find({ _id: { $in: ids } })
    .toArray();
  return events;
};

module.exports = { batchEvents };
