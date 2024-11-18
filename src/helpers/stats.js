const excludedDateFilter = {
  $and: [
    {
      datePurchased: {
        $not: {
          $gte: new Date("2021-03-14T00:00:00.000Z"),
          $lt: new Date("2021-03-15T00:00:00.000Z"),
        },
      },
    },
    {
      datePurchased: {
        $not: {
          $gte: new Date("2021-09-27T00:00:00.000Z"),
          $lt: new Date("2021-09-28T00:00:00.000Z"),
        },
      },
    },
  ],
};

export const averageMonthlySpend = () => [
  {
    $match: {
      ...excludedDateFilter, // Spread the excludedDateFilter to apply it
    },
  },
  {
    $group: {
      _id: {
        year: { $year: "$datePurchased" },
        month: { $month: "$datePurchased" },
      },
      totalSpend: { $sum: "$price" },
    },
  },
  {
    $group: {
      _id: null,
      avgMonthlySpend: { $avg: "$totalSpend" },
    },
  },
  {
    $project: {
      _id: 0,
      avgMonthlySpend: {
        $round: [{ $divide: ["$avgMonthlySpend", 100.0] }, 2],
      },
    },
  },
];

export const bestMonth = () => [
  {
    $match: {
      ...excludedDateFilter, // Spread the excludedDateFilter to apply it
    },
  },
  {
    $group: {
      _id: {
        year: { $year: "$datePurchased" },
        month: { $month: "$datePurchased" },
      },
      totalSpend: { $sum: "$price" },
    },
  },
  {
    $sort: { totalSpend: -1 },
  },
  {
    $limit: 1,
  },
  {
    $project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      totalSpend: { $round: [{ $divide: ["$totalSpend", 100.0] }, 2] }, // Amount spent for the best month
    },
  },
];

export const averageYearlySpend = () => [
  {
    $match: {
      $expr: { $ne: [{ $year: "$datePurchased" }, 2021] }, // Exclude 2021
    },
  },
  {
    $group: {
      _id: { year: { $year: "$datePurchased" } },
      totalSpend: { $sum: "$price" },
    },
  },
  {
    $group: {
      _id: null,
      avgYearlySpend: { $avg: "$totalSpend" },
    },
  },
  {
    $project: {
      _id: 0,
      avgYearlySpend: {
        $round: [{ $divide: ["$avgYearlySpend", 100.0] }, 2],
      },
    },
  },
];

export const bestYear = () => [
  {
    $match: {
      $expr: { $ne: [{ $year: "$datePurchased" }, 2021] }, // Exclude 2021
    },
  },
  {
    $group: {
      _id: { year: { $year: "$datePurchased" } },
      totalSpend: { $sum: "$price" },
    },
  },
  {
    $sort: { totalSpend: -1 },
  },
  {
    $limit: 1,
  },
  {
    $project: {
      _id: 0,
      year: "$_id.year",
      totalSpend: { $round: [{ $divide: ["$totalSpend", 100.0] }, 2] }, // Amount spent for the best year
    },
  },
];

export const averageDailySpend = () => [
  {
    $match: {
      ...excludedDateFilter, // Spread the excludedDateFilter to apply it
    },
  },
  {
    $group: {
      _id: {
        day: { $dayOfYear: "$datePurchased" },
        year: { $year: "$datePurchased" },
      },
      totalSpend: { $sum: "$price" },
    },
  },
  {
    $group: {
      _id: null,
      avgDailySpend: { $avg: "$totalSpend" },
    },
  },
  {
    $project: {
      _id: 0,
      avgDailySpend: {
        $round: [{ $divide: ["$avgDailySpend", 100.0] }, 2],
      },
    },
  },
];

export const bestDay = () => [
  {
    $match: {
      ...excludedDateFilter, // Spread the excludedDateFilter to apply it
    },
  },
  {
    $group: {
      _id: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$datePurchased" } },
      },
      totalSpend: { $sum: "$price" },
    },
  },
  {
    $sort: { totalSpend: -1 },
  },
  {
    $limit: 1,
  },
  {
    $project: {
      _id: 0,
      date: "$_id.date",
      totalSpend: { $round: [{ $divide: ["$totalSpend", 100.0] }, 2] }, // Amount spent for the best day
    },
  },
];
