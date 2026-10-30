import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../src/store/auth';
import { C } from '../src/theme';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const enviar = async () => {
    try {
      setErro('');
      await (modo === 'entrar' ? signIn : signUp)(email.trim(), senha);
    } catch {
      setErro('Não foi possível continuar. Confira e-mail e senha (mínimo de 6 caracteres).');
    }
  };

  return (
    <View style={s.box}>
      <Text style={s.h}>Prancheta FC</Text>
      <Text style={s.p}>Seus treinos, exercícios e quadros táticos em um lugar só.</Text>
      <TextInput style={s.in} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.in} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      {!!erro && <Text style={s.err}>{erro}</Text>}
      <Pressable style={s.btn} onPress={enviar}>
        <Text style={s.btnT}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
      </Pressable>
      <Pressable onPress={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}>
        <Text style={s.link}>{modo === 'entrar' ? 'Primeira vez? Criar conta' : 'Já tenho conta'}</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  box: { flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' },
  h: { fontSize: 40, fontWeight: '800', color: C.acc },
  p: { color: C.mut, marginBottom: 24, fontSize: 16 },
  in: { backgroundColor: C.card, borderWidth: 1, borderColor: C.bd, borderRadius: 12, padding: 14, marginBottom: 10, fontSize: 16 },
  err: { color: '#b91c1c', marginBottom: 10 },
  btn: { backgroundColor: C.acc, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: C.acc, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
