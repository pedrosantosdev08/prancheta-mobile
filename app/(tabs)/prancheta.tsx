import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { criarPrancheta, excluirPrancheta, ouvirPranchetas } from '../../src/lib/pranchetas';
import { C } from '../../src/theme';
import type { Prancheta } from '../../src/types';

export default function Pranchetas() {
  const { user } = useAuth();
  const uid = user?.uid;
  const router = useRouter();
  const [lista, setLista] = useState<Prancheta[]>([]);

  useEffect(() => {
    if (!uid) return;
    return ouvirPranchetas(uid, setLista);
  }, [uid]);

  const nova = async () => {
    const id = await criarPrancheta(user!.uid, 'Nova prancheta');
    router.push(`/pranchetas/${id}`);
  };
  const excluir = (p: Prancheta) =>
    Alert.alert('Excluir prancheta', `Excluir "${p.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirPrancheta(user!.uid, p.id) },
    ]);

  return (
    <SafeAreaView style={s.box} edges={['top']}>
      <View style={s.top}>
        <Text style={s.h}>Prancheta tática</Text>
        <Text style={s.sub}>Monte jogadas com quadros em sequência</Text>
      </View>
      <FlatList
        data={lista}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={s.vazio}>Nenhuma prancheta ainda. Toque em + para criar a primeira.</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => router.push(`/pranchetas/${item.id}`)} onLongPress={() => excluir(item)}>
            <Text style={s.t}>{item.titulo}</Text>
            <Text style={s.m}>{item.quadros.length} {item.quadros.length === 1 ? 'quadro' : 'quadros'} · segure para excluir</Text>
          </Pressable>
        )}
      />
      <Pressable style={s.fab} onPress={nova}><Text style={s.fabT}>+</Text></Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  box: { flex: 1, backgroundColor: C.bg },
  top: { paddingHorizontal: 16, paddingTop: 8 },
  h: { fontSize: 32, fontWeight: '800', color: C.fg },
  sub: { color: C.mut },
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.bd },
  t: { fontSize: 20, fontWeight: '700', color: C.fg },
  m: { color: C.mut, marginTop: 2 },
  vazio: { color: C.mut, textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: C.bib, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabT: { fontSize: 30, color: '#2b2200', marginTop: -2 },
});
