// @format
import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from 'rollup-plugin-replace';
import pkg from "./package.json";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = [
  {
    input: "src/EnvelopeGraph.js",
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: !production
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      resolve({ browser: true }),
      replace({
        'process.env.NODE_ENV': JSON.stringify("production"),
      }),
      commonjs(),
      production && terser()
    ]
  },
  {
    input: "src/EnvelopeGraph.js",
    output: {
      file: pkg.unpkg,
      format: "umd",
      sourcemap: !production,
      name: "ReactEnvelopeGraph",
      globals: {
        react: "React"
      }
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      resolve({ browser: true }),
      replace({
        'process.env.NODE_ENV': JSON.stringify("production"),
      }),
      commonjs(),
      production && terser()
    ]
  }
];
