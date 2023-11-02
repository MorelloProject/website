# Morello Project Website

This is the git repository for the Morello Project Website.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
│       └── resources
│   └──content/
│       └──data/
│       └──pages/
│       └──rows/
│       └──sections/
└── package.json
```

### Data

The `src/content/data` folder contains various lists of one-off items used in the site, namely the nav links, footer links and members. Any items added to these lists will be reflected in the website.

### Pages

Pages can be edited via the relevant `.md or mdx` files in the `src/content/pages` folder. New pages containing the nav, header, footer and a body of rendered markdown content can be implemented by adding `.md || .mdx` files to this folder (as with the cookies, conduct and governance pages). If rendered markdown content is not sufficient, please contact [it-support@linaro.org](mailto:it-support@linaro.org) to discuss implementing a new page.

### Rows

The Src /content /rows folder contains a container for content of all of the pages row.

### Sections

The Src /content /sections folder containes various list of items in section part of each page.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `yarn install`         | Installs dependencies                            |
| `yarn dev`             | Starts local dev server at `localhost:4321`      |
| `yarn build`           | Build your production site to `./dist/`          |
| `yarn preview`         | Preview your build locally, before deploying     |
| `yarn astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
