# Brand marks for the homepage value-prop diagrams

Each `.svg` here is inlined as a `<symbol id="value-prop-icon-<file name>">` by
`themes/bigspring/layouts/partials/home/value-props.html` and drawn by
`themes/bigspring/assets/js/value-props.js`. Files are kept exactly as published;
the template prefixes their ids and classes when it inlines them. Every mark
belongs to its owner and is used only to show that Dapr works with that product.

| Files | Source | Terms |
| --- | --- | --- |
| `apachekafka.svg`, `rabbitmq.svg`, `redis.svg`, `hashicorp-vault.svg` (Simple Icons "Vault") | [Simple Icons](https://simpleicons.org) 13.21.0 | CC0 1.0; the marks remain trademarks of their owners |
| `azure-service-bus.svg`, `azure-key-vault.svg`, `azure-cosmos-db.svg` | [Azure architecture icons](https://learn.microsoft.com/azure/architecture/icons/) V24 | Permitted in architecture diagrams, training material and documentation; do not crop, flip, rotate, distort or recolor |
| `amazon-sns.svg`, `aws-kms.svg`, `amazon-dynamodb.svg` | [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/), package 2026-07-31, `Architecture-Service-Icons/*/64` | Permitted for architecture diagrams |
| `google-cloud-pubsub.svg`, `google-cloud-secret-manager.svg`, `google-cloud-firestore.svg` | [Google Cloud icons](https://cloud.google.com/icons), legacy icon set | Google Cloud's icon library for architecture diagrams |

Company logos (Microsoft Azure, AWS, Google Cloud) are not used; the diagrams
name the platforms in text instead.

To add a mark, drop the vendor's file here as `<name>.svg` and reference it as
`icon(parent, { name: '<name>', ... })` in a scene.
