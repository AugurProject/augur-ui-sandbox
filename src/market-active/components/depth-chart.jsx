import React from 'react';
import Highcharts from 'highcharts/highstock';

export default class OrderBookDepthChart extends React.Component {
  constructor(props) {
    super(props);
    this.updateChart = this.updateChart.bind(this);
    this.calcSideData = this.calcSideData.bind(this);
    this.uglyIlliquidOrderBook = {
      bids: [
        [.02, 200],
        [.40, 10],
        [.43, 10],
        [.44, 150]
      ],
      asks: [
        [.995, 100],
        [.99, 100],
        [.45, 10],
        [.445, 10],
      ]
    };
    this.orderBookTwo = {
      bids: [
        [.02, 200],
        [.02, 200],
        [.02, 200],
        [.02, 200],
        [.02, 200],
        [.05, 20],
        [.10, 120],
        [.43, 150],
        [.44, 150]
      ],
      asks: [
        [.995, 1000],
        [.898, 1000],
        [.895, 1000],
        [.89, 1000],
        [.88, 1000],
        [.87, 1000],
        [.64, 10],
        [.62, 100],
        [.445, 100]
      ]
    };
    this.state = {
      orderBook: this.orderBookOne
    };
  }

  componentDidMount() {
//      noData(Highcharts); TODO when back in augur UI repo
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });

    this.depthChart = new Highcharts.Chart('depth_chart', {
      chart: {
        backgroundColor: '#2d2846',
        height: 350,
        width: 350,
        type: 'bar',
      },
      title: {
//          TODO title; probably as mid point
      },
      lang: {
        thousandsSep: ',',
        noData: 'No orders to display'
      },
      xAxis: {
        title: {
          text: ''
        },
        max: 1,
        tickWidth: 0,
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
        crosshair: {
//          width: 3,
          dashStyle: 'dash',
          width: 1,
          color: 'white',
          zIndex: 22
        }
      },
      yAxis: {
        title: {
          text: ''
        },
        min: 0, // can't do anything with less than 0 shares
        showLastLabel: true,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        labels: {
          align: 'bottom',
          verticalAlign: 'bottom'
        },
        crosshair: {
//          width: 3,
          dashStyle: 'dash',
          width: 1,
          color: 'white',
          zIndex: 22
        }
      },
      series: [
        {
          showInLegend: false,
          name: '',
          type: 'area',
          color: '#7257a3',
          lineWidth: 3,
          threshold: null,
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 1,
              x2: 0,
              y2: 0
            },
            stops: [
              [0, '#2d2846'],
              [1, '#3c2d63']
            ]
          },
        },
        {
          showInLegend: false,
          name: '', // TODO correct thing to display?  Needs to be same as series[0]
          type: 'area',
          color: '#7257a3',
          lineWidth: 3,
          threshold: null,
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 1,
              x2: 0,
              y2: 0
            },
            stops: [
              [0, '#2d2846'],
              [1, '#3c2d63']
            ]
          },
        }
      ],
      tooltip: {
//          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} Shares Available <br />@ {point.x} ETH</b><br/>',
        valueSuffix: '',
        formatter: function () {
          return this.point.y + " Shares Available @" + this.point.x + "ETH";
        },
        valueDecimals: 2,
        positioner: function () {
          return { x: 180, y: 130 };
        },
        shadow: false,
        borderWidth: 0,
        backgroundColor: 'rgba(255,255,255,0.4)'
      },
      credits: {
        enabled: false
      }
    });

    setInterval(function () {
      const orderBook = this.genRandomOrderBook();
      console.log(`Rerendering chart with ${orderBook.asks.length + orderBook.bids.length} total orders`);
      this.setState({ orderBook: orderBook });
      this.updateChart();
    }.bind(this), 3000);

  }

  genRandomOrderBook() {

    const maxBid = (Math.random() * (.85 - .001) + 0.001);

    const bids = [];
    const asks = [];
    let price = 0.0001;
    let askPrice = maxBid + Math.random() * (0.01 - 0.0001) + 0.0001;
    while (price < maxBid && askPrice < 1) {
      price = price + Math.random() * (0.01 - 0.001) + 0.001;
      const numShares = Math.round(Math.random() * (100 - 5) + 5);
      const bid = [price, numShares];
      bids.push(bid);

      askPrice = askPrice + Math.random() * (0.01 - 0.0002) + 0.0002;
      const askShares = Math.round(Math.random() * (100 - 5) + 5);
      const ask = [askPrice, askShares];
      asks.push(ask);
    }

    return { bids: bids, asks: asks };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.orderBookSeries !== this.props.orderBookSeries) this.updateChart();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateChart);
  }

  calcSideData(sideSeries, side) {
    if (side === 'asks') {
      sideSeries.sort(function (a, b) {
        return a[0] - b[0];
      });
    }
    else {
      sideSeries.sort(function (a, b) {
        return b[0] - a[0];
      });
    }
    const data = [];
    const firstShares = sideSeries[0][1];
    const firstPrice = sideSeries[0][0];
    data.push([firstPrice, firstShares]); // so we have the first cumulative numShares

    for (let i = 1; i < sideSeries.length; i++) {
      const order = [];
      const price = sideSeries[i][0];
      order.push(price);
      const currentShares = sideSeries[i][1];
      const currentCumShares = currentShares + data[i - 1][1];
      order.push(currentCumShares);
      data.push(order);
    }

    return data;
  }

  getMidPoint(bids, asks) {
    const maxBid = bids[bids.length - 1][0];
    const minAsk = asks[asks.length - 1][0];
    return maxBid + ((minAsk - maxBid) / 2);
  }

  updateChart() {
    const bidData = this.state.orderBook.bids;
    const askData = this.state.orderBook.asks;

    const bidSeries = this.calcSideData(bidData, 'bids');
    const askSeries = this.calcSideData(askData, 'asks');

    const midPoint = this.getMidPoint(bidSeries, askSeries);
    this.depthChart.setTitle({ text: midPoint });
    this.depthChart.series[0].setData(askSeries, true);
    this.depthChart.series[1].setData(bidSeries, true);

    this.depthChart.redraw();
  }

  render() {
    const p = this.props;

    return (
      <article className="order-book-chart">
        <div
          id="depth_chart"
        />
      </article>
    );
  }
}
