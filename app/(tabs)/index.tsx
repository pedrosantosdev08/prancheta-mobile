import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { ouvirTodos } from '../../src/lib/exercicios';
import { ouvirSessao, salvarSessao } from '../../src/lib/sessoes';
import { hojeExtenso, hojeISO } from '../../src/lib/data';
import { C } from '../../src/theme';
import type { Exercicio, Sessao } from '../../src/types';

export default function Treinos() {
  const { user } = useAuth();
  const uid = user?.uid;
  const router = useRouter();
  const hoje = hojeISO();
  const [lib, setLib] = useState<Exercicio[]>([]);
  const [sessao, setSessao] = useState<Sessao>({ data: hoje, turma: '', exercicios: [] });
  const [turma, setTurma] = useState('');
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!uid) return;
    return ouvirTodos(uid, setLib);
  }, [uid]);
  useEffect(() => {
    if (!uid) return;
    return ouvirSessao(uid, hoje, (x) => { setSessao(x); setTurma(x.turma); });
  }, [uid, hoje]);

  const itens = sessao.exercicios.map((i) => lib.find((e) => e.id === i)).filter(Boolean) as Exercicio[];
  const total = itens.reduce((a, e) => a + e.duracaoMin, 0);
  const disponiveis = lib.filter((e) => !sessao.exercicios.includes(e.id));

  const salvar = (p: Partial<Sessao>) => user && salvarSessao(user.uid, { ...sessao, ...p, data: hoje });
  const remover = (id: string) => salvar({ exercicios: sessao.exercicios.filter((x) => x !== id) });
  const subir = (id: string) => {
    const l = [...sessao.exercicios];
    const i = l.indexOf(id);
    if (i > 0) { [l[i - 1], l[i]] = [l[i], l[i - 1]]; salvar({ exercicios: l }); }
  };
  const adicionar = (id: string) => { salvar({ exercicios: [...sessao.exercicios, id] }); setAberto(false); };

  return (
    <SafeAreaView style={s.box} edges={['top']}>
      <FlatList
        data={itens}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <Text style={s.h}>Treino de hoje</Text>
            <Text style={s.sub}>{hojeExtenso()}</Text>
            <TextInput
              style={s.turma}
              value={turma}
              onChangeText={setTurma}
              onEndEditing={() => turma !== sessao.turma && salvar({ turma })}
              placeholder="Turma (ex.: Sub-15)"
              placeholderTextColor={C.mut}
            />
            <View style={s.hero}>
              <Text style={s.big}>{total} min</Text>
              <Text style={s.heroSub}>{itens.length} {itens.length === 1 ? 'exercício' : 'exercícios'}</Text>
            </View>
            <Text style={s.h2}>Sequência</Text>
          </View>
        }
        ListEmptyComponent={<Text style={s.vazio}>Nenhum exercício no treino de hoje. Adicione abaixo.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.row} onPress={() => router.push(`/exercicio/${item.id}`)}>
            <Text style={s.time}>{item.duracaoMin}'</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.nome}>{item.titulo}</Text>
              <Text style={s.obj} numberOfLines={1}>{item.objetivo || item.categoria}</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => subir(item.id)}><Text style={s.ico}>↑</Text></Pressable>
            <Pressable hitSlop={8} onPress={() => remover(item.id)}><Text style={s.ico}>✕</Text></Pressable>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable style={s.btn} onPress={() => setAberto(true)}><Text style={s.btnT}>+ Adicionar exercício</Text></Pressable>
        }
      />

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={s.fundo}>
          <View style={s.sheet}>
            <Text style={s.h2}>Escolha um exercício</Text>
            <FlatList
              data={disponiveis}
              keyExtractor={(e) => e.id}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={<Text style={s.vazio}>Todos os exercícios já estão no treino, ou a biblioteca está vazia.</Text>}
              renderItem={({ item }) => (
                <Pressable style={s.row} onPress={() => adicionar(item.id)}>
                  <Text style={s.time}>{item.duracaoMin}'</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.nome}>{item.titulo}</Text>
                    <Text style={s.obj}>{item.categoria}</Text>
                  </View>
                </Pressable>
              )}
            />
            <Pressable style={[s.chip, { marginTop: 12 }]} onPress={() => setAberto(false)}><Text>Fechar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  box: { flex: 1, backgroundColor: C.bg },
  h: { fontSize: 34, fontWeight: '800', color: C.fg },
  sub: { color: C.mut, marginBottom: 8 },
  turma: { backgroundColor: C.card, borderWidth: 1, borderColor: C.bd, borderRadius: 12, padding: 10, fontSize: 16, color: C.fg },
  hero: { backgroundColor: C.acc, borderRadius: 20, padding: 18, marginVertical: 14 },
  big: { fontSize: 44, fontWeight: '800', color: '#fff' },
  heroSub: { color: '#fff', opacity: 0.85 },
  h2: { fontSize: 24, fontWeight: '800', color: C.fg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bd },
  time: { width: 46, fontSize: 22, fontWeight: '800', color: C.acc },
  nome: { fontSize: 16, fontWeight: '700', color: C.fg },
  obj: { color: C.mut },
  ico: { fontSize: 20, color: C.mut, paddingHorizontal: 6 },
  vazio: { color: C.mut, textAlign: 'center', marginVertical: 24 },
  btn: { backgroundColor: C.acc, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 32 },
  chip: { backgroundColor: C.chip, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99, alignSelf: 'flex-start' },
});
