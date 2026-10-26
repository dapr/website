/* The homepage's 2D diagrams, animated or still, drawn with D3 (d3-selection
   and d3-timer, vendored in static/plugins/d3/). The value-prop diagrams that
   replaced the old MP4s, and the APIs overview, are scenes here. How to make a
   new one: skills/d3-2d-diagrams/SKILL.md.

   Markup comes from layouts/partials/diagram.html: an <svg data-scene="<name>">
   whose viewBox sets the scene's canvas (600x480 for a value prop), with a
   static fallback <image> (assets/images/diagrams/<name>.svg, regenerated with
   `npm run export:diagram-fallbacks` in tests/) and, unless it is a still
   (data-static), a pause/play button. The Dapr logo and brand marks are
   <symbol>s from layouts/partials/home/diagram-assets.html.

   Each scene builds its shapes once; frame(t) only updates opacity, transforms
   and arrow lengths. */
(function () {
  if (!window.d3 || !d3.select || !d3.timer) return;

  // colors of the original value-prop videos
  var C = {
    navy: '#1D168E', teal: '#4EA4AF', tealFill: '#D3E6E6', mint: '#1AF7A2',
    orange: '#F03E00', orangeFill: '#FACCBE',
    red: '#EE0000', blue: '#45AEEE', lavender: '#C2C0FB', grey: '#303030', caption: '#747474',
    rabbit: '#EE5D04', redis: '#C41922', black: '#000000', bg: '#FDFDFD'
  };
  // App hexagons take these in order: one app is light blue, two add dark blue,
  // three add teal, four add orange. No yellow: too light on the white background.
  var APP = [
    { stroke: '#3EA9F5', fill: '#D8ECFD' },
    { stroke: '#0D2192', fill: '#D3D7F0' },
    { stroke: C.teal, fill: C.tealFill },
    { stroke: C.orange, fill: C.orangeFill }
  ];

  function inOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // progress of a step that runs from a to b seconds, eased, clamped to 0..1
  function step(t, a, b) { return inOut(Math.max(0, Math.min(1, (t - a) / (b - a)))); }
  // a color between two #RRGGBB colors
  function mix(a, b, u) {
    var out = '#';
    for (var i = 1; i < 7; i += 2) {
      var x = parseInt(a.substr(i, 2), 16), y = parseInt(b.substr(i, 2), 16);
      out += ('0' + Math.round(x + (y - x) * u).toString(16)).slice(-2);
    }
    return out;
  }

  // pointy-top hexagon
  function hexPoints(x, y, r) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = (-90 + 60 * i) * Math.PI / 180;
      pts.push((x + r * Math.cos(a)).toFixed(2) + ',' + (y + r * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  }

  // ---- shapes: each takes a parent selection and returns a selection

  function group(parent) { return parent.append('g'); }

  // text centered on x (or starting at x, with anchor: 'start'); "\n" starts a new line below
  function label(parent, x, y, str, o) {
    o = o || {};
    var size = o.size || 11, t = parent.append('text').attr('x', x).attr('y', y).attr('text-anchor', o.anchor || 'middle')
      .attr('font-size', size).attr('font-weight', o.weight || 600).attr('fill', o.color || C.black);
    if (o.halo) t.attr('paint-order', 'stroke').attr('stroke', C.bg).attr('stroke-width', 4).attr('stroke-linejoin', 'round');
    String(str).split('\n').forEach(function (line, i) {
      t.append('tspan').attr('x', x).attr('dy', i ? size * 1.25 : 0).text(line);
    });
    return t;
  }

  function hex(parent, o) {
    var g = parent.append('g'), r = o.r || 42.5;
    g.append('polygon').attr('points', hexPoints(o.x, o.y, r))
      .attr('fill', o.fill).attr('fill-opacity', 0.6).attr('stroke', o.stroke).attr('stroke-width', 2.2);
    label(g, o.x + (o.labelDx || 0), o.y + r * 0.12, o.label || 'App', { size: o.size || r / 3, weight: 600 });
    return g;
  }

  // the small Dapr hexagon docked on an app
  function badge(parent, o) {
    var r = o.r || 19, w = r * 1.35, h = w * 270 / 367, g = parent.append('g');
    g.append('polygon').attr('points', hexPoints(o.x, o.y, r))
      .attr('fill', '#fff').attr('stroke', C.navy).attr('stroke-width', 2.2);
    g.append('use').attr('href', '#diagram-dapr-logo')
      .attr('x', o.x - w / 2).attr('y', o.y - h / 2 + 1).attr('width', w).attr('height', h);
    return g;
  }

  // an app with its Dapr badge; the badge sits bottom right, or bottom left
  function daprApp(parent, o) {
    var g = parent.append('g'), r = o.r || 42.5, side = o.badgeLeft ? -1 : 1;
    hex(g, { x: o.x, y: o.y, r: r, stroke: o.stroke, fill: o.fill, labelDx: o.badgeLeft ? r * 0.15 : -r * 0.1 });
    badge(g, { x: o.x + side * r * 0.85, y: o.y + r * 0.2, r: r * 0.45 });
    return g;
  }

  // a workflow activity
  function box(parent, o) {
    var g = parent.append('g');
    g.append('rect').attr('x', o.x - o.w / 2).attr('y', o.y - o.h / 2).attr('width', o.w).attr('height', o.h)
      .attr('fill', C.tealFill).attr('fill-opacity', 0.6).attr('stroke', C.teal).attr('stroke-width', 2.2);
    label(g, o.x, o.y + 4, o.label);
    return g;
  }

  // a workflow start or end
  function node(parent, o) {
    var g = parent.append('g');
    g.append('circle').attr('cx', o.x).attr('cy', o.y).attr('r', o.r)
      .attr('fill', 'none').attr('stroke', o.stroke).attr('stroke-width', 2.6);
    label(g, o.x, o.y + o.labelDy, o.label);
    return g;
  }

  // wireframe cylinder: the hidden back of the bottom rim is drawn faintly
  function cylinder(parent, o) {
    var rx = o.rx || 24, ry = o.ry || 8;
    var g = parent.append('g').attr('fill', 'none').attr('stroke', C.navy).attr('stroke-width', 2.2);
    g.append('ellipse').attr('cx', o.x).attr('cy', o.top).attr('rx', rx).attr('ry', ry);
    g.append('path').attr('d', 'M' + (o.x - rx) + ' ' + o.top + 'V' + o.bottom +
      'A' + rx + ' ' + ry + ' 0 0 0 ' + (o.x + rx) + ' ' + o.bottom + 'V' + o.top);
    g.append('path').attr('d', 'M' + (o.x - rx) + ' ' + o.bottom + 'A' + rx + ' ' + ry + ' 0 0 1 ' + (o.x + rx) + ' ' + o.bottom)
      .attr('stroke-width', 1.2).attr('stroke-opacity', 0.35).attr('stroke-dasharray', '3 4');
    return g;
  }

  // a message: an envelope, w wide, with an optional label
  function envelope(parent, o) {
    var w = o.w || 35, h = w * 0.76, x = o.x - w / 2, y = o.y - h / 2, g = parent.append('g');
    g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', w * 0.12)
      .attr('fill', o.fill || 'none').attr('stroke', o.color || C.grey).attr('stroke-width', o.stroke || 2.4);
    g.append('polyline').attr('points', [x + w * 0.12, y + h * 0.22, o.x, y + h * 0.58, x + w * 0.88, y + h * 0.22].join(' '))
      .attr('fill', 'none').attr('stroke', o.color || C.grey).attr('stroke-width', o.stroke || 2.4);
    if (o.label) label(g, o.x, o.y + o.labelDy, o.label);
    return g;
  }

  // a message broker: two stacked envelopes
  function broker(parent, o) {
    var g = parent.append('g'), w = o.w || 46;
    envelope(g, { x: o.x - w * 0.12, y: o.y + w * 0.1, w: w, color: C.black, stroke: 3, fill: C.bg });
    envelope(g, { x: o.x, y: o.y, w: w, color: C.black, stroke: 3, fill: C.bg });
    label(g, o.x, o.y + o.labelDy, o.label, { size: 13, weight: 700 });
    return g;
  }

  // a secret store: a padlock in a rounded square
  function lockBox(parent, o) {
    var s = o.size, x = o.x, y = o.y, g = parent.append('g').attr('stroke', C.teal).attr('stroke-width', 2.2);
    g.append('rect').attr('x', x - s / 2).attr('y', y - s / 2).attr('width', s).attr('height', s).attr('rx', s * 0.12)
      .attr('fill', C.tealFill).attr('fill-opacity', 0.6);
    g.append('path').attr('d', 'M' + (x - s * 0.13) + ' ' + (y - s * 0.02) + 'V' + (y - s * 0.13) +
      'A' + s * 0.13 + ' ' + s * 0.13 + ' 0 0 1 ' + (x + s * 0.13) + ' ' + (y - s * 0.13) + 'V' + (y - s * 0.02)).attr('fill', 'none');
    g.append('rect').attr('x', x - s * 0.22).attr('y', y - s * 0.02).attr('width', s * 0.44).attr('height', s * 0.3)
      .attr('rx', s * 0.05).attr('fill', 'none');
    g.append('circle').attr('cx', x).attr('cy', y + s * 0.13).attr('r', s * 0.035).attr('fill', C.teal);
    return g;
  }

  // a person, for an external system
  function person(parent, o) {
    var s = o.size, x = o.x, y = o.y, g = parent.append('g')
      .attr('fill', C.lavender).attr('fill-opacity', 0.8).attr('stroke', C.navy).attr('stroke-width', 2.4);
    g.append('path').attr('d', 'M' + (x - s * 0.48) + ' ' + (y + s * 0.5) + 'V' + (y + s * 0.38) +
      'C' + (x - s * 0.48) + ' ' + (y + s * 0.1) + ' ' + (x - s * 0.3) + ' ' + y + ' ' + x + ' ' + y +
      'C' + (x + s * 0.3) + ' ' + y + ' ' + (x + s * 0.48) + ' ' + (y + s * 0.1) + ' ' + (x + s * 0.48) + ' ' + (y + s * 0.38) +
      'V' + (y + s * 0.5) + 'Z');
    g.append('circle').attr('cx', x).attr('cy', y - s * 0.22).attr('r', s * 0.25);
    return g;
  }

  // secure service communication: a padlock with a shield
  function secureLock(parent, o) {
    var s = o.size, x = o.x, y = o.y, g = parent.append('g').attr('stroke', C.blue).attr('stroke-width', 2);
    g.append('path').attr('d', 'M' + (x - s * 0.3) + ' ' + (y - s * 0.05) + 'V' + (y - s * 0.22) +
      'A' + s * 0.18 + ' ' + s * 0.18 + ' 0 0 1 ' + (x + s * 0.06) + ' ' + (y - s * 0.22) + 'V' + (y - s * 0.05)).attr('fill', 'none');
    g.append('rect').attr('x', x - s * 0.45).attr('y', y - s * 0.05).attr('width', s * 0.66).attr('height', s * 0.48)
      .attr('rx', s * 0.07).attr('fill', 'none');
    g.append('circle').attr('cx', x - s * 0.18).attr('cy', y + s * 0.18).attr('r', s * 0.04).attr('fill', C.blue);
    g.append('path').attr('d', 'M' + (x + s * 0.3) + ' ' + (y + s * 0.02) + 'L' + (x + s * 0.5) + ' ' + (y + s * 0.09) +
      'V' + (y + s * 0.25) + 'C' + (x + s * 0.5) + ' ' + (y + s * 0.38) + ' ' + (x + s * 0.4) + ' ' + (y + s * 0.45) + ' ' +
      (x + s * 0.3) + ' ' + (y + s * 0.5) + 'C' + (x + s * 0.2) + ' ' + (y + s * 0.45) + ' ' + (x + s * 0.1) + ' ' + (y + s * 0.38) + ' ' +
      (x + s * 0.1) + ' ' + (y + s * 0.25) + 'V' + (y + s * 0.09) + 'Z').attr('fill', C.blue).attr('stroke', 'none');
    if (o.label) label(g, x, y + o.labelDy, o.label, { size: 11.5 }).attr('stroke', 'none');
    return g;
  }

  // a resiliency policy: two circling arrows behind the word "Resiliency"
  function retry(parent, o) {
    var r = o.r || 13, x = o.x, y = o.y, g = parent.append('g');
    var arcs = g.append('g').attr('fill', 'none').attr('stroke', C.blue).attr('stroke-width', 2.2);
    [[-160, -20], [20, 160]].forEach(function (span) {
      var a0 = span[0] * Math.PI / 180, a1 = span[1] * Math.PI / 180;
      var x1 = x + r * Math.cos(a1), y1 = y + r * Math.sin(a1);
      arcs.append('path').attr('d', 'M' + (x + r * Math.cos(a0)) + ' ' + (y + r * Math.sin(a0)) + 'A' + r + ' ' + r + ' 0 0 1 ' + x1 + ' ' + y1);
      // arrowhead at the end of the arc, pointing along it
      var t = a1 + Math.PI / 2, k = r * 0.38;
      arcs.append('polyline').attr('points', [
        x1 - k * Math.cos(t - 0.6), y1 - k * Math.sin(t - 0.6), x1, y1, x1 - k * Math.cos(t + 0.6), y1 - k * Math.sin(t + 0.6)
      ].join(' '));
    });
    label(g, x, y + 4, 'Resiliency', { size: 11.5, halo: true });
    return g;
  }

  // a failed call: a cross in a circle
  function failure(parent, o) {
    var r = o.r || 9, x = o.x, y = o.y, g = parent.append('g');
    g.append('circle').attr('cx', x).attr('cy', y).attr('r', r)
      .attr('fill', C.orangeFill).attr('stroke', C.orange).attr('stroke-width', 2.4);
    g.append('path').attr('d', 'M' + (x - r * 0.38) + ' ' + (y - r * 0.38) + 'L' + (x + r * 0.38) + ' ' + (y + r * 0.38) +
      'M' + (x + r * 0.38) + ' ' + (y - r * 0.38) + 'L' + (x - r * 0.38) + ' ' + (y + r * 0.38))
      .attr('stroke', C.orange).attr('stroke-width', 2.4);
    return g;
  }

  // a brand mark or icon symbol (assets/images/icons/<name>.svg), centered on x,y,
  // in a size x size box (or w x h), with an optional label under it. color fills single-color marks: as `fill`, and
  // as `color` for icons drawn in currentColor (the Fluent icons)
  function icon(parent, o) {
    var g = parent.append('g');
    // w and h set a box for a mark that is not square; it keeps its proportions inside it
    var w = o.w || o.size, h = o.h || o.size;
    g.append('use').attr('href', '#diagram-icon-' + o.name).attr('fill', o.color || C.black).attr('color', o.color || C.black)
      .attr('x', o.x - w / 2).attr('y', o.y - h / 2).attr('width', w).attr('height', h);
    if (o.label) label(g, o.x, o.y + o.labelDy, o.label, { size: o.labelSize || 13, weight: 700 });
    return g;
  }

  // a dashed, rounded area that groups part of a diagram
  function panel(parent, o) {
    return parent.append('rect').attr('x', o.x).attr('y', o.y).attr('width', o.w).attr('height', o.h).attr('rx', o.r || 10)
      .attr('fill', 'none').attr('stroke', o.stroke).attr('stroke-width', 2).attr('stroke-dasharray', '6 6');
  }

  // a rounded caption tag; filled (white text) or outlined (on a white ground)
  function pill(parent, o) {
    var g = parent.append('g');
    g.append('rect').attr('x', o.x - o.w / 2).attr('y', o.y - o.h / 2).attr('width', o.w).attr('height', o.h).attr('rx', o.h * 0.25)
      .attr('fill', o.filled ? o.color : '#fff').attr('stroke', o.color).attr('stroke-width', 2.2);
    label(g, o.x, o.y + (o.size || 15) * 0.35, o.text, { size: o.size || 15, color: o.filled ? '#fff' : C.black });
    return g;
  }

  // a card with an icon over a one- or two-line label (or, with inline: true, beside
  // a one-line label); filled cards invert to white. tag puts a small word, such as
  // 'alpha', in the top right corner
  function tile(parent, o) {
    var g = parent.append('g'), w = o.w || o.size || 99, h = o.h || o.size || 99;
    var ink = o.filled ? '#fff' : o.color, text = o.filled ? '#fff' : C.black;
    g.append('rect').attr('x', o.x).attr('y', o.y).attr('width', w).attr('height', h).attr('rx', 9)
      .attr('fill', o.filled ? o.color : '#fff').attr('stroke', o.color).attr('stroke-width', 2.2);
    if (o.inline) {
      icon(g, { name: o.icon, x: o.x + 22, y: o.y + h / 2, size: 26, color: ink });
      label(g, o.x + 40, o.y + h / 2 + 4, o.label, { size: o.labelSize || 12, color: text, anchor: 'start' });
    } else {
      var two = o.label.indexOf('\n') > -1;
      icon(g, { name: o.icon, x: o.x + w / 2, y: o.y + h * 0.36, size: Math.min(w, h) * 0.4, color: ink });
      label(g, o.x + w / 2, o.y + h * (two ? 0.7 : 0.8), o.label, { size: o.labelSize || 11.5, color: text });
    }
    if (o.tag) label(g, o.x + w - 6, o.y + 13, o.tag, { size: 9, weight: 700, color: ink, anchor: 'end' });
    return g;
  }

  // An arrow from a to b with an open head. Returns grow(p, o): draws it at
  // fraction p of its length and opacity o. It fades in over the first part of
  // its growth, so the head does not pop in. grow.paint(color) recolors it, and
  // grow.head(o) sets the opacity of its head ({ head: false } starts without one).
  function arrow(parent, a, b, opts) {
    opts = opts || {};
    var g = parent.append('g').attr('stroke', C.navy).attr('stroke-width', 2).attr('fill', 'none');
    var line = g.append('line').attr('x1', a[0]).attr('y1', a[1]);
    var tip = g.append('polyline').attr('points', '-8,-8 0,0 -8,8').attr('opacity', opts.head === false ? 0 : 1);
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    function grow(p, o) {
      var x = a[0] + (b[0] - a[0]) * p, y = a[1] + (b[1] - a[1]) * p, f = Math.min(1, p / 0.6);
      line.attr('x2', x).attr('y2', y);
      tip.attr('transform', 'translate(' + x + ',' + y + ') rotate(' + ang + ')');
      g.attr('opacity', f * f * (3 - 2 * f) * (o === undefined ? 1 : o));
    }
    grow.paint = function (c) { g.attr('stroke', c); };
    grow.head = function (o) { tip.attr('opacity', o); };
    grow(1);
    return grow;
  }

  // ---- scenes: build(root) returns frame(t), for a loop of T seconds; `still` is
  // the moment shown under prefers-reduced-motion, in the static fallback, and when
  // the diagram is shown as a still. A scene only ever shown as a still can leave
  // out T, and its frame(t) can ignore t.

  var scenes = {
    /* "Incrementally adopt", after the old 4_adopt.mp4 (155 frames at 24 fps).
       An existing system of three apps and Kafka; a Dapr app with a state store
       is added, then a Dapr app that publishes to RabbitMQ. Same steps and times
       as the video (shifted 0.4s by an opening hold), eased, and looping smoothly:
       the additions fade out and the diagram slides back instead of a hard cut. */
    adopt: {
      T: 8.4,
      still: 6.5,
      build: function (root) {
        var diagram = group(root);

        var base = group(diagram);
        // three kinds of app: the existing system (teal), and the two Dapr apps added to it
        hex(base, { x: 296.5, y: 102.5, stroke: APP[2].stroke, fill: APP[2].fill });
        hex(base, { x: 442.5, y: 101.5, stroke: APP[2].stroke, fill: APP[2].fill });
        hex(base, { x: 442.5, y: 243, stroke: APP[2].stroke, fill: APP[2].fill });
        icon(base, { name: 'apachekafka', x: 303, y: 236, size: 56, color: C.black, label: 'Apache Kafka', labelDy: 44 });
        arrow(base, [333, 101.5], [405, 101.5]);
        arrow(base, [296.5, 145], [296.5, 198.5]);
        arrow(base, [442.5, 144], [442.5, 198.5]);
        arrow(base, [344, 244], [404, 244]);

        var firstApp = group(diagram);
        hex(firstApp, { x: 155.5, y: 102.5, stroke: APP[0].stroke, fill: APP[0].fill });
        badge(firstApp, { x: 191.5, y: 111 });
        var daprToApp = arrow(diagram, [210.5, 102.5], [259, 102.5]);
        var daprToDb = arrow(diagram, [155.5, 145], [155.5, 198.5]);
        var db = cylinder(diagram, { x: 155.5, top: 210, bottom: 254 });
        var kafkaDown = arrow(diagram, [297, 290], [297, 345]);
        var secondApp = group(diagram);
        hex(secondApp, { x: 297, y: 389, stroke: APP[1].stroke, fill: APP[1].fill });
        badge(secondApp, { x: 333, y: 400 });
        var secondToRabbit = arrow(diagram, [352, 390], [404, 390]);
        var rabbit = icon(diagram, { name: 'rabbitmq', x: 421, y: 385, size: 32, color: C.rabbit, label: 'RabbitMQ', labelDy: 34 });

        var START = [-81, 61.5]; // where the base diagram sits before it slides into place

        return function (t) {
          var slide = step(t, 0.4, 1.1) - step(t, 7.5, 8.2);
          diagram.attr('transform', 'translate(' + (START[0] * (1 - slide)).toFixed(2) + ',' + (START[1] * (1 - slide)).toFixed(2) + ')');

          var out = 1 - step(t, 7.0, 7.5); // everything added fades out together
          firstApp.attr('opacity', step(t, 1.23, 1.9) * out);
          daprToApp(step(t, 2.07, 2.57), out);
          daprToDb(step(t, 2.07, 2.57), out);
          db.attr('opacity', step(t, 2.73, 3.23) * out);
          kafkaDown(step(t, 3.23, 3.73), out);
          secondApp.attr('opacity', step(t, 3.9, 4.35) * out);
          secondToRabbit(step(t, 4.65, 5.15), out);
          rabbit.attr('opacity', step(t, 5.23, 5.73) * out);
        };
      }
    },

    /* "Durable execution for your business processes", after the old
       1_automate.mp4 (306 frames at 24 fps). A workflow builds up step by step:
       a pub/sub message starts it, activities call the Secrets API, wait for an
       external event, invoke an app and write key/value state, and completion
       publishes a message. Same steps and times as the video (shifted 0.3s), eased;
       the loop fades everything out instead of a hard cut. */
    automate: {
      T: 14,
      still: 13,
      build: function (root) {
        var X = 295.5, W = 194, H = 30;
        var d = group(root);
        var steps = [];
        // each entry fades in (or grows, for arrows) over [a, b] seconds
        function at(a, b, el) { steps.push({ a: a, b: b, el: el }); return el; }

        at(0.3, 0.55, envelope(d, { x: 179, y: 61, label: 'Pub/Sub\nMessage', labelDy: -40 }));
        at(1.3, 1.63, arrow(d, [198.5, 61], [276, 61]));
        at(1.8, 2.05, node(d, { x: X, y: 61, r: 18.5, stroke: C.mint, label: 'Workflow/ Start', labelDy: -26 }));
        at(2.13, 2.43, arrow(d, [X, 80], [X, 109]));
        at(2.63, 2.93, box(d, { x: X, y: 126, w: W, h: H, label: 'Activity 1' }));
        at(3.4, 3.95, arrow(d, [393.5, 126], [507, 126]));
        at(3.4, 3.95, label(d, 451, 115.5, 'Secrets API'));
        at(4.05, 4.35, lockBox(d, { x: 533.5, y: 126, size: 46 }));
        at(4.55, 4.9, arrow(d, [X, 141.5], [X, 174]));
        at(4.95, 5.2, box(d, { x: X, y: 191, w: W, h: H, label: 'Wait for event' }));
        at(5.4, 5.7, person(d, { x: 73, y: 192, size: 44 }));
        at(5.85, 6.2, arrow(d, [99, 191], [196.5, 191]));
        at(5.85, 6.2, label(d, 140, 180, 'External System'));
        at(6.9, 7.2, arrow(d, [X, 206.5], [X, 239.5]));
        at(7.25, 7.55, box(d, { x: X, y: 257, w: W, h: H, label: 'Activity 2' }));
        at(7.6, 8.0, arrow(d, [393.5, 257], [502, 257]));
        at(7.6, 8.0, label(d, 453, 231, 'Service\nInvocation'));
        at(8.05, 8.35, hex(d, { x: 536, y: 257, r: 32, stroke: APP[0].stroke, fill: APP[0].fill, size: 11.5 }));
        at(8.6, 8.9, arrow(d, [X, 272.5], [X, 302]));
        at(8.95, 9.25, box(d, { x: X, y: 319.5, w: W, h: H, label: 'Activity 3' }));
        at(9.9, 10.25, arrow(d, [197.5, 319.5], [98.5, 319.5]));
        at(9.9, 10.25, label(d, 149.5, 309, 'Key/Value'));
        at(10.25, 10.55, cylinder(d, { x: 73, top: 302, bottom: 336, rx: 22, ry: 8 }));
        at(10.75, 11.05, arrow(d, [X, 335], [X, 366.5]));
        at(11.1, 11.4, node(d, { x: X, y: 387.5, r: 18.5, stroke: C.orange, label: 'Workflow/ Complete', labelDy: 35 }));
        at(11.45, 11.85, arrow(d, [314, 387.5], [394, 387.5]));
        at(12.05, 12.35, envelope(d, { x: 414, y: 388, label: 'Pub/Sub\nMessage', labelDy: 33 }));

        return function (t) {
          var out = 1 - step(t, 13.1, 13.7);
          steps.forEach(function (s) {
            var u = step(t, s.a, s.b);
            if (typeof s.el === 'function') s.el(u, out);
            else s.el.attr('opacity', u * out);
          });
        };
      }
    },

    /* "Secure and resilient by default", after the old 2_best_practices.mp4
       (336 frames at 24 fps, fitted from 2200x1536 into 600x480). Three calls fail
       (red, with a cross), a resiliency policy retries them (green) and they go
       through (navy). Same steps and times as the video (shifted 0.4s), eased;
       colors blend instead of switching, and the loop fades the calls out. */
    secure: {
      T: 15.2,
      still: 14,
      build: function (root) {
        var Y = 249.5, d = group(root);
        daprApp(d, { x: 70.5, y: 243, r: 32, stroke: APP[0].stroke, fill: APP[0].fill });
        daprApp(d, { x: 316.5, y: 243, r: 32, stroke: APP[1].stroke, fill: APP[1].fill });
        broker(d, { x: 513, y: 247, label: 'Message Broker', labelDy: 42 });
        daprApp(d, { x: 510.5, y: 103, r: 32, stroke: APP[2].stroke, fill: APP[2].fill, badgeLeft: true });
        daprApp(d, { x: 510.5, y: 368, r: 32, stroke: APP[3].stroke, fill: APP[3].fill, badgeLeft: true });

        // A call that fails, is retried, and goes through: `before` grows with a
        // head and turns red with a cross; then it turns green, loses its head and
        // the retry appears; then it turns navy and `after` grows to the target.
        // Lines in `also` lead up to `before` and change color with it.
        function call(before, mid, after, times, also) {
          var line = arrow(d, before[0], before[1]);
          var cross = failure(d, { x: mid[0], y: mid[1] });
          var policy = retry(d, { x: mid[0], y: mid[1] });
          var rest = arrow(d, after[0], after[1]);
          return function (t, out) {
            var red = step(t, times.fail, times.fail + 0.3), green = step(t, times.retry, times.retry + 0.3);
            var navy = step(t, times.done, times.done + 0.2);
            line(step(t, times.grow, times.grow + 0.45), out);
            var color = mix(mix(mix(C.navy, C.red, red), C.mint, green), C.navy, navy);
            line.paint(color);
            (also || []).forEach(function (l) { l.paint(color); });
            line.head(1 - green);
            cross.attr('opacity', (red - step(t, times.retry - 0.15, times.retry + 0.05)) * out);
            policy.attr('opacity', step(t, times.retry + 0.15, times.retry + 0.35) * out);
            rest(step(t, times.done + 0.3, times.done + 0.7), out);
          };
        }

        var first = arrow(d, [111.5, Y], [140.5, Y], { head: false });
        var lock = secureLock(d, { x: 156.5, y: 247, size: 28, label: 'Secure Service\nCommunication', labelDy: 29 });
        var calls = [
          call([[173.5, Y], [206, Y]], [232.5, 247], [[260.5, Y], [288.5, Y]], { grow: 2.57, fail: 3.23, retry: 3.9, done: 4.4 }, [first]),
          call([[357.5, Y], [386, Y]], [412.5, Y], [[442, Y], [480, Y]], { grow: 5.5, fail: 6.23, retry: 7.4, done: 8.2 }),
          call([[511, 215.5], [511, 193]], [511, 176], [[511, 159.5], [511, 136]], { grow: 10.0, fail: 10.57, retry: 11.73, done: 12.2 })
        ];
        var down = arrow(d, [510.5, 304.5], [510.5, 334]);

        return function (t) {
          var out = 1 - step(t, 14.4, 14.9);
          first(step(t, 1.4, 1.65), out);
          lock.attr('opacity', step(t, 1.73, 2.0) * out);
          calls.forEach(function (c) { c(t, out); });
          down(step(t, 10.0, 10.4), out);
        };
      }
    },

    /* "Integrate with the infrastructure of your choice", after the old
       3_integrate.mp4 (199 frames at 24 fps). The same app, built on Azure, then
       on AWS, Google Cloud and on-premises: only the components change. Each
       platform slides in and crossfades, as in the video; platforms are named in
       text instead of with company logos. */
    integrate: {
      T: 9.8,
      still: 4,
      build: function (root) {
        var platforms = [
          { caption: 'Microsoft Azure', broker: ['azure-service-bus', 'Azure Service Bus', 60], secrets: ['azure-key-vault', 'Azure Key Vault', 60], db: ['azure-cosmos-db', 'Azure Cosmos DB', 60] },
          { caption: 'AWS', broker: ['amazon-sns', 'Amazon Simple\nNotification Service', 50], secrets: ['aws-kms', 'AWS Key\nManagement Service', 50], db: ['amazon-dynamodb', 'Amazon\nDynamoDB', 50] },
          { caption: 'Google Cloud', broker: ['google-cloud-pubsub', 'Google Cloud\nPub/Sub', 58], secrets: ['google-cloud-secret-manager', 'Google Cloud\nSecret Manager', 58], db: ['google-cloud-firestore', 'Google Cloud\nFirestore', 58] },
          { caption: 'On-Prem', broker: ['rabbitmq', 'RabbitMQ', 36, C.rabbit], secrets: ['hashicorp-vault', 'HashiCorp Vault', 38, C.black], db: ['redis', 'Redis', 40, C.redis] }
        ];

        // one complete diagram per platform; returns its parts so the first can build up
        function diagram(p) {
          var g = group(root), parts = {};
          function mark(spec, x, y) {
            return icon(g, { name: spec[0], x: x, y: y, size: spec[2], color: spec[3], label: spec[1], labelDy: spec[2] / 2 + 15 });
          }
          parts.app = daprApp(g, { x: 66.5, y: 207.5, stroke: APP[0].stroke, fill: APP[0].fill });
          parts.caption = label(g, 293.5, 380, p.caption, { size: 16, weight: 600, color: C.caption });
          parts.toBroker = arrow(g, [120, 207.5], [163, 207.5]);
          parts.toSecrets = arrow(g, [66.5, 250], [66.5, 296]);
          parts.broker = mark(p.broker, 201.5, 205);
          parts.secrets = mark(p.secrets, 66.5, 331);
          parts.fan = arrow(g, [234, 207.5], [292.5, 207.5], { head: false });
          parts.fanUp = arrow(g, [292.5, 207.5], [292.5, 162.5], { head: false });
          parts.fanDown = arrow(g, [292.5, 207.5], [292.5, 253.5], { head: false });
          parts.toTop = arrow(g, [292.5, 162.5], [352, 162.5]);
          parts.toBottom = arrow(g, [292.5, 253.5], [352, 253.5]);
          parts.apps = group(g);
          daprApp(parts.apps, { x: 395, y: 159, stroke: APP[1].stroke, fill: APP[1].fill });
          daprApp(parts.apps, { x: 395, y: 257, stroke: APP[2].stroke, fill: APP[2].fill });
          parts.toDb = arrow(g, [448, 255.5], [497, 255.5]);
          parts.db = mark(p.db, 534, 250);
          parts.g = g;
          return parts;
        }
        var views = platforms.map(diagram);
        var first = views[0];
        // [slide in, slide out] times per platform, after the first has built up
        var shown = [[0, 4.3], [4.4, 5.9], [6.0, 7.5], [7.6, 9.1]];

        return function (t) {
          views.forEach(function (v, i) {
            var inn = i ? step(t, shown[i][0], shown[i][0] + 0.3) : 1;
            var gone = step(t, shown[i][1], shown[i][1] + 0.3);
            var x = 50 * (1 - inn) - 50 * gone;
            v.g.attr('transform', 'translate(' + x.toFixed(2) + ',0)').attr('opacity', inn * (1 - gone));
          });
          first.app.attr('opacity', step(t, 0.45, 0.75));
          first.caption.attr('opacity', step(t, 0.45, 0.75));
          first.toBroker(step(t, 1.05, 1.4));
          first.toSecrets(step(t, 1.05, 1.4));
          first.broker.attr('opacity', step(t, 1.35, 1.65));
          first.secrets.attr('opacity', step(t, 1.35, 1.65));
          first.fan(step(t, 1.75, 2.0));
          first.fanUp(step(t, 1.95, 2.1));
          first.fanDown(step(t, 1.95, 2.1));
          first.toTop(step(t, 2.05, 2.35));
          first.toBottom(step(t, 2.05, 2.35));
          first.apps.attr('opacity', step(t, 2.3, 2.6));
          first.toDb(step(t, 3.05, 3.35));
          first.db.attr('opacity', step(t, 3.3, 3.6));
        };
      }
    },

    /* "The APIs behind it", after the old assets/images/dapr-apis-overview.png (3168x1647),
       as a still on a 1200x624 canvas that scales with the section, like the
       image did. Three bands: your app in any language or runtime; Dapr and
       its APIs, reached over HTTP or gRPC; the infrastructure Dapr runs on and
       integrates with. Languages, runtimes and clouds are shown with their own logos. */
    apis: {
      still: 0,
      build: function (root) {
        var d = group(root), BLUE = APP[0].stroke;

        // languages and runtimes
        panel(d, { x: 23, y: 28, w: 1158, h: 119, stroke: C.teal });
        pill(d, { x: 1005, y: 30, w: 294, h: 35, text: 'Use any language or runtime', color: C.teal });
        hex(d, { x: 136, y: 88, r: 47, stroke: APP[0].stroke, fill: APP[0].fill, label: 'My app', size: 15 });
        // the languages' and runtimes' own logos (assets/images/icons/README.md), sized to
        // their proportions; most carry their name, and the description lists them all
        [['nodejs', 72, 44], ['python', 44, 44], ['dotnet', 44, 44], ['go', 86, 32], ['java', 28, 52],
          ['php', 76, 41], ['rust', 46, 46]].forEach(function (l, i) {
          icon(d, { name: l[0], x: 290 + i * 136.5, y: 88, w: l[1], h: l[2] });
        });

        // Dapr and its APIs
        panel(d, { x: 23, y: 180, w: 1158, h: 291, stroke: BLUE });
        arrow(d, [136, 136], [136, 252]);
        pill(d, { x: 136, y: 180, w: 132, h: 26, text: 'HTTP / gRPC API', color: BLUE, filled: true, size: 13.5 });
        d.append('polygon').attr('points', hexPoints(136, 342, 84))
          .attr('fill', '#fff').attr('stroke', C.navy).attr('stroke-width', 2.6);
        var lw = 112, lh = lw * 270 / 367;
        d.append('use').attr('href', '#diagram-dapr-logo').attr('x', 136 - lw / 2).attr('y', 342 - lh / 2)
          .attr('width', lw).attr('height', lh);
        // the APIs, two rows of eight; the alpha APIs are tagged, as on the API cards,
        // and grouped together at the end of the second row
        [[['flowchart', 'Workflow'], ['mail-copy', 'Publish /\nSubscribe'], ['arrow-step-in-right', 'Service\nInvocation'],
          ['database', 'State\nManagement'], ['people-team', 'Actors'], ['clock', 'Jobs'],
          ['settings-cog-multiple', 'External\nConfiguration'], ['key', 'Secrets']],
         [['plug-disconnected', 'Bindings'], ['arrow-move', 'Middleware'],
          ['lock-closed-key', 'Cryptography', 'alpha'], ['table-lock', 'Distributed\nlock', 'alpha'], ['chat', 'Conversation', 'alpha'],
          ['cloud-archive', 'Binary Store', 'alpha'], ['document-search', 'Search', 'alpha'], ['data-scatter', 'Vector', 'alpha']]
        ].forEach(function (row, r) {
          row.forEach(function (t, i) {
            tile(d, { x: 238 + i * 100, y: 214 + r * 123, w: 88, h: 99, icon: 'fluent-' + t[0], label: t[1],
              tag: t[2], color: BLUE, labelSize: 11 });
          });
        });
        // what Dapr gives every API: a column of filled tiles
        [['heart-pulse', 'Observability'], ['shield-lock', 'Security'], ['arrow-clockwise', 'Resiliency']].forEach(function (t, i) {
          tile(d, { x: 1038, y: 214 + i * 78, w: 128, h: 66, icon: 'fluent-' + t[0], label: t[1], color: BLUE, filled: true, inline: true });
        });
        arrow(d, [124, 474], [124, 506]);
        arrow(d, [142, 506], [142, 474]);

        // infrastructure
        panel(d, { x: 23, y: 510, w: 1158, h: 102, stroke: C.navy });
        pill(d, { x: 913, y: 510, w: 478, h: 36, text: 'Host on & integrate with any cloud or edge infrastructure', color: C.navy });
        var Y = 574;
        // the clouds' own logos (assets/images/icons/README.md): Azure's mark with its
        // name, and the AWS and Google Cloud logos, which carry theirs
        icon(d, { name: 'azure', x: 62, y: Y - 5, size: 30 });
        label(d, 83, Y, 'Azure', { size: 15, anchor: 'start' });
        icon(d, { name: 'aws', x: 172, y: Y - 4, w: 50, h: 30 });
        icon(d, { name: 'googlecloud', x: 302, y: Y - 5, w: 156, h: 24 });
        icon(d, { name: 'kubernetes', x: 412, y: Y - 5, size: 30, color: '#326CE5' });
        label(d, 433, Y, 'Kubernetes', { size: 15, anchor: 'start' });
        [['fluent-server', 'Virtual or\nphysical machines', 560], ['fluent-database', 'Databases', 755],
          ['fluent-mail-copy', 'Message brokers', 890], ['fluent-plug-disconnected', 'Services', 1062]].forEach(function (b) {
          icon(d, { name: b[0], x: b[2], y: Y - 5, size: 30, color: BLUE });
          label(d, b[2] + 22, b[1].indexOf('\n') > -1 ? Y - 9 : Y, b[1], { size: 13.5, anchor: 'start' });
        });

        return function () {};
      }
    }
  };

  // ---- playback: pause/play button, prefers-reduced-motion, offscreen

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(svgNode) {
    var scene = scenes[svgNode.getAttribute('data-scene')];
    if (!scene) return;
    // the static fallback stays up for an unknown scene or when this script does not run
    var fallback = svgNode.querySelector('.diagram-fallback');
    if (fallback) fallback.remove();

    var root = d3.select(svgNode).append('g').attr('aria-hidden', 'true')
      .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    var frame = scene.build(root);

    // a still diagram (data-static, from diagramstatic in the data) is drawn once,
    // at its complete frame, with no timer and no pause button; so is a scene
    // without a loop length T, which can only be shown as a still
    if (svgNode.hasAttribute('data-static') || !scene.T) {
      frame(scene.still || 0);
      return;
    }

    var toggle = svgNode.parentNode.querySelector('.diagram-toggle');
    var label = toggle ? toggle.getAttribute('data-label') : '';
    var playing = !reduce, visible = true, timer = null, elapsed = scene.still, last = null;
    if (!reduce) elapsed = 0;

    function tick(now) {
      if (last !== null) elapsed += (now - last) / 1000;
      last = now;
      frame(elapsed % scene.T);
    }
    function sync() {
      var run = playing && visible;
      if (run && !timer) { last = null; timer = d3.timer(function () { tick(d3.now()); }); }
      if (!run && timer) { timer.stop(); timer = null; }
      if (toggle) {
        toggle.setAttribute('aria-label', (playing ? 'Pause animation: ' : 'Play animation: ') + label);
        toggle.innerHTML = playing ? '<i class="fas fa-pause" aria-hidden="true"></i>' : '<i class="fas fa-play" aria-hidden="true"></i>';
      }
    }

    frame(elapsed % scene.T);
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () { playing = !playing; sync(); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(svgNode);
    }
    sync();
  }

  Array.prototype.forEach.call(document.querySelectorAll('svg[data-scene]'), mount);
})();
