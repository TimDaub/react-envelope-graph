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
      xa: props.defaultXa,
      xd: props.defaultXd,
      xr: props.defaultXr,

      // NOTE: Dragging attack in y direction is currently not implemented.
      ya: props.defaultYa,
      ys: props.defaultYs,

      drag: null
    };

    if (
      props.ratio &&
      typeof props.ratio.xa === "number" &&
      typeof props.ratio.xd === "number" &&
      typeof props.ratio.xs === "number" &&
      typeof props.ratio.xr === "number"
    ) {
      this.state.ratio = props.ratio;
    } else if (!props.ratio) {
      this.state.ratio = {
        xa: 0.25,
        xd: 0.25,
        xs: 0.25,
        xr: 0.25,
      };
    } else {
      throw new Error("ratio needs to have values of type 'number': xa, xd, xs, xr");
    }
  }
  /**
   * Returns the width of each phase
   */
  getPhaseLengths() {
    const { xa, xd, xr, ratio } = this.state;
    const { width } = this.props;

    // NOTE: We're subtracting 1/4 of the width to reserve space for release.
    const absoluteS = width - xa - xd - ratio.xs * width;

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
    const { xa, ya, xd, ys, xr, ratio } = this.state;
    const {
      width,
      onAttackChange,
      onDecayChange,
      onSustainChange,
      onReleaseChange
    } = this.props;

    // NOTE: Currently ya cannot be changed, so we're not checking it's
    // condition here.
    if (prevState.xa !== xa && onAttackChange) {
      const relationXa = xa / width * 1 / ratio.xa;
      onAttackChange({ xa: relationXa, ya });
    }
    if (prevState.xd !== xd && onDecayChange) {
      const relationXd = xd / width * 1 / ratio.xd;
      onDecayChange(relationXd);
    }
    if (prevState.ys !== ys && onSustainChange) {
      onSustainChange(ys);
    }
    if (prevState.xr !== xr && onReleaseChange) {
      const relationXr = xr / width * 1 / ratio.xr;
      onReleaseChange(relationXr);
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
      const { drag, xa, xd, xr, ratio} = this.state;

      if (drag === type) {
        const rect = event.target.getBoundingClientRect();

        if (type === "attack") {
          const xaNew = (event.clientX - rect.left + marginLeft) / emToPx;
          let newState = {};
          if (xaNew <= ratio.xa * width) {
            newState.xa = xaNew;
          }

          const yaNew = 1 - (event.clientY - rect.top) / height / emToPx;
          if (yaNew >= 0 && yaNew <= 1) {
            // TODO: Readd ya and make sure graph is displayed correctly.
            //newState.ya = yaNew;
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

          if (xdNew >= 0 && xdNew <= ratio.xd * width) {
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
          if (xrNew >= 0 && xrNew <= ratio.xr * width) {
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

  defaultXa: PropTypes.number.isRequired,
  defaultXd: PropTypes.number.isRequired,
  defaultXr: PropTypes.number.isRequired,

  defaultYa: PropTypes.number.isRequired,
  defaultYs: PropTypes.number.isRequired,

  ratio: PropTypes.shape({
    xa: PropTypes.number,
    xd: PropTypes.number,
    xs: PropTypes.number,
    xr: PropTypes.number
  }),

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
  marginLeft: 1,
  // TODO: Remove when ya implemented.
  defaultYa: 1
};

export default EnvelopeGraph;
