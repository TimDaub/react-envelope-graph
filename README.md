# react-envelope-graph

> A drag-and-drop-enabled envelope graph that allows to shape a wave with
> attack, decay, sustain and release.

<a href="https://github.com/TimDaub/react-envelope-graph"><img width="600"
src="https://github.com/TimDaub/react-envelope-graph/raw/master/assets/react-envelope-graph.gif" alt="react-envelope-graph screenshot" /></a>

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
  const width = 100;

  return (
    <EnvelopeGraph
      height={20}
      width={100}
      defaultXa={1}
      defaultXd={5}
      defaultYs={0.5}
      defaultXr={(1/4) * width}
      onAttackChange={({ xa, ya }) => console.log(`xa: ${xa}, ya: ${ya}`)}
      onDecayChange={xd => console.log("xd", xd)}
      onSustainChange={ys => console.log("ys", ys)}
      onReleaseChange={xr => console.log("xr", xr)}
    />
  );
}
```

## Contributing and Demo

To try the component:

```bash
$ git clone git@github.com:TimDaub/react-envelope-graph.git
$ npm i
$ npm run dev
```

## Current Limitations

Help is very much appreciated. I'll try to handle PRs as fast as I can. Below
is a list of the current limitations:

- [ ] It's difficult to get the adjusted ADSR values from a parent component.
Ideally they come in a seconds format or something similar.
- [ ] The `ya` value cannot be set via dragging
- [ ] The component's size can only be adjusted relatively to other content but
not absolutely .e.g via `px`
- [ ] Touch listeners are not yet implemented

## License

MIT
