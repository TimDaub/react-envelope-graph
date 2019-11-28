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
      a={0}
      d={5}
      s={1}
      r={(1/4) * width}
      onAttackChange={a => console.log("New attack:", a)}
      {/* ... */}
      onReleaseChange={r => console.log("New release:", a)}
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

- [ ] It's difficult to get the adjusted ADSR values from a parent component
- [ ] The `ax` cannot be set via dragging
- [ ] The component's size can only be adjusted relatively to other content but
not absolutely .e.g via `px`
- [ ] Touch listeners are not yet implemented
- [ ] Rename `s` to `sx`

## License

MIT
