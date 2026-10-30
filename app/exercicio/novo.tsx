import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { Escolhida, criarExercicio } from '../../src/lib/exercicios';
import { C, CATS } from '../../src/theme';
import type { Categoria } from '../../src/types';

export default function Novo() {
  const { user } = useAuth();
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Técnico');
  const [duracao, setDuracao] = useState('15');
  const [objetivo, setObjetivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [midias, setMidias] = useState<Escolhida[]>([]);
  const [salvando, setSalvando] = useState(false);

  const escolher = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.7,
      videoMaxDuration: 90,
    });
    if (r.canceled) return;
    setMidias((m) => [...m, ...r.assets.map((a) => ({ uri: a.uri, tipo: a.type === 'video' ? 'video' : 'imagem' }) as Escolhida)]);
  };

  const salvar = async () => {
    if (!titulo.trim()) return Alert.alert('Dê um título ao exercício');
    try {
      setSalvando(true);
      await criarExercicio(user!.uid, { titulo: titulo.trim(), categoria, duracaoMin: Number(duracao) || 15, objetivo, descricao }, midias);
      router.back();
    } catch {
      Alert.alert('Não foi possível salvar', 'Verifique a conexão e tente de novo.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Novo exercício' }} />
      <Text style={s.l}>Título</Text>
      <TextInput style={s.in} value={titulo} onChangeText={setTitulo} placeholder="Ex.: Saída de bola 3x2" />
      <Text style={s.l}>Categoria</Text>
      <View style={s.chips}>
        {CATS.map((c) => (
          <Pressable key={c} onPress={() => setCategoria(c)} style={[s.chip, categoria === c && s.chipOn]}>
            <Text style={categoria === c && { color: '#fff' }}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.l}>Duração (min)</Text>
      <TextInput style={s.in} value={duracao} onChangeText={setDuracao} keyboardType="number-pad" />
      <Text style={s.l}>Objetivo</Text>
      <TextInput style={s.in} value={objetivo} onChangeText={setObjetivo} placeholder="O que o atleta deve aprender" />
      <Text style={s.l}>Como funciona</Text>
      <TextInput style={[s.in, { height: 110, textAlignVertical: 'top' }]} multiline value={descricao} onChangeText={setDescricao} />
      <Text style={s.l}>Fotos e vídeos</Text>
      <ScrollView horizontal style={{ marginBottom: 16 }}>
        {midias.map((m, i) => (
          <View key={i} style={s.th}>
            {m.tipo === 'imagem' ? <Image source={m.uri} style={{ flex: 1 }} /> : <Text style={{ fontSize: 28, textAlign: 'center', marginTop: 24 }}>🎬</Text>}
          </View>
        ))}
        <Pressable style={[s.th, s.add]} onPress={escolher}><Text style={{ color: C.mut }}>+ adicionar</Text></Pressable>
      </ScrollView>
      <Pressable style={[s.btn, salvando && { opacity: 0.6 }]} onPress={salvar} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Salvar exercício</Text>}
      </Pressable>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  l: { fontWeight: '700', color: C.fg, marginBottom: 4 },
  in: { backgroundColor: C.card, borderWidth: 1, borderColor: C.bd, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { backgroundColor: C.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  chipOn: { backgroundColor: C.fg },
  th: { width: 100, height: 76, borderRadius: 12, overflow: 'hidden', backgroundColor: C.chip, marginRight: 8 },
  add: { borderWidth: 2, borderStyle: 'dashed', borderColor: C.bd, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  btn: { backgroundColor: C.acc, padding: 15, borderRadius: 12, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
