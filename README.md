# react-envelope-graph

> A drag-and-drop-enabled, responsive, envelope graph that allows to shape a
> wave with attack, decay, sustain and release.

<a href="https://github.com/TimDaub/react-envelope-graph"><img width="600"
src="https://github.com/TimDaub/react-envelope-graph/raw/master/assets/react-envelope-graph.gif" alt="react-envelope-graph screenshot" /></a>

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
      width="100%"
      height="20%"
      defaultXa={1}
      defaultXd={0.5}
      defaultYs={0.5}
      defaultXr={0.7}
      ratio={{
        xa: 0.25,
        xd: 0.25,
        xs: 0.5,
        xr: 0.2
      }}
      onAttackChange={({ xa, ya }) => console.log(`xa: ${xa}, ya: ${ya}`)}
      onDecayChange={xd => console.log("xd:", xd)}
      onSustainChange={ys => console.log("ys:", ys)}
      onReleaseChange={xr => console.log("xr:", xr)}
    />
  );
}
```

### Notes

- Width/height ratio is preserved
- `width` and `height` can be specified in `px` and `%`. I'm currently unsure
why e.g. `vh` doesn't work...
- `defaultXa`, `defaultXd`, `defaultYs` and `defaultXr` need to have a value
between 0 and 1
- In `ratio` the sum of all values needs to be `<= 1`
- `onAttackChange` returns an object containing `xa` and `ya`. All other
listener hooks only return a single float.

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
- [ ] Touch listeners are not yet implemented

## Changelog

### 0.0.3

- Bugfix: When mouse leaves graph, DnD stops

### 0.0.2

- Event subscriptions
- Improved props API
- Responsive

### 0.0.1

- Drop and draggable ADSR graph

## License

MIT
