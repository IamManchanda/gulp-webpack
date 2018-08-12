# Gulp 4 + Webpack 4 + Webpack Stream + Babel + BrowserSync

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

- **Development Server**: Server starts on `http://localhost:3000/`. You can change the port number [from here](./tooling/server.js)
- **Tooling** - Lives in `gulpfile.js` and files within `tooling` folder. Special mentions `webpack.dev.js` and `webpack.prod.js`
- **Source Files** - Lives in `public/dist` folder
- **Compiled Files** - Lives in `public/src` folder
- **Exported Project** - The exported project is imported from `public` folder and gets exported as `website.zip` to project root
