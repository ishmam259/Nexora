import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { LOST_FOUND_CATEGORIES, reportFoundItem, reportLostItem } from '@/services/api/lostFound';

export default function ReportItemScreen() {
  const [type, setType] = useState<'lost' | 'found'>('lost');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [reward, setReward] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !category || !location.trim() || !date.trim() || !contactDetails.trim()) {
      setError('Fill in the title, category, location, date, and a way to reach you.');
      return;
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      setError('Use the format YYYY-MM-DDTHH:mm for the date, e.g. 2026-07-14T15:00');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const isoDate = parsed.toISOString().slice(0, 19);
      if (type === 'lost') {
        const created = await reportLostItem({
          title: title.trim(),
          description: description.trim(),
          category,
          lostLocation: location.trim(),
          lostDate: isoDate,
          reward: reward ? Number(reward) : undefined,
          contactDetails: contactDetails.trim(),
        });
        router.replace(`/lost-found/lost/${created.id}`);
      } else {
        const created = await reportFoundItem({
          title: title.trim(),
          description: description.trim(),
          category,
          foundLocation: location.trim(),
          foundDate: isoDate,
          storageLocation: storageLocation.trim(),
          contactDetails: contactDetails.trim(),
        });
        router.replace(`/lost-found/found/${created.id}`);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Could not submit the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Report an item' }} />

      <View style={{ flexDirection: 'row', gap: Spacing.two }}>
        {(['lost', 'found'] as const).map((t) => (
          <Button
            key={t}
            label={t === 'lost' ? "I lost something" : 'I found something'}
            variant={type === t ? 'primary' : 'secondary'}
            onPress={() => setType(t)}
            style={{ flex: 1 }}
          />
        ))}
      </View>

      <TextField label="Title" value={title} onChangeText={setTitle} placeholder={type === 'lost' ? 'Black backpack' : 'Found a student ID card'} />
      <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Brand, color, distinguishing features…" multiline />
      <SelectField label="Category" value={category} onChange={setCategory} options={LOST_FOUND_CATEGORIES.map((c) => ({ label: c, value: c }))} />
      <TextField
        label={type === 'lost' ? 'Where did you lose it?' : 'Where did you find it?'}
        value={location}
        onChangeText={setLocation}
        placeholder="Library, 2nd floor"
      />
      <TextField
        label={type === 'lost' ? 'Date lost' : 'Date found'}
        value={date}
        onChangeText={setDate}
        placeholder="2026-07-14T15:00"
        autoCapitalize="none"
      />
      {type === 'lost' ? (
        <TextField label="Reward (optional, BDT)" value={reward} onChangeText={setReward} keyboardType="decimal-pad" placeholder="200" />
      ) : (
        <TextField label="Where is it being kept?" value={storageLocation} onChangeText={setStorageLocation} placeholder="Security desk, Gate 2" />
      )}
      <TextField label="How can people reach you?" value={contactDetails} onChangeText={setContactDetails} placeholder="Phone number or email" />

      {error && (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
      <Button label={`Submit ${type} item report`} onPress={submit} loading={submitting} />
    </Screen>
  );
}
