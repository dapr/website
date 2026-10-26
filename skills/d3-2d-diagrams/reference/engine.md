# value-props.js engine reference

Everything below lives in `themes/bigspring/assets/js/value-props.js`.
Coordinates are in the 600×480 viewBox.

## Shape builders

Every builder takes a parent D3 selection and returns a selection (a `<g>`),
except `arrow`, which returns a grow function. Set a selection's `opacity` in
`frame(t)` to fade it.

| Builder | Options | Draws |
| --- | --- | --- |
| `group(parent)` | none | an empty `<g>`, for moving or fading things together |
| `label(parent, x, y, text, o)` | `size` (11), `weight` (600), `color` (black), `halo` | centered text; `\n` starts a second line. Returns the `<text>` |
| `hex(parent, o)` | `x, y, r` (42.5), `stroke, fill`, `label` ('App'), `size`, `labelDx` | a pointy-top app hexagon with its name |
| `badge(parent, o)` | `x, y, r` (19) | the small Dapr hexagon with the logo |
| `daprApp(parent, o)` | `x, y, r, stroke, fill, badgeLeft` | an app with its Dapr badge, bottom right (or bottom left) |
| `box(parent, o)` | `x, y, w, h, label` | a workflow activity (teal rectangle) |
| `node(parent, o)` | `x, y, r, stroke, label, labelDy` | a workflow start or end (circle) |
| `cylinder(parent, o)` | `x, top, bottom, rx` (24), `ry` (8) | a database, with its hidden back rim dashed |
| `envelope(parent, o)` | `x, y, w` (35), `color, stroke, fill, label, labelDy` | a message |
| `broker(parent, o)` | `x, y, w` (46), `label, labelDy` | a message broker (two stacked envelopes) |
| `lockBox(parent, o)` | `x, y, size` | a secret store (padlock in a teal square) |
| `person(parent, o)` | `x, y, size` | a person, for an external system |
| `secureLock(parent, o)` | `x, y, size, label, labelDy` | secure service communication (padlock and shield) |
| `retry(parent, o)` | `x, y, r` (13) | a resiliency policy (circling arrows and "Resiliency") |
| `failure(parent, o)` | `x, y, r` (9) | a failed call (cross in a circle) |
| `icon(parent, o)` | `name, x, y, size, color, label, labelDy, labelSize` (13) | a brand mark from `assets/images/icons/<name>.svg`, with a label under it. `color` fills single-color marks |

### Arrows

```js
var grow = arrow(parent, [x1, y1], [x2, y2], { head: false }); // head defaults to true
grow(p, o);        // draw it at fraction p (0..1) of its length, at opacity o (default 1)
grow.paint(color); // recolor the line and head
grow.head(o);      // fade the head alone
```

An arrow fades in over the first 60% of its growth, so call `grow(step(...))`
and the head never pops in. A plain connecting line is an arrow with
`{ head: false }`.

## Timing and color helpers

| Helper | Returns |
| --- | --- |
| `step(t, a, b)` | progress from 0 to 1 between `a` and `b` seconds, eased in and out, clamped |
| `inOut(u)` | the cubic ease used by `step` |
| `mix(colorA, colorB, u)` | the `#RRGGBB` color a fraction `u` of the way from A to B |

## Colors

`C` holds every named color (`navy`, `teal`, `tealFill`, `mint`, `orange`,
`orangeFill`, `red`, `blue`, `lavender`, `grey`, `caption`, `rabbit`, `redis`,
`black`, `bg`). `APP[0]` to `APP[3]` are the app hexagon colors, each
`{ stroke, fill }`: light blue, dark blue, teal, orange. Take them in that order.

## A scene

```js
myscene: {
  T: 10,        // loop length, seconds
  still: 8,     // the complete diagram: reduced motion and the fallback show this
  build: function (root) {
    var d = group(root);
    var app = daprApp(d, { x: 150, y: 200, stroke: APP[0].stroke, fill: APP[0].fill });
    var call = arrow(d, [195, 200], [300, 200]);
    var db = cylinder(d, { x: 340, top: 185, bottom: 225 });

    return function (t) {
      var out = 1 - step(t, 9, 9.5);          // everything fades out to end the loop
      app.attr('opacity', step(t, 0.3, 0.7) * out);
      call(step(t, 1, 1.4), out);
      db.attr('opacity', step(t, 1.4, 1.8) * out);
    };
  }
}
```

The playback code at the bottom of the file mounts every
`.value-prop-diagram[data-scene]`. It handles the pause button, reduced motion
and offscreen pausing, and removes the static fallback once the scene draws.
