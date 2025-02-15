// data.js
export const dataset = {
    xAxis: [
      {
        scaleType: 'band',
        data: [
          'Jan-24',
          'Feb-24',
          'Mar-24',
          'Apr-24',
          'May-24',
          'Jun-24',
          'Jul-24',
          'Aug-24',
          'Sep-24',
          'Oct-24',
          'Nov-24',
          'Dec-24',
        ],
        categoryGapRatio: 0.2,
        barGapRatio: 0.1,
      },
    ],
    series: [
      {
        label: 'Total Bookings',
        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000)),
      },
      {
        label: 'Delivered',
        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 900)),
        stack: 'a'
      },
      {
        label: 'In Transit',
        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
        stack: 'a'
      },
      {
        label: 'Pending',
        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 300)),
        stack: 'a'
      },
    ],
  };
  
  dataset.series[0].data = dataset.series.slice(1).reduce((acc, curr) => {
    return acc.map((val, i) => val + curr.data[i]);
  }, new Array(12).fill(0));