import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { ouvirUm, vincularPrancheta } from '../../src/lib/exercicios';
import { criarPrancheta } from '../../src/lib/pranchetas';
import { ouvirSessao, salvarSessao } from '../../src/lib/sessoes';
import { hojeISO } from '../../src/lib/data';
import { C } from '../../src/theme';
import type { Exercicio, Sessao } from '../../src/types';

function Clip({ url }: { url: string }) {
  const player = useVideoPlayer(url);
  return <VideoView player={player} style={s.media} nativeControls fullscreenOptions={{ enable: true }} />;
}

export default function Detalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const uid = user?.uid;
  const router = useRouter();
  const hoje = hojeISO();
  const [e, setE] = useState<Exercicio | null | undefined>(undefined);
  const [sessao, setSessao] = useState<Sessao | null>(null);

  useEffect(() => {
    if (!uid || !id) return;
    return ouvirUm(uid, id, setE);
  }, [uid, id]);
  useEffect(() => {
    if (!uid) return;
    return ouvirSessao(uid, hoje, setSessao);
  }, [uid, hoje]);

  if (e === undefined) return <ActivityIndicator style={{ flex: 1 }} />;
  if (e === null) return <Text style={{ padding: 24 }}>Exercício não encontrado.</Text>;

  const naSessao = !!sessao?.exercicios.includes(e.id);

  const alternar = async () => {
    const atual = sessao?.exercicios ?? [];
    const novo = naSessao ? atual.filter((x) => x !== e.id) : [...atual, e.id];
    await salvarSessao(user!.uid, { data: hoje, turma: sessao?.turma ?? '', exercicios: novo });
  };

  const abrirPrancheta = async () => {
    try {
      let pid = e.pranchetaId;
      if (!pid) {
        pid = await criarPrancheta(user!.uid, e.titulo);
        await vincularPrancheta(user!.uid, e.id, pid);
      }
      router.push(`/pranchetas/${pid}`);
    } catch {
      Alert.alert('Não foi possível abrir a prancheta', 'Verifique a conexão e tente de novo.');
    }
  };

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Stack.Screen options={{ headerShown: true, title: e.titulo }} />
      <Text style={s.h}>{e.titulo}</Text>
      <Text style={s.m}>{e.categoria} · {e.duracaoMin} min</Text>
      {e.midias.map((m, i) => (
        <View key={i}>
          {m.tipo === 'imagem' ? <Image source={m.url} style={s.media} contentFit="cover" /> : <Clip url={m.url} />}
        </View>
      ))}
      <Text style={s.sub}>Objetivo</Text>
      <Text style={s.p}>{e.objetivo || 'Sem objetivo definido.'}</Text>
      <Text style={s.sub}>Como funciona</Text>
      <Text style={s.p}>{e.descricao || 'Sem descrição.'}</Text>
      <View style={s.acoes}>
        <Pressable style={s.btn} onPress={abrirPrancheta}>
          <Text style={s.btnT}>{e.pranchetaId ? 'Abrir prancheta' : 'Criar prancheta'}</Text>
        </Pressable>
        <Pressable style={s.chip} onPress={alternar}>
          <Text>{naSessao ? 'Tirar do treino de hoje' : 'Adicionar ao treino de hoje'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 30, fontWeight: '800', color: C.fg },
  m: { color: C.mut, marginBottom: 12 },
  media: { width: '100%', height: 220, borderRadius: 14, marginBottom: 10, backgroundColor: C.chip },
  sub: { fontSize: 20, fontWeight: '700', color: C.fg, marginTop: 14 },
  p: { fontSize: 16, color: C.fg, marginTop: 4, lineHeight: 22 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  btn: { backgroundColor: C.acc, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnT: { color: '#fff', fontWeight: '700' },
  chip: { backgroundColor: C.chip, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
});
