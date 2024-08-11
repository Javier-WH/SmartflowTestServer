import { Select, SelectItem } from '@nextui-org/react';

import useMarketplace from '@/modules/orders/hooks/useMarketplace';

export type Key = string | number;

export type SelectedKeys = 'all' | Iterable<Key> | undefined;

export default function MarketplaceSelector({
    selectedKeys,
    onSelect,
    multiple = false,
    className = '',
}: { selectedKeys: SelectedKeys; onSelect: (marketplaceId: Key) => void; multiple?: boolean; className?: string }) {
    const { data: marketplaces, isLoading: isMarketplaceLoading, error: marketplaceError } = useMarketplace();

    return (
        <Select
            multiple={multiple}
            className={`w-40 m-0 ${className}`}
            classNames={{ trigger: 'shadow-lg bg-white' }}
            label="MARKETPLACE"
            size="sm"
            radius="full"
            isLoading={isMarketplaceLoading}
            selectionMode="single"
            items={marketplaces}
            isInvalid={marketplaceError != null}
            onSelectionChange={keys => {
                console.log('[LS] -> src/modules/shared/components/MarketplaceSelector.tsx:17 -> keys: ', keys);

                const marketplaceId = Array.from(keys)[0];

                console.log(
                    '[LS] -> src/modules/shared/components/MarketplaceSelector.tsx:31 -> marketplaceId: ',
                    marketplaceId,
                );

                onSelect(marketplaceId);
            }}
            selectedKeys={selectedKeys}
        >
            {item => (
                <SelectItem key={item.id} className="capitalize">
                    {item.name}
                </SelectItem>
            )}
        </Select>
    );
}
