import React, { Component } from 'react';
import './App.css';

import p5 from 'p5';

const pythagoreanDistance = (pointA, pointB) => {
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
};

const withinRange = (val, rangeA, rangeB) => {
  return (val > rangeA && val < rangeB);
};

class App extends Component {
  componentWillMount() {
  }

  sketch(p) {
    p.setup = () => {
      const { offsetWidth, offsetHeight } = this.refs.appcontainer;
      const width = offsetWidth;
      const height = offsetHeight;

      p.createCanvas(width, height);

      this.circles = [];
      this.lines = [];
      this.circleCount = 100;
      this.dotSize = 3;
      this.idealScreen = 1440;
      this.screenScale = Math.max(width, height) / 1440;
      this.screenMid = {
        x: width / 2,
        y: height / 2
      };

      for (let i = 0; i < this.circleCount; i++) {
        const angle = Math.random() * 360;
        const rads = angle * (Math.PI / 180);
        const distScalar = 1 - Math.pow(i / this.circleCount, 2.2);
        const dist = distScalar * Math.min(this.screenMid.x, this.screenMid.y);
        const origin = {
          x: this.screenMid.x + (Math.cos(rads) * dist),
          y: this.screenMid.y + (Math.sin(rads) * dist)
        };
        this.circles.push({ origin, x: origin.x, y: origin.y, distScalar, angle, links: 0 });
      }

      this.circles.forEach((circleA, ai) => {
        this.circles.forEach((circleB, bi) => {
          if (circleA === circleB) return;
          const linekey = [ai, bi].sort().join('_');
          if (this.lines[linekey]) return;

          const pDist = pythagoreanDistance(circleA.origin, circleB.origin);
          const centerDist = Math.abs(circleA.distScalar - circleB.distScalar);

          const localLink = pDist < (110 * this.screenScale);
          const minCenterDist = 0;
          const maxCenterDist = 0.35;
          const tierLink = withinRange(centerDist,
                                       minCenterDist,
                                       maxCenterDist);
          const angLink = withinRange(circleA.angle,
                                      (circleB.angle - 15) % 360,
                                      (circleB.angle + 15) % 360);

          if (localLink || (tierLink && angLink)) {
            const linekey = [ai, bi].sort().join('_');
            this.lines[linekey] = { circleIndices: [ ai, bi ] };
            this.circles[ai].links += 1;
            this.circles[bi].links += 1;
          }
        });
      });
    };

    p.draw = () => {
      p.background('#231A3A');
      const scaledTime = p.millis() / 2500;

      p.noStroke();
      p.fill('#534C65');
      this.circles.forEach((circle) => {
        const { x, y } = circle.origin;
        const wobX = Math.sin(scaledTime + x) * 10;
        const wobY = Math.cos(scaledTime + y) * 10;
        circle.x = x + wobX;
        circle.y = y + wobY;

        const circleSize = (this.dotSize + (circle.links * 0.8));
        p.ellipse(x + wobX, y + wobY, circleSize, circleSize);
      });

      p.stroke('#534C65');
      Object.keys(this.lines).forEach((linekey) => {
        const line = this.lines[linekey];
        const circleA = this.circles[line.circleIndices[0]];
        const circleB = this.circles[line.circleIndices[1]];

        p.line(circleA.x, circleA.y, circleB.x, circleB.y);
      });
    };
  }

  componentDidMount() {
    this.p5Renderer = new p5((p) => this.sketch(p), this.refs.appcontainer);
  }

  render() {
    return (
      <div ref="appcontainer" className="App">
      </div>
    );
  }
}

export default App;
