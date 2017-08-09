import React, { Component } from 'react';
import './App.css';

import p5 from 'p5';

const pythagoreanDistance = (pointA, pointB) => {
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
}


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
      this.screenMid = {
        x: width / 2,
        y: height / 2
      };

      for (let i = 0; i < 30; i++) {
        const origin = {
          x: Math.random() * width,
          y: Math.random() * height
        };
        this.circles.push({ origin, x: origin.x, y: origin.y });
      }

      this.circles.forEach((circleA, ai) => {
        this.circles.forEach((circleB, bi) => {
          if (circleA === circleB) return;
          const linekey = [ai, bi].sort().join('_');
          if (this.lines[linekey]) return;

          const dist = pythagoreanDistance(circleA.origin, circleB.origin);

          if (dist < 250) {
            const linekey = [ai, bi].sort().join('_');
            this.lines[linekey] = { circleIndices: [ ai, bi ] };
          }
        });
      });
    };

    p.draw = () => {
      p.background('#231A3A');
      const scaledTime = p.millis() / 1000;

      p.noStroke();
      p.fill('#534C65');
      this.circles.forEach((circle) => {
        const { x, y } = circle.origin;
        const wobX = Math.sin(scaledTime + x) * 10;
        const wobY = Math.cos(scaledTime + y) * 10;
        circle.x = x + wobX;
        circle.y = y + wobY;

        p.ellipse( x + wobX, y + wobY, 20, 20 );
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
