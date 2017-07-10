import React, { Component } from 'react';

class SideBar extends Component {
  constructor() {
    super();

    this.currentRAF = null;

    this.plgram = {
      tl: [110, 0],
      tr: [223, 0],
      bl: [0, 42],
      br: [110, 42]
    };

    this.xOffsetMax = 110;
  }

  pointsToString(points) {
    return points.map((point) => (point[0]  + ',' + point[1])).join(' ');
  }

  offsetPoint(point) {
    const currentXOffset = this.props.menuScalar * this.xOffsetMax;
    return [point[0] + currentXOffset, point[1]];
  }

  renderParalellogram() {
    const boundOffset = (point) => this.offsetPoint(point);
    const triangles = [
      {
        color: "#0aeeff",
        points: ([
          this.plgram['tl'],
          this.plgram['bl'],
          this.plgram['br']
        ]).map(boundOffset)
      },
      {
        color: "#ffeeff",
        points: ([
          this.plgram['tl'],
          this.plgram['tr'],
          this.plgram['br']
        ]).map(boundOffset)
      },
    ];

    if (this.props.menuScalar > 0) {
      triangles.push({
        color: "#999",
        points: [
          this.plgram['tl'],
          boundOffset(this.plgram['bl']),
          boundOffset(this.plgram['tl']),
        ]
      });
    }

    return triangles.map((triangle) => {
      const pointString = this.pointsToString(triangle.points);
      return (<polygon fill={triangle.color} points={pointString} />);
    });
  }

  render() {
    return (
      <div onClick={this.props.onClick} className='sidebar'>
        <svg id='paralellogo'>
          {this.renderParalellogram()}
        </svg>
      </div>
    );
  }
}

export default SideBar;
