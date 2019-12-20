const data = [
  [
    'PK-DEV-421',
    {
      isEventAdmin: true,
      eventIds: [1, 2, 3, 4, 23, 25, 26, 27, 28, 29],
    },
  ],
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
