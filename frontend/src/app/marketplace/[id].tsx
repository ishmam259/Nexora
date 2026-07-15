import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { createOrder, createReview, getProduct, getProductReviews } from '@/services/api/marketplace';
import { payWithWallet } from '@/services/api/payment';
import { formatDate, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'marketplace')!.color;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const theme = useTheme();

  const { data: product, loading, error, refresh } = useAsync(() => getProduct(productId), [productId]);
  const { data: reviews, refresh: refreshReviews } = useAsync(() => getProductReviews(productId), [productId]);

  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (loading) return <LoadingView />;
  if (error || !product) return <ErrorState message={error ?? 'Listing not found.'} onRetry={refresh} />;

  const total = product.price * qty;

  const buy = async () => {
    const proceed = async () => {
      setBuying(true);
      try {
        const payment = await payWithWallet(`marketplace:${product.id}`, total, product.title);
        await createOrder({ productId: product.id, quantity: qty, paymentReference: payment.transactionId });
        if (Platform.OS === 'web') {
          router.push('/marketplace/orders');
        } else {
          Alert.alert('Order placed', `You bought ${qty} × ${product.title}.`, [
            { text: 'View orders', onPress: () => router.push('/marketplace/orders') },
          ]);
        }
      } catch (err: any) {
        Alert.alert('Purchase failed', err?.message ?? 'Please try again.');
      } finally {
        setBuying(false);
      }
    };

    if (Platform.OS === 'web') {
      proceed();
      return;
    }
    Alert.alert('Confirm purchase', `Pay ${formatMoney(total)} from your Nexora Wallet?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay & buy', onPress: proceed },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: product.title }} />

      <View style={[styles.imageWrap, { backgroundColor: theme.backgroundSelected }]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <SymbolView name={{ ios: 'photo', android: 'image', web: 'image' }} tintColor={theme.textSecondary} size={40} />
        )}
      </View>

      <View>
        <ThemedText type="small" style={{ color: ACCENT, fontWeight: '700' }}>
          {product.categoryName} · {product.condition.replace('_', ' ')}
        </ThemedText>
        <ThemedText type="subtitle">{product.title}</ThemedText>
        <ThemedText type="title" style={styles.price}>
          {formatMoney(product.price)}
        </ThemedText>
      </View>

      <ThemedText themeColor="textSecondary">{product.description}</ThemedText>

      <Card>
        <View style={styles.metaRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Seller
          </ThemedText>
          <ThemedText type="small">{product.sellerId}</ThemedText>
        </View>
        <View style={styles.metaRow}>
          <ThemedText type="small" themeColor="textSecondary">
            In stock
          </ThemedText>
          <ThemedText type="small">{product.stock}</ThemedText>
        </View>
      </Card>

      {product.status === 'ACTIVE' && product.stock > 0 ? (
        <Card style={styles.buyCard}>
          <View style={styles.stepper}>
            <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.stepButton}>
              <SymbolView name={{ ios: 'minus', android: 'remove', web: 'remove' }} tintColor={theme.text} size={16} />
            </Pressable>
            <ThemedText type="smallBold">{qty}</ThemedText>
            <Pressable onPress={() => setQty((q) => Math.min(product.stock, q + 1))} style={styles.stepButton}>
              <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.text} size={16} />
            </Pressable>
          </View>
          <Button label={`Pay ${formatMoney(total)} & buy`} onPress={buy} loading={buying} style={{ flex: 1 }} />
        </Card>
      ) : (
        <Card>
          <ThemedText themeColor="textSecondary">This listing is no longer available.</ThemedText>
        </Card>
      )}

      <SectionHeader title={`Reviews (${reviews?.length ?? 0})`} actionLabel="Write one" onAction={() => setReviewOpen((v) => !v)} />
      {reviewOpen && (
        <ReviewForm
          productId={product.id}
          onDone={() => {
            setReviewOpen(false);
            refreshReviews();
          }}
        />
      )}
      {(reviews ?? []).map((review) => (
        <Card key={review.id}>
          <View style={styles.metaRow}>
            <ThemedText type="smallBold">{review.reviewerId}</ThemedText>
            <View style={{ flexDirection: 'row' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SymbolView
                  key={i}
                  name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                  tintColor={i < review.rating ? theme.warning : theme.backgroundSelected}
                  size={13}
                />
              ))}
            </View>
          </View>
          {!!review.comment && <ThemedText type="small">{review.comment}</ThemedText>}
          <ThemedText type="small" themeColor="textSecondary">
            {formatDate(review.createdAt)}
          </ThemedText>
        </Card>
      ))}
    </Screen>
  );
}

function ReviewForm({ productId, onDone }: { productId: number; onDone: () => void }) {
  const theme = useTheme();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await createReview({ productId, rating, comment });
      onDone();
    } catch (err: any) {
      Alert.alert('Could not post review', err?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', gap: Spacing.one }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)}>
            <SymbolView
              name={{ ios: 'star.fill', android: 'star', web: 'star' }}
              tintColor={n <= rating ? theme.warning : theme.backgroundSelected}
              size={22}
            />
          </Pressable>
        ))}
      </View>
      <TextField placeholder="Share your experience…" value={comment} onChangeText={setComment} multiline />
      <Button label="Post review" onPress={submit} loading={submitting} />
    </Card>
  );
}

const styles = StyleSheet.create({
  imageWrap: { width: '100%', aspectRatio: 1.4, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  price: { fontSize: 24, marginTop: Spacing.half },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  buyCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stepButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(128,128,128,0.15)' },
});
