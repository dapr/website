/* Homepage value-prop diagrams: 2D animations drawn with D3 (d3-selection and
   d3-timer, vendored in static/plugins/d3/), replacing the old MP4s one by one.

   Markup lives in layouts/partials/home/value-props.html: each diagram is an
   <svg class="value-prop-diagram" data-scene="<name>"> with a static fallback
   <image> (assets/images/value-props/<name>.svg, regenerated with
   `npm run export:diagram-fallbacks` in tests/) and a pause/play button. The Dapr
   logo and brand marks are <symbol>s in the same partial.

   Each scene builds its shapes once; frame(t) only updates opacity, transforms
   and arrow lengths. Layouts are in a 600x480 space. */
(function () {
  if (!window.d3 || !d3.select || !d3.timer) return;

  // colors of the original value-prop videos
  var C = {
    navy: '#1D168E', teal: '#4EA4AF', tealFill: '#D3E6E6', mint: '#1AF7A2', mintFill: '#CAF7E6',
    yellow: '#E9D30A', yellowFill: '#FAF6CB', rabbit: '#EE5D04', black: '#000000'
  };

  function inOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // progress of a step that runs from a to b seconds, eased, clamped to 0..1
  function step(t, a, b) { return inOut(Math.max(0, Math.min(1, (t - a) / (b - a)))); }

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

  function hex(parent, o) {
    var g = parent.append('g');
    g.append('polygon').attr('points', hexPoints(o.x, o.y, o.r || 42.5))
      .attr('fill', o.fill).attr('fill-opacity', 0.6).attr('stroke', o.stroke).attr('stroke-width', 2.2);
    g.append('text').attr('x', o.x).attr('y', o.y + 5).attr('text-anchor', 'middle')
      .attr('font-size', 14).attr('font-weight', 600).attr('fill', C.black).text(o.label || 'App');
    return g;
  }

  // the small Dapr hexagon docked on an app
  function badge(parent, o) {
    var r = o.r || 19, w = r * 1.35, h = w * 270 / 367, g = parent.append('g');
    g.append('polygon').attr('points', hexPoints(o.x, o.y, r))
      .attr('fill', '#fff').attr('stroke', C.navy).attr('stroke-width', 2.2);
    g.append('use').attr('href', '#value-prop-dapr-logo')
      .attr('x', o.x - w / 2).attr('y', o.y - h / 2 + 1).attr('width', w).attr('height', h);
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

  // a brand mark symbol, centered on x,y, with a label under it
  function icon(parent, o) {
    var g = parent.append('g');
    g.append('use').attr('href', '#value-prop-icon-' + o.name).attr('fill', o.color)
      .attr('x', o.x - o.size / 2).attr('y', o.y - o.size / 2).attr('width', o.size).attr('height', o.size);
    g.append('text').attr('x', o.x).attr('y', o.y + o.labelDy).attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('font-weight', 700).attr('fill', C.black).text(o.label);
    return g;
  }

  // An arrow from a to b with an open head. Returns grow(p, o): draws it at
  // fraction p of its length and opacity o. It fades in over the first part of
  // its growth, so the head does not pop in.
  function arrow(parent, a, b) {
    var g = parent.append('g').attr('stroke', C.navy).attr('stroke-width', 2).attr('fill', 'none');
    var line = g.append('line').attr('x1', a[0]).attr('y1', a[1]);
    var tip = g.append('polyline').attr('points', '-8,-8 0,0 -8,8');
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    function grow(p, o) {
      var x = a[0] + (b[0] - a[0]) * p, y = a[1] + (b[1] - a[1]) * p, f = Math.min(1, p / 0.4);
      line.attr('x2', x).attr('y2', y);
      tip.attr('transform', 'translate(' + x + ',' + y + ') rotate(' + ang + ')');
      g.attr('opacity', f * f * (3 - 2 * f) * (o === undefined ? 1 : o));
    }
    grow(1);
    return grow;
  }

  // ---- scenes: build(root) returns frame(t), for a loop of T seconds; `still` is
  // the moment shown under prefers-reduced-motion and in the static fallback

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
        hex(base, { x: 296.5, y: 102.5, stroke: C.teal, fill: C.tealFill });
        hex(base, { x: 442.5, y: 101.5, stroke: C.teal, fill: C.tealFill });
        hex(base, { x: 442.5, y: 243, stroke: C.teal, fill: C.tealFill });
        icon(base, { name: 'apachekafka', x: 303, y: 236, size: 56, color: C.black, label: 'Apache Kafka', labelDy: 44 });
        arrow(base, [333, 101.5], [405, 101.5]);
        arrow(base, [296.5, 145], [296.5, 198.5]);
        arrow(base, [442.5, 144], [442.5, 198.5]);
        arrow(base, [344, 244], [404, 244]);

        var daprApp = group(diagram);
        hex(daprApp, { x: 155.5, y: 102.5, stroke: C.mint, fill: C.mintFill });
        badge(daprApp, { x: 191.5, y: 111 });
        var daprToApp = arrow(diagram, [210.5, 102.5], [259, 102.5]);
        var daprToDb = arrow(diagram, [155.5, 145], [155.5, 198.5]);
        var db = cylinder(diagram, { x: 155.5, top: 210, bottom: 254 });
        var kafkaDown = arrow(diagram, [297, 290], [297, 345]);
        var yellowApp = group(diagram);
        hex(yellowApp, { x: 297, y: 389, stroke: C.yellow, fill: C.yellowFill });
        badge(yellowApp, { x: 333, y: 400 });
        var yellowToRabbit = arrow(diagram, [352, 390], [404, 390]);
        var rabbit = icon(diagram, { name: 'rabbitmq', x: 421, y: 385, size: 32, color: C.rabbit, label: 'RabbitMQ', labelDy: 34 });

        var START = [-81, 61.5]; // where the base diagram sits before it slides into place

        return function (t) {
          var slide = step(t, 0.4, 1.1) - step(t, 7.5, 8.2);
          diagram.attr('transform', 'translate(' + (START[0] * (1 - slide)).toFixed(2) + ',' + (START[1] * (1 - slide)).toFixed(2) + ')');

          var out = 1 - step(t, 7.0, 7.5); // everything added fades out together
          daprApp.attr('opacity', step(t, 1.23, 1.9) * out);
          daprToApp(step(t, 2.07, 2.57), out);
          daprToDb(step(t, 2.07, 2.57), out);
          db.attr('opacity', step(t, 2.73, 3.23) * out);
          kafkaDown(step(t, 3.23, 3.73), out);
          yellowApp.attr('opacity', step(t, 3.9, 4.35) * out);
          yellowToRabbit(step(t, 4.65, 5.15), out);
          rabbit.attr('opacity', step(t, 5.23, 5.73) * out);
        };
      }
    }
  };

  // ---- playback: pause/play button, prefers-reduced-motion, offscreen

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(svgNode) {
    var scene = scenes[svgNode.getAttribute('data-scene')];
    if (!scene) return;
    // the static fallback stays up for an unknown scene or when this script does not run
    var fallback = svgNode.querySelector('.value-prop-diagram-fallback');
    if (fallback) fallback.remove();

    var root = d3.select(svgNode).append('g').attr('aria-hidden', 'true')
      .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    var frame = scene.build(root);

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

  Array.prototype.forEach.call(document.querySelectorAll('.value-prop-diagram'), mount);
})();
