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
  HonkParticle({
    required this.child,
    required double x,
    required double y,
    required double tx,
    required double ty,
  }) : pos = Vector2(x, y),
       target = Vector2(tx, ty),
       start = Vector2(x, y),
       curveHeight = HonkParticle.randomRange(-100, 100),
       speed = 0.015,
       progress = HonkParticle.randomRange(-0.4, 0);

  void update() {
    progress += speed;
    if (progress <= 0) {
      pos.setFrom(start);
      scale = 0;
      return;
    }
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    Vector2 path = target - start;
    Vector2 perpendicular = Vector2(-path.y, path.x);
    perpendicular.normalize();

    double curveT = sin(progress * pi);
    perpendicular.scale(curveT * curveHeight);

    currentPos.add(perpendicular);
    pos.setFrom(currentPos);

    currentAngle = curveT * progress;
    scale = curveT;
  }

  bool get isDead => progress >= 1;

  static double randomRange(double min, double max) {
    return min + Random().nextDouble() * (max - min);
  }
}
