import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { ouvirTodos } from '../../src/lib/exercicios';
import { C, CATS } from '../../src/theme';
import type { Exercicio } from '../../src/types';

export default function Exercicios() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;
  const router = useRouter();
  const [lista, setLista] = useState<Exercicio[]>([]);
  const [cat, setCat] = useState<string>('Todos');

  useEffect(() => {
    if (!uid) return;
    return ouvirTodos(uid, setLista);
  }, [uid]);
  const visiveis = lista.filter((e) => cat === 'Todos' || e.categoria === cat);

  return (
    <SafeAreaView style={s.box} edges={['top']}>
      <View style={s.top}>
        <Text style={s.h}>Exercícios</Text>
        <Pressable onPress={signOut}><Text style={s.sair}>Sair</Text></Pressable>
      </View>
      <View style={s.chips}>
        {['Todos', ...CATS].map((c) => (
          <Pressable key={c} onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipOn]}>
            <Text style={cat === c && { color: '#fff' }}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={visiveis}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={s.vazio}>Nenhum exercício ainda. Toque em + para criar o primeiro.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => router.push(`/exercicio/${item.id}`)}>
            <Text style={s.tag}>{item.categoria}</Text>
            <Text style={s.t}>{item.titulo}</Text>
            <Text style={s.m}>{item.duracaoMin} min · {item.midias.length} mídias</Text>
          </Pressable>
        )}
      />
      <Pressable style={s.fab} onPress={() => router.push('/exercicio/novo')}>
        <Text style={s.fabT}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  box: { flex: 1, backgroundColor: C.bg },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  h: { fontSize: 32, fontWeight: '800', color: C.fg },
  sair: { color: C.mut, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  chip: { backgroundColor: C.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  chipOn: { backgroundColor: C.fg },
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.bd },
  tag: { alignSelf: 'flex-start', backgroundColor: C.chip, paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99, fontSize: 12, overflow: 'hidden' },
  t: { fontSize: 20, fontWeight: '700', color: C.fg, marginTop: 6 },
  m: { color: C.mut, marginTop: 2 },
  vazio: { color: C.mut, textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: C.bib, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabT: { fontSize: 30, color: '#2b2200', marginTop: -2 },
});
