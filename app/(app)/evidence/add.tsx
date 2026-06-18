import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Text, Card, Button, Input } from '@/components/ui';
import { useUploadEvidence } from '@/hooks/useEvidence';
import { theme } from '@/theme';
import type { EvidenceKind } from '@/lib/database.types';

interface Picked {
  uri: string;
  kind: EvidenceKind;
  mimeType?: string;
  filename?: string;
}

export default function AddEvidence() {
  const router = useRouter();
  const { incidentId } = useLocalSearchParams<{ incidentId?: string }>();
  const upload = useUploadEvidence();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [caption, setCaption] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  async function pickImage(kind: EvidenceKind) {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setPicked({ uri: a.uri, kind, mimeType: a.mimeType, filename: a.fileName ?? undefined });
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Camera permission needed');
    const res = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!res.canceled && res.assets[0]) {
      setPicked({ uri: res.assets[0].uri, kind: 'photo', mimeType: 'image/jpeg' });
    }
  }

  async function pickDocument() {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setPicked({ uri: a.uri, kind: 'document', mimeType: a.mimeType, filename: a.name });
    }
  }

  async function toggleRecording() {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) setPicked({ uri, kind: 'audio', mimeType: 'audio/m4a', filename: 'recording.m4a' });
      return;
    }
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return Alert.alert('Microphone permission needed');
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    setRecording(rec);
  }

  function save() {
    if (!picked) return;
    upload.mutate(
      {
        uri: picked.uri,
        kind: picked.kind,
        mimeType: picked.mimeType,
        filename: picked.filename,
        caption: caption.trim() || undefined,
        incidentId: incidentId ?? null,
      },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert('Upload failed', (e as Error).message),
      },
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text tone="muted" variant="caption" style={styles.intro}>
        Files are hashed (SHA-256) and encrypted on this device before upload.
      </Text>

      {picked ? (
        <Card style={styles.preview}>
          <Text variant="label" tone="muted">
            SELECTED
          </Text>
          <Text weight="semibold">
            {picked.filename ?? picked.kind} ({picked.kind})
          </Text>
          <Text tone="faint" variant="caption" numberOfLines={1}>
            {picked.uri}
          </Text>
        </Card>
      ) : (
        <View style={styles.grid}>
          <Source icon="📷" label="Take photo" onPress={takePhoto} />
          <Source icon="🖼️" label="Photo library" onPress={() => pickImage('photo')} />
          <Source icon="🎥" label="Video" onPress={() => pickImage('video')} />
          <Source icon="📄" label="Document" onPress={pickDocument} />
          <Source
            icon={recording ? '⏹️' : '🎙️'}
            label={recording ? 'Stop recording' : 'Record audio'}
            active={!!recording}
            onPress={toggleRecording}
          />
        </View>
      )}

      {picked && (
        <View style={styles.form}>
          <Input label="Caption / description" value={caption} onChangeText={setCaption} placeholder="What is this and when was it taken?" multiline />
          <Button title="Encrypt & save evidence" icon="🔒" onPress={save} loading={upload.isPending} />
          <Button title="Choose a different file" variant="ghost" onPress={() => setPicked(null)} />
        </View>
      )}
    </ScrollView>
  );
}

function Source({ icon, label, onPress, active }: { icon: string; label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.sourceWrap}>
      <Card elevated style={[styles.source, active && { borderColor: theme.colors.danger }]}>
        <Text style={styles.sourceIcon}>{icon}</Text>
        <Text variant="label">{label}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: theme.spacing.lg },
  intro: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  sourceWrap: { width: '47%' },
  source: { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xl },
  sourceIcon: { fontSize: 30 },
  preview: { gap: 4 },
  form: { gap: theme.spacing.lg },
});
