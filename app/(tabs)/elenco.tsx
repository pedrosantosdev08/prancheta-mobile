import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/store/auth';
import { criarAtleta, excluirAtleta, ouvirAtletas } from '../../src/lib/atletas';
import { C } from '../../src/theme';
import type { Atleta } from '../../src/types';

const POSICOES = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Ponta', 'Atacante'];

export default function Elenco() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [lista, setLista] = useState<Atleta[]>([]);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState('Meia');
  const [numero, setNumero] = useState('');

  useEffect(() => {
    if (!uid) return;
    return ouvirAtletas(uid, setLista);
  }, [uid]);

  const salvar = async () => {
    if (!nome.trim()) return Alert.alert('Informe o nome do atleta');
    await criarAtleta(user!.uid, { nome: nome.trim(), posicao, numero: Number(numero) || 0 });
    setNome(''); setNumero(''); setAberto(false);
  };
  const remover = (a: Atleta) =>
    Alert.alert('Remover atleta', `Remover ${a.nome} do elenco?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => excluirAtleta(user!.uid, a.id) },
    ]);

  return (
    <SafeAreaView style={s.box} edges={['top']}>
      <View style={s.top}>
        <Text style={s.h}>Elenco</Text>
        <Text style={s.sub}>{lista.length} {lista.length === 1 ? 'atleta' : 'atletas'} · segure para remover</Text>
      </View>
      <FlatList
        data={lista}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={s.vazio}>Nenhum atleta ainda. Toque em + para adicionar.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.row} onLongPress={() => remover(item)}>
            <View style={s.ava}><Text style={s.num}>{item.numero || '–'}</Text></View>
            <View>
              <Text style={s.nome}>{item.nome}</Text>
              <Text style={s.pos}>{item.posicao}</Text>
            </View>
          </Pressable>
        )}
      />
      <Pressable style={s.fab} onPress={() => setAberto(true)}><Text style={s.fabT}>+</Text></Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <KeyboardAvoidingView style={s.fundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.sheet}>
            <Text style={s.h2}>Novo atleta</Text>
            <Text style={s.l}>Nome</Text>
            <TextInput style={s.in} value={nome} onChangeText={setNome} placeholder="Ex.: Davi" />
            <Text style={s.l}>Número da camisa</Text>
            <TextInput style={s.in} value={numero} onChangeText={setNumero} keyboardType="number-pad" placeholder="Ex.: 10" />
            <Text style={s.l}>Posição</Text>
            <View style={s.chips}>
              {POSICOES.map((p) => (
                <Pressable key={p} onPress={() => setPosicao(p)} style={[s.chip, posicao === p && s.chipOn]}>
                  <Text style={posicao === p && { color: '#fff' }}>{p}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Pressable style={s.btn} onPress={salvar}><Text style={s.btnT}>Salvar atleta</Text></Pressable>
              <Pressable style={s.chip} onPress={() => setAberto(false)}><Text>Cancelar</Text></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  box: { flex: 1, backgroundColor: C.bg },
  top: { paddingHorizontal: 16, paddingTop: 8 },
  h: { fontSize: 32, fontWeight: '800', color: C.fg },
  sub: { color: C.mut },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bd },
  ava: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 20, fontWeight: '800', color: C.fg },
  nome: { fontSize: 17, fontWeight: '700', color: C.fg },
  pos: { color: C.mut },
  vazio: { color: C.mut, textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: C.bib, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabT: { fontSize: 30, color: '#2b2200', marginTop: -2 },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 32 },
  h2: { fontSize: 24, fontWeight: '800', color: C.fg, marginBottom: 8 },
  l: { fontWeight: '700', color: C.fg, marginTop: 6 },
  in: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.bd, borderRadius: 12, padding: 12, marginTop: 4, marginBottom: 8, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { backgroundColor: C.chip, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99 },
  chipOn: { backgroundColor: C.fg },
  btn: { backgroundColor: C.acc, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 },
  btnT: { color: '#fff', fontWeight: '700' },
});
