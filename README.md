# Gulp 4 + Webpack 4 + Babel + BrowserSync

All the tasks are done via Gulp. Webpack is just used for ES6 Import/Export as Gulp can't do it to my best of knowledge. Apart from ES6 Import/Export, Gulp was able to do all my other work that I wanted so I have mainly used Gulp. That being said, you can modify the webpack config to your preferences from `webpack` folder and use webpack specific plugins as you need.

For Live reloading, Browsersync has been used. For ES6 Transpilation, Babel has been used.

## Setup

- Install [Node](https://nodejs.org/)
- Optionally, also install [Yarn](https://yarnpkg.com/) or use *Npm* that comes with Node pre-installed
- Install Gulp globally through `npm install -g gulp@next`
- Install Webpack globally through `npm install -g webpack`
- Fork this project
- Clone the forked project (Yours!)
- `cd` to the cloned project
- Install all [packages](./package.json) with `npm install` or `yarn install`

## Usage

- **Start the Project (for Development)** - `npm start` or `yarn start`.
- **Build the Project (for Production)** - `npm run build` or `yarn run build`
- **Exporting the Project to zip file** - `npm run export` or `yarn run export`

## Appendix

- **Tooling** - Gulpfile Lives in `gulpfile.js` and Webpack config files live within `webpack` folder.
- **Source Files** - Lives in `public/dist` folder
- **Compiled Files** - Lives in `public/src` folder
- **Exported Project** - The exported project is imported from `public` folder and gets exported as `website.zip` to project root
