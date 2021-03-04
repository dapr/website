
Welcome to the source file repository for the [Dapr website](https://dapr.io). The website is a simple static site, built with [Hugo](https://gohugo.io/) and hosted on [Netlify](https://app.netlify.com/sites/daprio/settings/general).

---

## Structure:
Important folders and files to note:

[/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml) - Dynamic content such as text.  This is the only file you need to touch when looking for minor modifications such as changing text, adding a pane in a section or replacing and image.

[/styleguides/](https://github.com/dapr/website/tree/master/styleguides) - Latest brand assets and logos for Dapr

[/static/images/](https://github.com/dapr/website/tree/master/static/images) - All image file in the site

[/config.toml](https://github.com/dapr/website/blob/master/config.toml) - Hugo configuration and parameters including baseURL, headers and footers, Google Analytics etc.

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

### Editing the content
All basic content editing can be done via changes to [/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml). Note that the different sections in the file are ordered in the same way as in the website. Each section will usually have an `enable` flag which allows it to be removed without deleting it from the file.

One exception is the menus in the header and footer of the website which are defined in [/config.toml](https://github.com/dapr/website/blob/master/config.toml)

Image assets are stored at [/static/images](https://github.com/dapr/website/tree/master/static/images)

### Editing the theme
The website uses a modified [Bigspring theme](https://themes.gohugo.io/bigspring-hugo-startup-theme/). You can find the documentation for the original theme [here](https://docs.gethugothemes.com/bigspring/).

All theme files are found at [/themes/bigspring](https://github.com/dapr/website/blob/master/themes/bigspring). Most likely changes you will be looking to do are to the main index file [/themes/bigspring/layouts/index.html](https://github.com/dapr/website/blob/master/themes/bigspring/layouts/index.html) this file uses content (like text and image file names) from [/data/homepage.yml](https://github.com/dapr/website/blob/master/data/homepage.yml)

## Deployment

The site is automatically rebuilt on Netlify when changes are merged into `master` branch. You view build logs by clicking on the badge below:

[![Netlify Status](https://api.netlify.com/api/v1/badges/bb8f6580-7739-4d16-8db8-37cbca965aea/deploy-status)](https://app.netlify.com/sites/daprio/deploys)


---


# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.