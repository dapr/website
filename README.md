![GitHub License](https://img.shields.io/github/license/dapr/website?style=flat&label=License&logo=github) [![GitHub issue custom search in repo](https://img.shields.io/github/issues-search/dapr/website?query=type%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22&label=Good%20first%20issues&style=flat&logo=github)](https://github.com/dapr/website/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) [![Discord](https://img.shields.io/discord/778680217417809931?label=Discord&style=flat&logo=discord)](https://discord.com/invite/ptHhX6jc34) [![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCtpSQ9BLB_3EXdWAUQYwnRA?style=flat&label=YouTube%20views&logo=youtube)](https://youtube.com/@daprdev) [![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/daprdev?logo=x&style=flat)](https://twitter.com/daprdev)

[Dapr](https://dapr.io) is a CNCF graduated project that gives developers APIs for durable workflows, messaging, state and more, so they can build resilient distributed applications in any language.

This repository holds the source for the [Dapr website](https://dapr.io). The website is a static site, built with [Hugo](https://gohugo.io/) and hosted on [Netlify](https://www.netlify.com/).

---

## Structure:
Important folders and files to note:

[/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml) - Dynamic content such as text.  This is the only file you need to touch when looking for minor modifications such as changing text, adding a pane in a section or replacing and image.

[/styleguides/](https://github.com/dapr/website/tree/master/styleguides) - Latest brand assets and logos for Dapr

[/static/images/](https://github.com/dapr/website/tree/master/static/images) - All image file in the site

[/config.toml](https://github.com/dapr/website/blob/master/config.toml) - Hugo configuration and parameters including baseURL, headers and footers, Google Analytics etc.

[/themes/bigspring/layouts/index.llms.txt](https://github.com/dapr/website/blob/master/themes/bigspring/layouts/index.llms.txt) - Template that generates `llms.txt` (do not edit a static copy); `index.llmsfull.txt` next to it generates `llms-full.txt`. The homepage's workflow and durable execution copy that these files pick up lives in [/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml); the workflow page's copy lives in [/content/workflow/_index.md](https://github.com/dapr/website/blob/master/content/workflow/_index.md)

[/netlify.toml](https://github.com/dapr/website/blob/master/netlify.toml) - Configuration for deployment on Netlify

[/themes/bigspring/](https://github.com/dapr/website/blob/master/themes/bigspring) - The website theme

[/themes/bigspring/layouts/index.html](https://github.com/dapr/website/blob/master/themes/bigspring/layouts/index.html) - The main HTML file which includes most of the structure of the website

[/themes/bigspring/assets/scss/_variables.scss](https://github.com/dapr/website/blob/master/themes/bigspring/assets/scss/_variables.scss) - Definitions of colors etc.

## Development
### Run locally
Make sure you have [Hugo installed](https://gohugo.io/getting-started/installing)

Run:

```bash
hugo server --disableFastRender
```

### Run the tests
Playwright tests in [/tests](https://github.com/dapr/website/tree/master/tests) check accessibility behavior: keyboard focus, the nav dropdown, the carousel and video pause controls, and an axe-core scan of every page. They run in GitHub Actions on every pull request. To run them locally you need Hugo, Node.js, and Google Chrome:

```bash
cd tests
npm install
npm test
```

The tests build the site themselves. If a change fixes accessibility issues, update the recorded baseline with `npm run test:update-a11y-baseline` and commit the changed `a11y-baseline.*.json` files.

### Editing the content
All basic content editing can be done via changes to [/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml). Note that the different sections in the file are ordered in the same way as in the website. Each section will usually have an `enable` flag which allows it to be removed without deleting it from the file.

One exception is the menus in the header and footer of the website which are defined in [/config.toml](https://github.com/dapr/website/blob/master/config.toml)

Image assets are stored at [/static/images](https://github.com/dapr/website/tree/master/static/images)

### Editing the theme
The website uses a modified [Bigspring theme](https://themes.gohugo.io/bigspring-hugo-startup-theme/). You can find the documentation for the original theme [here](https://docs.gethugothemes.com/bigspring/).

All theme files are found at [/themes/bigspring](https://github.com/dapr/website/blob/master/themes/bigspring). Most likely changes you will be looking to do are to the main index file [/themes/bigspring/layouts/index.html](https://github.com/dapr/website/blob/master/themes/bigspring/layouts/index.html) this file uses content (like text and image file names) from [/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml)

## Deployment

The live site is deployed by Netlify. Netlify rebuilds and publishes the site automatically when changes are merged into the `master` branch, using the build settings and Hugo version in [/netlify.toml](https://github.com/dapr/website/blob/master/netlify.toml). Pull requests get a Netlify deploy preview.

![Netlify Status](https://api.netlify.com/api/v1/badges/bb8f6580-7739-4d16-8db8-37cbca965aea/deploy-status)


---


# Contributing

This project welcomes contributions and suggestions. See the [Dapr contributing guide](https://docs.dapr.io/contributing/) for an overview of how to contribute to Dapr.

Dapr uses the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). Every commit must be signed off to certify that you wrote it or otherwise have the right to submit it. Add the sign-off with `git commit -s`, which appends a `Signed-off-by` line with your name and email to the commit message.

This project follows the [Dapr Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md).
