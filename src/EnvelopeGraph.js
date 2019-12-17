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
  corners: {
    strokeWidth: 0.25,
    length: 1,
    stroke: "white"
  }
};

const viewBox = {
  width: 100,
  height: 20,
  marginTop:
    2 * styles.corners.strokeWidth +
    styles.dndBox.height / 2 +
    styles.dndBox.strokeWidth,
  marginRight:
    2 * styles.corners.strokeWidth +
    styles.dndBox.width / 2 +
    styles.dndBox.strokeWidth,
  marginBottom:
    2 * styles.corners.strokeWidth +
    styles.dndBox.height / 2 +
    styles.dndBox.strokeWidth,
  marginLeft:
    2 * styles.corners.strokeWidth +
    styles.dndBox.width / 2 +
    styles.dndBox.strokeWidth
};

class EnvelopeGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    if (
      props.ratio &&
      typeof props.ratio.xa === "number" &&
      typeof props.ratio.xd === "number" &&
      typeof props.ratio.xr === "number"
    ) {
      this.state.ratio = props.ratio;
    } else if (!props.ratio) {
      this.state.ratio = {
        xa: 0.25,
        xd: 0.25,
        xr: 0.25
      };
    } else if (typeof props.ratio.xs === "number") {
      throw new Error(
        "Configuring ratio with parameter 'xs' is not supported."
      );
    } else {
      throw new Error(
        "ratio needs to have values of type 'number': xa, xd, xr"
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

    styles = Object.assign(styles, props.styles);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
    // NOTE: We call this initially, to set the width and height values.
    this.onWindowResize();

    window.addEventListener("mouseup", () => this.setState({ drag: null }));
  }

  onWindowResize() {
    const { width, height } = this.computeStyles();

    // NOTE: As the svg preserves it's aspect ratio, we have to calculate only
    // one value that accounts for both width and height ratios.
    this.setState({
      svgRatio: {
        width: width / viewBox.width,
        height: height / viewBox.height
      }
    });
  }

  getPhaseLengths() {
    const { xa, xd, xr } = this.state;

    // NOTE: We're subtracting 1/4 of the width to reserve space for release.
    const absoluteS = viewBox.width - xa - xd - 0.25 * viewBox.width;

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

  renderCorners() {
    const { marginTop, marginRight, marginBottom, marginLeft } = viewBox;
    const { length, stroke, strokeWidth } = styles.corners;

    // NOTE: We draw the paths clockwise.
    return [
      <path
        key="top-left-corner"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        d={`M ${strokeWidth},${strokeWidth +
          length} V ${strokeWidth} H ${strokeWidth + length}`}
      />,
      <path
        key="top-right-corner"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        d={`M ${viewBox.width +
          marginLeft +
          marginRight -
          length -
          strokeWidth},${strokeWidth} H ${viewBox.width +
          marginLeft +
          marginRight -
          strokeWidth} V ${strokeWidth + length}`}
      />,
      <path
        key="bottom-right-corner"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        d={`M ${viewBox.width +
          marginLeft +
          marginRight -
          strokeWidth},${viewBox.height +
          marginTop +
          marginBottom -
          strokeWidth -
          length} V ${viewBox.height +
          marginTop +
          marginBottom -
          strokeWidth} H ${viewBox.width +
          marginLeft +
          marginRight -
          length -
          strokeWidth}`}
      />,
      <path
        key="bottom-left-corner"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        d={`M ${length + strokeWidth},${viewBox.height +
          marginTop +
          marginBottom -
          strokeWidth} H ${strokeWidth} V ${viewBox.height +
          marginTop +
          marginBottom -
          length -
          strokeWidth}`}
      />
    ];
  }

  render() {
    const { corners, style } = this.props;
    const { marginTop, marginRight, marginBottom, marginLeft } = viewBox;
    const { drag } = this.state;

    const w = viewBox.width + marginLeft + marginRight;
    const h = viewBox.height + marginTop + marginBottom;
    const vb = `0 0 ${w} ${h}`;

    return (
      <svg style={style} onDragStart={() => false} viewBox={vb} ref="box">
        <path
          transform={`translate(${marginLeft}, ${marginTop})`}
          d={this.generatePath()}
          style={Object.assign({}, styles.line)}
          vectorEffect="non-scaling-stroke"
        />
        {corners ? this.renderCorners() : null}
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
    const { marginTop, marginRight, marginBottom, marginLeft } = viewBox;
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
        x={x}
        y={y}
        width={rWidth}
        height={rHeight}
        style={{
          pointerEvents: "all",
          fill: drag === type ? styles.dndBoxActive.fill : styles.dndBox.fill,
          stroke:
            drag === type ? styles.dndBoxActive.stroke : styles.dndBox.stroke,
          strokeWidth: styles.dndBox.strokeWidth
        }}
      />
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const { drag } = this.state;

    if (prevState.drag !== drag) {
      window.addEventListener("mousemove", this.moveDnDRect(drag));
    }

    this.notifyChanges(prevState);
  }

  notifyChanges(prevState) {
    const { xa, ya, xd, ys, xr, ratio, graph } = this.state;
    const { onChange } = this.props;

    if (
      prevState.xa !== xa ||
      prevState.xd !== xd ||
      prevState.ys !== ys ||
      (prevState.xr !== xr && onChange)
    ) {
      const relationXa = ((xa / viewBox.width) * 1) / ratio.xa;
      const relationXd = ((xd / viewBox.width) * 1) / ratio.xd;
      const relationXr = ((xr / viewBox.width) * 1) / ratio.xr;
      onChange({
        xa: relationXa,
        ya,
        xd: relationXd,
        ys,
        xr: relationXr
      });
    }
  }

  computeStyles() {
    const computedStyle = window.getComputedStyle(this.refs.box);
    const styles = {};
    [
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "height",
      "width"
    ].map(key => (styles[key] = parseFloat(computedStyle[key])));
    return styles;
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
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft
      } = this.computeStyles();
      const { marginTop, marginRight, marginBottom, marginLeft } = viewBox;
      const { drag, xa, xd, xr, ratio, svgRatio } = this.state;
      const { styles } = this.props;

      if (drag === type) {
        const rect = this.refs.box.getBoundingClientRect();
        if (type === "attack") {
          const xaNew = ((event.clientX - paddingLeft - rect.left) / svgRatio.width) - marginLeft;
          let newState = {};
          if (xaNew <= ratio.xa * viewBox.width && xaNew >= 0) {
            newState.xa = xaNew;
          }
          this.setState(newState);
        } else if (type === "decaysustain") {
          // NOTE: ys is defined as a percentage and not as an absolute value in
          // user units.
          const ysNew = 1 - (event.clientY - paddingTop - rect.top) / svgRatio.height / viewBox.height;

          let newState = {};
          if (ysNew >= 0 && ysNew <= 1) {
            newState.ys = ysNew;
          }
          const xdNew = ((event.clientX - paddingLeft - rect.left - (attackWidth * svgRatio.width)) / svgRatio.width);

          if (xdNew >= 0 && xdNew <= ratio.xd * viewBox.width) {
            newState.xd = xdNew;
          }

          this.setState(newState);
        } else if (type == "release") {
          const xrNew =(event.clientX - paddingLeft - rect.left - ((attackWidth + decayWidth + sustainWidth) * svgRatio.width)) / svgRatio.width;
          if (xrNew >= 0 && xrNew <= ratio.xr * viewBox.width) {
            this.setState({ xr: xrNew });
          }
        }
      }
    };
  }
}

EnvelopeGraph.propTypes = {
  defaultXa: PropTypes.number.isRequired,
  defaultXd: PropTypes.number.isRequired,
  defaultXr: PropTypes.number.isRequired,

  defaultYa: PropTypes.number.isRequired,
  defaultYs: PropTypes.number.isRequired,

  ratio: PropTypes.shape({
    xa: PropTypes.number,
    xd: PropTypes.number,
    xr: PropTypes.number
  }),

  dndBox: PropTypes.shape({
    height: PropTypes.number,
    width: PropTypes.number
  }),

  onChange: PropTypes.func,

  style: PropTypes.object,
  styles: PropTypes.object,
  corners: PropTypes.bool
};

EnvelopeGraph.defaultProps = {
  corners: true,
  // TODO: Remove when ya implemented.
  defaultYa: 1
};

export default EnvelopeGraph;
