import { useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Canvas, Circle, DashPathEffect, Group, Line, Path, Rect, Skia,
  Text as SkText, matchFont, vec,
} from '@shopify/react-native-skia';
import { DerivedValue, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { ALTURA, LARGURA, PECAS, Peca } from './constantes';
import type { Posicoes, Seta } from '../types';

const BR = 'rgba(255,255,255,0.7)';

export type SetaTemp = { x1: SharedValue<number>; y1: SharedValue<number>; x2: SharedValue<number>; y2: SharedValue<number>; on: SharedValue<number> };

// Cada peça lê a própria posição do valor compartilhado: o Skia redesenha sem re-render do React.
function PecaView({ peca, display, font }: { peca: Peca; display: DerivedValue<Posicoes>; font: ReturnType<typeof matchFont> }) {
  const id = peca.id;
  const cx = useDerivedValue(() => display.get()[id].x);
  const cy = useDerivedValue(() => display.get()[id].y);
  const tx = useDerivedValue(() => display.get()[id].x - 1.4);
  const ty = useDerivedValue(() => display.get()[id].y + 1.6);
  const bola = id === 'bola';
  return (
    <>
      <Circle cx={cx} cy={cy} r={peca.raio} color={peca.cor} />
      <Circle cx={cx} cy={cy} r={peca.raio} style="stroke" strokeWidth={0.6} color={bola ? '#222' : '#fff'} />
      {!bola && font && <SkText x={tx} y={ty} text={peca.rotulo} font={font} color="#fff" />}
    </>
  );
}

function SetaView({ s }: { s: Seta }) {
  const ponta = useMemo(() => {
    const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
    const L = 3.6, A = 0.45;
    return Skia.PathBuilder.Make()
      .moveTo(s.x2 - L * Math.cos(ang - A), s.y2 - L * Math.sin(ang - A))
      .lineTo(s.x2, s.y2)
      .lineTo(s.x2 - L * Math.cos(ang + A), s.y2 - L * Math.sin(ang + A))
      .build();
  }, [s]);
  return (
    <>
      <Line p1={vec(s.x1, s.y1)} p2={vec(s.x2, s.y2)} strokeWidth={0.9} color="#fff">
        <DashPathEffect intervals={[2, 1.4]} />
      </Line>
      <Path path={ponta} style="stroke" strokeWidth={0.9} strokeCap="round" strokeJoin="round" color="#fff" />
    </>
  );
}

export default function Campo({ largura, display, setas, tmp }: {
  largura: number; display: DerivedValue<Posicoes>; setas: Seta[]; tmp: SetaTemp;
}) {
  const escala = largura / LARGURA;
  const font = useMemo(
    () => matchFont({ fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }), fontSize: 4.6, fontWeight: 'bold' }),
    [],
  );
  // Objetos simples (não vec) dentro de worklets
  const p1 = useDerivedValue(() => ({ x: tmp.x1.get(), y: tmp.y1.get() }));
  const p2 = useDerivedValue(() => ({ x: tmp.x2.get(), y: tmp.y2.get() }));

  return (
    <Canvas style={{ width: largura, height: ALTURA * escala }}>
      <Group transform={[{ scale: escala }]}>
        <Rect x={0} y={0} width={LARGURA} height={ALTURA} color="#2a8a4a" />
        {[4, 48, 92].map((y) => (
          <Rect key={y} x={4} y={y} width={92} height={22} color="rgba(255,255,255,0.06)" />
        ))}
        <Rect x={4} y={4} width={92} height={132} style="stroke" strokeWidth={0.5} color={BR} />
        <Line p1={vec(4, 70)} p2={vec(96, 70)} strokeWidth={0.5} color={BR} />
        <Circle cx={50} cy={70} r={10} style="stroke" strokeWidth={0.5} color={BR} />
        <Rect x={25} y={4} width={50} height={18} style="stroke" strokeWidth={0.5} color={BR} />
        <Rect x={25} y={118} width={50} height={18} style="stroke" strokeWidth={0.5} color={BR} />
        <Rect x={38} y={4} width={24} height={7} style="stroke" strokeWidth={0.5} color={BR} />
        <Rect x={38} y={129} width={24} height={7} style="stroke" strokeWidth={0.5} color={BR} />
        {setas.map((s, i) => <SetaView key={i} s={s} />)}
        <Line p1={p1} p2={p2} strokeWidth={0.9} color="#fff" opacity={tmp.on} />
        {PECAS.map((p) => <PecaView key={p.id} peca={p} display={display} font={font} />)}
      </Group>
    </Canvas>
  );
}
