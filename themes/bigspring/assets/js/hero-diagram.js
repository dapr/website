/* Homepage hero diagram: a wireframe 3D scene drawn with D3 (d3-selection and
   d3-timer, vendored in static/plugins/d3/). Dapr sits in the middle with the
   logo on its top face; three apps, a message broker, and a state store connect
   to it, with pulses showing calls, messages, and durable state.

   Markup lives in layouts/partials/home/hero.html: an <svg class="hero-diagram-svg">
   holding the logo as <symbol id="hero-dapr-logo"> and a static fallback image
   (assets/images/dapr_hero_diagram.svg, regenerated with
   `npm run export:diagram-fallbacks` in tests/), and a pause/play button.
   The scene is laid out in a 700x600 space; the svg's viewBox crops it. */
(function () {
  var svgNode = document.querySelector('.hero-diagram-svg');
  if (!svgNode || !window.d3 || !d3.select || !d3.timer) return;
  // the static fallback stays up when this script or D3 does not load
  var fallback = svgNode.querySelector('.hero-diagram-fallback');
  if (fallback) fallback.remove();

  var cos = Math.cos, sin = Math.sin, PI = Math.PI, TAU = PI * 2;
  var C = {
    navy: '#0D2192', mid: '#476581', blue: '#3EA9F5', light: '#73CDF3', teal: '#489fb5', bg: '#fcfcfc'
  };
  // App hexagons take these in order, as in the 2D diagrams (diagrams.js):
  // light blue, dark blue, teal, then orange. No yellow.
  var APP = ['#3EA9F5', '#0D2192', '#4EA4AF', '#F03E00'];
  var TEXT = 1.5; // label scale: the diagram renders at roughly 0.55x its layout size

  // ---- geometry: everything is a list of segments [[x,y,z],[x,y,z]], y is up

  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function poly(c, r, n, y) {
    return range(n).map(function (i) { var a = i * TAU / n; return [c[0] + r * cos(a), y, c[2] + r * sin(a)]; });
  }
  function closed(pts) { return pts.map(function (p, i) { return [p, pts[(i + 1) % pts.length]]; }); }
  function open(pts) { return pts.slice(1).map(function (p, i) { return [pts[i], p]; }); }
  function hex(c, r) { return closed(poly(c, r, 6, c[1])); }
  function ring(c, r, n) { return closed(poly(c, r, n || 40, c[1])); }
  function prism(c, r, h, n, verts) {
    n = n || 6; verts = verts || n;
    var b = poly(c, r, n, c[1]), t = poly(c, r, n, c[1] + h);
    return closed(b).concat(closed(t), range(verts).map(function (i) {
      var k = Math.round(i * n / verts) % n;
      return [b[k], t[k]];
    }));
  }
  // flat-topped hex tiling in the xz-plane, clipped to radius R
  function hexGrid(r, R) {
    var segs = [], s3 = Math.sqrt(3), n = Math.ceil(R / r);
    for (var q = -n; q <= n; q++) for (var k = -n; k <= n; k++) {
      var x = r * 1.5 * q, z = r * s3 * (k + q / 2);
      if (Math.hypot(x, z) > R - r) continue;
      segs = segs.concat(closed(poly([x, 0, z], r * 0.94, 6, 0)));
    }
    return segs;
  }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function lerp3(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
  function along(pts, u) {
    var lens = pts.slice(1).map(function (p, i) { return Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]); });
    var d = u * lens.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; i < lens.length; i++) {
      if (d <= lens[i]) return lerp3(pts[i], pts[i + 1], d / lens[i]);
      d -= lens[i];
    }
    return pts[pts.length - 1];
  }

  // ---- renderer

  var cam = { yaw: 0, pitch: 0.62, dist: 1600, scale: 0.74, target: [40, 40, -10], cx: 350, cy: 240, depth: 360 };

  function proj(p) {
    var x = p[0] - cam.target[0], y = p[1] - cam.target[1], z = p[2] - cam.target[2];
    var cy = cos(cam.yaw), sy = sin(cam.yaw);
    var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    var cp = cos(cam.pitch), sp = sin(cam.pitch);
    var y1 = y * cp + z1 * sp, z2 = -y * sp + z1 * cp;
    var k = cam.dist / (cam.dist + z2);
    return [cam.cx + x1 * k * cam.scale, cam.cy - y1 * k * cam.scale, z2, k];
  }
  // depth cue: far lines fade, which is most of the wireframe feel
  function fade(z) { return 1 - 0.62 * Math.max(0, Math.min(1, (z + cam.depth) / (2 * cam.depth))); }

  var svg = d3.select(svgNode);
  var root = svg.append('g').attr('aria-hidden', 'true');
  var glowId = 'hero-diagram-glow';
  svg.select('defs').append('filter').attr('id', glowId)
    .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%')
    .append('feGaussianBlur').attr('stdDeviation', 4);
  var gGlow = root.append('g').attr('filter', 'url(#' + glowId + ')').attr('fill', 'none').attr('stroke-linecap', 'round');
  var gBack = root.append('g').attr('fill', 'none').attr('stroke-linecap', 'round');
  var gLogo = root.append('g');
  var gFront = root.append('g').attr('fill', 'none').attr('stroke-linecap', 'round');
  var gDots = root.append('g');
  var gText = root.append('g')
    .attr('paint-order', 'stroke').attr('stroke', C.bg).attr('stroke-width', 4 * TEXT).attr('stroke-linejoin', 'round');
  var logoUse = gLogo.append('use').attr('href', '#hero-dapr-logo').attr('width', 367).attr('height', 270);

  // Each item becomes a few <path>s: its segments bucketed by depth fade and by
  // whether they sit behind the logo. Far fewer DOM nodes than one <line> each.
  //   items:  { segs, c, w, o, dash, glow, flat }
  //   dots:   { p, r, c, o }
  //   labels: { p, t, c, size, weight, dy }
  function draw(items, dots, labels, splitZ) {
    var paths = [], glows = [];
    items.forEach(function (it) {
      var buckets = {};
      it.segs.forEach(function (s) {
        var a = proj(s[0]), b = proj(s[1]), z = (a[2] + b[2]) / 2;
        var f = it.flat ? 1 : Math.round(fade(z) * 8) / 8;
        var key = (z > splitZ ? 'b' : 'f') + f;
        (buckets[key] = buckets[key] || { back: z > splitZ, f: f, d: [] })
          .d.push('M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1));
      });
      Object.keys(buckets).forEach(function (key) {
        var bk = buckets[key], o = (it.o === undefined ? 1 : it.o) * bk.f;
        var p = { d: bk.d.join(''), c: it.c, w: it.w || 1, o: o, dash: it.dash || null, back: bk.back };
        paths.push(p);
        if (it.glow) glows.push({ d: p.d, c: p.c, w: p.w + 3, o: o * it.glow, dash: null });
      });
    });
    function put(g, data) {
      g.selectAll('path').data(data).join('path')
        .attr('d', function (d) { return d.d; }).attr('stroke', function (d) { return d.c; })
        .attr('stroke-width', function (d) { return d.w; }).attr('stroke-opacity', function (d) { return d.o; })
        .attr('stroke-dasharray', function (d) { return d.dash; });
    }
    put(gBack, paths.filter(function (p) { return p.back; }));
    put(gFront, paths.filter(function (p) { return !p.back; }));
    put(gGlow, glows);

    var pd = dots.map(function (d) {
      var p = proj(d.p);
      return { x: p[0], y: p[1], r: d.r * p[3], c: d.c, o: (d.o === undefined ? 1 : d.o) * fade(p[2]) };
    }).filter(function (d) { return d.o > 0; });
    gDots.selectAll('circle').data(pd).join('circle')
      .attr('cx', function (d) { return d.x; }).attr('cy', function (d) { return d.y; }).attr('r', function (d) { return d.r; })
      .attr('fill', function (d) { return d.c; }).attr('fill-opacity', function (d) { return d.o; });

    gText.selectAll('text').data(labels).join('text')
      .attr('x', function (l) { return proj(l.p)[0]; })
      .attr('y', function (l) { return proj(l.p)[1] + (l.dy || 0) * TEXT; })
      .attr('fill', function (l) { return l.c; }).attr('font-size', function (l) { return l.size * TEXT; })
      .attr('font-weight', function (l) { return l.weight; }).attr('text-anchor', 'middle')
      .text(function (l) { return l.t; });
  }

  // Places the logo symbol on a plane: o is its top-left corner, u/v unit vectors
  // along its x and y (y down), w its width. Affine, close enough at this distance.
  // Returns the depth of its center, used to split lines in front of and behind it.
  function placeLogo(o, u, v, w) {
    var h = w * 270 / 367;
    var p0 = proj(o), px = proj([o[0] + u[0] * w, o[1] + u[1] * w, o[2] + u[2] * w]);
    var py = proj([o[0] + v[0] * h, o[1] + v[1] * h, o[2] + v[2] * h]);
    logoUse.attr('transform', 'matrix(' + [(px[0] - p0[0]) / 367, (px[1] - p0[1]) / 367,
      (py[0] - p0[0]) / 270, (py[1] - p0[1]) / 270, p0[0], p0[1]].map(function (n) { return n.toFixed(4); }).join(',') + ')');
    return proj([o[0] + (u[0] * w + v[0] * h) / 2, o[1] + (u[1] * w + v[1] * h) / 2, o[2] + (u[2] * w + v[2] * h) / 2])[2];
  }

  // ---- scene

  var R = 125, H = 52, SR = 56, SH = 96, AR = 70, AH = 38, DIST = 300;
  function deg(d) { return d * PI / 180; }
  function polar(a, d) { return [d * cos(a), 0, d * sin(a)]; }
  // distance from a flat-topped hexagon's center to its edge in direction a
  function reach(r, a) {
    var s = PI / 3, m = ((a % s) + s) % s;
    return (r * Math.sqrt(3) / 2) / cos(m - s / 2);
  }
  // straight floor link between two shapes, offset sideways by off
  function link(a, ra, b, rb, y, off) {
    var dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, ang = Math.atan2(dz, dx);
    var da = typeof ra === 'number' ? ra : reach(ra.hex, ang);
    var db = typeof rb === 'number' ? rb : reach(rb.hex, ang + PI);
    var px = -uz * off, pz = ux * off;
    return [[a[0] + ux * da + px, y, a[2] + uz * da + pz], [b[0] - ux * db + px, y, b[2] - uz * db + pz]];
  }
  // n pulses travelling along a path, fading in and out at the ends
  function flow(dots, path, t, period, n, phase) {
    for (var k = 0; k < n; k++) {
      var u = ((t / period) + k / n + phase) % 1;
      dots.push({ p: along(path, u), r: 4.5, c: C.blue, o: Math.min(1, u * 8, (1 - u) * 8) });
    }
  }
  // 1 the moment one of the n pulses on a path reaches its end, fading to 0 soon after
  function landing(t, period, n) {
    return Math.max(0, 1 - ((t * n / period) % 1) / 0.4);
  }
  // label point on the side of a shape facing the camera
  function nearSide(p, r) { return [p[0] - r * sin(cam.yaw), 0, p[2] - r * cos(cam.yaw)]; }

  var ORIGIN = [0, 0, 0];
  var floor = hexGrid(34, 380);
  var dapr = prism(ORIGIN, R, H);

  var store = polar(deg(-40), 400);
  var storeSegs = prism(store, SR, SH, 32, 4).concat(ring([store[0], SH / 3, store[2]], SR, 32), ring([store[0], 2 * SH / 3, store[2]], SR, 32));
  var storeTop = ring([store[0], SH, store[2]], SR - 10, 32);
  var stateOut = link(ORIGIN, { hex: R }, store, SR, 8, -8), stateBack = link(ORIGIN, { hex: R }, store, SR, 8, 8);
  var stateMid = lerp3(stateOut[0], stateBack[1], 0.5);

  // Workflow app front left; Agent, App and the broker 60 degrees apart on one arc
  var apps = [['Workflow app', -125], ['Agent', 150], ['App', 90]].map(function (a) {
    var p = polar(deg(a[1]), DIST);
    return { t: a[0], p: p, segs: prism(p, AR, AH), call: link(p, { hex: AR }, ORIGIN, { hex: R }, 8, 0) };
  });

  // message broker: a pipe on the floor pointing at Dapr, four equally spaced rings
  var broker = (function () {
    var p = polar(deg(30), DIST), PR = 24, PL = 130, phi = Math.atan2(p[2], p[0]);
    function pipeRing(x) {
      return range(24).map(function (i) { var a = i * TAU / 24; return [x, PR + PR * cos(a), PR * sin(a)]; });
    }
    var rings = [-PL / 2, -PL / 6, PL / 6, PL / 2].map(pipeRing);
    var local = [].concat.apply([], rings.map(closed)).concat(range(4).map(function (i) { return [rings[0][i * 6], rings[3][i * 6]]; }));
    function rot(q) { return [p[0] + q[0] * cos(phi) - q[2] * sin(phi), q[1], p[2] + q[0] * sin(phi) + q[2] * cos(phi)]; }
    return {
      p: p, PR: PR,
      segs: local.map(function (s) { return s.map(rot); }),
      call: link(ORIGIN, { hex: R }, p, PL / 2, PR, 0),
      // messages leave the far end towards apps we don't see
      exit: [rot([PL / 2, PR, 0]), rot([PL / 2 + 130, PR, 0])]
    };
  })();

  function frame(t) {
    cam.yaw = -0.08 + sin(t * 0.0002) * 0.07;
    var items = [], dots = [], labels = [];

    items.push({ segs: floor, c: C.light, w: 0.8, o: 0.32 });
    var rip = (t % 4200) / 4200;
    items.push({ segs: hex([0, 0.5, 0], lerp(R + 10, 380, rip)), c: C.blue, w: 1.4, o: 0.45 * (1 - rip) });

    apps.forEach(function (a, i) {
      items.push({ segs: a.segs, c: APP[i], w: 1.4, glow: 0.08 });
      labels.push({ p: [a.p[0], AH, a.p[2]], t: a.t, size: 13.5, weight: 700, c: C.navy, dy: 5 });
      items.push({ segs: open(a.call), c: C.blue, w: 1.4, o: 0.7 });
      flow(dots, a.call, t, 2000, 2, i * 0.21);
    });

    items.push({ segs: dapr, c: C.navy, w: 1.6, glow: 0.1 });

    items.push({ segs: broker.segs, c: C.navy, w: 1.4 });
    items.push({ segs: open(broker.call), c: C.blue, w: 1.4, o: 0.7 });
    flow(dots, broker.call, t, 2200, 2, 0.4);
    for (var k = 0; k < 2; k++) {
      var ue = ((t / 2200) + k / 2 + 0.28) % 1;
      dots.push({ p: along(broker.exit, ue), r: 4.5, c: C.blue, o: Math.max(0, 1 - ue * 2.5) });
    }
    labels.push({ p: nearSide(broker.p, broker.PR + 6), t: 'Message broker', size: 14, weight: 600, c: C.mid, dy: 22 });

    items.push({ segs: open(stateOut), c: C.teal, w: 1.4, o: 0.8 });
    items.push({ segs: open(stateBack), c: C.blue, w: 1.4, o: 0.6 });
    flow(dots, stateOut, t, 2400, 3, 0);
    var ru = (t % 4800) / 4800;
    if (ru < 0.5) dots.push({ p: along(stateBack, 1 - ru * 2), r: 4.5, c: C.blue });

    items.push({ segs: storeSegs, c: C.navy, w: 1.6 });
    // the inner top ring pulses as each durable state dot lands
    var land = landing(t, 2400, 3);
    items.push({ segs: storeTop, c: C.teal, w: 1.6 + 1.2 * land, o: 0.4 + 0.6 * land });
    labels.push({ p: nearSide(store, SR), t: 'State store', size: 14, weight: 600, c: C.mid, dy: 22 });
    labels.push({ p: stateMid, t: 'durable state', size: 12.5, weight: 600, c: C.blue, dy: -12 });

    var LW = 168, LH = LW * 270 / 367;
    var splitZ = placeLogo([-LW / 2, H + 0.5, LH / 2], [1, 0, 0], [0, 0, -1], LW);
    draw(items, dots, labels, splitZ);
  }

  // ---- playback: pause/play button, prefers-reduced-motion, offscreen

  var toggle = document.querySelector('.hero-diagram .diagram-toggle');
  var label = toggle ? toggle.getAttribute('data-label') : '';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STILL = 1200; // the frame shown before the animation starts, or instead of it
  var playing = !reduce, visible = true, timer = null, elapsed = STILL, last = null;

  function tick(now) {
    if (last !== null) elapsed += now - last;
    last = now;
    frame(elapsed);
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

  frame(STILL);
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () { playing = !playing; sync(); });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(svgNode);
  }
  sync();
})();
