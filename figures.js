/* Offline teaching figures: hand-drawn SVGs for the course notes.
   This file has no DOM, network, font, or image dependency. Each function
   returns a self-contained inline SVG string for the figure renderer. */
(function () {
  "use strict";

  var C = {
    ink: "#17324d", muted: "#53677d", line: "#94a7bb", pale: "#f5f8fc",
    blue: "#2878c8", blue2: "#83b8eb", blueP: "#dceeff", red: "#dc514d",
    redP: "#ffe5e1", teal: "#139b91", tealP: "#d9f3ef", gold: "#e4a329",
    goldP: "#fff1d2", green: "#4a9d63", purple: "#8064b2", white: "#fff"
  };
  function xe(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  function svg(label, body, box) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (box || "0 0 720 300") +
      '" role="img" aria-label="' + xe(label) + '" focusable="false" preserveAspectRatio="xMidYMid meet">' +
      "<title>" + xe(label) + "</title>" + body + "</svg>";
  }
  function txt(x, y, s, size, color, anchor, weight, extra) {
    return '<text x="' + x + '" y="' + y + '" fill="' + (color || C.ink) +
      '" font-family="Arial, Helvetica, sans-serif" font-size="' + (size || 18) +
      '" font-weight="' + (weight || 400) + '" text-anchor="' + (anchor || "middle") + '"' +
      (extra ? " " + extra : "") + ">" + xe(s) + "</text>";
  }
  function ln(x1, y1, x2, y2, color, width, dash) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="' + (color || C.ink) + '" stroke-width="' + (width || 3) + '" stroke-linecap="round"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
  }
  function arrow(x1, y1, x2, y2, color, width, both) {
    function head(x, y, a) {
      var size = 10, spread = 0.48;
      var x1 = x - size * Math.cos(a - spread), y1 = y - size * Math.sin(a - spread);
      var x2 = x - size * Math.cos(a + spread), y2 = y - size * Math.sin(a + spread);
      return '<path d="M' + x + " " + y + " L" + x1.toFixed(1) + " " + y1.toFixed(1) +
        " L" + x2.toFixed(1) + " " + y2.toFixed(1) + ' Z" fill="' + color + '"/>';
    }
    var col = color || C.ink, w = width || 3, a = Math.atan2(y2 - y1, x2 - x1);
    return ln(x1, y1, x2, y2, col, w) + head(x2, y2, a) + (both ? head(x1, y1, a + Math.PI) : "");
  }
  function circ(x, y, r, fill, stroke, width, opacity) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (fill || "none") +
      '" stroke="' + (stroke || C.line) + '" stroke-width="' + (width || 3) + '"' +
      (opacity != null ? ' opacity="' + opacity + '"' : "") + '/>';
  }
  function rect(x, y, w, h, fill, stroke, width, radius, opacity) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="' + (radius || 0) + '" fill="' + (fill || "none") + '" stroke="' + (stroke || C.line) +
      '" stroke-width="' + (width || 2) + '"' + (opacity != null ? ' opacity="' + opacity + '"' : "") + '/>';
  }
  function poly(points, fill, stroke, width) {
    return '<polygon points="' + points + '" fill="' + (fill || "none") + '" stroke="' + (stroke || C.ink) +
      '" stroke-width="' + (width || 3) + '" stroke-linejoin="round"/>';
  }
  function path(d, stroke, width, fill, dash) {
    return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + (stroke || C.ink) +
      '" stroke-width="' + (width || 3) + '" stroke-linecap="round" stroke-linejoin="round"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
  }
  function dot(x, y, r, color) { return circ(x, y, r || 4, color || C.red, color || C.red, 1); }
  function panel(x, y, w, h, fill) { return rect(x, y, w, h, fill || C.white, "#d9e3ee", 2, 13); }
  function arrowLabel(x1, y1, x2, y2, label, color, tx, ty) {
    return arrow(x1, y1, x2, y2, color, 3) + txt(tx == null ? (x1 + x2) / 2 : tx,
      ty == null ? (y1 + y2) / 2 - 9 : ty, label, 16, color || C.ink, "middle", 700);
  }
  function molecule(x, y, atoms, bonds, scale) {
    var s = scale || 1, out = "";
    bonds.forEach(function (b) {
      var a = atoms[b[0]], z = atoms[b[1]], dx = z.x - a.x, dy = z.y - a.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / len * 4, py = dx / len * 4;
      for (var j = 0; j < (b[2] || 1); j++) {
        var off = (j - ((b[2] || 1) - 1) / 2) * 7;
        out += ln(x + (a.x + px * off / 4) * s, y + (a.y + py * off / 4) * s,
          x + (z.x + px * off / 4) * s, y + (z.y + py * off / 4) * s, "#506477", 3);
      }
    });
    atoms.forEach(function (a) {
      var r = (a.r || (a.el === "H" ? 15 : 23)) * s;
      out += circ(x + a.x * s, y + a.y * s, r, a.color || (a.el === "O" ? C.redP : C.blueP),
        a.stroke || (a.el === "O" ? C.red : C.blue), 2.5);
      out += txt(x + a.x * s, y + a.y * s + 6 * s, a.el, 17 * s, C.ink, "middle", 700);
    });
    return out;
  }
  function ticks(x1, x2, y, n, color) {
    var out = "";
    for (var i = 0; i <= n; i++) {
      var x = x1 + (x2 - x1) * i / n;
      out += ln(x, y - 7, x, y + 7, color || C.ink, 2);
    }
    return out;
  }

  var FIG = {
    /* MATHEMATICS --------------------------------------------------------- */
    "venn2": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(34, 43, "U: class of 40 learners", 17, C.muted, "start", 700) +
        circ(295, 164, 91, C.blueP, C.blue, 3, 0.82) + circ(425, 164, 91, C.redP, C.red, 3, 0.82) +
        txt(255, 87, "A: football", 17, C.blue, "middle", 700) + txt(465, 87, "B: kickball", 17, C.red, "middle", 700) +
        txt(250, 171, "18", 25, C.ink, "middle", 700) + txt(360, 171, "7", 25, C.ink, "middle", 700) +
        txt(470, 171, "11", 25, C.ink, "middle", 700) + txt(630, 175, "4 neither", 17, C.muted, "middle", 700) +
        txt(252, 246, "A only", 15, C.muted) + txt(360, 246, "A ∩ B", 15, C.muted) + txt(466, 246, "B only", 15, C.muted);
      return svg("Two overlapping real circles in a Venn diagram showing football and kickball learners", b);
    },
    "venn3": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(34, 43, "Universal set U", 17, C.muted, "start", 700) +
        circ(305, 158, 86, C.blueP, C.blue, 3, 0.73) + circ(415, 158, 86, C.redP, C.red, 3, 0.73) +
        circ(360, 205, 80, C.tealP, C.teal, 3, 0.73) +
        txt(264, 94, "A", 21, C.blue, "middle", 700) + txt(456, 94, "B", 21, C.red, "middle", 700) +
        txt(360, 274, "C", 21, C.teal, "middle", 700) + txt(360, 154, "A ∩ B ∩ C", 15, C.ink, "middle", 700) +
        txt(90, 260, "Each circle is a set; overlaps show shared members.", 16, C.muted, "start");
      return svg("Three overlapping circles of a Venn diagram for sets A, B and C", b);
    },
    "venn-subset": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(38, 44, "Universal set U", 17, C.muted, "start", 700) +
        circ(373, 161, 105, C.blueP, C.blue, 3, 0.7) + circ(346, 161, 47, C.redP, C.red, 3, 0.95) +
        txt(370, 91, "G: graduates", 17, C.blue, "middle", 700) + txt(346, 167, "T", 23, C.red, "middle", 700) +
        txt(360, 256, "All T are G: the T circle is entirely inside the G circle.", 16, C.muted, "middle", 600);
      return svg("Venn diagram showing set T entirely contained inside set G", b);
    },
    "venn-disjoint": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(38, 45, "Universal set U", 17, C.muted, "start", 700) +
        circ(255, 160, 76, C.blueP, C.blue, 3, 0.9) + circ(466, 160, 76, C.goldP, C.gold, 3, 0.9) +
        txt(255, 151, "boys", 18, C.blue, "middle", 700) + txt(466, 151, "girls", 18, "#b47b10", "middle", 700) +
        txt(255, 181, "3", 22, C.ink, "middle", 700) + txt(466, 181, "2", 22, C.ink, "middle", 700) +
        txt(360, 261, "Disjoint sets: no member is in both circles.", 17, C.muted, "middle", 600);
      return svg("Two non-overlapping circles showing disjoint sets of boys and girls", b);
    },
    "numberline": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 44, "Number line: equal steps, ordered numbers", 19, C.ink, "middle", 700) +
        arrow(72, 160, 648, 160, C.ink, 3) + ticks(100, 620, 160, 8) +
        [-4,-3,-2,-1,0,1,2,3,4].map(function (v, i) {
          return txt(100 + i * 65, 194, String(v), 17, C.muted, "middle", 600);
        }).join("") + circ(490, 160, 9, C.red, C.red, 2) +
        txt(490, 124, "3", 17, C.red, "middle", 700) + txt(360, 248, "Positive values lie to the right of zero; negative values lie to the left.", 16, C.muted);
      return svg("Horizontal number line from negative four to positive four, with three highlighted", b);
    },
    "counting-line": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 44, "Count forward in equal steps", 20, C.ink, "middle", 700) +
        arrow(72, 158, 648, 158, C.ink, 3) + ticks(100, 620, 158, 10) +
        Array.from({length:11}, function (_, i) { return txt(100 + i * 52, 194, String(i), 16, C.muted, "middle", 600); }).join("") +
        circ(412, 158, 9, C.red, C.red, 2) + txt(412, 124, "6", 17, C.red, "middle", 700) +
        txt(360, 247, "Each jump is one more: 0, 1, 2, 3, …, 10.", 17, C.muted);
      return svg("Counting number line from zero to ten with six highlighted", b);
    },
    "clock": function () {
      var b = panel(12, 12, 696, 276) + circ(360, 154, 106, "#fffdf8", "#53677d", 5) +
        circ(360, 154, 3, C.ink, C.ink, 1);
      for (var n = 1; n <= 12; n++) {
        var a = (n * 30 - 90) * Math.PI / 180;
        var x = 360 + Math.cos(a) * 82, y = 154 + Math.sin(a) * 82;
        b += txt(x, y + 7, String(n), 18, C.ink, "middle", 700);
      }
      b += ln(360, 154, 318, 171, C.blue, 5) + ln(360, 154, 423, 154, C.red, 4) +
        circ(360, 154, 6, C.gold, C.gold, 1) +
        txt(360, 278, "Short hand: hour   ·   Long hand: minutes   ·   School day example: 8:15", 16, C.muted);
      return svg("Analogue clock showing quarter past eight", b);
    },
    "shapes": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 42, "Flat shapes you can find around you", 20, C.ink, "middle", 700) +
        circ(111, 142, 48, C.blueP, C.blue, 3) + txt(111, 214, "coin / circle", 16, C.muted, "middle", 600) +
        rect(228, 94, 88, 88, C.tealP, C.teal, 3, 2) + txt(272, 214, "tile / square", 16, C.muted, "middle", 600) +
        rect(378, 105, 120, 70, C.goldP, "#c58a17", 3, 2) + txt(438, 214, "door / rectangle", 16, C.muted, "middle", 600) +
        poly("590,180 641,91 692,180", C.redP, C.red, 3) + txt(641, 214, "roof / triangle", 16, C.muted, "middle", 600);
      return svg("A circle, square, rectangle and triangle beside familiar real-world objects", b);
    },
    "fraction-bars": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 42, "Fractions are equal parts of one whole", 20, C.ink, "middle", 700) +
        txt(78, 103, "1/2", 18, C.ink, "middle", 700) + txt(78, 164, "2/4", 18, C.ink, "middle", 700) +
        txt(78, 225, "3/6", 18, C.ink, "middle", 700);
      [[2,1],[4,2],[6,3]].forEach(function (r, row) {
        var x = 148, y = 77 + row * 61, w = 480 / r[0];
        for (var i = 0; i < r[0]; i++) {
          b += rect(x + i * w, y, w, 34, i < r[1] ? C.blueP : C.white, C.blue, 2, 0);
        }
      });
      b += txt(390, 267, "Each row shows the same amount shaded: one half.", 16, C.muted);
      return svg("Three fraction bars demonstrate that one half equals two fourths and three sixths", b);
    },
    "bargraph": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 40, "Favourite school subjects · 20 learners", 19, C.ink, "middle", 700) +
        ln(112, 234, 635, 234, C.ink, 3) + ln(112, 234, 112, 72, C.ink, 3) +
        txt(62, 157, "Pupils", 15, C.muted, "middle", 600, 'transform="rotate(-90 62 157)"');
      for (var i = 0; i <= 5; i++) {
        var y = 234 - i * 29;
        b += ln(108, y, 635, y, "#e3eaf1", 1) + txt(96, y + 5, String(i * 2), 14, C.muted, "end");
      }
      var vals = [6, 4, 5, 5], labs = ["Math", "Science", "English", "Arts"], cols = [C.blue, C.teal, C.gold, C.red];
      vals.forEach(function (v, i) {
        var x = 166 + i * 116, h = v * 29;
        b += rect(x, 234 - h, 58, h, cols[i], cols[i], 1, 5) +
          txt(x + 29, 224 - h, String(v), 15, C.ink, "middle", 700) + txt(x + 29, 258, labs[i], 15, C.muted, "middle", 600);
      });
      return svg("Bar graph of four favourite school subjects among twenty learners", b);
    },
    "histogram": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 40, "Grouped marks · adjacent bars show continuous data", 18, C.ink, "middle", 700) +
        ln(105, 235, 642, 235, C.ink, 3) + ln(105, 235, 105, 74, C.ink, 3);
      [0,2,4,6,8,10].forEach(function (v) {
        var y = 235 - v * 15;
        b += ln(101, y, 642, y, "#e7edf4", 1) + txt(91, y + 5, String(v), 14, C.muted, "end");
      });
      var vals = [3,7,10,6,4], labels = ["0–9","10–19","20–29","30–39","40–49"];
      vals.forEach(function (v, i) {
        var x = 126 + i * 100, h = v * 15;
        b += rect(x, 235 - h, 99, h, [C.blueP,C.blue2,C.teal,C.gold,C.red][i], C.white, 1, 0) +
          txt(x + 49, 225 - h, String(v), 14, C.ink, "middle", 700) + txt(x + 49, 259, labels[i], 14, C.muted, "middle", 600);
      });
      return svg("Histogram with adjacent bars showing grouped pupil marks", b);
    },
    "circle-c": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 40, "Measure a bicycle wheel, plate or circular drum", 19, C.ink, "middle", 700) +
        circ(350, 158, 91, C.blueP, C.blue, 4, 0.48) + circ(350, 158, 5, C.ink, C.ink, 1) +
        ln(350, 158, 441, 158, C.red, 3) + txt(396, 147, "radius r", 16, C.red, "middle", 700) +
        ln(259, 158, 441, 158, C.teal, 2, "7 6") + txt(350, 181, "diameter d = 2r", 16, C.teal, "middle", 700) +
        path("M 278 95 A 91 91 0 1 1 420 221", C.gold, 6) +
        arrow(411, 225, 424, 215, C.gold, 3) + txt(350, 273, "Circumference C = πd = 2πr", 18, C.ink, "middle", 700);
      return svg("A real circle marked with its centre, radius, diameter and circumference", b);
    },
    "right-triangle": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 40, "A ladder against a wall makes a right triangle", 19, C.ink, "middle", 700) +
        ln(200, 239, 200, 72, C.muted, 5) + ln(200, 239, 510, 239, C.muted, 5) +
        ln(200, 239, 320, 79, C.red, 5) +
        poly("200,239 224,239 224,207 200,207", C.white, C.ink, 2) +
        txt(236, 171, "5 m", 18, C.red, "middle", 700) + txt(176, 158, "4 m", 17, C.blue, "middle", 700) +
        txt(260, 265, "3 m", 17, C.teal, "middle", 700) + txt(216, 230, "90°", 13, C.ink, "start", 600) +
        txt(286, 119, "ladder", 15, C.muted, "middle", 600, 'transform="rotate(-53 286 119)"') +
        txt(560, 141, "3² + 4² = 5²", 20, C.ink, "middle", 700);
      return svg("A five metre ladder forms a three-four-five right triangle against a wall", b);
    },
    "coordinate-plane": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 39, "The coordinate plane: locate the point (3, 2)", 19, C.ink, "middle", 700) +
        arrow(102, 231, 633, 231, C.ink, 3) + arrow(155, 258, 155, 65, C.ink, 3) +
        ln(155, 183, 480, 183, "#c8d5e3", 1, "5 5") + ln(480, 231, 480, 183, "#c8d5e3", 1, "5 5") +
        circ(480, 183, 8, C.red, C.red, 1) + txt(493, 174, "(3, 2)", 17, C.red, "start", 700) +
        txt(626, 255, "x", 17, C.ink, "middle", 700) + txt(137, 69, "y", 17, C.ink, "middle", 700) +
        txt(154, 254, "0", 14, C.muted) + [1,2,3,4].map(function (n) {
          return txt(155 + n * 81, 254, String(n), 14, C.muted) + txt(135, 231 - n * 24, String(n), 14, C.muted);
        }).join("");
      return svg("Coordinate plane with the point three comma two plotted in the first quadrant", b);
    },
    "probability-tree": function () {
      var b = panel(12, 12, 696, 276) + txt(360, 40, "Two coin tosses: multiply along a path", 19, C.ink, "middle", 700) +
        circ(105, 150, 8, C.ink, C.ink, 1) + arrow(114, 147, 254, 95, C.blue, 3) + arrow(114, 153, 254, 205, C.red, 3) +
        circ(260, 92, 7, C.blue, C.blue, 1) + circ(260, 208, 7, C.red, C.red, 1) +
        txt(176, 117, "H · 1/2", 16, C.blue, "middle", 700) + txt(176, 205, "T · 1/2", 16, C.red, "middle", 700) +
        arrow(268, 89, 430, 58, C.blue, 2) + arrow(268, 95, 430, 116, C.red, 2) +
        arrow(268, 205, 430, 178, C.blue, 2) + arrow(268, 211, 430, 239, C.red, 2) +
        txt(470, 64, "HH  =  1/4", 16, C.ink, "start", 600) + txt(470, 122, "HT  =  1/4", 16, C.ink, "start", 600) +
        txt(470, 184, "TH  =  1/4", 16, C.ink, "start", 600) + txt(470, 246, "TT  =  1/4", 16, C.ink, "start", 600) +
        txt(105, 180, "Start", 14, C.muted) + txt(260, 260, "First toss", 14, C.muted);
      return svg("Probability tree for tossing a fair coin twice", b);
    },

    /* CHEMISTRY ----------------------------------------------------------- */
    "bond-types": function () {
      var b = panel(10, 10, 700, 440, "#fff") +
        rect(24, 24, 326, 194, "#fbfdff", "#cdd9e5", 2, 9) + rect(370, 24, 326, 194, "#fbfdff", "#cdd9e5", 2, 9) +
        rect(24, 234, 326, 202, "#fbfdff", "#cdd9e5", 2, 9) + rect(370, 234, 326, 202, "#fbfdff", "#cdd9e5", 2, 9) +
        txt(187, 51, "1. Ionic bond · transfer", 19, C.ink, "middle", 700) +
        txt(533, 51, "2. Covalent bond · sharing", 19, C.ink, "middle", 700) +
        txt(187, 261, "3. Hydrogen bond · attraction", 19, C.ink, "middle", 700) +
        txt(533, 261, "4. Metallic bond · electron sea", 19, C.ink, "middle", 700);
      /* Na gives one outer electron to Cl. */
      b += circ(99, 119, 24, C.blueP, C.blue, 2) + txt(99, 126, "Na", 18, C.ink, "middle", 700) + dot(126, 119, 4, C.red) +
        circ(250, 119, 28, C.redP, C.red, 2) + txt(250, 126, "Cl", 18, C.ink, "middle", 700);
      [[242,92],[252,92],[266,111],[266,125],[252,146],[242,146],[232,119]].forEach(function (p) { b += dot(p[0], p[1], 3.4); });
      b += arrow(136, 119, 207, 119, C.ink, 3) + txt(171, 100, "e⁻", 16, C.red, "middle", 700) +
        txt(170, 185, "Na⁺  +  Cl⁻  →  NaCl", 16, C.ink, "middle", 700);
      /* O2 shared pairs and water's polar covalent bonds. */
      b += circ(448, 119, 24, C.redP, C.red, 2) + circ(510, 119, 24, C.redP, C.red, 2) +
        txt(448, 126, "O", 19, C.ink, "middle", 700) + txt(510, 126, "O", 19, C.ink, "middle", 700) +
        dot(474, 111, 3.5, C.red) + dot(483, 111, 3.5, C.red) + dot(474, 127, 3.5, C.red) + dot(483, 127, 3.5, C.red) +
        dot(435, 87, 3) + dot(449, 83, 3) + dot(463, 87, 3) +
        dot(497, 87, 3) + dot(511, 83, 3) + dot(525, 87, 3) +
        txt(479, 185, "O₂ shares electron pairs", 16, C.ink, "middle", 600);
      /* Two water molecules; dashed attraction connects H to O. */
      b += ln(86, 337, 110, 307, C.ink, 3) + ln(110, 307, 136, 337, C.ink, 3) +
        txt(82, 353, "H", 17, C.ink, "middle", 700) + txt(110, 301, "O", 20, C.red, "middle", 700) + txt(140, 353, "H", 17, C.ink, "middle", 700) +
        txt(75, 328, "δ+", 13, C.muted, "middle", 600) + txt(110, 282, "δ−", 13, C.muted, "middle", 600) + txt(141, 328, "δ+", 13, C.muted, "middle", 600) +
        ln(221, 337, 245, 307, C.ink, 3) + ln(245, 307, 270, 337, C.ink, 3) +
        txt(217, 353, "H", 17, C.ink, "middle", 700) + txt(245, 301, "O", 20, C.red, "middle", 700) + txt(274, 353, "H", 17, C.ink, "middle", 700) +
        path("M145 340 C164 310 199 304 224 319", C.blue, 3, "none", "4 6") +
        txt(180, 393, "hydrogen bond", 14, C.blue, "middle", 700) +
        txt(533, 302, "delocalised e⁻", 15, C.blue, "middle", 600);
      /* Copper ions in a conducting electron cloud. */
      [0,1,2,3].forEach(function (row) {
        [0,1,2,3].forEach(function (col) {
          var x = 435 + col * 59, y = 327 + row * 27;
          b += circ(x, y, 15, "#a8e8e7", C.teal, 2) + txt(x, y + 5, "Cu²⁺", 10, C.ink, "middle", 700);
          b += dot(x + 22, y - 14, 3.2, C.blue);
        });
      });
      b += txt(533, 426, "positive metal ions in a mobile electron sea", 13, C.muted, "middle", 600);
      return svg("Four chemical bond types: ionic electron transfer, covalent sharing, hydrogen attraction and metallic bonding", b, "0 0 720 460");
    },
    "bond-ionic": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 40, "Ionic bonding: a metal transfers electrons to a non-metal", 19, C.ink, "middle", 700) +
        txt(176, 83, "Before transfer", 16, C.muted, "middle", 600) + txt(527, 83, "After transfer", 16, C.muted, "middle", 600) +
        circ(143, 153, 35, C.blueP, C.blue, 2) + txt(143, 160, "Na", 22, C.ink, "middle", 700) + dot(184, 153, 5, C.red) +
        circ(286, 153, 38, C.redP, C.red, 2) + txt(286, 160, "Cl", 22, C.ink, "middle", 700);
      [[270,116],[286,112],[302,116],[309,135],[309,151],[302,190],[270,190]].forEach(function (p) { b += dot(p[0],p[1],3.5); });
      b += arrow(198, 153, 237, 153, C.red, 3) + txt(218, 136, "e⁻", 15, C.red, "middle", 700) + arrow(338, 153, 405, 153, C.ink, 3) +
        circ(473, 153, 36, C.blueP, C.blue, 2) + txt(473, 160, "Na⁺", 20, C.ink, "middle", 700) +
        circ(576, 153, 36, C.redP, C.red, 2) + txt(576, 160, "Cl⁻", 20, C.ink, "middle", 700) +
        txt(360, 250, "Oppositely charged ions attract to form sodium chloride (NaCl).", 17, C.ink, "middle", 600);
      return svg("Sodium transfers an outer electron to chlorine, forming oppositely charged ions", b);
    },
    "bond-covalent": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 40, "Covalent bonds form when non-metal atoms share pairs", 19, C.ink, "middle", 700) +
        txt(146, 82, "Hydrogen", 16, C.muted, "middle", 600) + txt(360, 82, "Oxygen", 16, C.muted, "middle", 600) + txt(574, 82, "Water", 16, C.muted, "middle", 600) +
        circ(105, 154, 32, C.blueP, C.blue, 2) + txt(105, 161, "H", 23, C.ink, "middle", 700) +
        circ(187, 154, 32, C.blueP, C.blue, 2) + txt(187, 161, "H", 23, C.ink, "middle", 700) +
        dot(140, 147, 4, C.red) + dot(152, 161, 4, C.red) + txt(146, 210, "H—H", 18, C.ink, "middle", 700) +
        circ(306, 154, 34, C.redP, C.red, 2) + circ(414, 154, 34, C.redP, C.red, 2) +
        txt(306, 161, "O", 23, C.ink, "middle", 700) + txt(414, 161, "O", 23, C.ink, "middle", 700) +
        ln(343, 146, 377, 146, C.ink, 3) + ln(343, 161, 377, 161, C.ink, 3) + txt(360, 210, "O=O · double bond", 17, C.ink, "middle", 700) +
        ln(537, 174, 574, 126, C.ink, 3) + ln(574, 126, 612, 174, C.ink, 3) +
        txt(530, 190, "H", 21, C.ink, "middle", 700) + txt(574, 121, "O", 23, C.red, "middle", 700) + txt(618, 190, "H", 21, C.ink, "middle", 700) +
        txt(574, 231, "H₂O · two O—H bonds", 17, C.ink, "middle", 700) +
        txt(360, 263, "Shared electrons count in the outer shell of both atoms.", 16, C.muted, "middle", 600);
      return svg("Shared electron pairs in hydrogen, oxygen and water molecules", b);
    },
    "bond-hydrogen": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 40, "Hydrogen bonds attract neighbouring water molecules", 19, C.ink, "middle", 700) +
        molecule(180, 150, [{el:"O",x:0,y:0,r:25},{el:"H",x:-46,y:36},{el:"H",x:46,y:36}], [[0,1],[0,2]], 1) +
        molecule(408, 150, [{el:"O",x:0,y:0,r:25},{el:"H",x:-46,y:36},{el:"H",x:46,y:36}], [[0,1],[0,2]], 1) +
        path("M231 187 C280 208 337 204 383 160", C.blue, 3, "none", "5 6") +
        txt(305, 223, "hydrogen bond", 15, C.blue, "middle", 700) +
        txt(180, 87, "δ−", 16, C.red, "middle", 700) + txt(134, 199, "δ+", 14, C.muted) + txt(226, 199, "δ+", 14, C.muted) +
        txt(408, 87, "δ−", 16, C.red, "middle", 700) + txt(362, 199, "δ+", 14, C.muted) + txt(454, 199, "δ+", 14, C.muted) +
        txt(360, 269, "The dotted attraction is between molecules, not an O—H covalent bond.", 15, C.muted, "middle", 600);
      return svg("Two polar water molecules linked by a dashed hydrogen bond", b);
    },
    "bond-metallic": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Metallic bond: positive ions in a sea of mobile electrons", 19, C.ink, "middle", 700) +
        rect(82, 68, 556, 153, "#eefbff", "#9ecbd6", 2, 18);
      for (var row = 0; row < 3; row++) for (var col = 0; col < 6; col++) {
        var x = 135 + col * 88, y = 105 + row * 46;
        b += circ(x, y, 18, "#a8e8e7", C.teal, 2) + txt(x, y + 5, "Cu²⁺", 11, C.ink, "middle", 700);
        b += dot(x + 29, y - 23 + (col % 2) * 7, 4, C.blue);
      }
      b += txt(360, 252, "Delocalised electrons move through the lattice and carry electrical current.", 16, C.muted, "middle", 600);
      return svg("Copper positive ions arranged in a lattice surrounded by delocalised electrons", b);
    },
    "ball-stick": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 40, "Ball-and-stick model of a water molecule", 19, C.ink, "middle", 700) +
        ln(324, 161, 264, 112, C.ink, 8) + ln(396, 161, 456, 112, C.ink, 8) +
        circ(360, 174, 42, C.redP, C.red, 3) + txt(360, 182, "O", 28, C.ink, "middle", 700) +
        circ(248, 99, 28, C.blueP, C.blue, 3) + txt(248, 107, "H", 23, C.ink, "middle", 700) +
        circ(472, 99, 28, C.blueP, C.blue, 3) + txt(472, 107, "H", 23, C.ink, "middle", 700) +
        path("M324 142 A 46 46 0 0 1 396 142", C.gold, 2) + txt(360, 104, "104.5°", 16, "#a87817", "middle", 700) +
        txt(360, 253, "Bent shape · two O—H covalent bonds · oxygen has two lone pairs", 16, C.muted, "middle", 600);
      return svg("Ball and stick model of bent water with two O–H bonds and its bond angle", b);
    },
    "atom-shells": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Sodium atom · electron shells (Bohr model)", 19, C.ink, "middle", 700) +
        circ(270, 162, 25, "#ffd891", "#cc8d23", 2) + txt(270, 157, "11p", 12, C.ink, "middle", 700) + txt(270, 172, "12n", 12, C.ink, "middle", 700) +
        circ(270, 162, 58, "none", "#8aa2bb", 2) + circ(270, 162, 91, "none", "#8aa2bb", 2) + circ(270, 162, 124, "none", "#8aa2bb", 2);
      [[270,104],[270,220]].forEach(function (p) { b += circ(p[0],p[1],6,C.blue,C.blue,1); });
      [[179,162],[361,162],[270,71],[270,253],[198,90],[342,90],[198,234],[342,234]].forEach(function (p) { b += circ(p[0],p[1],6,C.red,C.red,1); });
      b += circ(394, 162, 6, C.green, C.green, 1) +
        txt(500, 109, "K shell: 2 e⁻", 17, C.ink, "start", 700) + txt(500, 154, "L shell: 8 e⁻", 17, C.ink, "start", 700) +
        txt(500, 199, "M shell: 1 e⁻", 17, C.ink, "start", 700) + txt(500, 245, "Electron arrangement: 2, 8, 1", 17, C.blue, "start", 700);
      return svg("Bohr diagram of sodium with a nucleus and two, eight and one electrons in shells", b);
    },
    "periodic-cell": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 40, "One element cell in the periodic table", 19, C.ink, "middle", 700) +
        rect(259, 67, 202, 180, "#e8f4ff", C.blue, 4, 8) + txt(282, 96, "11", 18, C.muted, "start", 600) +
        txt(360, 156, "Na", 59, C.blue, "middle", 700) + txt(360, 188, "Sodium", 20, C.ink, "middle", 600) +
        txt(360, 225, "22.99", 18, C.muted, "middle", 600) +
        txt(174, 110, "Atomic number", 16, C.muted, "end", 600) + arrow(186, 114, 252, 103, C.line, 2) +
        txt(536, 216, "Relative atomic mass", 16, C.muted, "start", 600) + arrow(527, 207, 462, 224, C.line, 2);
      return svg("Sodium element cell identifying atomic number, chemical symbol, name and relative atomic mass", b);
    },
    "ph-scale": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 40, "pH scale · acidic  ←  neutral  →  alkaline", 19, C.ink, "middle", 700);
      var colors = ["#bf3540","#d04446","#df5d50","#e97b55","#ef9b59","#f2b85d","#e8cc65","#8dc27e","#55b996","#45aab0","#418fbd","#4472b6","#5a60aa","#7554a2","#884a91"];
      for (var i = 0; i <= 14; i++) {
        var x = 72 + i * 41;
        b += rect(x, 101, 41, 48, colors[i], "#fff", 1, 2) + txt(x + 20, 180, String(i), 15, C.ink, "middle", 700);
      }
      b += txt(132, 220, "lemon juice", 15, C.red, "middle", 600) + txt(358, 220, "pure water", 15, C.teal, "middle", 600) +
        txt(584, 220, "soap solution", 15, C.purple, "middle", 600) +
        arrow(116, 247, 648, 247, C.ink, 2) + txt(360, 272, "Increasing alkalinity", 15, C.muted, "middle", 600);
      b += circ(358, 94, 8, C.white, C.ink, 3) + txt(358, 77, "pH 7", 14, C.ink, "middle", 700);
      return svg("Colour pH scale from zero acidic to fourteen alkaline, with neutral water at seven", b);
    },
    "electrolysis": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Electrolysis · a direct current drives a chemical change", 19, C.ink, "middle", 700) +
        rect(114, 99, 490, 137, "#e8f8ff", C.blue2, 2, 10) +
        path("M114 99 Q359 127 604 99", C.blue2, 2) + txt(359, 224, "copper(II) sulfate solution", 16, C.blue, "middle", 600) +
        rect(218, 74, 23, 130, "#777f8a", "#535d69", 2, 3) + rect(475, 74, 23, 130, "#b76b4e", "#8d4c34", 2, 3) +
        txt(229, 66, "anode (+)", 15, C.ink, "middle", 600) + txt(486, 66, "cathode (−)", 15, C.ink, "middle", 600) +
        circ(229, 151, 5, C.red, C.red, 1) + circ(229, 169, 4, C.red, C.red, 1) + circ(229, 184, 4, C.red, C.red, 1) +
        txt(181, 155, "O₂ bubbles", 14, C.red, "end", 600) + arrow(398, 149, 468, 149, C.blue, 3) + txt(432, 134, "Cu²⁺", 15, C.blue, "middle", 700) +
        path("M230 74 L230 56 L316 56", C.ink, 3) + path("M486 74 L486 56 L396 56", C.ink, 3) +
        rect(316, 43, 80, 28, C.white, C.ink, 2, 3) + txt(356, 62, "DC source", 14, C.ink, "middle", 700) +
        txt(486, 208, "copper coats plate", 14, "#8d4c34", "middle", 600);
      return svg("Electrolysis cell with graphite anode, copper cathode and a direct current source", b);
    },
    "distillation": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Simple distillation separates a liquid by boiling and condensing", 18, C.ink, "middle", 700) +
        path("M183 107 L183 154 Q183 190 222 190 Q261 190 261 154 L261 107", C.blue, 3) +
        path("M183 107 Q222 83 261 107", C.blue, 3) +
        path("M195 165 Q222 174 249 165", C.teal, 2) + txt(222, 148, "mixture", 14, C.blue, "middle", 600) +
        path("M222 85 L222 60 L365 60 L482 116", C.ink, 4) +
        path("M356 95 L477 149 L455 194 L334 139 Z", "#eaf6fb", C.blue, 3) +
        ln(367, 91, 346, 137, C.blue2, 2) + ln(485, 140, 466, 185, C.blue2, 2) +
        arrow(406, 113, 421, 119, C.red, 3) + txt(411, 82, "water out", 14, C.blue, "middle", 600) +
        arrow(374, 168, 394, 177, C.blue, 3) + txt(386, 211, "water in", 14, C.blue, "middle", 600) +
        path("M477 149 L556 185 L556 215", C.ink, 4) + path("M527 215 L585 215 L585 232 L527 232 Z", C.tealP, C.teal, 2) +
        txt(556, 255, "distillate", 14, C.teal, "middle", 600) +
        path("M181 201 L264 201", C.gold, 4) + path("M195 201 Q222 222 249 201", C.gold, 3) + txt(222, 239, "heat", 14, "#a87817", "middle", 600) +
        txt(222, 256, "heated flask", 14, C.muted, "middle", 600) + txt(403, 233, "condenser", 14, C.muted, "middle", 600);
      return svg("Simple distillation apparatus with heated flask, water-cooled condenser and receiver", b);
    },
    "mole-map": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "The mole links mass, particle count and gas volume", 19, C.ink, "middle", 700) +
        rect(38, 113, 167, 77, C.blueP, C.blue, 2, 10) + rect(277, 113, 167, 77, C.tealP, C.teal, 2, 10) +
        rect(516, 113, 167, 77, C.goldP, "#c58a17", 2, 10) +
        txt(121, 144, "mass (g)", 19, C.ink, "middle", 700) + txt(121, 170, "m ÷ M", 16, C.muted, "middle", 600) +
        txt(360, 144, "amount (mol)", 19, C.ink, "middle", 700) + txt(360, 170, "n", 17, C.muted, "middle", 600) +
        txt(599, 144, "particles", 19, C.ink, "middle", 700) + txt(599, 170, "n × Nₐ", 16, C.muted, "middle", 600) +
        arrow(207, 132, 273, 132, C.blue, 3) + arrow(273, 171, 207, 171, C.blue, 3) +
        arrow(446, 132, 512, 132, C.teal, 3) + arrow(512, 171, 446, 171, C.teal, 3) +
        txt(240, 111, "÷ M", 14, C.blue, "middle", 700) + txt(240, 207, "× M", 14, C.blue, "middle", 700) +
        txt(479, 111, "× Nₐ", 14, C.teal, "middle", 700) + txt(479, 207, "÷ Nₐ", 14, C.teal, "middle", 700) +
        txt(360, 251, "At STP, gas volume can also be found: V = n × 22.4 dm³ mol⁻¹.", 15, C.muted, "middle", 600);
      return svg("Conversion map connecting mass, moles and number of particles", b);
    },
    "redox-electron": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Redox: zinc atoms give electrons to copper(II) ions", 19, C.ink, "middle", 700) +
        rect(67, 88, 241, 132, "#e9f5ff", C.blue, 2, 10) + rect(412, 88, 241, 132, "#e9f9f4", C.teal, 2, 10) +
        txt(187, 117, "zinc strip", 17, C.blue, "middle", 700) + txt(532, 117, "copper sulfate solution", 16, C.teal, "middle", 700) +
        rect(160, 137, 52, 63, "#b9c6d3", "#647587", 2, 4) +
        [0,1,2].map(function (i) { return circ(484 + i * 38, 164, 13, C.blueP, C.blue, 2) + txt(484 + i * 38, 169, "Cu²⁺", 9, C.ink, "middle", 700); }).join("") +
        arrow(245, 153, 425, 153, C.red, 3) + txt(335, 137, "2e⁻", 17, C.red, "middle", 700) +
        txt(187, 211, "Zn → Zn²⁺ + 2e⁻", 15, C.ink, "middle", 600) + txt(532, 211, "Cu²⁺ + 2e⁻ → Cu", 15, C.ink, "middle", 600) +
        txt(360, 260, "Oxidation loses electrons; reduction gains electrons (OIL RIG).", 16, C.muted, "middle", 600);
      return svg("Electron transfer from zinc metal to copper two plus ions in a displacement redox reaction", b);
    },
    "hydration": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Water molecules surround and separate salt ions", 19, C.ink, "middle", 700) +
        circ(360, 155, 31, C.blueP, C.blue, 3) + txt(360, 162, "Na⁺", 20, C.ink, "middle", 700) +
        circ(548, 155, 31, C.redP, C.red, 3) + txt(548, 162, "Cl⁻", 20, C.ink, "middle", 700);
      [[275,155,"O","H","H",-1],[360,72,"O","H","H",0],[360,238,"O","H","H",0]].forEach(function (p) {
        var x = p[0], y = p[1];
        b += ln(x - 8, y + 6, x - 26, y + 24, C.ink, 2) + ln(x + 8, y + 6, x + 26, y + 24, C.ink, 2) +
          circ(x, y, 18, C.redP, C.red, 2) + txt(x, y + 5, "O", 14, C.ink, "middle", 700) +
          circ(x - 30, y + 28, 10, C.white, C.blue, 1.5) + txt(x - 30, y + 32, "H", 9, C.ink, "middle", 700) +
          circ(x + 30, y + 28, 10, C.white, C.blue, 1.5) + txt(x + 30, y + 32, "H", 9, C.ink, "middle", 700);
      });
      b += txt(287, 123, "δ−", 13, C.red, "middle", 700) + txt(586, 123, "δ+", 13, C.blue, "middle", 700) +
        txt(360, 268, "The oxygen end (δ−) turns toward Na⁺; hydrogen ends (δ+) turn toward Cl⁻.", 14, C.muted, "middle", 600);
      return svg("Polar water molecules hydrate sodium and chloride ions as salt dissolves", b);
    },
    "gas-laws": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Compressing a gas: less volume means more wall collisions", 19, C.ink, "middle", 700) +
        rect(98, 100, 217, 126, "#eef8ff", C.blue2, 3, 8) + rect(406, 100, 217, 126, "#eef8ff", C.blue2, 3, 8) +
        rect(98, 77, 217, 24, "#9aa8b8", "#6a7888", 2, 4) + rect(406, 136, 217, 24, "#9aa8b8", "#6a7888", 2, 4) +
        txt(205, 65, "larger volume V₁", 16, C.blue, "middle", 600) + txt(515, 124, "smaller volume V₂", 16, C.blue, "middle", 600) +
        [[135,130],[180,175],[222,125],[278,199],[155,205],[263,158]].map(function (p) { return circ(p[0],p[1],6,C.red,C.red,1); }).join("") +
        [[440,181],[474,200],[512,178],[548,203],[586,180],[600,208]].map(function (p) { return circ(p[0],p[1],6,C.red,C.red,1); }).join("") +
        arrow(324, 160, 388, 160, C.ink, 3) + txt(356, 142, "push", 14, C.muted, "middle", 600) +
        txt(360, 263, "At constant temperature: P₁V₁ = P₂V₂ (Boyle’s law).", 17, C.ink, "middle", 700);
      return svg("A piston compresses gas particles in a syringe to illustrate Boyle's law", b);
    },
    "energy-profile": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Exothermic reaction profile · energy released", 19, C.ink, "middle", 700) +
        arrow(113, 234, 621, 234, C.ink, 3) + arrow(113, 234, 113, 72, C.ink, 3) +
        path("M150 177 C210 177 228 88 338 88 C448 88 450 210 567 210", C.red, 4) +
        ln(151, 177, 215, 177, C.blue, 3) + ln(506, 210, 568, 210, C.teal, 3) +
        arrow(188, 178, 188, 95, C.gold, 3) + txt(218, 128, "activation\nenergy", 15, "#a87817", "start", 600) +
        arrow(594, 177, 594, 209, C.blue, 3) + txt(624, 198, "ΔH < 0", 16, C.blue, "start", 700) +
        txt(170, 162, "reactants", 15, C.blue, "start", 600) + txt(512, 195, "products", 15, C.teal, "start", 600) +
        txt(361, 266, "Reaction progress", 16, C.muted, "middle", 600) + txt(74, 156, "Energy", 15, C.muted, "middle", 600, 'transform="rotate(-90 74 156)"');
      return svg("Energy profile of an exothermic chemical reaction showing activation energy and negative enthalpy change", b);
    },
    "collision-theory": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Only a successful collision makes products", 19, C.ink, "middle", 700) +
        rect(37, 67, 309, 162, "#fff8f5", "#ead8d0", 2, 12) + rect(374, 67, 309, 162, "#f1fbf8", "#cce6dd", 2, 12) +
        txt(191, 94, "Not enough energy", 16, C.red, "middle", 700) + txt(529, 94, "Enough energy + right orientation", 15, C.teal, "middle", 700) +
        circ(111, 148, 24, C.blueP, C.blue, 2) + txt(111, 154, "A", 18, C.ink, "middle", 700) +
        circ(265, 148, 24, C.redP, C.red, 2) + txt(265, 154, "B", 18, C.ink, "middle", 700) + arrow(144,148,230,148,C.muted,2) +
        txt(190, 197, "bounce apart", 15, C.muted, "middle", 600) +
        circ(445, 148, 24, C.blueP, C.blue, 2) + txt(445, 154, "A", 18, C.ink, "middle", 700) +
        circ(516, 148, 24, C.redP, C.red, 2) + txt(516, 154, "B", 18, C.ink, "middle", 700) + arrow(548,148,606,148,C.teal,3) +
        txt(629, 154, "AB", 16, C.teal, "middle", 700) + txt(529, 197, "bonds rearrange", 15, C.muted, "middle", 600) +
        txt(360, 262, "Higher temperature or concentration increases the chance of effective collisions.", 15, C.muted, "middle", 600);
      return svg("Two particle collisions compare an ineffective collision with a successful reaction", b);
    },
    "organic-molecule": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Carbon makes chains and branches · a methane model", 19, C.ink, "middle", 700) +
        circ(360, 155, 31, "#333b48", "#202833", 2) + txt(360, 162, "C", 23, C.white, "middle", 700) +
        [[360,88],[293,155],[427,155],[360,222]].forEach(function (p) {
          b += ln(360 + (p[0]-360)*0.37, 155 + (p[1]-155)*0.37, p[0], p[1], C.ink, 5) +
            circ(p[0],p[1],22,C.white,C.blue,2) + txt(p[0],p[1]+7,"H",19,C.ink,"middle",700);
        });
      b += txt(123, 100, "Four covalent bonds", 16, C.blue, "middle", 600) + arrow(196, 108, 285, 137, C.blue, 2) +
        txt(579, 113, "CH₄", 23, C.teal, "middle", 700) + txt(579, 143, "methane", 16, C.muted, "middle", 600) +
        txt(360, 266, "Tetravalent carbon can build the skeletons of organic compounds.", 16, C.muted, "middle", 600);
      return svg("Methane ball-and-stick structure shows carbon's four covalent bonds", b);
    },
    "functional-groups": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Functional groups give organic families their characteristic reactions", 18, C.ink, "middle", 700) +
        [[90,"Alcohol","R—OH",C.blueP,C.blue],[268,"Aldehyde","R—CHO",C.goldP,"#bf841a"],[446,"Carboxylic acid","R—COOH",C.redP,C.red],[624,"Ester","R—COO—R′",C.tealP,C.teal]].map(function (a) {
          return rect(a[0]-76, 92, 152, 115, a[3], a[4], 2, 12) + txt(a[0], 126, a[1], 16, C.ink, "middle", 700) +
            txt(a[0], 169, a[2], 21, a[4], "middle", 700);
        }).join("") + txt(360, 255, "R stands for the rest of the carbon chain.", 16, C.muted, "middle", 600);
      return svg("Four organic functional groups with structural shorthand for alcohol, aldehyde, acid and ester", b);
    },
    "polymer-chain": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Addition polymerisation · ethene becomes polythene", 19, C.ink, "middle", 700) +
        rect(55, 99, 204, 100, C.blueP, C.blue, 2, 12) + txt(157, 137, "H₂C = CH₂", 24, C.ink, "middle", 700) +
        txt(157, 174, "ethene monomer", 16, C.muted, "middle", 600) + arrow(272,149,363,149,C.ink,3) +
        txt(318, 128, "n", 20, C.ink, "middle", 700) +
        path("M396 149 L430 149 L450 128 L488 170 L526 128 L564 170 L602 149 L652 149", C.teal, 5) +
        txt(522, 204, "—[CH₂—CH₂]ₙ—", 20, C.teal, "middle", 700) +
        txt(522, 238, "many repeating units", 16, C.muted, "middle", 600) +
        txt(360, 267, "The double bond opens; new single bonds join a long carbon chain.", 15, C.muted, "middle", 600);
      return svg("Ethene monomer joining into a repeating polythene chain", b);
    },
    "solvay-process": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Solvay process · a simplified industrial route to soda ash", 18, C.ink, "middle", 700) +
        [[38,"Brine + NH₃",C.blueP,C.blue],[212,"Carbonation\ntower",C.tealP,C.teal],[386,"NaHCO₃\ncrystals",C.goldP,"#bd861c"],[560,"Na₂CO₃\nsoda ash",C.redP,C.red]].map(function (a) {
          var lines = a[1].split("\n");
          return rect(a[0], 111, 124, 77, a[2], a[3], 2, 10) +
            txt(a[0]+62, 141, lines[0], 16, C.ink, "middle", 700) +
            (lines[1] ? txt(a[0]+62, 163, lines[1], 16, C.ink, "middle", 700) : "");
        }).join("") + arrow(164,150,205,150,C.ink,2) + arrow(338,150,379,150,C.ink,2) + arrow(512,150,553,150,C.ink,2) +
        txt(294, 92, "CO₂", 15, C.blue, "middle", 700) + arrow(294, 99, 274, 110, C.blue, 2) +
        txt(446, 222, "heat", 14, "#a87817", "middle", 600) + arrow(446, 211, 446, 188, C.gold, 2) +
        txt(360, 264, "Ammonia is recovered and reused; limestone supplies carbon dioxide.", 15, C.muted, "middle", 600);
      return svg("Four-step diagram of the Solvay process from brine and ammonia to sodium carbonate", b);
    },
    "blast-furnace": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Blast furnace · iron ore is reduced by carbon monoxide", 18, C.ink, "middle", 700) +
        path("M289 75 L431 75 L414 116 L414 189 L444 224 L276 224 L306 189 L306 116 Z", "#f7ece5", "#8f6151", 3) +
        rect(324, 91, 72, 24, "#d98a3d", "#9c5f2c", 1, 5) + rect(317, 121, 86, 24, "#6b6572", "#4f4a55", 1, 4) +
        rect(310, 151, 100, 30, "#9a775d", "#69513d", 1, 4) + rect(307, 184, 106, 26, "#e1c896", "#aa8952", 1, 4) +
        txt(360, 107, "ore + coke", 14, C.white, "middle", 700) + txt(360, 139, "CO reduces Fe₂O₃", 14, C.white, "middle", 700) +
        txt(360, 171, "hot reaction zone", 13, C.white, "middle", 700) + txt(360, 202, "molten iron", 14, C.ink, "middle", 700) +
        arrow(348, 54, 348, 73, C.red, 2) + arrow(372, 54, 372, 73, C.blue, 2) + txt(360, 52, "ore + coke", 14, C.muted, "middle", 600) +
        arrow(276, 206, 245, 222, "#8f6151", 2) + txt(197, 236, "slag outlet", 14, C.muted, "middle", 600) +
        arrow(430, 207, 463, 224, C.red, 2) + txt(505, 237, "iron tap", 14, C.muted, "middle", 600) +
        txt(360, 262, "Limestone removes silica impurities as slag.", 15, C.muted, "middle", 600);
      return svg("Cutaway blast furnace showing charge, reaction zones, molten iron and slag outlets", b);
    },
    "particle-states": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Particle arrangement explains the three states of matter", 19, C.ink, "middle", 700) +
        [[145,"Solid","#deefff"],[360,"Liquid","#e1f5f0"],[575,"Gas","#fff2d9"]].map(function (a) {
          return rect(a[0]-85, 76, 170, 155, a[2], "#d1dce7", 2, 10) + txt(a[0], 63, a[1], 18, C.ink, "middle", 700);
        }).join("");
      for (var r=0;r<3;r++) for (var c=0;c<3;c++) {
        b += circ(91+c*35, 112+r*35, 6, C.blue, C.blue, 1);
      }
      [[307,114],[344,108],[382,120],[316,151],[355,158],[390,146],[307,190],[345,186],[382,198]].forEach(function(p){b+=circ(p[0],p[1],6,C.teal,C.teal,1);});
      [[526,111],[605,99],[554,148],[633,145],[520,190],[585,205],[626,183]].forEach(function(p){b+=circ(p[0],p[1],6,C.red,C.red,1);});
      b += txt(145, 257, "fixed pattern", 15, C.muted, "middle", 600) + txt(360, 257, "close; able to flow", 15, C.muted, "middle", 600) + txt(575, 257, "far apart; moving freely", 15, C.muted, "middle", 600);
      return svg("Particle diagrams compare the closely packed solid, flowing liquid and widely spaced gas", b);
    },

    /* PHYSICS ------------------------------------------------------------- */
    "projectile": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A thrown ball follows a curved path under gravity", 19, C.ink, "middle", 700) +
        ln(88, 235, 647, 235, C.muted, 3) +
        path("M125 221 C204 77 359 74 548 221", C.blue, 4) +
        circ(125,221,9,C.red,C.red,1) + circ(548,221,9,C.red,C.red,1) +
        arrow(125,221,190,163,C.teal,3) + txt(155, 178, "launch velocity", 15, C.teal, "middle", 700) +
        arrow(125,221,190,221,C.gold,2) + txt(160, 246, "horizontal motion", 14, "#a87817", "middle", 600) +
        arrow(190,221,190,162,C.red,2) + txt(207, 195, "upward", 13, C.red, "start", 600) +
        arrow(475,98,475,153,C.red,3) + txt(497, 127, "g", 17, C.red, "middle", 700) +
        txt(548, 258, "range", 15, C.muted, "middle", 600) +
        txt(358, 271, "Horizontal velocity stays constant; vertical velocity changes due to gravity.", 14, C.muted, "middle", 600);
      return svg("Parabolic projectile path with launch velocity, horizontal component, range and downward gravity", b);
    },
    "pendulum": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A swinging pendulum moves to either side of equilibrium", 19, C.ink, "middle", 700) +
        ln(238, 78, 482, 78, C.ink, 5) + circ(360, 78, 6, C.ink, C.ink, 1) +
        path("M251 95 A138 138 0 0 0 469 95", C.gold, 2, "none", "5 6") +
        ln(360, 78, 268, 188, C.blue, 4) + ln(360, 78, 360, 222, C.muted, 3, "6 6") + ln(360, 78, 452, 188, C.blue, 4) +
        circ(268, 188, 19, C.redP, C.red, 3) + circ(360, 222, 19, C.tealP, C.teal, 3) + circ(452, 188, 19, C.redP, C.red, 3) +
        arrow(268, 212, 268, 235, C.red, 2) + arrow(452, 212, 452, 235, C.red, 2) +
        txt(268, 258, "extreme", 14, C.red, "middle", 600) + txt(360, 258, "equilibrium", 14, C.muted, "middle", 600) + txt(452, 258, "extreme", 14, C.red, "middle", 600) +
        txt(360, 282, "Gravity provides the restoring force; one full swing is a period.", 14, C.muted, "middle", 600);
      return svg("Pendulum at two extreme positions and its central equilibrium position", b);
    },
    "motion-graph": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Velocity–time graph · slope is acceleration", 19, C.ink, "middle", 700) +
        arrow(118, 229, 626, 229, C.ink, 3) + arrow(118, 229, 118, 73, C.ink, 3) +
        path("M120 222 L245 222 L420 104 L584 104", C.blue, 4) +
        path("M245 222 L245 222 L420 104 L420 222 Z", C.blue2, 1, C.blueP) +
        txt(363, 172, "area = distance", 15, C.blue, "middle", 700) +
        txt(601, 254, "time", 15, C.muted, "middle", 600) + txt(80, 145, "velocity", 15, C.muted, "middle", 600, 'transform="rotate(-90 80 145)"') +
        txt(246, 250, "2 s", 14, C.muted) + txt(420, 250, "5 s", 14, C.muted) + txt(101, 105, "m/s", 13, C.muted, "end");
      return svg("Velocity time graph showing acceleration, constant velocity and area as distance", b);
    },
    "lever": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A first-class lever · the fulcrum lies between load and effort", 18, C.ink, "middle", 700) +
        ln(110, 157, 610, 157, "#795e3f", 12) + poly("350,166 316,229 384,229", C.goldP, "#be8b2c", 3) +
        rect(173, 118, 68, 38, C.redP, C.red, 2, 6) + txt(207, 143, "LOAD", 15, C.red, "middle", 700) +
        arrow(207, 69, 207, 113, C.red, 4) + txt(207, 61, "down", 14, C.red, "middle", 600) +
        arrow(535, 217, 535, 163, C.blue, 4) + txt(535, 240, "effort", 15, C.blue, "middle", 700) +
        txt(350, 249, "fulcrum", 15, "#a87817", "middle", 700) +
        arrow(350, 101, 207, 101, C.muted, 2, true) + txt(278, 90, "load arm", 14, C.muted, "middle", 600) +
        arrow(350, 124, 535, 124, C.muted, 2, true) + txt(443, 113, "effort arm", 14, C.muted, "middle", 600);
      return svg("Lever diagram labeling the load, effort and central fulcrum with moment arms", b);
    },
    "pulley": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A fixed pulley changes the direction of the effort", 19, C.ink, "middle", 700) +
        rect(211, 67, 292, 15, "#9ba8b5", "#687788", 2, 4) + ln(356, 82, 356, 102, C.ink, 4) +
        circ(356, 132, 36, "#f1f4f8", C.ink, 4) + circ(356,132,5,C.ink,C.ink,1) +
        path("M320 132 L320 215 L394 215 L394 132", C.gold, 4) +
        arrow(394, 187, 394, 238, C.blue, 4) + txt(428, 225, "effort", 16, C.blue, "start", 700) +
        rect(298, 215, 116, 44, C.redP, C.red, 2, 7) + txt(356, 243, "LOAD", 17, C.red, "middle", 700) +
        arrow(356, 207, 356, 174, C.red, 3) + txt(251, 123, "fixed support", 15, C.muted, "middle", 600) +
        txt(360, 278, "The pulley turns the pull downwards; ideal mechanical advantage = 1.", 15, C.muted, "middle", 600);
      return svg("Fixed pulley with rope, load, support and downward effort force", b);
    },
    "hydraulic-press": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Hydraulic press · pressure is transmitted through a liquid", 19, C.ink, "middle", 700) +
        path("M199 185 L199 224 L523 224 L523 185", "#8fcbdc", 2) + rect(199, 169, 324, 55, "#c9f0f4", "#67b9c8", 2, 3) +
        rect(209, 86, 51, 91, "#aebbc7", "#647587", 3, 4) + rect(455, 64, 76, 113, "#aebbc7", "#647587", 3, 4) +
        rect(185, 82, 79, 13, C.ink, C.ink, 1, 3) + rect(444, 58, 98, 13, C.ink, C.ink, 1, 3) +
        arrow(224, 46, 224, 80, C.red, 4) + arrow(493, 128, 493, 65, C.blue, 4) +
        txt(224, 41, "F₁", 17, C.red, "middle", 700) + txt(494, 145, "F₂", 17, C.blue, "middle", 700) +
        txt(234, 117, "A₁", 17, C.ink, "middle", 700) + txt(493, 106, "A₂", 17, C.ink, "middle", 700) +
        txt(361, 205, "enclosed oil", 15, C.blue, "middle", 700) +
        txt(360, 263, "P = F₁/A₁ = F₂/A₂  ·  a small force can lift a heavy load.", 16, C.ink, "middle", 700);
      return svg("Hydraulic press with unequal pistons, fluid, input force and amplified output force", b);
    },
    "spring": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Spring extension increases with load (within the elastic limit)", 18, C.ink, "middle", 700) +
        rect(247, 67, 226, 12, "#9ba8b5", "#687788", 2, 4) +
        path("M360 79 L360 94 L342 105 L378 117 L342 129 L378 141 L342 153 L378 165 L342 177 L378 189 L360 201", C.blue, 4) +
        rect(326, 201, 68, 45, C.goldP, "#c58a17", 2, 7) + txt(360, 229, "load", 16, C.ink, "middle", 700) +
        arrow(428, 87, 428, 202, C.red, 3) + txt(454, 145, "extension x", 15, C.red, "middle", 700) +
        txt(360, 270, "Hooke’s law: force F ∝ extension x; the gradient is the spring constant k.", 16, C.muted, "middle", 600);
      return svg("Spring stretching under a load with its extension indicated", b);
    },
    "electroscope": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A gold-leaf electroscope detects electric charge", 19, C.ink, "middle", 700) +
        rect(276, 93, 168, 155, "#f8fcff", "#87a0b7", 3, 14, 0.72) +
        circ(360, 70, 27, C.goldP, "#bd861c", 3) + ln(360, 97, 360, 190, "#697989", 5) +
        ln(360, 184, 329, 221, C.gold, 5) + ln(360, 184, 391, 221, C.gold, 5) +
        ln(315, 225, 405, 225, C.ink, 4) +
        circ(360, 70, 4, C.red, C.red, 1) + dot(349, 69, 3) + dot(372, 69, 3) +
        txt(360, 271, "Like charges spread down both leaves, so they repel and diverge.", 16, C.muted, "middle", 600);
      return svg("Charged electroscope with a metal cap, conducting stem and diverging gold leaves", b);
    },
    "electric-field": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Electric field lines run from positive to negative charge", 19, C.ink, "middle", 700) +
        circ(180, 154, 31, C.redP, C.red, 3) + txt(180, 162, "+", 26, C.red, "middle", 700) +
        circ(540, 154, 31, C.blueP, C.blue, 3) + txt(540, 162, "−", 26, C.blue, "middle", 700) +
        path("M211 154 C292 95 424 95 509 154", C.teal, 2) + path("M211 154 C292 213 424 213 509 154", C.teal, 2) +
        path("M198 126 C265 58 453 58 522 126", C.teal, 2) + path("M198 182 C265 250 453 250 522 182", C.teal, 2) +
        arrow(338, 112, 382, 112, C.teal, 2) + arrow(338, 196, 382, 196, C.teal, 2) +
        txt(360, 271, "Lines never cross; a closer spacing means a stronger field.", 16, C.muted, "middle", 600);
      return svg("Dipole electric field lines with arrows directed from a positive charge to a negative charge", b);
    },
    "force-components": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Resolve one force into perpendicular components", 19, C.ink, "middle", 700) +
        ln(172, 218, 574, 218, C.muted, 3) + ln(172, 218, 172, 79, C.muted, 3) +
        arrow(172, 218, 432, 98, C.red, 4) + arrow(172, 218, 432, 218, C.blue, 3) + arrow(432, 218, 432, 98, C.teal, 3) +
        ln(432, 98, 432, 218, "#a9b7c5", 1, "5 5") +
        txt(303, 137, "F", 20, C.red, "middle", 700) + txt(302, 243, "F cos θ", 17, C.blue, "middle", 700) +
        txt(462, 158, "F sin θ", 17, C.teal, "start", 700) + txt(200, 207, "θ", 17, C.ink, "middle", 700) +
        txt(360, 270, "Horizontal and vertical components add vectorially to the original force.", 15, C.muted, "middle", 600);
      return svg("A diagonal force and its perpendicular horizontal and vertical components", b);
    },
    "collision-carts": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Two carts collide · total momentum is conserved", 19, C.ink, "middle", 700) +
        ln(68, 202, 650, 202, C.muted, 4) +
        rect(119, 145, 91, 48, C.blueP, C.blue, 3, 7) + circ(142, 200, 8, C.ink, C.ink, 1) + circ(188, 200, 8, C.ink, C.ink, 1) +
        rect(396, 145, 91, 48, C.redP, C.red, 3, 7) + circ(419, 200, 8, C.ink, C.ink, 1) + circ(465, 200, 8, C.ink, C.ink, 1) +
        txt(164, 175, "2 kg", 17, C.ink, "middle", 700) + txt(441, 175, "1 kg", 17, C.ink, "middle", 700) +
        arrow(128, 116, 215, 116, C.blue, 3) + txt(171, 97, "3 m/s", 15, C.blue, "middle", 700) +
        arrow(502, 116, 568, 116, C.teal, 3) + txt(536, 97, "after", 14, C.teal, "middle", 600) +
        txt(360, 254, "Before: (2 × 3) + (1 × 0) = 6 kg m/s.  No external force → same total after.", 15, C.muted, "middle", 600);
      return svg("Two trolley carts with masses and velocity arrows demonstrate conservation of momentum", b);
    },
    "vacuum-flask": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A vacuum flask slows the three ways heat travels", 19, C.ink, "middle", 700) +
        path("M290 71 L290 215 Q290 244 360 244 Q430 244 430 215 L430 71", "#7a8b9c", 5) +
        path("M310 91 L310 205 Q310 222 360 222 Q410 222 410 205 L410 91", C.blue, 3) +
        path("M324 106 L324 194 Q324 209 360 209 Q396 209 396 194 L396 106", C.blue2, 2) +
        txt(360, 170, "hot drink", 18, C.red, "middle", 700) +
        txt(218, 113, "vacuum", 15, C.muted, "middle", 600) + arrow(247, 119, 286, 119, C.muted, 2) +
        txt(504, 107, "silvered walls", 15, C.muted, "middle", 600) + arrow(474, 111, 423, 127, C.muted, 2) +
        txt(503, 174, "insulating stopper", 15, C.muted, "middle", 600) + arrow(467, 167, 418, 81, C.muted, 2) +
        txt(360, 273, "Vacuum limits conduction and convection; shiny surfaces reflect heat radiation.", 15, C.muted, "middle", 600);
      return svg("Cutaway vacuum flask showing double walls, vacuum, reflective surfaces and stopper", b);
    },
    "wave": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Transverse wave · particles vibrate across the direction of travel", 18, C.ink, "middle", 700) +
        arrow(96, 165, 627, 165, C.muted, 2) +
        path("M104 165 C144 165 144 91 184 91 C224 91 224 239 264 239 C304 239 304 91 344 91 C384 91 384 239 424 239 C464 239 464 91 504 91 C544 91 544 165 584 165", C.blue, 4) +
        ln(100,165,600,165,"#aab8c7",1,"5 6") + arrow(184,157,184,103,C.red,2,true) +
        txt(155, 132, "amplitude", 14, C.red, "middle", 600) + arrow(184, 69, 344, 69, C.teal, 2, true) +
        txt(264, 62, "wavelength λ", 15, C.teal, "middle", 700) +
        txt(360, 270, "Wave speed v = frequency f × wavelength λ", 17, C.ink, "middle", 700);
      return svg("Transverse wave showing rest position, amplitude, wavelength and direction of travel", b);
    },
    "reflection": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Reflection at a plane mirror · angle in equals angle out", 19, C.ink, "middle", 700) +
        ln(140, 218, 583, 218, "#687b8e", 6) + ln(361, 84, 361, 220, "#9aaaba", 2, "6 5") +
        arrow(206, 85, 361, 218, C.blue, 4) + arrow(361, 218, 517, 85, C.red, 4) +
        path("M361 179 A39 39 0 0 0 333 190", C.gold, 3) + path("M361 179 A39 39 0 0 1 389 190", C.gold, 3) +
        txt(309, 183, "i", 18, "#a87817", "middle", 700) + txt(413, 183, "r", 18, "#a87817", "middle", 700) +
        txt(361, 247, "plane mirror", 16, C.muted, "middle", 600) + txt(256, 115, "incident ray", 15, C.blue, "middle", 600) +
        txt(466, 115, "reflected ray", 15, C.red, "middle", 600);
      return svg("Plane mirror with normal, incident and reflected rays and equal angles", b);
    },
    "prism": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A prism disperses white light into a spectrum", 19, C.ink, "middle", 700) +
        arrow(86, 155, 282, 155, "#f1b92f", 6) + txt(162, 134, "white light", 15, C.muted, "middle", 600) +
        poly("294,86 424,155 294,224", "#eaf4ff", C.blue, 3) +
        path("M424 155 L613 83", "#e34542", 4) + path("M424 155 L613 106", "#ef9d36", 4) +
        path("M424 155 L613 129", "#ebd23f", 4) + path("M424 155 L613 153", "#55a865", 4) +
        path("M424 155 L613 177", "#4489cd", 4) + path("M424 155 L613 200", "#5e64ad", 4) +
        path("M424 155 L613 223", "#9165a8", 4) + txt(626, 85, "R", 13, C.red, "start", 700) +
        txt(626, 226, "V", 13, C.purple, "start", 700) + txt(360, 260, "Red bends least; violet bends most.", 16, C.muted, "middle", 600);
      return svg("Triangular glass prism disperses white light into seven colours from red to violet", b);
    },
    "circuit-series": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Series circuit · the same current passes every component", 19, C.ink, "middle", 700) +
        path("M165 105 L165 75 L555 75 L555 215 L165 215 L165 168", C.ink, 4) +
        ln(165, 145, 165, 168, C.ink, 4) + ln(153, 145, 177, 145, C.blue, 4) + ln(158, 132, 172, 132, C.blue, 2) +
        path("M267 75 L286 75 L296 61 L312 89 L328 61 L344 89 L360 61 L376 89 L392 75 L420 75", C.red, 3) +
        path("M420 75 L439 75 L449 61 L465 89 L481 61 L497 89 L513 61 L529 89 L540 75", C.teal, 3) +
        arrow(218, 75, 257, 75, C.blue, 2) + txt(237, 62, "I", 15, C.blue, "middle", 700) +
        txt(344, 117, "R₁", 17, C.red, "middle", 700) + txt(480, 117, "R₂", 17, C.teal, "middle", 700) +
        txt(360, 253, "Rₜ = R₁ + R₂   ·   V = V₁ + V₂", 18, C.ink, "middle", 700);
      return svg("Battery and two resistors connected in a single series loop", b);
    },
    "circuit-parallel": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Parallel circuit · each branch has the full supply voltage", 19, C.ink, "middle", 700) +
        path("M163 108 L163 76 L554 76 L554 218 L163 218 L163 168", C.ink, 4) +
        ln(163, 145, 163, 168, C.ink, 4) + ln(151, 145, 175, 145, C.blue, 4) + ln(156, 132, 170, 132, C.blue, 2) +
        path("M295 76 L295 121 L315 121 L325 107 L341 135 L357 107 L373 135 L389 107 L405 121 L425 121 L425 76", C.red, 3) +
        path("M295 76 L295 174 L315 174 L325 160 L341 188 L357 160 L373 188 L389 160 L405 174 L425 174 L425 76", C.teal, 3) +
        arrow(256, 95, 286, 95, C.blue, 2) + arrow(256, 196, 286, 196, C.blue, 2) +
        txt(358, 102, "R₁", 15, C.red, "middle", 700) + txt(358, 211, "R₂", 15, C.teal, "middle", 700) +
        txt(360, 255, "Current splits between branches; Iₜ = I₁ + I₂.", 17, C.ink, "middle", 700);
      return svg("Battery with two resistors on separate parallel branches", b);
    },
    "electromagnet": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Current through a coil magnetises a soft-iron core", 19, C.ink, "middle", 700) +
        rect(231, 124, 259, 56, "#a7b4c1", "#607181", 3, 8) +
        path("M262 104 C244 104 244 199 262 199 C280 199 280 104 298 104 C316 104 316 199 334 199 C352 199 352 104 370 104 C388 104 388 199 406 199 C424 199 424 104 442 104 C460 104 460 199 478 199", C.red, 5) +
        circ(169, 152, 29, C.blueP, C.blue, 2) + txt(169, 159, "+", 24, C.blue, "middle", 700) +
        rect(123, 133, 16, 38, C.blue, C.blue, 1, 2) + txt(169, 225, "cell", 15, C.muted, "middle", 600) +
        path("M198 152 L231 152 M490 152 L532 152 L532 82 L169 82 L169 122", C.ink, 3) +
        arrow(344, 84, 397, 84, C.blue, 2) + txt(360, 263, "More turns or more current makes a stronger electromagnet.", 16, C.muted, "middle", 600);
      return svg("Battery-driven wire coil wrapped around an iron core to make an electromagnet", b);
    },
    "transformer": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Transformer · alternating current changes voltage", 19, C.ink, "middle", 700) +
        rect(298, 81, 124, 144, "#d8e0e8", "#657789", 3, 4) + rect(324, 102, 72, 102, C.white, "#657789", 2, 2) +
        path("M233 90 C208 90 208 119 233 119 C258 119 258 148 233 148 C208 148 208 177 233 177 C258 177 258 206 233 206", C.blue, 5) +
        path("M487 90 C462 90 462 119 487 119 C512 119 512 148 487 148 C462 148 462 177 487 177 C512 177 512 206 487 206", C.red, 5) +
        path("M124 147 L208 147 M512 147 L596 147", C.ink, 3) +
        txt(234, 250, "Primary coil · Nₚ", 16, C.blue, "middle", 700) + txt(486, 250, "Secondary coil · Nₛ", 16, C.red, "middle", 700) +
        txt(360, 151, "iron core", 15, C.muted, "middle", 600) + txt(360, 273, "Vₛ / Vₚ = Nₛ / Nₚ", 17, C.ink, "middle", 700);
      return svg("Transformer with primary and secondary coils wound on a soft iron core", b);
    },
    "ac-waveform": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Alternating current reverses direction each half-cycle", 19, C.ink, "middle", 700) +
        arrow(96, 158, 631, 158, C.ink, 2) + arrow(133, 230, 133, 76, C.ink, 2) +
        path("M134 158 C168 158 169 91 218 91 C267 91 267 225 316 225 C365 225 365 91 414 91 C463 91 463 225 512 225 C561 225 561 158 600 158", C.blue, 4) +
        txt(624, 181, "time", 14, C.muted, "middle", 600) + txt(94, 85, "current", 14, C.muted, "middle", 600, 'transform="rotate(-90 94 85)"') +
        txt(252, 81, "+", 18, C.red, "middle", 700) + txt(352, 246, "−", 18, C.blue, "middle", 700) +
        txt(360, 271, "One complete cycle contains a positive and a negative half-cycle.", 15, C.muted, "middle", 600);
      return svg("Sinusoidal alternating current graph crossing zero between positive and negative half cycles", b);
    },
    "atomic-nucleus": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "An atom has a tiny, dense nucleus and surrounding electrons", 19, C.ink, "middle", 700) +
        circ(290, 158, 69, "none", "#9baec0", 2) + circ(290, 158, 110, "none", "#9baec0", 2) + circ(290, 158, 151, "none", "#9baec0", 2) +
        circ(290, 158, 37, "#ffe6b5", "#c78d2b", 2) +
        [[271,144,"p⁺",C.red],[302,143,"n⁰",C.muted],[278,172,"n⁰",C.muted],[305,174,"p⁺",C.red]].map(function(a){return circ(a[0],a[1],13,C.white,a[3],2)+txt(a[0],a[1]+4,a[2],10,a[3],"middle",700);}).join("") +
        [[290,47],[180,158],[400,158],[290,268]].map(function(p){return circ(p[0],p[1],6,C.blue,C.blue,1);}).join("") +
        txt(510, 103, "protons + neutrons", 17, C.ink, "start", 700) + arrow(498, 108, 335, 141, C.line, 2) +
        txt(510, 163, "electron shells", 17, C.ink, "start", 700) + arrow(499, 166, 400, 158, C.line, 2) +
        txt(510, 218, "most of the atom is empty space", 15, C.muted, "start", 600);
      return svg("Atom diagram showing a small proton and neutron nucleus with electrons in shells", b);
    },
    "nuclear-fission": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Nuclear fission · one heavy nucleus splits and releases neutrons", 18, C.ink, "middle", 700) +
        circ(146, 151, 43, "#dce8f8", C.blue, 3) + txt(146, 158, "U-235", 18, C.ink, "middle", 700) +
        circ(268, 151, 7, C.muted, C.muted, 1) + arrow(206, 151, 248, 151, C.ink, 3) +
        circ(396, 127, 32, C.blueP, C.blue, 2) + txt(396, 133, "Ba", 17, C.ink, "middle", 700) +
        circ(477, 178, 28, C.redP, C.red, 2) + txt(477, 184, "Kr", 16, C.ink, "middle", 700) +
        [0,1,2].map(function(i){return circ(549+i*28, 125+i*26, 6, C.gold, "#ba8120",1);}).join("") +
        arrow(343, 142, 367, 132, C.blue, 2) + arrow(343, 161, 450, 177, C.red, 2) +
        txt(566, 221, "neutrons", 14, "#a87817", "middle", 600) +
        txt(360, 263, "The released neutrons may trigger a chain reaction.", 16, C.muted, "middle", 600);
      return svg("Uranium nucleus absorbs a neutron then splits into smaller nuclei and releases neutrons", b);
    },
    "particle-accelerator": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "A circular accelerator steers charged particles with magnets", 19, C.ink, "middle", 700) +
        path("M191 206 A 163 103 0 1 1 524 206 A 163 103 0 1 1 191 206", C.blue, 9) +
        path("M211 198 A 143 85 0 1 1 501 198 A 143 85 0 1 1 211 198", "#b9d9f4", 2, "none", "5 7") +
        arrow(198, 126, 222, 104, C.red, 3) + arrow(516, 177, 495, 201, C.red, 3) +
        rect(326, 117, 65, 82, C.goldP, "#bf8b27", 2, 9) + txt(358, 150, "RF", 20, C.ink, "middle", 700) + txt(358, 174, "cavity", 14, C.muted, "middle", 600) +
        circ(258, 153, 7, C.red, C.red, 1) + circ(282, 145, 7, C.red, C.red, 1) + circ(305, 137, 7, C.red, C.red, 1) +
        txt(359, 260, "Radio-frequency fields add energy; magnets bend the path.", 16, C.muted, "middle", 600);
      return svg("Circular particle accelerator with a radio frequency cavity and a curved particle beam", b);
    },
    "photoelectric": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Photoelectric effect · light can eject electrons from a metal", 18, C.ink, "middle", 700) +
        rect(460, 105, 38, 110, "#aebbc7", "#657789", 3, 4) +
        arrow(96, 127, 438, 127, "#e6ae24", 4) + arrow(96, 160, 438, 160, "#e6ae24", 4) + arrow(96, 193, 438, 193, "#e6ae24", 4) +
        txt(224, 102, "incoming light photons", 16, "#a87817", "middle", 700) +
        [0,1,2].map(function(i){var y=126+i*38; return circ(533+i*34,y,7,C.blue,C.blue,1)+arrow(500,y,526+i*34,y,C.blue,2);}).join("") +
        txt(531, 239, "emitted electrons", 15, C.blue, "middle", 600) + txt(479, 90, "metal surface", 14, C.muted, "middle", 600) +
        txt(360, 270, "Below the threshold frequency, no electron is emitted, whatever the intensity.", 15, C.muted, "middle", 600);
      return svg("Photons strike a metal surface and eject electrons in the photoelectric effect", b);
    },
    "bernoulli-wing": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Air moves faster over a wing; lower pressure helps create lift", 18, C.ink, "middle", 700) +
        path("M228 164 Q340 91 501 152 Q388 166 228 164 Z", "#dceeff", C.blue, 3) +
        path("M160 104 C270 32 419 38 552 97", C.teal, 2) + path("M157 125 C270 70 417 73 552 118", C.teal, 2) +
        path("M160 208 C285 210 421 195 552 183", "#9baec0", 2) + path("M160 230 C285 236 421 222 552 207", "#9baec0", 2) +
        arrow(309, 63, 385, 55, C.teal, 2) + arrow(306, 222, 375, 223, C.muted, 2) +
        arrow(364, 157, 364, 94, C.red, 3) + txt(395, 125, "lift", 15, C.red, "middle", 700) +
        txt(487, 77, "faster flow", 15, C.teal, "middle", 600) + txt(490, 226, "slower flow", 15, C.muted, "middle", 600) +
        txt(360, 270, "Pressure differences around a wing contribute to the upward force.", 15, C.muted, "middle", 600);
      return svg("Airflow streamlines around an aerofoil with the upward lift force", b);
    },
    "density-flotation": function () {
      var b = panel(12, 12, 696, 276, "#fbfdff") + txt(360, 39, "Why a loaded boat floats · upthrust balances weight", 19, C.ink, "middle", 700) +
        path("M83 161 Q360 185 637 161 L596 224 Q360 254 124 224 Z", "#d4e3ed", C.ink, 3) +
        path("M78 152 Q180 142 282 152 Q420 166 642 151 L642 239 L78 239 Z", "#dff5ff", C.blue2, 2) +
        path("M214 115 L506 115 L472 153 L247 153 Z", "#f2e4c9", "#9a7848", 2) +
        arrow(360, 97, 360, 145, C.red, 4) + txt(386, 105, "weight", 15, C.red, "start", 700) +
        arrow(360, 212, 360, 166, C.blue, 4) + txt(387, 197, "upthrust", 15, C.blue, "start", 700) +
        txt(360, 269, "Archimedes’ principle: upthrust equals the weight of displaced fluid.", 16, C.muted, "middle", 600);
      return svg("Boat floating at the waterline with weight downward and buoyant upthrust upward", b);
    }
  };

  if (typeof window !== "undefined") window.FIG = FIG;
})();
