// @format
// Source taken from: https://github.com/gerardabello/adsr-envelope-graph
// Author: Gerard Abelló Serras
// Adjusted by Tim Daubenschütz to make the phases of the graph draggable.
import React from "react";
import PropTypes from "prop-types";

let styles = {
  line: {
    fill: "none",
    stroke: "rgb(221, 226, 232)",
    strokeWidth: "2"
  },
  dndBox: {
    fill: "none",
    stroke: "white",
    strokeWidth: 0.1,
    height: 0.75,
    width: 0.75
  },
  dndBoxActive: {
    fill: "none",
    stroke: "white",
    strokeWidth: 0.1
  },
  background: {
    fill: "rgb(40, 56, 68)"
  }
};

const viewBox = {
  width: 100,
  height: 20
};

class EnvelopeGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

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
        xr: 0.25
      };
    } else {
      throw new Error(
        "ratio needs to have values of type 'number': xa, xd, xs, xr"
      );
    }

    this.state = Object.assign(this.state, {
      xa: props.defaultXa * viewBox.width * this.state.ratio.xa,
      xd: props.defaultXd * viewBox.width * this.state.ratio.xd,
      xr: props.defaultXr * viewBox.width * this.state.ratio.xr,

      // NOTE: Dragging attack in y direction is currently not implemented.
      ya: props.defaultYa,
      ys: props.defaultYs,

      drag: null,

      svgRatio: 0
    });

    this.onWindowResize = this.onWindowResize.bind(this);
    this.handleGraphExit = this.handleGraphExit.bind(this);

    styles = Object.assign(styles, props.styles);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
    // NOTE: We call this initially, to set the width and height values.
    this.onWindowResize();
  }

  onWindowResize() {
    const { width } = this.refs.box.getBoundingClientRect();

    // NOTE: As the svg preserves it's aspect ratio, we have to calculate only
    // one value that accounts for both width and height ratios.
    this.setState({ svgRatio: width / viewBox.width });

    // NOTE: In case a user's mouse leaves the graph, we want the drag to stop.
    // For this, we need to listen on the whole document, as listening just to
    // events within the graph's box, would yield incorrect results in cases
    // where the user's mouse moves really fast.
    document.addEventListener("mousemove", this.handleGraphExit);
  }

  handleGraphExit(event) {
    const rect = this.refs.box.getBoundingClientRect();

    if (
      event.clientX <= rect.x ||
      event.clientX + rect.left >= rect.right ||
      event.clientY <= rect.top ||
      event.clientY + rect.top >= rect.bottom
    ) {
      this.setState({ drag: null });
    }
  }

  getPhaseLengths() {
    const { xa, xd, xr, ratio } = this.state;

    // NOTE: We're subtracting 1/4 of the width to reserve space for release.
    const absoluteS = viewBox.width - xa - xd - ratio.xs * viewBox.width;

    return [xa, xd, absoluteS, xr];
  }

  /**
   * Returns a string to be used as 'd' attribute on an svg path that resembles
   * an envelope shape given its parameters
   * @return {String}
   */
  generatePath() {
    const { ys, ya } = this.state;
    const [
      attackWidth,
      decayWidth,
      sustainWidth,
      releaseWidth
    ] = this.getPhaseLengths();

    let strokes = [];
    strokes.push("M 0 " + viewBox.height);
    strokes.push(this.exponentialStrokeTo(attackWidth, -viewBox.height));
    strokes.push(
      this.exponentialStrokeTo(decayWidth, viewBox.height * (1 - ys))
    );
    strokes.push(this.linearStrokeTo(sustainWidth, 0));
    strokes.push(this.exponentialStrokeTo(releaseWidth, viewBox.height * ys));

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
      width,
      height,
      phaseLines,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft
    } = this.props;
    const { drag } = this.state;

    const w = viewBox.width + marginLeft + marginRight;
    const h = viewBox.height + marginTop + marginBottom;
    const vb = `0 0 ${w} ${h}`;

    return (
      <svg
        ref="box"
        viewBox={vb}
        style={Object.assign({ height, width }, this.props.style)}
      >
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
          style={Object.assign({}, styles.line)}
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
      phaseLines,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft
    } = this.props;
    const { ys, drag } = this.state;
    const rHeight = styles.dndBox.height;
    const rWidth = styles.dndBox.width;

    let x, y;
    if (type === "attack") {
      x = marginLeft + attackWidth - rWidth / 2;
      y = marginTop - rHeight / 2;
    } else if (type === "decaysustain") {
      x = marginLeft + attackWidth + decayWidth - rWidth / 2;
      y = marginTop + viewBox.height * (1 - ys) - rHeight / 2;
    } else if (type === "release") {
      x =
        marginLeft +
        attackWidth +
        decayWidth +
        sustainWidth +
        releaseWidth -
        rWidth / 2;
      y = marginTop + viewBox.height - rHeight / 2;
    } else {
      throw new Error("Invalid type for DnDRect");
    }

    return (
      <rect
        onMouseDown={() => this.setState({ drag: type })}
        onMouseUp={() => this.setState({ drag: null })}
        onDragStart={() => false}
        x={x}
        y={y}
        width={rWidth}
        height={rHeight}
        style={{
          pointerEvents: "all",
          cursor: drag === type ? "none" : "grab",
          fill: drag === type ? styles.dndBoxActive.fill : styles.dndBox.fill,
          stroke:
            drag === type ? styles.dndBoxActive.stroke : styles.dndBox.stroke,
          strokeWidth: styles.dndBox.strokeWidth
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
      onAttackChange,
      onDecayChange,
      onSustainChange,
      onReleaseChange
    } = this.props;

    // NOTE: Currently ya cannot be changed, so we're not checking it's
    // condition here.
    if (prevState.xa !== xa && onAttackChange) {
      const relationXa = ((xa / viewBox.width) * 1) / ratio.xa;
      onAttackChange({ xa: relationXa, ya });
    }
    if (prevState.xd !== xd && onDecayChange) {
      const relationXd = ((xd / viewBox.width) * 1) / ratio.xd;
      onDecayChange(relationXd);
    }
    if (prevState.ys !== ys && onSustainChange) {
      onSustainChange(ys);
    }
    if (prevState.xr !== xr && onReleaseChange) {
      const relationXr = ((xr / viewBox.width) * 1) / ratio.xr;
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
      const { marginTop, marginRight, marginBottom, marginLeft } = this.props;
      const { drag, xa, xd, xr, ratio, svgRatio } = this.state;

      if (drag === type) {
        const rect = event.target.getBoundingClientRect();
        if (type === "attack") {
          const xaNew = (event.clientX - rect.left + marginLeft) / svgRatio;
          let newState = {};
          if (xaNew <= ratio.xa * viewBox.width) {
            newState.xa = xaNew;
          }

          const yaNew =
            1 - (event.clientY - rect.top) / viewBox.height / svgRatio;
          if (yaNew >= 0 && yaNew <= 1) {
            // TODO: Readd ya and make sure graph is displayed correctly.
            //newState.ya = yaNew;
          }

          this.setState(newState);
        } else if (type === "decaysustain") {
          const ysNew =
            1 - (event.clientY - rect.top) / viewBox.height / svgRatio;

          let newState = {};
          if (ysNew >= 0 && ysNew <= 1) {
            newState.ys = ysNew;
          }
          const xdNew =
            (event.clientX - rect.left + marginLeft - attackWidth * svgRatio) /
            svgRatio;

          if (xdNew >= 0 && xdNew <= ratio.xd * viewBox.width) {
            newState.xd = xdNew;
          }

          this.setState(newState);
        } else if (type == "release") {
          const xrNew =
            (event.clientX -
              rect.left +
              marginLeft -
              (attackWidth + decayWidth + sustainWidth) * svgRatio) /
            svgRatio;
          if (xrNew >= 0 && xrNew <= ratio.xr * viewBox.width) {
            this.setState({ xr: xrNew });
          }
        }
      }
    };
  }
}

EnvelopeGraph.propTypes = {
  height: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,

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

  dndBox: PropTypes.shape({
    height: PropTypes.number,
    width: PropTypes.number
  }),

  onAttackChange: PropTypes.func,
  onDecayChange: PropTypes.func,
  onSustainChange: PropTypes.func,
  onReleaseChange: PropTypes.func,

  styles: PropTypes.object
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
