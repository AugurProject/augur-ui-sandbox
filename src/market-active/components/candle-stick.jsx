import React from 'react';
import Highcharts from 'highcharts/highstock';

// TODO write tickPositioner() that will dynamically mark gridlines (a la IDEO's .2,.5,.8) based upon market type and scalar-min-max prices
// TODO Discuss navigator which seems to be nonoptional, maybe because data at default rangeSelected don't get rendered?
// TODO Update orderBook to have at least binary market representative data/prices
// TODO Final design colors

//  import noData from 'highcharts/modules/no-data-to-display';
export default class CandleStickChart extends React.Component {
  constructor(props) {
    super(props);
    this.getVolumeFromOrderBook = this.getVolumeFromOrderBook.bind(this);
  }

  componentDidMount() {
//      noData(Highcharts); when back in augur UI repo
    this.candleStickChart = new Highcharts.stockChart('candlestick_chart', {
      chart: {
        borderWidth: 0,
        backgroundColor: '#2d2846',
        width: 700,
        height: 500
      },
      rangeSelector: {
        enabled: false
      },
      buttonTheme: {
        visibility: 'hidden'
      },
      labelStyle: {
        visibility: 'hidden'
      },
      lang: {
        noData: 'No Chart Data',
      },
      title: {
        text: ''
      },
      plotOptions: {
        candlestick: {
          dataLabels: {
            enabled: false
          }
        }
      },
      xAxis: {
        lineWidth: 0,
        tickWidth: 0
      },
      yAxis: [{
        opposite: false,  // place labels on left y-axis
        labels: {
          y: 4  // this seems necessary to align labels with gridlines
        },
        lineWidth: 0,
        gridLineColor: '#625e73',
        gridLineWidth: 2,
        tickInterval: 10
      }, {
        // second y-axis: grey volume columns
        labels: {
          align: 'right'
        },
        top: '80%',
        borderRadius: 3,
        height: '20%',
        offset: 0,
        lineWidth: 2,
        minorGridLineWidth: 0,
        gridLineWidth: 0,
        lineColor: 'transparent'
      }],
      series: [{
        type: 'candlestick',
        name: 'Pricing Data',
        maxPointWidth: 3,
        color: '#ef5134',
        lineColor: '#ef5134',
        upColor: '#67eec6',
        upLineColor: '#67eec6',
      }, {
        type: 'column',
        name: 'Volume',
        color: '#615d73',
        pointWidth: 4,
        yAxis: 1,
        gridLineWidth:0,
        borderRadius: 2
      }]
    });

    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.orderBook !== this.props.orderBook) this.updateChart();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateChart);
    this.chart.destroy();
  }

  getVolumeFromOrderBook(orderBook) {

    const volumeData = [];
    for (let i = 0; i < orderBook.length; i++) {
      const volumeForDate = [];
      volumeForDate.push(orderBook[i][0], orderBook[i][5]);
      volumeData.push(volumeForDate);
    }
    return volumeData;
  }

  updateChart() {
    this.candleStickChart.series[0].setData(this.props.orderBook, false);
    const volumeData = this.getVolumeFromOrderBook(this.props.orderBook);
    this.candleStickChart.series[1].setData(volumeData, false);
    this.candleStickChart.redraw();
  }

  render() {
    const p = this.props;

    return (
      <article
        className="order-book-chart"
      >
        <span
          id="candlestick_chart"
        />
      </article>
    );
  }
}
