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
      xa: props.xa,
      xd: props.xd,
      xr: props.xr,

      // NOTE: Dragging attack in y direction is currently not implemented.
      ya: props.ya,
      ys: props.ys,

      drag: null
    };
  }
  /**
   * Returns the width of each phase
   */
  getPhaseLengths() {
    const { xa, xd, xr } = this.state;
    const { width } = this.props;

    // NOTE: We're subtracting 1/4 of the width to reserve space for release.
    const absoluteS = width - xa - xd - (1 / 4) * width;

    return [xa, xd, absoluteS, xr];
  }

  /**
   * Returns a string to be used as 'd' attribute on an svg path that resembles
   * an envelope shape given its parameters
   * @return {String}
   */
  generatePath() {
    const { ys, ya } = this.state;
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
    strokes.push(this.exponentialStrokeTo(decayWidth, height * (1 - ys)));
    strokes.push(this.linearStrokeTo(sustainWidth, 0));
    strokes.push(this.exponentialStrokeTo(releaseWidth, height * ys));

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
    const { ys, drag } = this.state;

    const rHeight = 0.75;
    const rWidth = 0.75;

    let x, y;
    if (type === "attack") {
      x = marginLeft + attackWidth - rWidth / 2;
      y = marginTop - rHeight / 2;
    } else if (type === "decaysustain") {
      x = marginLeft + attackWidth + decayWidth - rWidth / 2;
      y = marginTop + height * (1 - ys) - rHeight / 2;
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

  componentDidUpdate(prevProps, prevState) {
    this.notifyChanges(prevState);
  }

  notifyChanges(prevState) {
    const { xa, xd, ys, xr } = this.state;
    const {
      onAttackChange,
      onDecayChange,
      onSustainChange,
      onReleaseChange
    } = this.props;
    if (prevState.xa !== xa && onAttackChange) {
      onAttackChange(xa);
    }
    if (prevState.xd !== xd && onDecayChange) {
      onDecayChange(xd);
    }
    if (prevState.ys !== ys && onSustainChange) {
      onSustainChange(ys);
    }
    if (prevState.xr !== xr && onReleaseChange) {
      onReleaseChange(xr);
    }
  }

  moveDnDRect(type) {
    return event => {
      event.stopPropagation();

      const [
        attackWidth,
        decayWidth,
        sustainWidth,
        releaseWidth
      ] = this.getPhaseLengths();
      const {
        height,
        width,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
      } = this.props;
      const { drag, xa, xd, xr } = this.state;

      if (drag === type) {
        const rect = event.target.getBoundingClientRect();

        if (type === "attack") {
          const xaNew = (event.clientX - rect.left + marginLeft) / emToPx;
          let newState = {};
          if (xaNew <= (1 / 4) * width) {
            newState.xa = xaNew;
          }

          const yaNew = 1 - (event.clientY - rect.top) / height / emToPx;
          if (yaNew >= 0 && yaNew <= 1) {
            newState.ya = yaNew;
          }

          this.setState(newState);
        } else if (type === "decaysustain") {
          const ysNew = 1 - (event.clientY - rect.top) / height / emToPx;

          let newState = {};
          if (ysNew >= 0 && ysNew <= 1) {
            newState.ys = ysNew;
          }
          const xdNew =
            (event.clientX - rect.left + marginLeft - attackWidth * emToPx) /
            emToPx;

          if (xdNew >= 0 && xdNew <= (1 / 4) * width) {
            newState.xd = xdNew;
          }

          this.setState(newState);
        } else if (type == "release") {
          const xrNew =
            (event.clientX -
              rect.left +
              marginLeft -
              (attackWidth + decayWidth + sustainWidth) * emToPx) /
            emToPx;
          if (xrNew >= 0 && xrNew <= (1 / 4) * width) {
            this.setState({ xr: xrNew });
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

  xa: PropTypes.number.isRequired,
  xd: PropTypes.number.isRequired,
  xr: PropTypes.number.isRequired,

  ya: PropTypes.number.isRequired,
  ys: PropTypes.number.isRequired,

  onAttackChange: PropTypes.func,
  onDecayChange: PropTypes.func,
  onSustainChange: PropTypes.func,
  onReleaseChange: PropTypes.func,

  style: PropTypes.object,
  lineStyle: PropTypes.object
};

EnvelopeGraph.defaultProps = {
  marginTop: 1,
  marginRight: 1,
  marginBottom: 1,
  marginLeft: 1
};

export default EnvelopeGraph;
