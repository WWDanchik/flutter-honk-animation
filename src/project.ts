import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";

import { parser } from "@lezer/cpp";
import { Code, LezerHighlighter } from "@motion-canvas/2d";
import { makeProject } from "@motion-canvas/core";
import camera from "./scenes/camera?scene";
import codeExample from "./scenes/code?scene";
import demo from "./scenes/demo?scene";
import particles from "./scenes/particles?scene";
import video from "./scenes/video?scene";
import cartesian from "./scenes/cartesian?scene";
import math from "./scenes/math?scene";
import browserScroll from "./scenes/browser_scroll?scene";
import cartesianSystemExample from "./scenes/cartesian-system-example?scene";
Code.defaultHighlighter = new LezerHighlighter(parser, oneDarkHighlightStyle);

export default makeProject({
    scenes: [
        browserScroll,
        demo,
        math,
        cartesianSystemExample,
        particles,

    ],
    name: "Honk Animation",
});
