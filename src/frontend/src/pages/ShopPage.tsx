import React, { useState } from "react";
import { toast } from "sonner";
import { PurchaseType } from "../backend";
import RPGButton from "../components/RPGButton";
import CoinGemAnimation from "../components/animations/CoinGemAnimation";
import {
  useGetUser,
  useGetUserPurchases,
  usePurchaseItem,
} from "../hooks/useQueries";
import { SHOP_ITEMS } from "../lib/gameData";
import { loadUserId } from "../lib/userStore";

interface ShopPageProps {
  userId: string;
}

type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: "coins" | "gems";
  icon: string;
  type: "hintPack" | "avatarCostume" | "worldSkin";
};

// Flatten SHOP_ITEMS into a single array with type field
function getAllShopItems(): ShopItem[] {
  return [
    ...SHOP_ITEMS.hintPacks.map((item) => ({
      ...item,
      type: "hintPack" as const,
    })),
    ...SHOP_ITEMS.avatarCostumes.map((item) => ({
      ...item,
      type: "avatarCostume" as const,
    })),
    ...SHOP_ITEMS.worldSkins.map((item) => ({
      ...item,
      type: "worldSkin" as const,
    })),
  ];
}

export default function ShopPage({ userId: propUserId }: ShopPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: user } = useGetUser(userId);
  const { data: purchases = [] } = useGetUserPurchases(userId);
  const purchaseItem = usePurchaseItem();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [showAnim, setShowAnim] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hintPack" | "avatarCostume" | "worldSkin"
  >("hintPack");

  const allItems = getAllShopItems();
  const ownedItemIds = new Set(purchases.map((p) => p.itemId));

  const handlePurchase = async (item: ShopItem) => {
    if (!userId) return;

    const userCoins = user ? Number(user.coins) : 0;
    const userGems = user ? Number(user.gems) : 0;

    if (item.currency === "coins" && userCoins < item.cost) {
      toast.error(`Not enough coins! You need ${item.cost} coins.`);
      return;
    }
    if (item.currency === "gems" && userGems < item.cost) {
      toast.error(`Not enough gems! You need ${item.cost} gems.`);
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
      const msg = err instanceof Error ? err.message : "Purchase failed";
      if (msg.includes("Insufficient coins")) {
        toast.error("Not enough coins!");
      } else if (msg.includes("Insufficient gems")) {
        toast.error("Not enough gems!");
      } else {
        toast.error("Purchase failed. Try again!");
      }
    } finally {
      setBuyingId(null);
    }
  };

  const filteredItems = allItems.filter((item) => item.type === activeTab);

  const TABS: {
    key: "hintPack" | "avatarCostume" | "worldSkin";
    label: string;
    icon: string;
  }[] = [
    { key: "hintPack", label: "Hints", icon: "💡" },
    { key: "avatarCostume", label: "Costumes", icon: "👗" },
    { key: "worldSkin", label: "Skins", icon: "🎨" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {showAnim && (
        <CoinGemAnimation
          coins={0}
          gems={0}
          onComplete={() => setShowAnim(false)}
        />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">Shop</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Spend your coins and gems!
        </p>
      </div>

      {/* Balance display */}
      {user && (
        <div className="max-w-sm mx-auto flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/icon-coin.dim_64x64.png"
              alt="coins"
              className="w-7 h-7 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-heading font-bold text-xl text-gold">
              {Number(user.coins).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/icon-gem.dim_64x64.png"
              alt="gems"
              className="w-7 h-7 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-heading font-bold text-xl text-purple-400">
              {Number(user.gems).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 max-w-sm mx-auto">
        {TABS.map(({ key, label, icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-sm transition-all ${
              activeTab === key
                ? "bg-gold text-navy-dark"
                : "bg-card border border-border text-muted-foreground hover:border-gold/50"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3 max-w-sm mx-auto">
        {filteredItems.map((item) => {
          const owned = ownedItemIds.has(item.id);
          const userCoins = user ? Number(user.coins) : 0;
          const userGems = user ? Number(user.gems) : 0;
          const canAfford =
            item.currency === "coins"
              ? userCoins >= item.cost
              : userGems >= item.cost;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                owned
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : canAfford
                    ? "border-gold/30 bg-card"
                    : "border-border/30 bg-card opacity-70"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    owned ? "bg-emerald-500/20" : "bg-gold/10"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                {item.currency === "coins" ? (
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/assets/generated/icon-coin.dim_64x64.png"
                      alt="coins"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span
                      className={`font-heading font-bold text-sm ${canAfford ? "text-gold" : "text-red-400"}`}
                    >
                      {item.cost}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/assets/generated/icon-gem.dim_64x64.png"
                      alt="gems"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span
                      className={`font-heading font-bold text-sm ${canAfford ? "text-purple-400" : "text-red-400"}`}
                    >
                      {item.cost}
                    </span>
                  </div>
                )}
              </div>

              {owned ? (
                <div className="text-center py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                  ✅ Owned
                </div>
              ) : (
                <RPGButton
                  variant={item.currency === "coins" ? "gold" : "navy"}
                  size="sm"
                  className="w-full"
                  loading={buyingId === item.id}
                  disabled={!canAfford || buyingId !== null}
                  onClick={() => handlePurchase(item)}
                >
                  {canAfford ? "Buy Now!" : "Not enough!"}
                </RPGButton>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
