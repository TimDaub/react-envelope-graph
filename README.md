# react-envelope-graph

[![npm version](https://badge.fury.io/js/react-envelope-graph.svg)](https://badge.fury.io/js/react-envelope-graph)

> A drag-and-drop-enabled, responsive, envelope graph that allows to shape a
> wave with attack, decay, sustain and release.

<a href="https://github.com/TimDaub/react-envelope-graph"><img width="600"
src="https://github.com/TimDaub/react-envelope-graph/raw/master/assets/react-envelope-graphv2.gif" alt="react-envelope-graph screenshot" /></a>

Check out the [Demo](https://codesandbox.io/s/nervous-northcutt-ikjhb?fontsize=14&hidenavigation=1&theme=dark)!

## Installing

```bash
$ npm i --save react-envelope-graph
```

or

```bash
$ yarn add react-envelope-graph
```

## Usage

Import the component

```js
import EnvelopeGraph from "react-envelope-graph";
```

and then use it:

```js
function App() {
  return (
    <EnvelopeGraph
      defaultXa={1}
      defaultXd={0.5}
      defaultYs={0.5}
      defaultXr={0.7}
      ratio={{
        xa: 0.25,
        xd: 0.25,
        xr: 0.2
      }}
      style={{
        backgroundColor: "black",
        padding: "2.5%",
        height: "100vh",
        width: "20vw"
      }}
      styles={{
        line: {
          fill: "none",
          stroke: "red",
          strokeWidth: 2,
        },
        dndBox: {
          fill: "none",
          stroke: "blue",
          strokeWidth: 0.1,
          height: 1,
          width: 1
        },
        dndBoxActive: {
          fill: "blue",
        }
      }}
      onChange={console.log}
    />
  );
}
```

### Notes

- The `height/width` ratio is preserved within the svg
- `width` and `height` can be specified via the `style` prop
- `defaultXa`, `defaultXd`, `defaultYs` and `defaultXr` need to have a value
  between 0 and 1
- In `ratio`, the sum of the values `xa`, `xd` and `xr` needs to remain below
  `0.75`. `xs` is internally set to `xs === 0.25`.
- Most numeric values in the `styles` prop must not use a unit (e.g. `px` or
  `em`) as they set values on SVG components (user units)
- Note that `styles` is not a regular `style` prop, but a custom prop that
  additionally allows to configure interaction reactions too
- To regularly style the component, use the `style` prop
- When `defaultXa`, `defaultXd`, `defaultYs` and `defaultXr` props are changed,
  no `onChange` event is fired and the graph is set to these values.
- Optional props: `ratio`, `dndBox`, `onChange`, `style`


## Contributing

To try the component:

```bash
$ git clone git@github.com:TimDaub/react-envelope-graph.git
$ npm i
$ npm run dev
```

## Current Limitations

Help is very much appreciated. I'll try to handle PRs as fast as I can. Below
is a list of the current limitations:

- [ ] The `ya` value cannot be set via dragging
- [ ] [Touch listeners are not yet implemented](https://gist.github.com/hartzis/b34a4beeb5ceb4bf1ed8659e477c4191)

## Changelog

### 0.1.4

- `defaultXa`, `defaultXd`, `defaultYs` and `defaultXr` can now be used to
  continuously set the graphs values without an `onChange` event firing

### 0.1.3

- Bugfix: Dropped `getBoundingClientRect` in favor of `getComputedStyles` for
  measuring the svg's dimensions. Setting `margin` and `padding` via `style`
  should now be possible without problems.

### 0.1.2

- Bugfix: Properly fix ratio issues with `height` and `width`. They're now
  members of the `style` prop

### 0.1.1

- Hotfix: Set `height`/`width` of graph to `100%` to respect ratio. I'll have
  to go back on that fix later...

### 0.1.0

- Breaking change: Removed functions `onAttackChange`, `onDecayChange`,
  `onSustainChange` and `onReleaseChange` in favor of `onChange`, which returns
  all values as an object

### 0.0.11

- When setting the props `height` and `width`, the graph's ratio is adjusts
  accordingly

### 0.0.10

- Bugfix: Remove `ratio.xs` from configurable params

### 0.0.9

- Bugfix: Dragging the function works even thought the graph has any type of
  padding

### 0.0.8

- Bugfix: Yet fixing corner length another time...

### 0.0.7

- Bugfix: Left top corner same length as others

### 0.0.6

- Add cut corners to graph
- Allow definition of `padding` through native `style` prop and remove
  `marginTop`, `marginRight`, `marginBottom`, and `marginRight` props

### 0.0.5

- Improve support for `styles` prop to allow to styling of the component
- Move `dndBox` prop to `styles`

### 0.0.4

- DnD box's size now configurable

### 0.0.3

- Bugfix: When mouse leaves graph, DnD stops

### 0.0.2

- Event subscriptions
- Improved props API
- Responsive

### 0.0.1

- Dragable ADSR graph

## License

MIT
