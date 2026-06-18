import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const production = process.env.NODE_ENV === 'production';

export default {
	input: 'src/entry.ts',
	output: {
		file: 'dist/frills.js', // Change to desired output
		format: 'es',
    strict: false
	},
	plugins: [
        resolve({ extensions: ['.ts', '.js'] }),
        commonjs(),     // converts require() to ES modules so Rollup can inline them
        babel({
            babelHelpers: 'bundled',  // Inline helpers, no external dep needed
            extensions: ['.ts', '.js'],
            presets: [
              ['@babel/preset-env', {
                targets: { browsers: ['ie 11'] }, // IE11 ≈ ES5, good Duktape proxy
                modules: false,                   // Let Rollup handle modules
              }],
              ['@babel/preset-typescript'],
            ]
        }),
        production && terser()
    ]
};