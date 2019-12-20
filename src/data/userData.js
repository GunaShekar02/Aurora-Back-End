const data = [
  [
    'PK-DEV-420',
    {
      isRoot: true,
    },
  ],
  [
    'PK-DEV-786',
    {
      isRoot: true,
    },
  ],
  [
    'AR-PRE-443',
    {
      isRoot: true,
    },
  ],
  [
    'AR-PRE-518',
    {
      isEventAdmin: true,
      eventIds: [1, 2],
    },
  ],
];

const userMap = new Map(data);

module.exports = userMap;
