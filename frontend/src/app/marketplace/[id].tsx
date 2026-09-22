import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import {
  acceptHighestBid,
  addComment,
  getProduct,
  getProductBids,
  getProductComments,
  listingPrice,
  placeBid,
} from '@/services/api/marketplace';
import { formatDateTime, formatMoney } from '@/utils/format';
import { resolveMediaUrl } from '@/utils/media';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { user } = useAuth();
  const theme = useTheme();

  const { data: product, loading, error, refresh } = useAsync(() => getProduct(productId), [productId]);
  const { data: bids, refresh: refreshBids } = useAsync(() => getProductBids(productId), [productId]);
  const { data: comments, refresh: refreshComments } = useAsync(() => getProductComments(productId), [productId]);

  const [bidAmount, setBidAmount] = useState('');
  const [commentText, setCommentText] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refreshAll = () => {
    refresh();
    refreshBids();
    refreshComments();
  };

  if (loading) return <LoadingView />;
  if (error || !product) return <ErrorState message={error ?? 'Listing not found'} onRetry={refreshAll} />;

  const isSeller = user?.username === product.sellerId;
  const minBid =
    product.currentBid != null ? Number(product.currentBid) + 1 : Number(product.startingBid);
  const displayPrice = listingPrice(product);
  const imageUri = resolveMediaUrl(product.imageUrl);

  const submitBid = async () => {
    const amount = Number(bidAmount);
    if (!amount || amount < minBid) {
      setActionError(`Bid must be at least ${formatMoney(minBid)}`);
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await placeBid({ productId, amount });
      setBidAmount('');
      refreshAll();
    } catch (err: any) {
      setActionError(err?.message ?? 'Could not place bid');
    } finally {
      setBusy(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await addComment({ productId, content: commentText.trim() });
      setCommentText('');
      refreshComments();
    } catch (err: any) {
      setActionError(err?.message ?? 'Could not post comment');
    } finally {
      setBusy(false);
    }
  };

  const acceptBid = () => {
    const run = async () => {
      setBusy(true);
      setActionError(null);
      try {
        await acceptHighestBid(productId);
        refreshAll();
        router.push('/marketplace/orders');
      } catch (err: any) {
        setActionError(err?.message ?? 'Could not accept bid');
      } finally {
        setBusy(false);
      }
    };

    if (Platform.OS === 'web') {
      run();
      return;
    }
    Alert.alert(
      'Accept highest bid?',
      `Accept ${formatMoney(Number(product.currentBid))} from ${product.currentBidderId}? They will be asked to pay.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: run },
      ]
    );
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: product.title }} />

      <View style={[styles.hero, { backgroundColor: theme.backgroundSelected }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <ThemedText themeColor="textTertiary">No image</ThemedText>
        )}
      </View>

      <View style={styles.meta}>
        <StatusBadge status={product.status} />
        <ThemedText type="headline">{product.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {product.categoryName} · {product.condition.replace('_', ' ')} · Seller @{product.sellerId}
        </ThemedText>
        <ThemedText type="title" style={{ fontSize: 28 }}>
          {formatMoney(displayPrice)}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Starting {formatMoney(product.startingBid)} · {product.bidCount} bid
          {product.bidCount === 1 ? '' : 's'} · Ends {formatDateTime(product.endsAt)}
        </ThemedText>
        {product.description ? <ThemedText>{product.description}</ThemedText> : null}
      </View>

      {actionError && (
        <ThemedText type="small" themeColor="danger">
          {actionError}
        </ThemedText>
      )}

      {!isSeller && product.biddingOpen && (
        <Card>
          <SectionHeader title="Place a bid" />
          <TextField
            label={`Your bid (min ${formatMoney(minBid)})`}
            value={bidAmount}
            onChangeText={setBidAmount}
            keyboardType="decimal-pad"
            placeholder={String(minBid)}
          />
          <Button label="Submit bid" onPress={submitBid} loading={busy} />
        </Card>
      )}

      {isSeller && product.currentBid != null && (product.status === 'ACTIVE' || product.status === 'ENDED') && (
        <Card>
          <SectionHeader title="Your auction" />
          <ThemedText type="small" themeColor="textSecondary">
            Highest bid {formatMoney(Number(product.currentBid))} by @{product.currentBidderId}
          </ThemedText>
          <Button label="Accept highest bid" onPress={acceptBid} loading={busy} />
        </Card>
      )}

      <SectionHeader title="Bids" />
      {(bids ?? []).length === 0 ? (
        <EmptyState title="No bids yet" message="Be the first to bid on this listing." />
      ) : (
        (bids ?? []).map((bid) => (
          <Card key={bid.id} elevated={false} style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">@{bid.bidderId}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {formatDateTime(bid.createdAt)}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{formatMoney(bid.amount)}</ThemedText>
          </Card>
        ))
      )}

      <SectionHeader title="Comments" />
      <Card>
        <TextField
          label="Add a comment"
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Ask about condition, meetup, etc."
          multiline
        />
        <Button label="Post comment" variant="secondary" onPress={submitComment} loading={busy} disabled={!commentText.trim()} />
      </Card>
      {(comments ?? []).map((c) => (
        <Card key={c.id} elevated={false}>
          <ThemedText type="smallBold">@{c.authorId}</ThemedText>
          <ThemedText type="small">{c.content}</ThemedText>
          <ThemedText type="caption" themeColor="textTertiary">
            {formatDateTime(c.createdAt)}
          </ThemedText>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    aspectRatio: 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: { width: '100%', height: '100%' },
  meta: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
