import { makeScene2D, Code, Rect } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
    const code = createRef<Code>();
    
    view.add(
        <Code
            ref={code}
            fontSize={20}
            offsetX={-1}
            x={-400}

            code={`\ 
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math.dart';
import 'dart:math';

`}
        />
    );

    yield* code().code(`\
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math.dart';
import 'dart:math';

class HonkParticle {

}
`,0.6).to(`\
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math.dart';
import 'dart:math';

class HonkParticle {
  Vector2 start;
  Vector2 pos;
  Vector2 target;
  double progress = 0.0;
  double scale = 0;
  double curveHeight;
  double speed;
  Widget child;
}
`,0.6).to(`\
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math.dart';
import 'dart:math';

class HonkParticle {
  Vector2 start;
  Vector2 pos;
  Vector2 target;
  double progress = 0.0;
  double scale = 0;
  double curveHeight;
  double speed;
  Widget child;

  final Key key = UniqueKey();

  double angle = HonkParticle.randomRange(0, 20);
  double currentAngle = 0.0;
}
`,0.6)
});
 