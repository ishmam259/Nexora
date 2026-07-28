import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import {
  createProduct,
  getCategories,
  PRODUCT_CONDITIONS,
  ProductCondition,
  uploadListingImage,
} from '@/services/api/marketplace';

const ACCENT = MODULES.find((m) => m.key === 'marketplace')!.color;

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

const DURATION_OPTIONS = [
  { label: '1 day', hint: 'Fast sale', value: '24' },
  { label: '3 days', hint: 'Popular', value: '72' },
  { label: '7 days', hint: 'More bids', value: '168' },
  { label: '14 days', hint: 'Long run', value: '336' },
];

type LocalPhoto = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

export default function NewListingScreen() {
  const theme = useTheme();
  const { data: categories } = useAsync(() => getCategories(), []);

  const [photo, setPhoto] = useState<LocalPhoto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [durationHours, setDurationHours] = useState('72');
  const [condition, setCondition] = useState<ProductCondition | null>('GOOD');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo library access to add a listing picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
      setError(null);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      // Web often has no camera; fall back to library picker.
      await pickFromLibrary();
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Allow camera access to photograph your item.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
      setError(null);
    }
  };

  const choosePhotoSource = () => {
    if (Platform.OS === 'web') {
      void pickFromLibrary();
      return;
    }
    Alert.alert('Add a photo', 'Show students what you’re selling.', [
      { text: 'Take photo', onPress: () => void takePhoto() },
      { text: 'Choose from library', onPress: () => void pickFromLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submit = async () => {
    if (!title.trim() || !startingBid || !condition || !categoryId || !durationHours) {
      setError('Add a title, starting bid, condition, category, and auction length.');
      return;
    }
    if (!photo) {
      setError('Add a photo of the item — tap the photo area above.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const uploaded = await uploadListingImage(photo.uri, photo.mimeType, photo.fileName);
      const created = await createProduct({
        title: title.trim(),
        description: description.trim(),
        startingBid: Number(startingBid),
        durationHours: Number(durationHours),
        condition,
        imageUrl: uploaded.url,
        categoryId,
      });
      router.replace(`/marketplace/${created.id}`);
    } catch (err: any) {
      setError(err?.message ?? 'Could not start the auction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'List for auction' }} />

      {photo ? (
        <Pressable
          onPress={choosePhotoSource}
          accessibilityRole="button"
          accessibilityLabel="Change listing photo"
          style={[styles.photoHero, { backgroundColor: theme.backgroundSelected }]}
        >
          <Image source={{ uri: photo.uri }} style={styles.photoImage} contentFit="cover" />
          <View style={[styles.photoOverlay, { backgroundColor: 'rgba(11,18,32,0.45)' }]}>
            <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} tintColor="#FFFFFF" size={18} />
            <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
              Change photo
            </ThemedText>
          </View>
        </Pressable>
      ) : (
        <View style={[styles.photoHero, { backgroundColor: theme.backgroundSelected }]}>
          <View style={styles.photoEmpty}>
            <View style={[styles.photoIcon, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} tintColor={ACCENT} size={28} />
            </View>
            <ThemedText type="smallBold">Add a photo</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary" style={styles.photoHint}>
              Clear photos get more bids. Take one or pick from your library.
            </ThemedText>
            <View style={styles.photoActions}>
              {Platform.OS !== 'web' && (
                <Pressable onPress={() => void takePhoto()} style={[styles.photoChip, { backgroundColor: ACCENT }]}>
                  <ThemedText type="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Camera
                  </ThemedText>
                </Pressable>
              )}
              <Pressable
                onPress={() => void pickFromLibrary()}
                style={[styles.photoChip, { backgroundColor: theme.backgroundElement, borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText type="caption" style={{ fontWeight: '600' }}>
                  Library
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          WHAT ARE YOU SELLING
        </ThemedText>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Calculus textbook, 3rd edition"
        />
        <TextField
          label="Details"
          value={description}
          onChangeText={setDescription}
          placeholder="What's included, scratches, why you're selling…"
          multiline
          style={styles.description}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          CATEGORY
        </ThemedText>
        <View style={styles.chipWrap}>
          {(categories ?? []).map((c) => {
            const selected = categoryId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.choiceChip,
                  {
                    backgroundColor: selected ? ACCENT : theme.backgroundElement,
                    borderColor: selected ? ACCENT : theme.borderSubtle,
                  },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{ color: selected ? '#FFFFFF' : theme.textSecondary, fontWeight: selected ? '600' : '500' }}
                >
                  {c.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          CONDITION
        </ThemedText>
        <View style={styles.chipWrap}>
          {PRODUCT_CONDITIONS.map((c) => {
            const selected = condition === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCondition(c)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.choiceChip,
                  {
                    backgroundColor: selected ? theme.primaryMuted : theme.backgroundElement,
                    borderColor: selected ? theme.primary : theme.borderSubtle,
                  },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{ color: selected ? theme.primary : theme.textSecondary, fontWeight: selected ? '600' : '500' }}
                >
                  {CONDITION_LABELS[c]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          AUCTION
        </ThemedText>
        <TextField
          label="Starting bid (৳)"
          value={startingBid}
          onChangeText={setStartingBid}
          keyboardType="decimal-pad"
          placeholder="200"
          hint="Bidders must offer at least this much"
        />
        <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>
          Length
        </ThemedText>
        <View style={styles.durationRow}>
          {DURATION_OPTIONS.map((opt) => {
            const selected = durationHours === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setDurationHours(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.durationCard,
                  {
                    backgroundColor: selected ? theme.primaryMuted : theme.backgroundElement,
                    borderColor: selected ? theme.primary : theme.borderSubtle,
                  },
                ]}
              >
                <ThemedText type="smallBold" style={{ color: selected ? theme.primary : theme.text }}>
                  {opt.label}
                </ThemedText>
                <ThemedText type="caption" themeColor="textTertiary">
                  {opt.hint}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: theme.dangerMuted }]}>
          <ThemedText type="small" themeColor="danger">
            {error}
          </ThemedText>
        </View>
      )}

      <Button label="Start auction" onPress={submit} loading={submitting} style={{ backgroundColor: ACCENT }} />
      <ThemedText type="caption" themeColor="textTertiary" style={styles.footerHint}>
        After someone bids, you can accept the highest offer and they’ll pay from their wallet.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoHero: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: { width: '100%', height: '100%' },
  photoOverlay: {
    position: 'absolute',
    bottom: Spacing.three,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  photoEmpty: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  photoIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  photoHint: { textAlign: 'center', maxWidth: 260 },
  photoActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  photoChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  section: { gap: Spacing.three },
  sectionLabel: { letterSpacing: 0.8, fontSize: 11 },
  description: { minHeight: 96, textAlignVertical: 'top', paddingTop: Spacing.three },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  choiceChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  durationCard: {
    flexGrow: 1,
    flexBasis: '40%',
    minWidth: 120,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 2,
  },
  errorBox: {
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  footerHint: { textAlign: 'center', marginBottom: Spacing.four },
});
