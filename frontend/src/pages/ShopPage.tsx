import React, { useState } from 'react';
import { useGetUser, useGetUserPurchases, usePurchaseItem } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { PurchaseType } from '@/backend';
import { SHOP_ITEMS } from '@/lib/gameData';
import RPGButton from '@/components/RPGButton';
import CoinGemAnimation from '@/components/animations/CoinGemAnimation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function ShopPage() {
  const userId = loadUserId();
  const { data: user } = useGetUser(userId);
  const { data: purchases = [] } = useGetUserPurchases(userId);
  const purchaseItem = usePurchaseItem();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [showAnim, setShowAnim] = useState(false);

  const ownedItemIds = new Set(purchases.map((p) => p.itemId));

  const handlePurchase = async (item: (typeof SHOP_ITEMS)[0]) => {
    if (!userId) return;

    // Check balance
    const userCoins = user ? Number(user.coins) : 0;
    const userGems = user ? Number(user.gems) : 0;

    if (item.coinCost > 0 && userCoins < item.coinCost) {
      toast.error(`Not enough coins! You need ${item.coinCost} coins.`);
      return;
    }
    if (item.gemCost > 0 && userGems < item.gemCost) {
      toast.error(`Not enough gems! You need ${item.gemCost} gems.`);
      return;
    }

    setBuyingId(item.id);
    try {
      const itemTypeMap: Record<string, PurchaseType> = {
        hintPack: PurchaseType.hintPack,
        avatarCostume: PurchaseType.avatarCostume,
        worldSkin: PurchaseType.worldSkin,
      };
      await purchaseItem.mutateAsync({
        userId,
        itemType: itemTypeMap[item.type],
        itemId: item.id,
      });
      setShowAnim(true);
      toast.success(`${item.name} purchased! 🎉`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Insufficient coins')) {
        toast.error('Not enough coins!');
      } else if (msg.includes('Insufficient gems')) {
        toast.error('Not enough gems!');
      } else {
        toast.error('Purchase failed. Try again!');
      }
    } finally {
      setBuyingId(null);
    }
  };

  const hintPacks = SHOP_ITEMS.filter((i) => i.type === 'hintPack');
  const costumes = SHOP_ITEMS.filter((i) => i.type === 'avatarCostume');
  const skins = SHOP_ITEMS.filter((i) => i.type === 'worldSkin');

  const ShopItemCard = ({ item }: { item: (typeof SHOP_ITEMS)[0] }) => {
    const owned = ownedItemIds.has(item.id);
    const userCoins = user ? Number(user.coins) : 0;
    const userGems = user ? Number(user.gems) : 0;
    const canAfford =
      (item.coinCost > 0 && userCoins >= item.coinCost) ||
      (item.gemCost > 0 && userGems >= item.gemCost) ||
      (item.coinCost === 0 && item.gemCost === 0);

    return (
      <div
        className={cn(
          'rpg-card flex flex-col gap-3',
          owned && 'opacity-70'
        )}
        style={
          owned
            ? { borderColor: 'oklch(0.55 0.18 155 / 0.5)' }
            : !canAfford
            ? { borderColor: 'oklch(0.58 0.22 27 / 0.3)' }
            : {}
        }
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: owned
                ? 'oklch(0.55 0.18 155 / 0.2)'
                : 'oklch(0.78 0.16 85 / 0.15)',
              border: `2px solid ${owned ? 'oklch(0.55 0.18 155 / 0.4)' : 'oklch(0.78 0.16 85 / 0.3)'}`,
            }}
          >
            {item.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-sm" style={{ color: 'oklch(0.97 0.01 265)' }}>
              {item.name}
            </p>
            <p className="text-xs font-body text-muted-foreground">{item.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          {item.coinCost > 0 && (
            <div className="flex items-center gap-1.5">
              <img src="/assets/generated/icon-coin.dim_64x64.png" alt="coins" className="w-5 h-5" />
              <span
                className="font-heading font-bold text-sm"
                style={{
                  color:
                    user && Number(user.coins) >= item.coinCost
                      ? 'oklch(0.88 0.14 85)'
                      : 'oklch(0.58 0.22 27)',
                }}
              >
                {item.coinCost}
              </span>
            </div>
          )}
          {item.gemCost > 0 && (
            <div className="flex items-center gap-1.5">
              <img src="/assets/generated/icon-gem.dim_64x64.png" alt="gems" className="w-5 h-5" />
              <span
                className="font-heading font-bold text-sm"
                style={{
                  color:
                    user && Number(user.gems) >= item.gemCost
                      ? 'oklch(0.75 0.18 265)'
                      : 'oklch(0.58 0.22 27)',
                }}
              >
                {item.gemCost}
              </span>
            </div>
          )}
        </div>

        {owned ? (
          <div
            className="text-center py-2 rounded-xl font-heading font-bold text-sm"
            style={{
              background: 'oklch(0.55 0.18 155 / 0.2)',
              color: 'oklch(0.62 0.2 155)',
            }}
          >
            ✅ Owned
          </div>
        ) : (
          <RPGButton
            variant={item.coinCost > 0 ? 'gold' : 'navy'}
            size="sm"
            onClick={() => handlePurchase(item)}
            loading={buyingId === item.id}
            disabled={!canAfford}
            className="w-full"
          >
            {canAfford ? 'Buy Now!' : 'Not enough!'}
          </RPGButton>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 py-6">
      <Toaster />
      {showAnim && (
        <CoinGemAnimation coins={0} gems={0} onComplete={() => setShowAnim(false)} />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🛒 Shop
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Spend your coins and gems on awesome items!
        </p>
      </div>

      {/* Balance display */}
      {user && (
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/icon-coin.dim_64x64.png" alt="coins" className="w-7 h-7" />
            <span className="font-heading font-bold text-xl" style={{ color: 'oklch(0.88 0.14 85)' }}>
              {Number(user.coins).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/assets/generated/icon-gem.dim_64x64.png" alt="gems" className="w-7 h-7" />
            <span className="font-heading font-bold text-xl" style={{ color: 'oklch(0.75 0.18 265)' }}>
              {Number(user.gems).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <Tabs defaultValue="hints">
        <TabsList
          className="w-full mb-4"
          style={{ background: 'oklch(0.18 0.04 265)', border: '1px solid oklch(0.3 0.05 265)' }}
        >
          <TabsTrigger value="hints" className="flex-1 font-heading font-bold text-xs">
            💡 Hints
          </TabsTrigger>
          <TabsTrigger value="costumes" className="flex-1 font-heading font-bold text-xs">
            👗 Costumes
          </TabsTrigger>
          <TabsTrigger value="skins" className="flex-1 font-heading font-bold text-xs">
            🌍 Skins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hints">
          <div className="flex flex-col gap-3">
            {hintPacks.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="costumes">
          <div className="flex flex-col gap-3">
            {costumes.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skins">
          <div className="flex flex-col gap-3">
            {skins.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
