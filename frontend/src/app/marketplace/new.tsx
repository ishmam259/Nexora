import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useAsync } from '@/hooks/use-async';
import { createProduct, getCategories, PRODUCT_CONDITIONS, ProductCondition } from '@/services/api/marketplace';

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

export default function NewListingScreen() {
  const { data: categories } = useAsync(() => getCategories(), []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState<ProductCondition | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !price || !condition || !categoryId) {
      setError('Fill in the title, price, condition, and category.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createProduct({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock) || 1,
        condition,
        imageUrl: imageUrl.trim(),
        categoryId: Number(categoryId),
      });
      router.replace(`/marketplace/${created.id}`);
    } catch (err: any) {
      setError(err?.message ?? 'Could not create the listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Sell an item' }} />
      <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Calculus textbook, 3rd edition" />
      <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Condition details, what's included…" multiline />
      <TextField label="Price (BDT)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="500" />
      <TextField label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="1" />
      <SelectField
        label="Condition"
        value={condition}
        onChange={(v) => setCondition(v as ProductCondition)}
        options={PRODUCT_CONDITIONS.map((c) => ({ label: CONDITION_LABELS[c], value: c }))}
      />
      <SelectField
        label="Category"
        value={categoryId}
        onChange={setCategoryId}
        options={(categories ?? []).map((c) => ({ label: c.name, value: String(c.id) }))}
      />
      <TextField label="Image URL (optional)" value={imageUrl} onChangeText={setImageUrl} placeholder="https://…" autoCapitalize="none" />
      {error && (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
      <Button label="Publish listing" onPress={submit} loading={submitting} />
    </Screen>
  );
}
