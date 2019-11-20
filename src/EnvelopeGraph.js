// @format
// Source taken from: https://github.com/gerardabello/adsr-envelope-graph
// Author: Gerard Abelló Serras
// Adjusted by Tim Daubenschütz to make the phases of the graph draggable.
import React from "react";
import PropTypes from "prop-types";

const styles = {
  line: {
    fill: "none",
    stroke: "rgb(221, 226, 232)",
    strokeWidth: "2"
  },
  timeline: {
    fill: "none",
    stroke: "#354550",
    strokeWidth: "1"
  },
  phaseline: {
    fill: "none",
    stroke: "rgb(70, 94, 111)",
    strokeWidth: "1",
    stroke: "rgb(221, 226, 232)",
    strokeDasharray: "5,5"
  },
  background: {
    fill: "rgb(40, 56, 68)"
  }
};

// NOTE: Since the width of xs depends on how long the user holds a key,
// we simply choose a constant here.
const XS = 0.9;
const emToPx = 14;

class EnvelopeGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      a: props.a,
      // NOTE: Dragging a in x direction is currently not implemented.
      ax: props.ax,
      d: props.d,
      s: props.s,
      r: props.r,
      drag: null
    };
  }
  /**
   * Returns the width of each phase
   */
  getPhaseLengths() {
    const { a, d, r } = this.state;
    const { width } = this.props;

    // NOTE: We're subtracting 1/4 of the width to reserve space for release.
    const absoluteS = width - a - d - (1 / 4) * width;

    return [a, d, absoluteS, r];
  }

  /**
   * Returns a string to be used as 'd' attribute on an svg path that resembles
   * an envelope shape given its parameters
   * @return {String}
   */
  generatePath() {
    const { s, ax } = this.state;
    const { height } = this.props;
    const [
      attackWidth,
      decayWidth,
      sustainWidth,
      releaseWidth
    ] = this.getPhaseLengths();

    let strokes = [];
    strokes.push("M 0 " + height);
    strokes.push(this.exponentialStrokeTo(attackWidth, -height));
    strokes.push(this.exponentialStrokeTo(decayWidth, height * (1 - s)));
    strokes.push(this.linearStrokeTo(sustainWidth, 0));
    strokes.push(this.exponentialStrokeTo(releaseWidth, height * s));

    return strokes.join(" ");
  }

  /**
   * Constructs a command for an svg path that resembles an exponential curve
   * @param {Number} dx
   * @param {Number} dy
   * @return {String} command
   */
  exponentialStrokeTo(dx, dy) {
    return ["c", dx / 5, dy / 2, dx / 2, dy, dx, dy].join(" ");
  }

  /**
   * Constructs a line command for an svg path
   * @param {Number} dx
   * @param {Number} dy
   * @return {String} command
   */
  linearStrokeTo(dx, dy) {
    return `l ${dx} ${dy}`;
  }

  render() {
    const {
      height,
      width,
      phaseLines,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft
    } = this.props;
    const { drag } = this.state;

    const h = height + marginTop + marginBottom;
    const w = width + marginLeft + marginRight;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={this.props.style}>
        <rect
          width={w}
          height={h}
          style={Object.assign({}, styles.background, {
            cursor: drag ? "none" : null
          })}
          onMouseMove={drag ? this.moveDnDRect(drag) : null}
          onMouseUp={() => this.setState({ drag: null })}
          onDragStart={() => false}
        />
        <path
          transform={`translate(${marginLeft}, ${marginTop})`}
          d={this.generatePath()}
          style={Object.assign({}, styles.line, this.props.lineStyle)}
          vectorEffect="non-scaling-stroke"
        />
        {this.renderDnDRect("attack")}
        {this.renderDnDRect("decaysustain")}
        {this.renderDnDRect("release")}
      </svg>
    );
  }

  renderDnDRect(type) {
    const [
      attackWidth,
      decayWidth,
      sustainWidth,
      releaseWidth
    ] = this.getPhaseLengths();
    const {
      height,
      phaseLines,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft
    } = this.props;
    const { s, drag } = this.state;

    const rHeight = 0.75;
    const rWidth = 0.75;

    let x, y;
    if (type === "attack") {
      x = marginLeft + attackWidth - rWidth / 2;
      y = marginTop - rHeight / 2;
    } else if (type === "decaysustain") {
      x = marginLeft + attackWidth + decayWidth - rWidth / 2;
      y = marginTop + height * (1 - s) - rHeight / 2;
    } else if (type === "release") {
      x =
        marginLeft +
        attackWidth +
        decayWidth +
        sustainWidth +
        releaseWidth -
        rWidth / 2;
      y = marginTop + height - rHeight / 2;
    } else {
      throw new Error("Invalid type for DnDRect");
    }

    return (
      <rect
        onMouseDown={() => this.setState({ drag: type })}
        x={x}
        y={y}
        width={rWidth}
        height={rHeight}
        style={{
          pointerEvents: "all",
          cursor: drag === type ? "none" : "grab",
          fill: drag === type ? "white" : "none",
          stroke: drag === type ? "white" : "yellow",
          strokeWidth: 0.1
        }}
      />
    );
  }

  moveDnDRect(type) {
    return event => {
      event.stopPropagation();

      const [
        attackWidth,
        decayWidth,
        sustainWidth,
        releaseWidth,
      ] = this.getPhaseLengths();
      const {
        height,
        width,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
      } = this.props;
      const { drag, a, d, r } = this.state;

      if (drag === type) {
        const rect = event.target.getBoundingClientRect();

        if (type === "attack") {
          const aNew = (event.clientX - rect.left + marginLeft) / emToPx;
          let newState = {};
          if (aNew <= (1 / 4) * width) {
            newState.a = aNew;
          }

          const axNew = 1 - (event.clientY - rect.top) / height / emToPx;
          if (axNew >= 0 && axNew <= 1) {
            newState.ax = axNew;
          }

          this.setState(newState);
        } else if (type === "decaysustain") {
          const sNew = 1 - (event.clientY - rect.top) / height / emToPx;

          let newState = {};
          if (sNew >= 0 && sNew <= 1) {
            newState.s = sNew;
          }
          const dNew =
            (event.clientX - rect.left + marginLeft - attackWidth * emToPx) /
            emToPx;

          if (dNew >= 0 && dNew <= (1 / 4) * width) {
            newState.d = dNew;
          }

          this.setState(newState);
        } else if (type == "release") {
          const rNew =
            (event.clientX -
              rect.left +
              marginLeft -
              (attackWidth + decayWidth + sustainWidth) * emToPx) /
            emToPx;
          if (rNew >= 0 && rNew <= (1 / 4) * width) {
            this.setState({ r: rNew });
          }
        }
      }
    };
  }
}

EnvelopeGraph.propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,

  marginTop: PropTypes.number,
  marginRight: PropTypes.number,
  marginBottom: PropTypes.number,
  marginLeft: PropTypes.number,

  a: PropTypes.number.isRequired,
  ax: PropTypes.number.isRequired,
  d: PropTypes.number.isRequired,
  s: PropTypes.number.isRequired,
  r: PropTypes.number.isRequired,

  style: PropTypes.object,
  lineStyle: PropTypes.object,
  timeLineStyle: PropTypes.object,
  phaseLineStyle: PropTypes.object
};

EnvelopeGraph.defaultProps = {
  marginTop: 1,
  marginRight: 1,
  marginBottom: 1,
  marginLeft: 1
};

export default EnvelopeGraph;
