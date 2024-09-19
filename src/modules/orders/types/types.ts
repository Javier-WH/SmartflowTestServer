export enum OrderAction {
    Accept = 'accept',
    Reject = 'reject',
    Scan = 'scan',
    ReadyToShip = 'ready_to_ship',
}

export type WalmartOrderToBeAcknowledged = {
    orderId: string;
    orderAcknowledge: {
        orderLines: {
            orderLine: [
                {
                    lineNumber: string;
                    orderLineStatuses: {
                        orderLineStatus: [
                            {
                                status: 'Acknowledged';
                                statusQuantity: {
                                    unitOfMeasurement: string;
                                    amount: string;
                                };
                            },
                        ];
                    };
                },
            ];
        };
    };
};

export type LiverpoolOrderToBeAcknowledged = any; // TODO: Define this type

export type OrderToBeAcknowledged = WalmartOrderToBeAcknowledged | LiverpoolOrderToBeAcknowledged;

export type AcknowledgeableOrderList = Record<
    string,
    Array<WalmartOrderToBeAcknowledged | LiverpoolOrderToBeAcknowledged>
>;
