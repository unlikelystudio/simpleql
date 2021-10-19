// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
 
export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: 'dist/index.es.js',
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
    terser()
  ]
}