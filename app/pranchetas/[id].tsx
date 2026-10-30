import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import Campo from '../../src/prancheta/Campo';
import { ALTURA, IDS, LARGURA, POS_INICIAL, copiarPos } from '../../src/prancheta/constantes';
import { carregarPrancheta, salvarPrancheta } from '../../src/lib/pranchetas';
import { useAuth } from '../../src/store/auth';
import { C } from '../../src/theme';
import type { Posicoes, Quadro } from '../../src/types';

const DUR = 1000; // ms por transição entre quadros
const limite = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function Editor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const W = Math.min(width, 440) - 32;
  const esc = W / LARGURA;

  const [titulo, setTitulo] = useState('');
  const [quadros, setQuadros] = useState<Quadro[] | null>(null);
  const [cur, setCur] = useState(0);
  const [tool, setTool] = useState<'mover' | 'seta'>('mover');
  const [tocando, setTocando] = useState(false);
  const [scroll, setScroll] = useState(true);
  const [sujo, setSujo] = useState(false);
  const [erro, setErro] = useState(false);

  // Valores compartilhados: o Skia lê estes valores direto, sem re-render
  const positions = useSharedValue<Posicoes>(copiarPos(POS_INICIAL));
  const from = useSharedValue<Posicoes>(copiarPos(POS_INICIAL));
  const to = useSharedValue<Posicoes>(copiarPos(POS_INICIAL));
  const t = useSharedValue(0);
  const playing = useSharedValue(0);
  const tmp = {
    x1: useSharedValue(0), y1: useSharedValue(0),
    x2: useSharedValue(0), y2: useSharedValue(0), on: useSharedValue(0),
  };

  // Posição exibida: a editada, ou a interpolada entre dois quadros durante a reprodução
  const display = useDerivedValue<Posicoes>(() => {
    if (playing.get() === 0) return positions.get();
    const k = t.get(), a = from.get(), b = to.get();
    const o: Posicoes = {};
    for (const pid of IDS) o[pid] = { x: a[pid].x + (b[pid].x - a[pid].x) * k, y: a[pid].y + (b[pid].y - a[pid].y) * k };
    return o;
  });

  const estado = useRef({ tool, cur, tocando });
  useEffect(() => { estado.current = { tool, cur, tocando }; });
  const arrasto = useRef<string | null>(null);
  const armando = useRef(false);
  const versao = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    carregarPrancheta(user.uid, id).then((p) => {
      if (!p || !p.quadros?.length) return setQuadros([]);
      setTitulo(p.titulo);
      setQuadros(p.quadros);
      positions.set(copiarPos(p.quadros[0].p));
    });
    return () => { if (timer.current) clearTimeout(timer.current); playing.set(0); };
  }, [user, id]);

  const marcar = () => { versao.current++; setSujo(true); setErro(false); };

  // Salvamento automático
  useEffect(() => {
    if (!sujo || !quadros || !user || tocando) return;
    const v = versao.current;
    const h = setTimeout(async () => {
      try {
        await salvarPrancheta(user.uid, id, { titulo: titulo.trim() || 'Prancheta', quadros });
        if (versao.current === v) setSujo(false);
      } catch { setErro(true); }
    }, 1200);
    return () => clearTimeout(h);
  }, [sujo, quadros, titulo, tocando]);

  const atualizar = (fn: (q: Quadro) => Quadro) => {
    const i = estado.current.cur;
    setQuadros((qs) => qs && qs.map((q, k) => (k === i ? fn(q) : q)));
    marcar();
  };

  const pan = usePanGesture({
    minDistance: 0,
    runOnJS: true,
    onBegin: (e) => {
      if (estado.current.tocando) return;
      setScroll(false);
      const x = limite(e.x / esc, 2, 98), y = limite(e.y / esc, 2, 138);
      if (estado.current.tool === 'mover') {
        const pos = positions.get();
        let melhor: string | null = null, dist = 9; // raio de toque
        for (const pid of IDS) {
          const d = Math.hypot(pos[pid].x - x, pos[pid].y - y);
          if (d < dist) { dist = d; melhor = pid; }
        }
        arrasto.current = melhor;
      } else {
        armando.current = true;
        tmp.x1.set(x); tmp.y1.set(y); tmp.x2.set(x); tmp.y2.set(y); tmp.on.set(1);
      }
    },
    onUpdate: (e) => {
      const x = limite(e.x / esc, 2, 98), y = limite(e.y / esc, 2, 138);
      if (arrasto.current) positions.set({ ...positions.get(), [arrasto.current]: { x, y } });
      else if (armando.current) { tmp.x2.set(x); tmp.y2.set(y); }
    },
    onFinalize: () => {
      setScroll(true);
      if (arrasto.current) {
        arrasto.current = null;
        const p = copiarPos(positions.get());
        atualizar((q) => ({ ...q, p }));
      } else if (armando.current) {
        armando.current = false;
        tmp.on.set(0);
        const s = { x1: tmp.x1.get(), y1: tmp.y1.get(), x2: tmp.x2.get(), y2: tmp.y2.get() };
        if (Math.hypot(s.x2 - s.x1, s.y2 - s.y1) > 4) atualizar((q) => ({ ...q, setas: [...q.setas, s] }));
      }
    },
  });

  if (!quadros) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!quadros.length) return <Text style={{ padding: 24 }}>Prancheta não encontrada.</Text>;
  const q = quadros[Math.min(cur, quadros.length - 1)];

  const selecionar = (i: number) => {
    if (tocando) return;
    setCur(i);
    positions.set(copiarPos(quadros[i].p));
  };
  const novoQuadro = () => {
    if (tocando) return;
    setQuadros([...quadros, { p: copiarPos(positions.get()), setas: [] }]);
    setCur(quadros.length);
    marcar();
  };
  const excluirQuadro = () => {
    if (tocando || quadros.length < 2) return;
    const nq = quadros.filter((_, i) => i !== cur);
    const i = Math.max(0, cur - 1);
    setQuadros(nq); setCur(i); positions.set(copiarPos(nq[i].p)); marcar();
  };

  const tocar = () => {
    if (quadros.length < 2 || tocando) return;
    setTocando(true);
    let i = 0;
    const passo = () => {
      if (i >= quadros.length - 1) {
        playing.set(0);
        positions.set(copiarPos(quadros[quadros.length - 1].p));
        setCur(quadros.length - 1);
        setTocando(false);
        return;
      }
      from.set(quadros[i].p);
      to.set(quadros[i + 1].p);
      t.set(0);
      playing.set(1);
      t.set(withTiming(1, { duration: DUR, easing: Easing.inOut(Easing.quad) }));
      setCur(i + 1);
      i++;
      timer.current = setTimeout(passo, DUR + 60);
    };
    passo();
  };

  return (
    <ScrollView scrollEnabled={scroll} style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Prancheta tática' }} />
      <TextInput style={s.titulo} value={titulo} onChangeText={(v) => { setTitulo(v); marcar(); }} placeholder="Nome da prancheta" />
      <Text style={s.status}>{erro ? 'Erro ao salvar. Verifique a conexão.' : sujo ? 'Salvando…' : 'Salvo ✓'}</Text>

      <GestureDetector gesture={pan}>
        <View style={{ width: W, height: ALTURA * esc, borderRadius: 16, overflow: 'hidden' }}>
          <Campo largura={W} display={display} setas={tocando ? [] : q.setas} tmp={tmp} />
        </View>
      </GestureDetector>

      <View style={s.linha}>
        {([['mover', '✋ Mover'], ['seta', '↗ Seta']] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setTool(k)} style={[s.chip, tool === k && s.chipOn]}>
            <Text style={tool === k && { color: '#fff' }}>{l}</Text>
          </Pressable>
        ))}
        <Pressable style={s.chip} onPress={() => atualizar((x) => ({ ...x, setas: [] }))}><Text>Limpar setas</Text></Pressable>
      </View>

      <View style={s.linha}>
        {quadros.map((_, i) => (
          <Pressable key={i} onPress={() => selecionar(i)} style={[s.chip, i === cur && s.chipOn]}>
            <Text style={i === cur && { color: '#fff' }}>Quadro {i + 1}</Text>
          </Pressable>
        ))}
        <Pressable style={s.chip} onPress={novoQuadro}><Text>+ Quadro</Text></Pressable>
      </View>

      <View style={[s.linha, { alignItems: 'center' }]}>
        <Pressable style={[s.btn, (tocando || quadros.length < 2) && { opacity: 0.5 }]} onPress={tocar} disabled={tocando || quadros.length < 2}>
          <Text style={s.btnT}>▶ Reproduzir</Text>
        </Pressable>
        {quadros.length > 1 && <Pressable onPress={excluirQuadro}><Text style={s.excluir}>Excluir quadro {cur + 1}</Text></Pressable>}
      </View>
      <Text style={s.dica}>
        {tool === 'mover' ? 'Arraste os jogadores e a bola.' : 'Arraste no campo para desenhar uma seta.'} Crie um novo quadro para cada momento da jogada e toque em Reproduzir para ver a animação.
      </Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  titulo: { fontSize: 26, fontWeight: '800', color: C.fg, paddingVertical: 4 },
  status: { color: C.mut, marginBottom: 10 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: C.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  chipOn: { backgroundColor: C.fg },
  btn: { backgroundColor: C.acc, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 },
  btnT: { color: '#fff', fontWeight: '700' },
  excluir: { color: '#b91c1c', fontWeight: '600', marginLeft: 8 },
  dica: { color: C.mut, marginTop: 14, lineHeight: 20 },
});
